const path = require('path')

const config = {
  projectRoot: __dirname,
  watchFolders: [path.join(__dirname, '../..')],
}

// Starting with react-native 0.72, we are required to provide a full config.
const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config')
module.exports = mergeConfig(getDefaultConfig(__dirname), config)
