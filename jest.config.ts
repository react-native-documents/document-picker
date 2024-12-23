import type { Config } from 'jest'

const config: Config = {
  verbose: true,
  projects: [
    {
      preset: 'react-native',
      testMatch: ['<rootDir>/packages/document-picker/**/?(*.)+(test).[jt]s?(x)'],
      moduleNameMapper: {
        '^react-native$': '<rootDir>/node_modules/react-native',
        '@react-native-documents/picker': '<rootDir>/packages/document-picker/src/index.ts',
      },
    },
  ],
}

export default config
