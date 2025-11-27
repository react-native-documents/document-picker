const path = require('path')
const root = path.resolve(__dirname, '..', 'packages')

const pickerPath = path.join(
  root,
  'document-picker',
  require('../packages/document-picker/package.json').exports['.'].source,
)
const viewerPath = path.join(
  root,
  'document-viewer',
  require('../packages/document-viewer/package.json').exports['.'].source,
)

module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    [
      require.resolve('babel-plugin-module-resolver'),
      {
        extensions: ['.tsx', '.ts', '.jsx', '.js', '.json'],
        alias: {
          '@react-native-documents/picker': pickerPath,
          '@react-native-documents/viewer': viewerPath,
        },
      },
    ],
  ],
}
