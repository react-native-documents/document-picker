import { BookmarkingResponse, PresentationStyle, type TransitionStyle } from './types'
import { Platform } from 'react-native'
import { NativeDocumentPicker } from './spec/NativeDocumentPicker'

/**
 * Base options object for the directory picker. They only slightly influence the appearance of the picker modal on iOS.
 * You'd rarely use this type directly, but instead use {@link DirectoryPickerOptions}
 *
 * which extend this type
 * @group pickDirectory() types
 */
export type DirectoryPickerOptionsBase = {
  /**
   * iOS only - Controls how the picker is presented, e.g. on an iPad you may want to present it fullscreen. Defaults to `pageSheet`.
   * */
  presentationStyle?: PresentationStyle
  /**
   * iOS only - Configures the transition style of the picker. Defaults to coverVertical, when the picker is presented, its view slides up from the bottom of the screen.
   * */
  transitionStyle?: TransitionStyle
}
/**
 * @hidden
 * */
export type DirectoryPickerOptionsLongTerm = DirectoryPickerOptionsBase & {
  requestLongTermAccess: true
}
/**
 * Options for {@link pickDirectory}.
 *
 * @group pickDirectory() types
 * */
export type DirectoryPickerOptions = DirectoryPickerOptionsBase & { requestLongTermAccess: boolean }

/**
 * This object represents the response from the directory picker, when long-term access was not requested.
 *
 * @group pickDirectory() types
 * */
export type DirectoryPickerResponse = {
  /**
   * The (percent-encoded) directory selected by user.
   * */
  uri: string
}
/**
 * This object represents the response from the directory picker, when long-term access was requested.
 *
 * @group pickDirectory() types
 * */
export type DirectoryPickerResponseLongTerm = DirectoryPickerResponse & BookmarkingResponse

// TODO not entirely sure this is a good idea but let's try
/**
 * You likely won't use this type directly, but instead use {@link DirectoryPickerResponse} or {@link DirectoryPickerResponseLongTerm}.
 *
 * @group pickDirectory() types
 * */
export type PickDirectoryResponse<O extends DirectoryPickerOptions> = Promise<
  O extends DirectoryPickerOptionsLongTerm
    ? DirectoryPickerResponseLongTerm
    : DirectoryPickerResponse
>

/**
 * Opens a directory picker.
 *
 * @group DocumentPicker
 * */
export async function pickDirectory<O extends DirectoryPickerOptions>(
  options?: O,
): PickDirectoryResponse<O> {
  const optionsOverride = (() => {
    if (Platform.OS === 'ios') {
      return {
        ...options,
        mode: 'open',
        allowMultiSelection: false,
        type: ['public.folder'],
      }
    } else {
      return {
        // technically, "mode" is ignored here, and we shouldn't need to specify anything but the PickOptions data class
        // requires mode to be set
        mode: 'open',
        ...options,
      }
    }
  })()
  return NativeDocumentPicker.pickDirectory(optionsOverride) as unknown as Promise<
    PickDirectoryResponse<O>
  >
}
