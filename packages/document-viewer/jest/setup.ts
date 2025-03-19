type ExportedModuleType = typeof import('../src/index')
import { errorCodes, isErrorWithCode } from '../src'

const mockModule: ExportedModuleType = Object.freeze({
  viewDocument: jest.fn().mockResolvedValue(null),
  errorCodes,
  isErrorWithCode,
})

jest.mock('@react-native-documents/viewer', () => {
  return mockModule
})
