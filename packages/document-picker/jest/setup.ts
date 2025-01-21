import type { Spec } from '../src/spec/NativeDocumentPicker'

import {
  DirectoryPickerResponse,
  DocumentPickerResponse,
  IsKnownTypeResponse,
  KeepLocalCopyOptions,
  LocalCopyResponse,
} from '../src'

export const mockDocPickerResponse: DocumentPickerResponse = {
  uri: 'file:///mock/uri/mockName.pdf',
  name: 'mockName.pdf',
  type: 'application/pdf',
  nativeType: 'com.adobe.pdf',
  size: 1234,
  error: null,
  isVirtual: false,
  convertibleToMimeTypes: null,
  hasRequestedType: true,
}

function mockFactory() {
  const mockNativeModule: Spec = Object.freeze({
    isKnownType: jest.fn().mockReturnValue({
      isKnown: false,
      UTType: null,
      preferredFilenameExtension: null,
      mimeType: null,
    } satisfies IsKnownTypeResponse),
    keepLocalCopy: jest.fn().mockImplementation(async (options: KeepLocalCopyOptions) => {
      const mockCopyResults: LocalCopyResponse[] = options.files.map(({ uri, fileName }) => ({
        sourceUri: uri,
        localUri: `file:///mock/uri/${fileName}`,
        status: 'success',
      }))
      return mockCopyResults
    }),
    pick: jest.fn().mockResolvedValue([mockDocPickerResponse] satisfies DocumentPickerResponse[]),
    pickDirectory: jest.fn().mockResolvedValue({
      uri: 'file:///mock/uri/mockDirectory',
    } satisfies DirectoryPickerResponse),
    saveDocument: jest
      .fn()
      .mockResolvedValue([mockDocPickerResponse] satisfies DocumentPickerResponse[]),
    writeDocuments: jest
      .fn()
      .mockResolvedValue([mockDocPickerResponse] satisfies DocumentPickerResponse[]),
    releaseSecureAccess: jest.fn().mockResolvedValue(null),
    releaseLongTermAccess: jest.fn().mockResolvedValue([]),
  })
  return {
    NativeDocumentPicker: mockNativeModule,
  }
}

jest.mock('../src/spec/NativeDocumentPicker', () => mockFactory())
// the following are for jest testing outside of the library, where the paths are different
// alternative is to use moduleNameMapper in user space
const mockModulePaths = [
  '../../../lib/commonjs/spec/NativeDocumentPicker',
  '../../../lib/module/spec/NativeDocumentPicker',
]
mockModulePaths.forEach((path) => {
  try {
    require.resolve(path)
    jest.mock(path, () => mockFactory())
  } catch (error: any) {
    if ('code' in error && error.code === 'MODULE_NOT_FOUND') {
      if (!process.env.SILENCE_MOCK_NOT_FOUND) {
        console.warn(`Unable to resolve ${path}`)
      }
    } else {
      throw error
    }
  }
})
