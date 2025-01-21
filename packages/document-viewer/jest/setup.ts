type ExportedModuleType = typeof import('../src/index')

const mockModule: ExportedModuleType = Object.freeze({
  viewDocument: jest.fn().mockResolvedValue(null),
})

jest.mock('@react-native-documents/viewer', () => {
  return mockModule
})
