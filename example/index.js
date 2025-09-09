/**
 * @format
 */

import { AppRegistry } from 'react-native'
import { ImportExamples } from './src/ImportExamples'
import { OpenExamples } from './src/OpenExamples'
import { Utils } from './src/Utils'
import { SaveAsExamples } from './src/SaveAsExamples'

AppRegistry.registerComponent('importingExample', () => ImportExamples)
AppRegistry.registerComponent('openingExample', () => OpenExamples)
AppRegistry.registerComponent('utilsExample', () => Utils)
AppRegistry.registerComponent('saveAsExample', () => SaveAsExamples)
