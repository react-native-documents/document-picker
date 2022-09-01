import type { TurboModule } from 'react-native'
import { TurboModuleRegistry } from 'react-native'

export type DocumentPickerResponse = {
  uri: string
  name: string
  copyError?: string
  fileCopyUri: string | null
  type: string | null
  size: number | null
}

type DocumentPickerOptions = {
  type?: Array<string>
  mode?: string
  copyTo?: string
  allowMultiSelection?: boolean
  transitionStyle?: string
  presentationStyle?: string
}

export type DirectoryPickerResponse = {
  uri: string
}

export interface Spec extends TurboModule {
  readonly getConstants: () => {}

  pick(options: DocumentPickerOptions): Promise<DocumentPickerResponse[]>
  releaseSecureAccess(uris: string[]): Promise<void>
  pickDirectory(): Promise<DirectoryPickerResponse>
}

export default TurboModuleRegistry.get<Spec>('RNDocumentPicker')
