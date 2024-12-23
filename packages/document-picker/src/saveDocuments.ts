import { NativeDocumentPicker } from './spec/NativeDocumentPicker'

import type { DocumentPickerResponse, NonEmptyArray } from './types'
import { Platform } from 'react-native'

/**
 * Options object for the {@link saveDocuments} method. `sourceUris` is the only required field.
 *
 * @group saveDocuments() types
 */
export type SaveDocumentsOptions = {
  /**
   * The source URIs of the files to save, percentage-encoded. Android only allows to save one file at a time, iOS allows multiple.
   * */
  sourceUris: string[]
  /**
   * Android-only: The MIME type of the file to be stored.
   * It is recommended to provide this value, otherwise the system will try to infer it from the sourceUri using ContentResolver.
   * */
  mimeType?: string
  /**
   * Android-only: The suggested title of the file to be stored, which will be pre-filled in the UI.
   * On iOS, the target name is taken from the source uri, and is changeable only when exactly one file is being saved.
   * */
  fileName?: string
  /**
   * iOS-only: Whether to copy the file to a new location, or move it (default).
   * On Android, file is always copied.
   * */
  copy?: boolean
  // initialUri?: string
}

/**
 * The result of calling {@link saveDocuments}. It is very unlikely that the metadata fields would be `null`, but in theory, it can happen.
 *
 * @group saveDocuments() types
 */
export type SaveDocumentsResponse = {
  /**
   * The target URI - the one user saved to. This is a percent-encoded `content://` uri (Android), or a `file://` uri (iOS).
   * */
  uri: string
  /**
   * The name of the file that user entered, including extension.
   * */
  name: string | null
  /**
   * Error in case the file could not be written or some metadata could not be obtained.
   * */
  error: string | null

  // type: string | null
  // nativeType: string | null

  // later if needed; iOS doesn't allow to read the info from the target file
  // should be the same as the source anyway
  // size: number | null
}

/**
 * The method for opening a "save as" dialog and saving source file(s) to a new location.
 *
 * On Android, only one file can be saved at a time.
 *
 * @group DocumentPicker
 * */
export async function saveDocuments(
  options: SaveDocumentsOptions,
): Promise<NonEmptyArray<SaveDocumentsResponse>> {
  const writeDocumentResponse = await (async () => {
    if (Platform.OS === 'android') {
      const length = options.sourceUris.length
      if (length > 1) {
        console.warn(`DocumentPicker.saveDocuments: Android only allows to save one file at a time.\n
      You provided an array with ${length} entries.`)
      }
      // making this division into 2 calls might be an overkill... but who knows
      const objectWithSingleUri = await NativeDocumentPicker.saveDocument(options)
      const response = await NativeDocumentPicker.writeDocuments(objectWithSingleUri)
      return response as NonEmptyArray<DocumentPickerResponse>
    } else {
      return NativeDocumentPicker.writeDocuments(options) as Promise<
        NonEmptyArray<DocumentPickerResponse>
      >
    }
  })()
  return writeDocumentResponse.map(keepOnlySpecifiedFields) as NonEmptyArray<SaveDocumentsResponse>
}

function keepOnlySpecifiedFields(source: DocumentPickerResponse): SaveDocumentsResponse {
  return {
    uri: source.uri,
    name: source.name,
    error: source.error,
    // type: source.type,
    // nativeType: source.nativeType,
  }
}
