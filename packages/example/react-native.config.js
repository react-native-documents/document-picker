const path = require('path')
const { configureProjects } = require('react-native-test-app')

const project = (() => {
  try {
    return configureProjects({
      android: {
        sourceDir: 'android',
      },
      ios: {
        sourceDir: 'ios',
      },
    })
  } catch (_) {
    return undefined
  }
})()

module.exports = {
  dependencies: {
    // Help rn-cli find and autolink libs
    '@react-native-documents/picker': {
      root: path.resolve(__dirname, '../document-picker'),
    },
    '@react-native-documents/viewer': {
      root: path.resolve(__dirname, '../document-viewer'),
    },
  },
  ...(project ? { project } : undefined),
}
