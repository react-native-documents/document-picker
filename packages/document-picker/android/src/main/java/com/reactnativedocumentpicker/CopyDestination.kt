// LICENSE: see License.md in the package root
package com.reactnativedocumentpicker

enum class CopyDestination(val preset: String) {
  CACHES_DIRECTORY("cachesDirectory"),
  DOCUMENT_DIRECTORY("documentDirectory");

  companion object {
    fun fromPath(path: String): CopyDestination = entries.find { it.preset == path } ?: CACHES_DIRECTORY
  }
}
