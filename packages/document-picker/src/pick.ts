import { NativeDocumentPicker } from './spec/NativeDocumentPicker'

import { PredefinedFileTypes, types } from './fileTypes'
import type {
  BookmarkingResponse,
  DocumentPickerResponse,
  NonEmptyArray,
  TransitionStyle,
  PresentationStyle,
} from './types'
import { Platform } from 'react-native'
import { safeValidate } from './validateTypes'

/**
 * Base options object for the document picker.
 * You'd rarely use this type directly, but instead use one of
 *
 * {@link DocumentPickerOptionsImport}, {@link DocumentPickerOptionsOpenOnce} or {@link DocumentPickerOptionsOpenLongTerm}
 *
 * which extend this type
 * @group pick() types
 */
export type DocumentPickerOptionsBase = {
  /**
   * Specify file type(s) that you want to pick. Use `types` for some predefined values.
   * */
  type?: string | PredefinedFileTypes | Array<PredefinedFileTypes | string>

  // TODO: implement these
  // initialDirectoryUrl?: string
  // showFileExtensions?: boolean
  // localOnly?: boolean
  /**
   * Whether to allow multiple files to be picked. False by default.
   * */
  allowMultiSelection?: boolean
  // allowVirtualFiles is available for ACTION_OPEN_DOCUMENT only (or so it seems)
  // https://developer.android.com/reference/android/content/Intent#ACTION_OPEN_DOCUMENT
  // https://developer.android.com/reference/android/content/Intent#ACTION_GET_CONTENT
  /**
   * Android only - Whether to allow virtual files (such as Google docs or sheets) to be picked. False by default.
   * */
  allowVirtualFiles?: boolean
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
 * Present the document picker in import mode.
 *
 * @group pick() types
 */
export type DocumentPickerOptionsImport = DocumentPickerOptionsBase & {
  mode?: 'import'
  requestLongTermAccess?: never
}
/**
 * Present the document picker in open mode, with permissions to access the file for a limited time (until the app terminates).
 *
 * @group pick() types
 */
export type DocumentPickerOptionsOpenOnce = DocumentPickerOptionsBase & {
  mode: 'open'
  requestLongTermAccess?: false
}
/**
 * Present the document picker in open mode, with long-term permissions to access the opened file.
 *
 * @group pick() types
 */
export type DocumentPickerOptionsOpenLongTerm = DocumentPickerOptionsBase & {
  mode: 'open'
  requestLongTermAccess: true
}

type DocumentPickerOptionsOpen = DocumentPickerOptionsOpenOnce | DocumentPickerOptionsOpenLongTerm
/**
 * @hidden
 */
export type DocumentPickerOptions = DocumentPickerOptionsImport | DocumentPickerOptionsOpen

/**
 * The result of calling {@link pick} with `mode: 'open'` and `requestLongTermAccess: true`
 *
 * @group pick() types
 */
export type DocumentPickerResponseOpenLongTerm = DocumentPickerResponse & BookmarkingResponse

// TODO not entirely sure this is a good idea but let's try
type PickResponse<O extends DocumentPickerOptions> = Promise<
  O extends DocumentPickerOptionsOpenLongTerm
    ? NonEmptyArray<DocumentPickerResponseOpenLongTerm>
    : NonEmptyArray<DocumentPickerResponse>
>

type DoPickOptions = DocumentPickerOptionsBase & { mode: 'import' | 'open'; type: string[] }

/**
 * The method for picking a file, both for `import` and `open` modes.
 *
 * For result types, see {@link DocumentPickerResponse} or {@link DocumentPickerResponseOpenLongTerm}.
 *
 * For options, see {@link DocumentPickerOptionsImport}, {@link DocumentPickerOptionsOpenOnce} or {@link DocumentPickerOptionsOpenLongTerm}.
 *
 * @group DocumentPicker
 * */
export async function pick<O extends DocumentPickerOptions>(options?: O): PickResponse<O> {
  const type: string[] = (() => {
    if (!options?.type) {
      return [types.allFiles]
    }
    const newType = Array.isArray(options.type) ? options.type : [options.type]
    return newType.flat().map((it) => it.trim())
  })()
  const newOpts: DoPickOptions = {
    mode: 'import',
    // allowMultiSelection must be false to maintain old (v5) behavior
    allowMultiSelection: false,
    allowVirtualFiles: false,
    ...options,
    type,
  }

  if (!newOpts.type.every((it: unknown) => typeof it === 'string')) {
    throw new TypeError(
      `Unexpected type option in ${newOpts.type}, did you try using a DocumentPicker.types.* that does not exist?`,
    )
  }

  if ('mode' in newOpts && !['import', 'open'].includes(newOpts.mode)) {
    throw new TypeError('Invalid mode option: ' + newOpts.mode)
  }

  const response: Promise<DocumentPickerResponse[]> = NativeDocumentPicker.pick(newOpts)
  const awaitedResult = await response
  for (const res of awaitedResult) {
    if (Platform.OS === 'android') {
      res.hasRequestedType = safeValidate(newOpts.type, res)
    } else {
      res.hasRequestedType = true
    }
  }

  return awaitedResult as unknown as PickResponse<O>
}
