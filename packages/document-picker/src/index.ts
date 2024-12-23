export { isKnownType, type IsKnownTypeResponse, type IsKnownTypeOptions } from './isKnownType'
export {
  keepLocalCopy,
  type KeepLocalCopyOptions,
  type KeepLocalCopyResponse,
  type FileToCopy,
} from './keepLocalCopy'

// TODO expose from /fileTypes?
export { types, type PredefinedFileTypes } from './fileTypes'
export { errorCodes, isErrorWithCode } from './errors'
export { pickDirectory } from './pickDirectory'
export type {
  PickDirectoryResponse,
  DirectoryPickerOptions,
  DirectoryPickerOptionsLongTerm,
  DirectoryPickerResponse,
  DirectoryPickerResponseLongTerm,
  DirectoryPickerOptionsBase,
} from './pickDirectory'
export { pick, type DocumentPickerOptionsBase } from './pick'
export {
  saveDocuments,
  type SaveDocumentsResponse,
  type SaveDocumentsOptions,
} from './saveDocuments'
export type {
  NonEmptyArray,
  TransitionStyle,
  BookmarkingResponse,
  DocumentPickerResponse,
  PresentationStyle,
  VirtualFileMeta,
} from './types'
export type {
  DocumentPickerOptions,
  DocumentPickerOptionsImport,
  DocumentPickerOptionsOpenOnce,
  DocumentPickerOptionsOpenLongTerm,
  DocumentPickerResponseOpenLongTerm,
} from './pick'
export type { LocalCopyResponse } from './spec/NativeDocumentPicker'
export {
  releaseLongTermAccess,
  releaseSecureAccess,
  type ReleaseLongTermAccessResult,
} from './release'
