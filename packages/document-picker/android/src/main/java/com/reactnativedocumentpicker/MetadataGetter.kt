// LICENSE: see License.md in the package root
package com.reactnativedocumentpicker

import android.content.ContentResolver
import android.content.Context
import android.content.Intent
import android.database.Cursor
import android.net.Uri
import android.os.Build
import android.provider.DocumentsContract
import android.provider.OpenableColumns
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.ReadableArray
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext

class MetadataGetter(private val uriMap: MutableMap<String, Uri>) {

  suspend fun processPickedFileUris(
      context: Context,
      uris: List<Uri>,
      pickOptions: PickOptions
  ): ReadableArray =
      withContext(Dispatchers.IO) {
        val results = Arguments.createArray()
        for (uri in uris) {
          val metadata = getMetadataForUri(context, uri, pickOptions)
          uriMap[uri.toString()] = uri
          results.pushMap(metadata.build())
        }
        results
      }

  private suspend fun getMetadataForUri(
      context: Context,
      sourceUri: Uri,
      pickOptions: PickOptions,
  ): DocumentMetadataBuilder =
      withContext(Dispatchers.IO) {
        val contentResolver = context.contentResolver
        val metadataBuilder = DocumentMetadataBuilder(sourceUri)

        val mimeFromUri = contentResolver.getType(sourceUri)
        metadataBuilder.mimeType(mimeFromUri)

        if (pickOptions.allowVirtualFiles) {
          // https://developer.android.com/training/data-storage/shared/documents-files#open-virtual-file
          val openableMimeTypes = contentResolver.getStreamTypes(sourceUri, "*/*")
          metadataBuilder.openableMimeTypes(openableMimeTypes)
        }

        if (pickOptions.requestLongTermAccess) {
          // https://developer.android.com/training/data-storage/shared/documents-files#persist-permissions
          // checking FLAG_GRANT_PERSISTABLE_URI_PERMISSION is not mentioned in the official docs
          val takeFlags = Intent.FLAG_GRANT_READ_URI_PERMISSION or Intent.FLAG_GRANT_WRITE_URI_PERMISSION

          try {
            context.contentResolver.takePersistableUriPermission(sourceUri, takeFlags)
            metadataBuilder.bookmark(sourceUri)
          } catch (e: Exception) {
            metadataBuilder.bookmarkError(
                e.localizedMessage
                    ?: e.message
                    ?: "Unknown error with takePersistableUriPermission")
          }
        }

        val couldBeVirtualFile = pickOptions.allowVirtualFiles && DocumentsContract.isDocumentUri(context, sourceUri)
        queryContentResolverMetadata(contentResolver, metadataBuilder, couldBeVirtualFile)

        metadataBuilder
      }

  fun queryContentResolverMetadata(
      contentResolver: ContentResolver,
      metadataBuilder: DocumentMetadataBuilder,
      couldBeVirtualFile: Boolean
  ) {
    try {
      queryContentResolverMetadataInternal(contentResolver, metadataBuilder, couldBeVirtualFile)
    } catch (e: Exception) {
      val suppressedSummary =
        e.suppressed.joinToString(separator = "; ") { suppressed ->
            "${suppressed.javaClass.simpleName}: ${suppressed.message ?: "no message"}"
          }
      metadataBuilder.metadataReadingError(
        "Could not read file metadata: ${e.javaClass.simpleName}: ${e.message ?: "no message"}" +
          (" (suppressed summary: [$suppressedSummary])")
      )
    }
  }

  private fun queryContentResolverMetadataInternal(
      contentResolver: ContentResolver,
      metadataBuilder: DocumentMetadataBuilder,
      couldBeVirtualFile: Boolean
  ) {
    val forUri = metadataBuilder.getUri()
    val hasNoMime = !metadataBuilder.hasMime()

    val projection = mutableListOf(
      OpenableColumns.DISPLAY_NAME,
      OpenableColumns.SIZE,
    ).apply {
      if (couldBeVirtualFile) {
        add(DocumentsContract.Document.COLUMN_FLAGS)
      }
      if (hasNoMime) {
        add(DocumentsContract.Document.COLUMN_MIME_TYPE)
      }
    }.toTypedArray()

    contentResolver
      .query(
        forUri,
        projection,
        null,
        null,
        null
      )
      .use { cursor ->
        if (cursor == null) {
          metadataBuilder.metadataReadingError("Could not read file metadata because cursor was null. This is likely an issue with the underlying ContentProvider.")
          return
        }
        if (!cursor.moveToFirst()) {
          metadataBuilder.metadataReadingError("Could not read file metadata because cursor could not move to the first result row. This is likely an issue with the underlying ContentProvider. Row count: ${cursor.count}, columns: ${cursor.columnNames.joinToString(",")}")
          return
        }
        metadataBuilder.name(
          getCursorValue(cursor, OpenableColumns.DISPLAY_NAME, String::class.java)
        )
        metadataBuilder.size(getCursorValue(cursor, OpenableColumns.SIZE, Long::class.java))

        if (hasNoMime) {
          metadataBuilder.mimeType(
            getCursorValue(
              cursor, DocumentsContract.Document.COLUMN_MIME_TYPE, String::class.java
            )
          )
        }

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N) {
          // https://developer.android.com/training/data-storage/shared/documents-files#open-virtual-file
          val isVirtual =
            if (couldBeVirtualFile) {
              val cursorValue: Int =
                getCursorValue(
                  cursor, DocumentsContract.Document.COLUMN_FLAGS, Int::class.java
                )
                  ?: 0
              cursorValue and DocumentsContract.Document.FLAG_VIRTUAL_DOCUMENT != 0
            } else {
              false
            }
          metadataBuilder.virtual(isVirtual)
        }
      }
  }

  @Suppress("UNCHECKED_CAST")
  private fun <T> getCursorValue(cursor: Cursor, columnName: String, valueType: Class<T>): T? {
    val columnIndex = cursor.getColumnIndex(columnName)
    if (columnIndex == -1 || cursor.isNull(columnIndex)) {
      return null
    }
    return runCatching {
      when (valueType) {
        String::class.java -> cursor.getString(columnIndex) as T
        Int::class.java -> cursor.getInt(columnIndex) as T
        Long::class.java -> cursor.getLong(columnIndex) as T
        Double::class.java -> cursor.getDouble(columnIndex) as T
        Float::class.java -> cursor.getFloat(columnIndex) as T
        else -> null
      }
      // throw should not happen but if it does, we return null
    }.getOrNull()
  }
}
