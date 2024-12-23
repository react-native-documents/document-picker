import type { TurboModule } from 'react-native'
import { TurboModuleRegistry } from 'react-native'

export interface Spec extends TurboModule {
  // permission only for android, 'read' or 'write'
  viewDocument(
    bookmarkOrUri: string,
    permissions: string,
    mimeType?: string,
    title?: string,
    presentationStyle?: string,
  ): Promise<null>
}

export const NativeDocumentViewer = TurboModuleRegistry.getEnforcing<Spec>('RNDocumentViewer')
