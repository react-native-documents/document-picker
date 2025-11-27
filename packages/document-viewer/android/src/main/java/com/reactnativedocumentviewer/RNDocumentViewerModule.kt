// LICENSE: see License.md in the package root
package com.reactnativedocumentviewer;

import android.content.ActivityNotFoundException
import android.content.Intent
import android.net.Uri
import android.util.Base64
import android.webkit.MimeTypeMap
import androidx.core.content.FileProvider
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.util.RNLog
import java.io.File

class RNDocumentViewerModule(reactContext: ReactApplicationContext) : NativeDocumentViewerSpec(reactContext) {

  override fun viewDocument(
    bookmarkOrUri: String,
    permissions: String,
    mimeType: String?,
    title: String?,
    androidApplicationId: String?,
    presentation: String?,
    promise: Promise
  ) {
    val currentActivity = reactApplicationContext.currentActivity ?: return rejectWithNullActivity(promise)
    if (BuildConfig.DEBUG && mimeType != null && !MimeTypeMap.getSingleton().hasMimeType(mimeType)) {
      RNLog.w(
        reactApplicationContext, "$mimeType appears to be an unusual mime type, are you sure it's correct?")
    }

    try {
      val (uriToOpen, intentFlags) = constructUri(bookmarkOrUri, permissions, androidApplicationId)

      // grantUriPermission is not needed (for file uris WE OWN), we're using the Flags
      // on a Uri returned by FileProvider.getUriForFile()
      // see "Granting Temporary Permissions to a URI"
      // https://developer.android.com/reference/androidx/core/content/FileProvider
      val openIntent = Intent(Intent.ACTION_VIEW).apply {
        setDataAndType(uriToOpen, mimeType)
        addFlags(intentFlags)
      }

      currentActivity.startActivity(openIntent)
      promise.resolve(null)
    } catch (e: ActivityNotFoundException) {
      promise.reject(UNABLE_TO_OPEN_FILE_TYPE, e)
    } catch (e: Exception) {
      promise.reject("RNDocumentViewer:viewDocument", e)
    }
  }

  private fun constructUri(bookmarkOrUri: String, permissions: String, androidApplicationId: String?): UriWithFlags {
    val flags = when (permissions) {
      "write" -> Intent.FLAG_GRANT_READ_URI_PERMISSION or Intent.FLAG_GRANT_WRITE_URI_PERMISSION
      else -> Intent.FLAG_GRANT_READ_URI_PERMISSION
    }
    return if (bookmarkOrUri.startsWith("content://")) {
      UriWithFlags(Uri.parse(bookmarkOrUri), flags)
    } else if (bookmarkOrUri.startsWith("file://")) {
      // Package name may not be the same as applicationId but usually is.
      // Also see document-viewer/android/src/main/AndroidManifest.xml
      val applicationId = androidApplicationId ?: reactApplicationContext.packageName
      val authority = "$applicationId.reactnativedocumentviewer.fileprovider"
      val uri = Uri.parse(bookmarkOrUri)
      val uriPath = uri.path ?: throw IllegalArgumentException("file:// uri must have a path")
      val fileUri = FileProvider.getUriForFile(
        reactApplicationContext,
        authority,
        File(uriPath)
      )
      UriWithFlags(fileUri, flags)
    } else {
      // decode the uri from the opaque string
      val decodedBytes = Base64.decode(bookmarkOrUri, Base64.DEFAULT)
      val decodedUri = String(decodedBytes, Charsets.UTF_8)
      UriWithFlags(Uri.parse(decodedUri), flags)
    }
  }

  companion object {
    fun rejectWithNullActivity(promise: Promise) {
      promise.reject(NULL_PRESENTER, "current activity is null")
    }

    private const val NULL_PRESENTER = "NULL_PRESENTER"
    private const val UNABLE_TO_OPEN_FILE_TYPE = "UNABLE_TO_OPEN_FILE_TYPE"
  }
}

data class UriWithFlags(val uriToOpen: Uri, val intentFlags: Int)
