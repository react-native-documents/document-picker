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

        queryContentResolverMetadata(contentResolver, metadataBuilder, context)

        metadataBuilder
      }

  fun queryContentResolverMetadata(
      contentResolver: ContentResolver,
      metadataBuilder: DocumentMetadataBuilder,
      context: Context
  ) {
    val forUri = metadataBuilder.getUri()
    contentResolver
      .query(
        forUri,
        arrayOf(
          DocumentsContract.Document.COLUMN_MIME_TYPE,
          OpenableColumns.DISPLAY_NAME,
          OpenableColumns.SIZE,
          DocumentsContract.Document.COLUMN_FLAGS,
        ),
        null,
        null,
        null
      )
      .use { cursor ->
        if (cursor != null && cursor.moveToFirst()) {
          metadataBuilder.name(
            getCursorValue(cursor, OpenableColumns.DISPLAY_NAME, String::class.java)
          )

          if (!metadataBuilder.hasMime()) {
            metadataBuilder.mimeType(
              getCursorValue(
                cursor, DocumentsContract.Document.COLUMN_MIME_TYPE, String::class.java
              )
            )
          }

          if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N) {
            // https://developer.android.com/training/data-storage/shared/documents-files#open-virtual-file
            val isVirtual =
              if (DocumentsContract.isDocumentUri(context, forUri)) {
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
          metadataBuilder.size(getCursorValue(cursor, OpenableColumns.SIZE, Long::class.java))
        } else {
          // metadataBuilder only contains the uri, type and error in this unlikely case
          // there's nothing more we can do
          metadataBuilder.metadataReadingError("Could not read file metadata")
        }
      }
  }

  @Suppress("UNCHECKED_CAST")
  private fun <T> getCursorValue(cursor: Cursor, columnName: String, valueType: Class<T>): T? {
    val columnIndex = cursor.getColumnIndex(columnName)
    if (columnIndex != -1 && !cursor.isNull(columnIndex)) {
      return try {
        when (valueType) {
          String::class.java -> cursor.getString(columnIndex) as T
          Int::class.java -> cursor.getInt(columnIndex) as T
          Long::class.java -> cursor.getLong(columnIndex) as T
          Double::class.java -> cursor.getDouble(columnIndex) as T
          Float::class.java -> cursor.getFloat(columnIndex) as T
          else -> null
        }
      } catch (e: Exception) {
        // this should not happen but if it does, we return null
        null
      }
    }
    return null
  }
}
