import * as React from 'react'

import { StyleSheet, Text, Button, ScrollView, SafeAreaView, View } from 'react-native'
import {
  LocalCopyResponse,
  DocumentPickerResponse,
  errorCodes,
  isErrorWithCode,
  pick,
  types,
  saveDocuments,
  SaveDocumentsResponse,
} from '@react-native-documents/picker'
import { useEffect } from 'react'
import { Box } from './components/Box'
import { viewDocument } from '@react-native-documents/viewer'
import { SelectableText } from './components/SelectableText'

export function SaveAsExamples() {
  const [results, _setResults] = React.useState<
    Array<DocumentPickerResponse[] | LocalCopyResponse[] | SaveDocumentsResponse[]>
  >([])
  const [error, setError] = React.useState<string>('')

  const addResult = (
    newResult: DocumentPickerResponse[] | LocalCopyResponse[] | SaveDocumentsResponse[],
  ) => {
    _setResults((prevResult) => {
      const sort = <T extends object>(object: T): T => {
        // @ts-ignore
        return Object.keys(object)
          .sort()
          .reduce(
            (acc, key) => ({
              ...acc,
              // @ts-ignore
              [key]: object[key],
            }),
            {},
          )
      }
      // const newResSorted = newResult
      const newResSorted = newResult.map(sort) as any as typeof newResult
      if (prevResult) {
        return [newResSorted, ...prevResult].slice(0, 4)
      } else {
        return [newResSorted]
      }
    })
    return newResult
  }

  useEffect(() => {
    setError('')
    console.log(JSON.stringify(results, null, 2))
  }, [results])

  const handleError = (err: unknown) => {
    if (isErrorWithCode(err)) {
      switch (err.code) {
        case errorCodes.IN_PROGRESS:
          console.warn(
            'user attempted to present a picker, but a previous one was already presented',
          )
          break
        case errorCodes.UNABLE_TO_OPEN_FILE_TYPE:
          setError('unable to open file type')
          break
        case errorCodes.OPERATION_CANCELED:
          console.log('cancelled')
          break
        default:
          setError(String(err))
          console.error(err)
      }
    } else {
      setError(String(err))
    }
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={{ gap: 20, padding: 10 }}
        testID={'screenContainer'}
      >
        <Box label={'Save As Example'}>
          <Button
            title="import multiple files"
            onPress={() => {
              pick({ allowMultiSelection: true })
                .then((res) => addResult(res))
                .catch(handleError)
            }}
          />
          <Button
            title="import single pdf file"
            onPress={() => {
              pick({
                type: types.pdf,
              })
                .then((res) => addResult(res))
                .catch(handleError)
            }}
          />
        </Box>
        <Button
          title="view the last imported file"
          onPress={() => {
            const lastResults = results[0]
            if (
              lastResults &&
              Array.isArray(lastResults) &&
              lastResults.length > 0 &&
              lastResults[0]
            ) {
              const lastResult = lastResults[0]
              const uriToOpen: string = (() => {
                if ('uri' in lastResult) {
                  return lastResult.uri
                }
                if ('localUri' in lastResult) {
                  return lastResult.localUri
                }
                throw new Error('no uri found')
              })()

              viewDocument({ uri: uriToOpen, mimeType: undefined }).catch(handleError)
            } else {
              console.warn('no uri found', lastResults)
            }
          }}
        />
        <Button
          title="save the last imported file to a location (='Save As' dialog)"
          onPress={async () => {
            const lastResults = results[0]

            if (verifyInput(lastResults)) {
              const savedDocs = await saveDocuments({
                sourceUris: lastResults.map((it) => it.uri),
                copy: true,
                fileName: 'some file name',
                // mimeType: lastResults[0].type!,
              })
              addResult(savedDocs)
            } else {
              console.warn(
                'In this demo, "Save As" works with the result of the last operation, and it needs to be an import.' +
                  'The last operation was not import. Tap "Import single PDF" and try again.',
              )
            }
          }}
        />

        <Text>Results (most recent at the top)</Text>
        <View>
          {error && (
            <Text
              selectable
              style={{ fontWeight: 'bold', color: 'black' }}
              accessibilityLabel={'pickerError'}
            >
              Error: {error}
            </Text>
          )}
          {results.flat().map((result, index) => {
            return (
              <View key={index}>
                <SelectableText accessibilityLabel={`result-${index}`} value={result} />
              </View>
            )
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const verifyInput = (arg?: Array<any>): arg is Array<DocumentPickerResponse> => {
  const one = Array.isArray(arg) && arg.length > 0 && arg[0]
  if (one) {
    const lastResult = arg[0]
    return 'type' in lastResult && 'convertibleToMimeTypes' in lastResult
  }
  return false
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  box: {
    width: 60,
    height: 60,
    marginVertical: 20,
  },
})
