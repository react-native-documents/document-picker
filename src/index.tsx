import { Platform, NativeModules, ModalPropsIOS } from 'react-native'
import invariant from 'invariant'
import type { PlatformTypes, SupportedPlatforms } from './fileTypes'
import { perPlatformTypes } from './fileTypes'

export type DocumentPickerResponse = {
  uri: string
  fileCopyUri: string
  copyError?: string
  type: string
  name: string
  size: number
}

export const types = perPlatformTypes[Platform.OS]

export type DirectoryPickerResponse = {
  uri: string
}

type DocumentPickerType = {
  pick(options: Record<string, any>): Promise<DocumentPickerResponse[]>
  releaseSecureAccess(uris: string[]): Promise<void>
  pickDirectory(): Promise<DirectoryPickerResponse>
}

const RNDocumentPicker: DocumentPickerType = NativeModules.RNDocumentPicker

export type DocumentPickerOptions<OS extends SupportedPlatforms> = {
  type?:
    | string
    | PlatformTypes[OS][keyof PlatformTypes[OS]]
    | Array<PlatformTypes[OS][keyof PlatformTypes[OS]] | string>
  mode?: 'import' | 'open'
  copyTo?: 'cachesDirectory' | 'documentDirectory'
  allowMultiSelection?: boolean
} & Pick<ModalPropsIOS, 'presentationStyle'>

export function pickDirectory(): Promise<DirectoryPickerResponse | null> {
  if (Platform.OS === 'android' || Platform.OS === 'windows') {
    return RNDocumentPicker.pickDirectory()
  } else {
    // TODO iOS impl
    return Promise.resolve(null)
  }
}

export function pickMultiple<OS extends SupportedPlatforms>(
  opts?: DocumentPickerOptions<OS>,
): Promise<DocumentPickerResponse[]> {
  const options = {
    ...opts,
    allowMultiSelection: true,
  }
  return pick(options)
}
export function pickSingle<OS extends SupportedPlatforms>(
  opts?: DocumentPickerOptions<OS>,
): Promise<DocumentPickerResponse> {
  const options = {
    ...opts,
    allowMultiSelection: false,
  }
  return pick(options).then((results) => results[0])
}

export function pick<OS extends SupportedPlatforms>(
  opts?: DocumentPickerOptions<OS>,
): Promise<DocumentPickerResponse[]> {
  const options = {
    // must be false to maintain old (v5) behavior
    allowMultiSelection: false,
    type: [types.allFiles],
    ...opts,
  }

  const newOpts: DoPickParams<OS> = {
    presentationStyle: 'formSheet',
    ...options,
    type: Array.isArray(options.type) ? options.type : [options.type],
  }

  return doPick(newOpts)
}

type DoPickParams<OS extends SupportedPlatforms> = DocumentPickerOptions<OS> & {
  type: Array<PlatformTypes[OS][keyof PlatformTypes[OS]] | string>
  allowMultiSelection: boolean
  presentationStyle: NonNullable<ModalPropsIOS['presentationStyle']>
}

function doPick<OS extends SupportedPlatforms>(
  options: DoPickParams<OS>,
): Promise<DocumentPickerResponse[]> {
  invariant(
    !('filetype' in options),
    'A `filetype` option was passed to DocumentPicker.pick, the correct option is `type`',
  )
  invariant(
    !('types' in options),
    'A `types` option was passed to DocumentPicker.pick, the correct option is `type`',
  )

  invariant(
    options.type.every((type: unknown) => typeof type === 'string'),
    `Unexpected type option in ${options.type}, did you try using a DocumentPicker.types.* that does not exist?`,
  )
  invariant(
    options.type.length > 0,
    '`type` option should not be an empty array, at least one type must be passed if the `type` option is not omitted',
  )

  invariant(
    // @ts-ignore TS2345: Argument of type 'string' is not assignable to parameter of type 'PlatformTypes[OS][keyof PlatformTypes[OS]]'.
    !options.type.includes('folder'),
    'RN document picker: "folder" option was removed, use "pickDirectory()"',
  )

  if ('mode' in options && !['import', 'open'].includes(options.mode ?? '')) {
    throw new TypeError('Invalid mode option: ' + options.mode)
  }

  if (
    'copyTo' in options &&
    !['cachesDirectory', 'documentDirectory'].includes(options.copyTo ?? '')
  ) {
    throw new TypeError('Invalid copyTo option: ' + options.copyTo)
  }

  return RNDocumentPicker.pick(options)
}

export function releaseSecureAccess(uris: Array<string>): Promise<void> {
  if (Platform.OS !== 'ios') {
    return Promise.resolve()
  }

  invariant(
    Array.isArray(uris) && uris.every((uri) => typeof uri === 'string'),
    `"uris" should be an array of strings, was ${uris}`,
  )

  return RNDocumentPicker.releaseSecureAccess(uris)
}

const E_DOCUMENT_PICKER_CANCELED = 'DOCUMENT_PICKER_CANCELED'
const E_DOCUMENT_PICKER_IN_PROGRESS = 'ASYNC_OP_IN_PROGRESS'

export type NativeModuleErrorShape = Error & { code?: string }

export function isCancel(err: unknown): boolean {
  return isErrorWithCode(err, E_DOCUMENT_PICKER_CANCELED)
}

export function isInProgress(err: unknown): boolean {
  return isErrorWithCode(err, E_DOCUMENT_PICKER_IN_PROGRESS)
}

function isErrorWithCode(err: unknown, errorCode: string): boolean {
  if (err instanceof Error && 'code' in err) {
    const nativeModuleErrorInstance = err as NativeModuleErrorShape
    return nativeModuleErrorInstance?.code === errorCode
  }
  return false
}

export default {
  isCancel,
  releaseSecureAccess,
  pickDirectory,
  pick,
  pickMultiple,
  pickSingle,
  types,
  perPlatformTypes,
}
