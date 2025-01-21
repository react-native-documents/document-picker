// LICENSE: see License.md in the package root
package com.reactnativedocumentpicker

enum class CopyDestination(val preset: String) {
  CACHES_DIRECTORY("cachesDirectory"),
  DOCUMENT_DIRECTORY("documentDirectory");

  companion object {
    // keep values() for RN 73 compatibility
    fun fromPath(path: String): CopyDestination = values().find { it.preset == path } ?: CACHES_DIRECTORY
  }
}
