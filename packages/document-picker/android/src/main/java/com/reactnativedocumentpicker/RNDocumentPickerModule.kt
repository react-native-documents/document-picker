package com.reactnativedocumentpicker

import android.annotation.SuppressLint
import android.app.Activity
import android.content.ActivityNotFoundException
import android.content.ClipData
import android.content.Intent
import android.net.Uri
import android.os.Build
import android.provider.DocumentsContract
import android.util.Base64
import com.facebook.react.bridge.ActivityEventListener
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.BaseActivityEventListener
import com.facebook.react.bridge.LifecycleEventListener
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.ReadableArray
import com.facebook.react.bridge.ReadableMap
import com.facebook.react.bridge.WritableMap
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.cancel
import kotlinx.coroutines.launch

class RNDocumentPickerModule(reactContext: ReactApplicationContext) :
    NativeDocumentPickerSpec(reactContext), LifecycleEventListener {
  private var currentPickOptions: PickOptions? = null
  private var currentUriOfFileBeingExported: Uri? = null
  private val promiseWrapper = PromiseWrapper(NAME)
  private val pickedFilesUriMap = mutableMapOf<String, Uri>()
  private val metadataGetter = MetadataGetter(pickedFilesUriMap)
  private val fileOps = FileOperations(pickedFilesUriMap)
  private val fileCopyingCoroutine = CoroutineScope(Dispatchers.IO)

  private val activityEventListener: ActivityEventListener =
      object : BaseActivityEventListener() {
        override fun onActivityResult(
            activity: Activity,
            requestCode: Int,
            resultCode: Int,
            data: Intent?
        ) {
          if (requestCode != PICK_FILES_REQUEST_CODE && requestCode != PICK_DIR_REQUEST_CODE && requestCode != SAVE_DOC_REQUEST_CODE) {
            // we only handle the document picker library request codes
            return
          }

          when (resultCode) {
            Activity.RESULT_CANCELED -> promiseWrapper.rejectAsUserCancelledOperation()
            (Activity.RESULT_OK) -> {
              if (data == null) {
                promiseWrapper.reject(E_INVALID_DATA_RETURNED, "Data from document picker is null")
                return
              }
              when (requestCode) {
                PICK_FILES_REQUEST_CODE -> processFilePickerResult(data)
                PICK_DIR_REQUEST_CODE -> processDirectoryPickerResult(data)
                SAVE_DOC_REQUEST_CODE -> processSaveAsResult(data)
                else -> promiseWrapper.reject(
                  "UNEXPECTED_ACTIVITY_RESULT", "Unknown activity result: $resultCode", null)
              }
            }
            else ->
                promiseWrapper.reject(
                  "UNEXPECTED_ACTIVITY_RESULT", "Unknown activity result: $resultCode", null)
          }
        }
      }

  init {
    reactContext.addActivityEventListener(activityEventListener)
    reactContext.addLifecycleEventListener(this)
  }

  override fun invalidate() {
    reactApplicationContext.removeActivityEventListener(activityEventListener)
    // TODO verify this should be done (and order)
    // reactApplicationContext.removeLifecycleEventListener(this)
    super.invalidate()
  }

  @ReactMethod
  override fun pick(opts: ReadableMap, promise: Promise) {
    val currentActivity = currentActivity

    if (currentActivity == null) {
      rejectWithNullActivity(promise)
      return
    }
    if (!promiseWrapper.trySetPromiseRejectingIncoming(promise, "pick")) {
      return
    }
    val options = parsePickOptions(opts)
    currentPickOptions = options

    try {
      val intent = IntentFactory.getPickIntent(options)
      currentActivity.startActivityForResult(intent, PICK_FILES_REQUEST_CODE)
    } catch (e: ActivityNotFoundException) {
      promise.reject(UNABLE_TO_OPEN_FILE_TYPE, e)
    } catch (e: Exception) {
      promise.reject(E_OTHER_PRESENTING_ERROR, e)
    }
  }

  override fun saveDocument(options: ReadableMap, promise: Promise) {
    val currentActivity = currentActivity
    if (currentActivity == null) {
      rejectWithNullActivity(promise)
      return
    }
    if (!promiseWrapper.trySetPromiseRejectingIncoming(promise, "saveDocuments")) {
      return
    }

    try {
      val uri = Uri.parse(options.getArray("sourceUris")!!.getString(0))
      currentUriOfFileBeingExported = uri

      val mimeType = if (options.hasKey("mimeType")) options.getString("mimeType") else {
        val contentResolver = reactApplicationContext.contentResolver
        contentResolver.getType(uri) ?: throw IllegalStateException("MIME type could not be determined from the URI")
      }
      val suggestedTitle = if (options.hasKey("fileName")) options.getString("fileName") else null
      val intent = Intent(Intent.ACTION_CREATE_DOCUMENT).apply {
        addCategory(Intent.CATEGORY_OPENABLE)
        type = mimeType
        suggestedTitle?.let { putExtra(Intent.EXTRA_TITLE, it) }

        // Optionally, specify a URI for the directory that should be opened in
        // the system file picker before your app creates the document.
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O && options.hasKey("initialUri")) {
          putExtra(DocumentsContract.EXTRA_INITIAL_URI, options.getString("initialUri"))
        }
      }
      currentActivity.startActivityForResult(intent, SAVE_DOC_REQUEST_CODE)
    } catch (e: ActivityNotFoundException) {
      promise.reject(UNABLE_TO_OPEN_FILE_TYPE, e)
    } catch (e: Exception) {
      promise.reject(E_OTHER_PRESENTING_ERROR, e)
    }
  }

  @ReactMethod
  override fun pickDirectory(opts: ReadableMap, promise: Promise) {
    val currentActivity = currentActivity
    if (currentActivity == null) {
      rejectWithNullActivity(promise)
      return
    }
    if (!promiseWrapper.trySetPromiseRejectingIncoming(promise, "pickDirectory")) {
      return
    }
    val options = parsePickOptions(opts)
    currentPickOptions = options
    try {
      val intent =
          Intent(Intent.ACTION_OPEN_DOCUMENT_TREE).apply {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O &&
                options.initialDirectoryUrl != null) {
              putExtra(
                  // TODO must be URI
                  DocumentsContract.EXTRA_INITIAL_URI,
                  options.initialDirectoryUrl)
            }
          }
      // TODO option for extra task on stack?
      currentActivity.startActivityForResult(intent, PICK_DIR_REQUEST_CODE)
    } catch (e: ActivityNotFoundException) {
      promise.reject(UNABLE_TO_OPEN_FILE_TYPE, e)
    } catch (e: Exception) {
      promise.reject(E_OTHER_PRESENTING_ERROR, e)
    }
  }

  @ReactMethod
  override fun keepLocalCopy(options: ReadableMap, promise: Promise) {
    val filesToCopy = options.getArray("files")
    val copyTo = options.getString("destination")
    if (copyTo == null || filesToCopy == null) {
      promise.reject("keepLocalCopy",
        "You did not provide the correct options. Expected 'files' and 'destination', got: ${options.toHashMap().keys}"
      )
    } else {
      fileCopyingCoroutine.launch {
        val results = fileOps.copyFilesToLocalStorage(
                reactApplicationContext,
                filesToCopy,
                CopyDestination.fromPath(copyTo),
            )
        promise.resolve(results)
      }
    }
  }

  override fun isKnownType(kind: String, value: String): WritableMap {
    return IsKnownTypeImpl.isKnownType(kind, value)
  }

  override fun releaseSecureAccess(uris: ReadableArray, promise: Promise) {
    promise.resolve(null)
  }

  override fun releaseLongTermAccess(uris: ReadableArray, promise: Promise) {
    val contentResolver = reactApplicationContext.contentResolver
    val results = Arguments.createArray()
    for (i in 0 until uris.size()) {
      val uriString = uris.getString(i)
      val result = Arguments.createMap().apply {
        putString("uri", uriString)
      }
      try {
        val uri = Uri.parse(uriString)
        contentResolver.releasePersistableUriPermission(
          uri,
          Intent.FLAG_GRANT_READ_URI_PERMISSION or Intent.FLAG_GRANT_WRITE_URI_PERMISSION
        )
        // TODO clarify if this should be done
        // pickedFilesUriMap.remove(uriString)
        result.putString("status", "success")
      } catch (e: Exception) {
        result.putString("status", "error")
        result.putString("errorMessage", e.message ?: "Unknown error")
      }
      results.pushMap(result)
    }
    promise.resolve(results)
  }

  @SuppressLint("WrongConstant") // in takePersistableUriPermission
  private fun processDirectoryPickerResult(intent: Intent) {
    val uri: Uri? = intent.data
    val pickOptions = currentPickOptions
    if (uri == null || pickOptions == null) {
      promiseWrapper.reject(E_INVALID_DATA_RETURNED, "Data from document picker is null")
      return
    }

    val map = Arguments.createMap().apply {
      putString("uri", uri.toString())
    }

    if (pickOptions.requestLongTermAccess) {
      // https://developer.android.com/training/data-storage/shared/documents-files#persist-permissions
      // checking FLAG_GRANT_PERSISTABLE_URI_PERMISSION is not mentioned in the official docs
      val takeFlags =
          intent.flags and
              (Intent.FLAG_GRANT_READ_URI_PERMISSION or Intent.FLAG_GRANT_WRITE_URI_PERMISSION)

      // TODO detect whether we have read or write permissions
      // TODO use metadataBuilder too?
      try {
        reactApplicationContext.contentResolver.takePersistableUriPermission(uri, takeFlags)
        val encodedBookmark =
            Base64.encodeToString(uri.toString().toByteArray(Charsets.UTF_8), Base64.DEFAULT)
        map.putString("status", "success")
        map.putString("bookmark", encodedBookmark)
      } catch (e: Exception) {
        val error =
            e.localizedMessage ?: e.message ?: "Unknown error with takePersistableUriPermission"
        map.putString("status", "error")
        map.putString("bookmarkError", error)
      }
    }
    promiseWrapper.resolve(map)
  }

  override fun writeDocuments(options: ReadableMap, promise: Promise) {
    fileCopyingCoroutine.launch {
      try {
        val targetUriString = if (options.hasKey("uri")) options.getString("uri") else null

        val metadataBuilder = fileOps.writeDocumentImpl(currentUriOfFileBeingExported, targetUriString, reactApplicationContext)
        metadataGetter.queryContentResolverMetadata(reactApplicationContext.contentResolver, metadataBuilder, reactApplicationContext)

        val arrayWithSingleResult = Arguments.createArray().apply {
          val resultMap = metadataBuilder.build()
          pushMap(resultMap)
        }
        promise.resolve(arrayWithSingleResult)
      } catch (e: Exception) {
        promise.reject(e)
      }
    }
  }

  private fun processSaveAsResult(intent: Intent) {
    val targetUri: Uri? = intent.data
    if (targetUri != null) {
      pickedFilesUriMap[targetUri.toString()] = targetUri
      val map = Arguments.createMap().apply {
        putString("uri", targetUri.toString())
      }
      promiseWrapper.resolve(map)
    } else {
      promiseWrapper.reject(E_INVALID_DATA_RETURNED, "Data from document picker is null")
    }
  }

  fun processFilePickerResult(intent: Intent) {
    val singleFileUri: Uri? = intent.data
    val multiSelectClipData: ClipData? = intent.clipData

    val uris: List<Uri> =
        when {
          multiSelectClipData != null && multiSelectClipData.itemCount > 0 -> {
            // multiple files selected
            (0 until multiSelectClipData.itemCount).map { index ->
              multiSelectClipData.getItemAt(index).uri
            }
          }
          singleFileUri != null -> listOf(singleFileUri)
          else -> emptyList()
        }

    CoroutineScope(Dispatchers.IO).launch {
      try {
        val pickOptions = currentPickOptions
        require(pickOptions != null)
        val results =
            metadataGetter.processPickedFileUris(reactApplicationContext, uris, pickOptions)
        promiseWrapper.resolve(results)
      } catch (e: Exception) {
        promiseWrapper.reject(e)
      }
    }
  }

  companion object {
    fun rejectWithNullActivity(promise: Promise) {
      promise.reject(PRESENTER_IS_NULL, PRESENTER_IS_NULL)
    }

    private const val PICK_FILES_REQUEST_CODE = 41
    private const val PICK_DIR_REQUEST_CODE = 42
    private const val SAVE_DOC_REQUEST_CODE = 43
    private const val PRESENTER_IS_NULL = "NULL_PRESENTER"
    private const val UNABLE_TO_OPEN_FILE_TYPE = "UNABLE_TO_OPEN_FILE_TYPE"
    private const val E_OTHER_PRESENTING_ERROR = "OTHER_PRESENTING_ERROR"
    private const val E_INVALID_DATA_RETURNED = "INVALID_DATA_RETURNED"
  }

  override fun onHostResume() {}

  override fun onHostPause() {}

  override fun onHostDestroy() {
    fileCopyingCoroutine.cancel("host destroyed")
  }
}
