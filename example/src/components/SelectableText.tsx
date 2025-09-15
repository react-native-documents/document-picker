import React from 'react'
import { Platform, TextInput, Text } from 'react-native'

export type SelectableTextProps = {
  value: string | Record<string, any>
  accessibilityLabel: string
}
const style = { color: 'black' } as const

const SelectableTextFabric = ({ value, accessibilityLabel }: SelectableTextProps) => {
  const toRender = typeof value === 'string' ? value : JSON.stringify(value, null, 2)
  return Platform.OS === 'ios' ? (
    // it has some issues but good enough
    <TextInput
      multiline
      accessibilityLabel={accessibilityLabel}
      editable={false}
      style={style}
      value={toRender}
    />
  ) : (
    <Text style={style} selectable accessibilityLabel={accessibilityLabel}>
      {toRender}
    </Text>
  )
}
// maybe use different implementation for old architecture
export const SelectableText = SelectableTextFabric
