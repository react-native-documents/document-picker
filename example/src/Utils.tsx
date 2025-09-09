import React from 'react'
import { Button, SafeAreaView, TextInput } from 'react-native'
import { Box } from './components/Box'
import { isKnownType } from '@react-native-documents/picker'
import { SegmentedControl } from './components/SegmentedControl'
import { SelectableText } from './components/SelectableText'

const valueKinds = ['extension', 'UTType', 'mimeType'] as const
export const Utils = () => {
  const [value, setValue] = React.useState('pdf')
  const [result, setResult] = React.useState('')
  const [kind, setKind] = React.useState<(typeof valueKinds)[number]>(valueKinds[0])
  const checkEnteredUti = () => {
    if (value) {
      const response = isKnownType({ kind, value })

      setResult(`isKnownType('${kind}', '${value}') = ${JSON.stringify(response, null, 2)}`)
    } else {
      setResult('no input')
    }
  }
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
      <Box label={'Test if the given input is supported by iOS'}>
        <SegmentedControl
          values={valueKinds.slice()}
          selectedIndex={valueKinds.indexOf(kind)}
          onChange={(event) => {
            const string = valueKinds[event.nativeEvent.selectedSegmentIndex]
            if (string) {
              setKind(string)
            }
          }}
        />
        <TextInput
          style={{
            height: 50,
            backgroundColor: 'lightgrey',
            borderRadius: 10,
            paddingHorizontal: 10,
          }}
          autoCapitalize={'none'}
          value={value}
          placeholder={'enter string here'}
          onChangeText={setValue}
          onSubmitEditing={checkEnteredUti}
        />
        <SelectableText accessibilityLabel={`result-${0}`} value={result} />

        <Button
          title={'Check if the value is supported by this device'}
          onPress={checkEnteredUti}
        />
      </Box>
    </SafeAreaView>
  )
}
