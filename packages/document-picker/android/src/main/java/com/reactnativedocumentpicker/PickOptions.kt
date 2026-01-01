// LICENSE: see License.md in the package root
package com.reactnativedocumentpicker

import android.content.Intent
import android.os.Build
import android.provider.DocumentsContract
import com.facebook.react.bridge.ReadableArray
import com.facebook.react.bridge.ReadableMap

data class PickOptions(
  private val mode: String?,
  val mimeTypes: Array<String>,
  val initialDirectoryUrl: String?,
  val localOnly: Boolean,
  val multiple: Boolean,
  val requestLongTermAccess: Boolean,
  val allowVirtualFiles: Boolean,
) {
  constructor(readableMap: ReadableMap) : this(
    mode = readableMap.getString("mode"),
    mimeTypes = if (readableMap.hasKey("type") && !readableMap.isNull("type")) {
      readableMap.getArray("type")?.let { readableArrayToStringArray(it) } ?: arrayOf("*/*")
    } else {
      arrayOf("*/*")
    },
    initialDirectoryUrl = if (readableMap.hasKey("initialDirectoryUrl")) readableMap.getString("initialDirectoryUrl") else null,
    localOnly = readableMap.hasKey("localOnly") && readableMap.getBoolean("localOnly"),
    multiple = readableMap.hasKey("allowMultiSelection") && readableMap.getBoolean("allowMultiSelection"),
    requestLongTermAccess = readableMap.hasKey("requestLongTermAccess") && readableMap.getBoolean("requestLongTermAccess"),
    allowVirtualFiles = readableMap.hasKey("allowVirtualFiles") && readableMap.getBoolean("allowVirtualFiles")
  )

  val action: String
    get() = if ("open" == mode) Intent.ACTION_OPEN_DOCUMENT else Intent.ACTION_GET_CONTENT

  val intentFilterTypes: String get() {
    return if (action == Intent.ACTION_OPEN_DOCUMENT) {
      // https://developer.android.com/reference/android/content/Intent.html#ACTION_OPEN_DOCUMENT
      "*/*"
    } else {
      // https://stackoverflow.com/a/46074075/2070942
      mimeTypes.joinToString("|")
    }
  }

  fun getPickIntent(): Intent {
    // TODO option for extra task on stack?
    // reminder - flags are for granting rights to others

    return Intent(action).apply {
      val types = mimeTypes

      type =
        if (types.size > 1) {
          putExtra(Intent.EXTRA_MIME_TYPES, types)
          intentFilterTypes
        } else {
          types[0]
        }
      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O &&
        initialDirectoryUrl != null
      ) {
        // only works for ACTION_OPEN_DOCUMENT
        // TODO must be URI
        putExtra(DocumentsContract.EXTRA_INITIAL_URI, initialDirectoryUrl)
      }
      if (!allowVirtualFiles) {
        addCategory(Intent.CATEGORY_OPENABLE)
      }
      putExtra(Intent.EXTRA_LOCAL_ONLY, localOnly)
      putExtra(Intent.EXTRA_ALLOW_MULTIPLE, multiple)
    }
  }
}

fun readableArrayToStringArray(readableArray: ReadableArray): Array<String> {
  /**
   * MIME type and Uri scheme matching in the
   * Android framework is case-sensitive, unlike the formal RFC definitions.
   * As a result, you should always write these elements with lower case letters,
   * */
  return readableArray.toArrayList().map { Intent.normalizeMimeType(it.toString())!! }.toTypedArray()
}
