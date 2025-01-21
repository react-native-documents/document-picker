// LICENSE: see License.md in the package root
package com.reactnativedocumentpicker

import android.net.Uri
import android.util.Base64
import android.webkit.MimeTypeMap
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.ReadableMap

class DocumentMetadataBuilder(forUri: Uri) {
  private val uri: Uri = forUri
  private var name: String? = null
  private var size: Long? = null
  private var mimeType: String? = null
  private var metadataError: String? = null
  private var openableMimeTypes: Array<String>? = null
  private var bookmark: String? = null
  private var bookmarkError: String? = null
  private var virtual: Boolean? = null

  fun name(name: String?) = apply { this.name = name }

  fun size(size: Long?) = apply { this.size = size }

  fun mimeType(mimeType: String?) = apply { this.mimeType = mimeType }

  fun metadataReadingError(error: String?) = apply { this.metadataError = error }

  fun openableMimeTypes(openableMimeTypes: Array<String>?) = apply {
    this.openableMimeTypes = openableMimeTypes
  }

  fun bookmark(bookmark: Uri) = apply { this.bookmark = bookmark.toString() }

  fun bookmarkError(bookmarkError: String?) = apply { this.bookmarkError = bookmarkError }

  fun virtual(virtual: Boolean) = apply { this.virtual = virtual }

  fun build(): ReadableMap = createReadableMap()

  fun hasMime() = mimeType != null

  fun getUri() = uri

  private fun createReadableMap(): ReadableMap {
    val map = Arguments.createMap()
    map.putString("name", name)
    map.putString("uri", uri.toString())
    size?.let { map.putDouble("size", it.toDouble()) } ?: map.putNull("size")
    map.putString("type", mimeType?.lowercase())
    map.putString("nativeType", mimeType?.lowercase())
    openableMimeTypes?.let {
      val arrayOfExtensionsAndMime = Arguments.createArray()
      it.forEach { mimeType ->
        val virtualFileDetails = Arguments.createMap()
        val maybeExtension = MimeTypeMap.getSingleton().getExtensionFromMimeType(mimeType)
        virtualFileDetails.putString("mimeType", mimeType)
        virtualFileDetails.putString("extension", maybeExtension)
        arrayOfExtensionsAndMime.pushMap(virtualFileDetails)
      }
      map.putArray("convertibleToMimeTypes", arrayOfExtensionsAndMime)
    } ?: map.putNull("convertibleToMimeTypes")
    map.putString("error", metadataError)
    virtual?.let { map.putBoolean("isVirtual", it) } ?: map.putNull("isVirtual")

    bookmark?.let {
      // we're encoding so that we behave the same as the iOS implementation
      val encodedBookmark = Base64.encodeToString(it.toByteArray(Charsets.UTF_8), Base64.DEFAULT)
      map.putString("bookmarkStatus", "success")
      map.putString("bookmark", encodedBookmark)
    }
        ?: bookmarkError?.let {
          map.putString("bookmarkStatus", "error")
          map.putString("bookmarkError", it)
        }

    return map
  }
}
