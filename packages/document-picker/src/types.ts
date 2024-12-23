export type NonEmptyArray<T> = [T, ...Array<T>]
import type { ModalPropsIOS } from 'react-native'

/**
 * If you've requested long-term access to a directory or file, this object will be returned in the response.
 * In order to access the same directory or file in the future, you must store the `bookmark` opaque string,
 * and then pass it to the document viewer if you want to preview the file.
 *
 * See the Document viewer source on how to retrieve the file from the bookmark, if you need to do that (advanced use case).
 * */
export type BookmarkingResponse =
  | {
      bookmarkStatus: 'success'
      bookmark: string
    }
  | {
      bookmarkStatus: 'error'
      bookmarkError: string
    }

/**
 * @group pick() types
 */
export type VirtualFileMeta = {
  /**
   * The registered extension for the given MIME type. Note that some MIME types map to multiple extensions.
   *
   * This call will return the most common extension for the given MIME type.
   *
   * Example: `pdf`
   */
  extension: string | null
  /**
   * The MIME type of the file. This is necessary to export the virtual file to a local file.
   *
   * Example: `application/pdf`
   */
  mimeType: string
}

/**
 * @group pick() types
 */
export type DocumentPickerResponse = {
  /**
   * The URI of the picked file. This is a percent-encoded `content://` uri (Android), or a `file://` uri (iOS).
   * */
  uri: string
  /**
   * The name of the picked file, including the extension. It's very unlikely that it'd be `null` but in theory, it can happen.
   * */
  name: string | null
  /**
   * Error in case the file metadata could not be obtained.
   * */
  error: string | null
  /**
   * The MIME type of the picked file.
   * */
  type: string | null
  /**
   * The "native" type of the picked file: on Android, this is the MIME type. On iOS, it is the UTType identifier.
   * */
  nativeType: string | null
  /**
   * The size of the picked file in bytes.
   * */
  size: number | null

  /**
   * Android: whether the file is a virtual file (such as Google docs or sheets). Will be `null` on pre-Android 7.0 devices. On iOS, it's always `false`.
   * */
  isVirtual: boolean | null
  /**
   * Android: The target types the virtual file can be converted to. Useful for {@link keepLocalCopy}.
   * This field is only present if `isVirtual` is true, and only on Android 7.0+. Always `null` on iOS.
   * */
  convertibleToMimeTypes: VirtualFileMeta[] | null

  /**
   * Android: Some document providers on Android (especially those popular in Asia, it seems)
   * do not respect the request for limiting selectable file types.
   * `hasRequestedType` will be false if the user picked a file that does not have one of the requested types.
   *
   * You need to do your own post-processing and display an error to the user if this is important to your app.
   *
   * Always `true` on iOS.
   * */
  hasRequestedType: boolean
}

/**
 * iOS only. Configure the transition style of the picker.
 * */
export type TransitionStyle =
  | 'coverVertical'
  | 'flipHorizontal'
  | 'crossDissolve'
  | 'partialCurl'
  | undefined

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

type AreUnionsEqual<T, U> = [T] extends [U] ? ([U] extends [T] ? true : false) : false

export const typesAreEqual: AreUnionsEqual<PresentationStyle, ModalPropsIOS['presentationStyle']> =
  true
