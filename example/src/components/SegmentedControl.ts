import SegmentedControlNative from '@react-native-segmented-control/segmented-control'
// @ts-ignore
import JSSegmentedControl from '@react-native-segmented-control/segmented-control/js/SegmentedControl.js'

// @ts-ignore
const isFabricEnabled = global.nativeFabricUIManager !== null

// Forcing the JS implementation for Fabric as the native module is not compatible with Fabric yet.
export const SegmentedControl: typeof SegmentedControlNative = isFabricEnabled
  ? JSSegmentedControl
  : SegmentedControlNative
