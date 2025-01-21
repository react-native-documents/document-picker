import React from 'react'
import { UITextView } from 'react-native-uitextview'
import { Platform, TextInput, Text } from 'react-native'
// note this is not stable yet

export type SelectableTextProps = {
  value: string | Record<string, any>
  accessibilityLabel: string
}
const style = { color: 'black' } as const

const SelectableTextPaper = ({ value, accessibilityLabel }: SelectableTextProps) => {
  const toRender = typeof value === 'string' ? value : JSON.stringify(value, null, 2)
  return (
    <UITextView style={style} accessibilityLabel={accessibilityLabel} selectable uiTextView>
      {toRender}
    </UITextView>
  )
}

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
// @ts-ignore
const isFabricEnabled = global.nativeFabricUIManager !== null
export const SelectableText = isFabricEnabled ? SelectableTextFabric : SelectableTextPaper
