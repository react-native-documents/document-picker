import { NativeDocumentViewer } from './spec/NativeDocumentViewer'

/**
 * iOS only. Configure the presentation style of the picker.
 * */
export type PresentationStyle =
  | 'fullScreen'
  | 'pageSheet'
  | 'formSheet'
  | 'overFullScreen'
  | undefined
/*
 * really, PresentationStyle shouldn't be here and we should just use ModalPropsIOS['presentationStyle']>
 * but I'm not sure how to get that working with TypeDoc producing a nice output so we duplicate it here
 * */

export type BaseOptions = {
  /**
   * Android only: The type of permission to grant to the receiving app that will open the document.
   * This only has effect if you're viewing a file that lives in the app's sandboxed storage.
   */
  grantPermissions?: 'read' | 'write'
  /**
   * iOS only: The title to display in the header of the document viewer.
   * If not provided, the filename will be used.
   */
  headerTitle?: string
  /**
   * Optional, but recommended: the mimetype of the document. This will help the Android OS to find the right app(s) to open the document.
   */
  mimeType?: string

  /**
   * iOS only - Controls how the picker is presented, e.g. on an iPad you may want to present it fullscreen. Defaults to `pageSheet`.
   * */
  presentationStyle?: PresentationStyle
}

/**
 * BaseOptions with the uri of the document to view
 * */
export type OptionsViewUri = BaseOptions & {
  /**
   * The uri of the document to view
   * */
  uri: string
}

/**
 * BaseOptions with the bookmark data from the DocumentPicker module. Obtain the bookmark using the "open" mode, with `requestLongTermAccess` flag set to true.
 *
 * A bookmark enables long-term access to a file.
 */
export type OptionsViewBookmark = BaseOptions & {
  /**
   * bookmark data from the DocumentPicker module. Obtain it using the "open" mode, with `requestLongTermAccess` flag set to true.
   *
   * A bookmark allows a long-term permission to access a file.
   */
  bookmark: string
}
/**
 * options for viewing a document
 *
 * If you're trying to open a file that you have long-term permission to access, you should use the `bookmark` option (provided by the DocumentPicker module).
 *
 * */
export type ViewDocumentOptions = OptionsViewBookmark | OptionsViewUri

export function viewDocument(data: ViewDocumentOptions): Promise<null> {
  const bookmarkOrUri = 'bookmark' in data ? data.bookmark : data.uri
  return NativeDocumentViewer.viewDocument(
    bookmarkOrUri,
    data?.grantPermissions ?? 'read',
    data?.mimeType,
    data?.headerTitle,
    data?.presentationStyle,
  )
}
