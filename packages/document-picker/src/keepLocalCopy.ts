import type { NonEmptyArray } from './types'
import { type LocalCopyResponse, NativeDocumentPicker } from './spec/NativeDocumentPicker'

/**
 * Parameter of {@link keepLocalCopy}. Object type representing the file(s) whose copy should be kept in the app's storage.
 * */
export type FileToCopy = {
  /**
   * The uri to keep a local copy of. This would be a `content://` uri (Android), or a `file://` uri (iOS) that the user has previously picked.
   * */
  uri: string
  /**
   * The name of the resulting file, with the file extension. You can use the `name` field from the response of the `pick()` method.
   *
   * Example: someFile.pdf
   *
   * */
  fileName: string
  /**
   * Only for Android virtual files: the type of the file to export to. For example, `application/pdf` or `text/plain`.
   * Use one of the values from `convertibleToMimeTypes` from the response of the `pick()` method: {@link DocumentPickerResponse}.
   * */
  convertVirtualFileToType?: string
}
/**
 * options for {@link keepLocalCopy}
 *
 * */
export type KeepLocalCopyOptions = {
  files: NonEmptyArray<FileToCopy>
  destination: 'cachesDirectory' | 'documentDirectory'
}

/**
 * Result of the call to {@link keepLocalCopy}. Please note the promise always resolves, even if there was an error processing any uri(s) (as indicated by the `status` field, and `copyError` field).
 * */
export type KeepLocalCopyResponse = NonEmptyArray<LocalCopyResponse>

/**
 * Makes the file available in the app's storage. The behavior is different on iOS and Android, and for simple use cases (such as uploading file to remote server), you may not need to call this method at all.
 *
 * On Android, it can be used to "convert" a `content://` Uri into a local file. It also "exports" virtual files (such as Google docs or sheets) into local files.
 *
 * However, note that for some use cases, such as uploading the picked file to a server, you may not need to call `keepLocalCopy` at all. React Native's `fetch` can handle `content://` uris.
 *
 * @group DocumentPicker
 * */
export function keepLocalCopy(options: KeepLocalCopyOptions): Promise<KeepLocalCopyResponse> {
  const response = NativeDocumentPicker.keepLocalCopy(options)
  return response as Promise<KeepLocalCopyResponse>
}
