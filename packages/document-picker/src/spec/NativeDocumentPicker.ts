import type { TurboModule } from 'react-native'
import { TurboModuleRegistry } from 'react-native'
import { DocumentPickerResponse } from '../types'

/**
 * Indicates, for each Uri that was passed to {@link keepLocalCopy}, whether the local copy was successfully created or not.
 *
 * If the copy was successful, the status field is `success` and `localUri` contains the local Uri.
 * If the copy was not successful, the status field is `error` and `copyError` field contains the error message.
 * */
export type LocalCopyResponse =
  | {
      status: 'success'
      sourceUri: string
      localUri: string
    }
  | { status: 'error'; sourceUri: string; copyError: string }

export interface Spec extends TurboModule {
  // we use "Object" to have backward compatibility with old arch
  pick(options: Object): Promise<DocumentPickerResponse[]>
  saveDocument(options: Object): Promise<Object>
  writeDocuments(options: Object): Promise<Object[]>
  pickDirectory(options: Object): Promise<Object>
  keepLocalCopy(options: Object): Promise<LocalCopyResponse[]>
  isKnownType(kind: string, value: string): Object
  releaseSecureAccess(uris: string[]): Promise<null>
  releaseLongTermAccess(uris: string[]): Promise<Object>
}

export const NativeDocumentPicker = TurboModuleRegistry.getEnforcing<Spec>('RNDocumentPicker')
