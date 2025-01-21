import { NativeDocumentPicker } from './spec/NativeDocumentPicker'

/**
 * The result of calling {@link isKnownType}
 * */
export type IsKnownTypeResponse = {
  /**
   * On iOS, this is true if the type is known to the device. That means it can be used with the document picker to filter what files can be picked.
   * On Android, this is true if the internal mime type database contains the given value.
   * */
  isKnown: boolean
  /**
   * the preferred filename extension for the given value, if any
   * */
  preferredFilenameExtension: string | null
  /**
   * the mime type for the given value, if any
   * */
  mimeType: string | null
  /**
   * the UTType identifier for the given value, if any
   * */
  UTType: string | null
}

export type IsKnownTypeOptions = {
  /**
   * the kind of value you're passing
   * */
  kind: 'UTType' | 'mimeType' | 'extension'
  /**
   * the value you're checking, for example: application/pdf, com.adobe.pdf, pdf
   * */
  value: string
}

/**
 *
 * Checks if the given value (which can be a file extension, UTType identifier or mime) is known to the system.
 * Also returns the mime type which you can use to filter files on Android.
 *
 * @group DocumentPicker
 * */
export function isKnownType(options: IsKnownTypeOptions): IsKnownTypeResponse {
  const { kind, value } = options
  const result = NativeDocumentPicker.isKnownType(kind, value) as IsKnownTypeResponse
  return result
}
