package com.reactnativedocumentpicker

import android.webkit.MimeTypeMap
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.WritableMap

class IsKnownTypeImpl {
  companion object {
    fun isKnownType(kind: String, value: String): WritableMap {
      return when (kind) {
        "mimeType" -> {
          val extensionForMime = MimeTypeMap.getSingleton().getExtensionFromMimeType(value)
          createMap(
            isKnown = extensionForMime != null,
            preferredFilenameExtension = extensionForMime,
            mimeType = if (extensionForMime != null) value else null
          )
        }
        "extension" -> {
          val mimeForExtension = MimeTypeMap.getSingleton().getMimeTypeFromExtension(value)
          createMap(
            isKnown = mimeForExtension != null,
            preferredFilenameExtension = if (mimeForExtension != null) value else null,
            mimeType = mimeForExtension
          )
        }
        else -> createMap(isKnown = false, preferredFilenameExtension = null, mimeType = null)
      }
    }

    private fun createMap(isKnown: Boolean, preferredFilenameExtension: String?, mimeType: String?): WritableMap {
      return Arguments.createMap().apply {
        putNull("UTType")
        putBoolean("isKnown", isKnown)
        putString("preferredFilenameExtension", preferredFilenameExtension)
        putString("mimeType", mimeType)
      }
    }
  }
}
