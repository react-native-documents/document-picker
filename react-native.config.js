const path = require('path')
const { androidManifestPath, iosProjectPath } = require('react-native-test-app')

const project = (() => {
  try {
    return {
      android: {
        sourceDir: path.join('example', 'android'),
        manifestPath: androidManifestPath(path.join(__dirname, 'example', 'android')),
      },
      ios: {
        project: iosProjectPath('example/ios'),
      },
    }
  } catch (e) {
    console.error('example config not found', e)

    return undefined
  }
})()

module.exports = {
  dependencies: {
    // Help rn-cli find and autolink this library
    'react-native-document-picker': {
      root: __dirname,
    },
  },
  ...(project ? { project } : undefined),
}
