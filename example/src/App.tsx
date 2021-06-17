import * as React from 'react'

import { StyleSheet, View, Text, Button } from 'react-native'
import DocumentPicker, {
  DirectoryPickerResponse,
  DocumentPickerResponse,
  types,
} from 'react-native-document-picker'

export default function App() {
  const [result, setResult] = React.useState<
    Array<DocumentPickerResponse> | DirectoryPickerResponse | undefined | null
  >()

  const handleError = (err: Error) => {
    if (DocumentPicker.isCancel(err)) {
      console.warn('cancelled')
      // User cancelled the picker, exit any dialogs or menus and move on
    } else {
      throw err
    }
  }

  return (
    <View style={styles.container}>
      <Button
        title="open picker for single file selection"
        onPress={() => {
          DocumentPicker.pickSingle()
            .then((pickerResult) => setResult([pickerResult]))
            .catch(handleError)
        }}
      />
      <Button
        title="open picker for multi file selection"
        onPress={() => {
          DocumentPicker.pickMultiple().then(setResult).catch(handleError)
        }}
      />
      <Button
        title="open picker for multi selection of word files"
        onPress={() => {
          DocumentPicker.pick({
            allowMultiSelection: true,
            type: [types.doc, types.docx],
          })
            .then(setResult)
            .catch(handleError)
        }}
      />
      <Button
        title="open picker for single selection of pdf file"
        onPress={() => {
          DocumentPicker.pick({
            type: types.pdf,
          })
            .then(setResult)
            .catch(handleError)
        }}
      />
      <Button
        title="open directory picker (android+windows only)"
        onPress={() => {
          DocumentPicker.pickDirectory().then(setResult).catch(handleError)
        }}
      />

      <Text>Result: {JSON.stringify(result, null, 2)}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  box: {
    width: 60,
    height: 60,
    marginVertical: 20,
  },
})
