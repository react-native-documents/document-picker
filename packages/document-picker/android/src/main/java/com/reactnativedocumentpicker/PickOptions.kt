// LICENSE: see License.md in the package root
package com.reactnativedocumentpicker

import android.content.Intent
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
}

fun parsePickOptions(readableMap: ReadableMap): PickOptions {
  val mode = readableMap.getString("mode")

  val mimeTypes = if (readableMap.hasKey("type") && !readableMap.isNull("type")) {
    readableMap.getArray("type")?.let { readableArrayToStringArray(it) } ?: arrayOf("*/*")
  } else {
    arrayOf("*/*")
  }

  val initialDirectoryUrl = if (readableMap.hasKey("initialDirectoryUrl")) readableMap.getString("initialDirectoryUrl") else null
  val localOnly = readableMap.hasKey("localOnly") && readableMap.getBoolean("localOnly")
  val multiple = readableMap.hasKey("allowMultiSelection") && readableMap.getBoolean("allowMultiSelection")
  val requestLongTermAccess = readableMap.hasKey("requestLongTermAccess") && readableMap.getBoolean("requestLongTermAccess")
  val allowVirtualFiles = readableMap.hasKey("allowVirtualFiles") && readableMap.getBoolean("allowVirtualFiles")

  return PickOptions(
    mode = mode,
    mimeTypes = mimeTypes,
    initialDirectoryUrl = initialDirectoryUrl,
    localOnly = localOnly,
    multiple = multiple,
    requestLongTermAccess = requestLongTermAccess,
    allowVirtualFiles = allowVirtualFiles,
  )
}
fun readableArrayToStringArray(readableArray: ReadableArray): Array<String> {
  /**
   * MIME type and Uri scheme matching in the
   * Android framework is case-sensitive, unlike the formal RFC definitions.
   * As a result, you should always write these elements with lower case letters,
   * */
  return readableArray.toArrayList().map { Intent.normalizeMimeType(it.toString())!! }.toTypedArray()
}
