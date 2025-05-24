package com.reactnativedocumentpicker

import android.app.Activity
import android.content.ClipData
import android.content.ContentResolver
import android.content.Context
import android.content.Intent
import android.database.Cursor
import android.net.Uri
import android.os.Bundle
import android.provider.DocumentsContract
import android.provider.OpenableColumns
import com.facebook.react.bridge.*
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import kotlinx.coroutines.*
import java.io.File
import java.io.FileOutputStream
import java.io.IOException
import java.io.InputStream
import java.lang.ref.WeakReference
import java.util.UUID
import android.content.ActivityNotFoundException

class RNDocumentPickerModule(
    private val reactContext: ReactApplicationContext
) : ReactContextBaseJavaModule(reactContext), ActivityEventListener, CoroutineScope {

    companion object {
        private const val NAME = "RNDocumentPicker"
        private const val READ_REQUEST_CODE = 41
        private const val PICK_DIR_REQUEST_CODE = 42

        private const val E_ACTIVITY_DOES_NOT_EXIST = "ACTIVITY_DOES_NOT_EXIST"
        private const val E_FAILED_TO_SHOW_PICKER = "FAILED_TO_SHOW_PICKER"
        private const val E_DOCUMENT_PICKER_CANCELED = "DOCUMENT_PICKER_CANCELED"
        private const val E_UNABLE_TO_OPEN_FILE_TYPE = "UNABLE_TO_OPEN_FILE_TYPE"
        private const val E_UNKNOWN_ACTIVITY_RESULT = "UNKNOWN_ACTIVITY_RESULT"
        private const val E_INVALID_DATA_RETURNED = "INVALID_DATA_RETURNED"
        private const val E_UNEXPECTED_EXCEPTION = "UNEXPECTED_EXCEPTION"
    }

    private val job = SupervisorJob()
    override val coroutineContext = Dispatchers.Main + job

    private var pendingPromise: Promise? = null
    private var copyTo: String? = null

    init {
        reactContext.addActivityEventListener(this)
    }

    override fun getName(): String = NAME

    override fun invalidate() {
        reactContext.removeActivityEventListener(this)
        job.cancel()
        super.invalidate()
    }

    @ReactMethod
    fun pick(options: ReadableMap, promise: Promise) {
        val activity = currentActivity
        if (activity == null) {
            promise.reject(E_ACTIVITY_DOES_NOT_EXIST, "Current activity does not exist")
            return
        }
        pendingPromise = promise
        copyTo = if (options.hasKey("copyTo")) options.getString("copyTo") else null

        try {
            val intent = Intent(Intent.ACTION_GET_CONTENT).apply {
                addCategory(Intent.CATEGORY_OPENABLE)
                type = "*/*"
                if (options.hasKey("type")) {
                    options.getArray("type")?.let { arr ->
                        when {
                            arr.size() > 1 -> {
                                val types = Array(arr.size()) { i -> arr.getString(i)!! }
                                putExtra(Intent.EXTRA_MIME_TYPES, types)
                                type = types.joinToString("|")
                            }
                            arr.size() == 1 -> {
                                type = arr.getString(0)!!
                            }
                        }
                    }
                }
                val allowMultiSelection = if (options.hasKey("allowMultiSelection")) options.getBoolean("allowMultiSelection") else false
                putExtra(Intent.EXTRA_ALLOW_MULTIPLE, allowMultiSelection)
            }
            activity.startActivityForResult(intent, READ_REQUEST_CODE, Bundle.EMPTY)
        } catch (e: ActivityNotFoundException) {
            promise.reject(E_UNABLE_TO_OPEN_FILE_TYPE, e.message)
        } catch (e: Exception) {
            promise.reject(E_FAILED_TO_SHOW_PICKER, e.message)
        }
    }

    @ReactMethod
    fun pickDirectory(promise: Promise) {
        val activity = currentActivity
        if (activity == null) {
            promise.reject(E_ACTIVITY_DOES_NOT_EXIST, "Current activity does not exist")
            return
        }
        pendingPromise = promise
        try {
            val intent = Intent(Intent.ACTION_OPEN_DOCUMENT_TREE)
            activity.startActivityForResult(intent, PICK_DIR_REQUEST_CODE)
        } catch (e: Exception) {
            promise.reject(E_FAILED_TO_SHOW_PICKER, e.message)
        }
    }

    override fun onActivityResult(activity: Activity?, requestCode: Int, resultCode: Int, data: Intent?) {
        val promise = pendingPromise ?: return
        pendingPromise = null

        if (resultCode == Activity.RESULT_CANCELED) {
            promise.reject(E_DOCUMENT_PICKER_CANCELED, "User canceled picker")
            return
        }
        when (requestCode) {
            READ_REQUEST_CODE -> handleReadResult(data, promise)
            PICK_DIR_REQUEST_CODE -> handleDirectoryResult(data, promise)
            else -> promise.reject(E_UNKNOWN_ACTIVITY_RESULT, "Unknown request code: $requestCode")
        }
    }

    override fun onNewIntent(intent: Intent?) {}

    private fun handleDirectoryResult(data: Intent?, promise: Promise) {
        val uri = data?.data
        if (uri == null) {
            promise.reject(E_INVALID_DATA_RETURNED, "Invalid data returned by intent")
        } else {
            val map = Arguments.createMap().apply { putString("uri", uri.toString()) }
            promise.resolve(map)
        }
    }

    private fun handleReadResult(data: Intent?, promise: Promise) {
        val uris = mutableListOf<Uri>()
        data?.clipData?.let { clip ->
            for (i in 0 until clip.itemCount) {
                uris.add(clip.getItemAt(i).uri)
            }
        } ?: data?.data?.let { uris.add(it) }

        if (uris.isEmpty()) {
            promise.reject(E_INVALID_DATA_RETURNED, "No files selected")
            return
        }

        launch {
            try {
                val results = withContext(Dispatchers.IO) {
                    Arguments.createArray().apply {
                        uris.forEach { pushMap(getMetadata(it)) }
                    }
                }
                promise.resolve(results)
            } catch (e: Exception) {
                promise.reject(E_UNEXPECTED_EXCEPTION, e.message)
            }
        }
    }

    private fun getMetadata(uri: Uri): WritableMap {
        val context = reactContext.applicationContext
        val resolver = context.contentResolver
        val map = Arguments.createMap().apply {
            putString("uri", uri.toString())
            putString("type", resolver.getType(uri))
        }
        resolver.query(uri, null, null, null, null)?.use { cursor ->
            if (cursor.moveToFirst()) {
                val nameIdx = cursor.getColumnIndex(OpenableColumns.DISPLAY_NAME)
                if (!cursor.isNull(nameIdx)) map.putString("name", cursor.getString(nameIdx))
                val sizeIdx = cursor.getColumnIndex(OpenableColumns.SIZE)
                if (!cursor.isNull(sizeIdx)) map.putDouble("size", cursor.getLong(sizeIdx).toDouble())
            }
        }
        copyTo?.let { option ->
            try {
                val copyUri = copyFile(context, uri, option)
                map.putString("fileCopyUri", copyUri.toString())
            } catch (ex: Exception) {
                map.putNull("fileCopyUri")
                map.putString("copyError", ex.message)
            }
        } ?: map.putNull("fileCopyUri")

        return map
    }

    private fun copyFile(context: Context, uri: Uri, copyTo: String): Uri {
        val baseDir = if (copyTo == "documentDirectory") context.filesDir else context.cacheDir
        val dir = File(baseDir, UUID.randomUUID().toString()).apply {
            if (!mkdir()) throw IOException("Failed to create dir: $absolutePath")
        }
        val fileName = context.contentResolver.query(uri, null, null, null, null)?.use { cursor ->
            val idx = cursor.getColumnIndex(OpenableColumns.DISPLAY_NAME)
            if (cursor.moveToFirst() && !cursor.isNull(idx)) cursor.getString(idx) else UUID.randomUUID().toString()
        } ?: UUID.randomUUID().toString()

        val dest = File(dir, fileName)
        context.contentResolver.openInputStream(uri).use { input ->
            FileOutputStream(dest).use { output -> input!!.copyTo(output, 8 * 1024) }
        }
        return Uri.fromFile(dest)
    }
}
