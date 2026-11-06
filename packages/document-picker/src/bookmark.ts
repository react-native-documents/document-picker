import { NativeDocumentPicker } from './spec/NativeDocumentPicker'

/**
 * Convert a file bookmark (that was obtained by selecting a file with long term
 * access requested) into a URI.
 */
export const bookmarkToURI = async (bookmark: string): Promise<string> => {
  return NativeDocumentPicker.bookmarkToURI(bookmark)
}
