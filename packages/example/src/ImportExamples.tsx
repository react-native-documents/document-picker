import * as React from 'react'

import { StyleSheet, Text, Button, ScrollView, SafeAreaView, Platform, View } from 'react-native'
import {
  LocalCopyResponse,
  keepLocalCopy,
  DocumentPickerResponse,
  errorCodes,
  isErrorWithCode,
  pick,
  types,
  SaveDocumentsResponse,
  type NonEmptyArray,
  FileToCopy,
} from '@react-native-documents/picker'
import { useEffect } from 'react'
import { Box } from './components/Box'
import invariant from 'invariant'
import { viewDocument } from '@react-native-documents/viewer'
import { SelectableText } from './components/SelectableText'

export function ImportExamples() {
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
      console.error(err)
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
        <Box label={'Import mode'}>
          <Button
            title="single file import, and ensure it is available in the local storage"
            onPress={async () => {
              try {
                const pickResults = await pick({ allowMultiSelection: false })
                addResult(pickResults)
                const filesToCopy: Array<FileToCopy> = pickResults.map((file) => ({
                  uri: file.uri,
                  fileName: file.name ?? 'fallback',
                }))
                const copyResults = await keepLocalCopy({
                  files: filesToCopy as NonEmptyArray<FileToCopy>,
                  destination: 'cachesDirectory',
                })

                const localCopyResults: LocalCopyResponse[] = copyResults.map((it) => {
                  invariant(it.status === 'success', 'status should be success')
                  return {
                    status: 'success',
                    sourceUri: it.sourceUri,
                    localUri: it.localUri,
                  }
                })
                addResult(localCopyResults)
              } catch (err) {
                handleError(err)
              }
            }}
          />

          <Button
            title="import multiple files"
            onPress={() => {
              pick({ allowMultiSelection: true })
                .then((res) => addResult(res))
                .catch(handleError)
            }}
          />
          <Button
            title="import multiple docx or pdf files"
            onPress={() => {
              pick({
                allowMultiSelection: true,
                type: [types.pdf, types.docx],
              })
                .then((res) => {
                  const allFilesArePdfOrDocx = res.every((file) => file.hasRequestedType)
                  if (!allFilesArePdfOrDocx) {
                    // tell the user they selected a file that is not a pdf or docx
                  }
                  addResult(res)
                })
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
          <Button
            title="import virtual file (such as in GDrive)"
            onPress={async () => {
              try {
                const [file] = await pick({
                  allowVirtualFiles: true,
                })
                addResult([file])
                const { name, uri: pickedUri, convertibleToMimeTypes } = file

                const getLocalUri = Platform.select({
                  android: async () => {
                    const virtualFileMeta = convertibleToMimeTypes && convertibleToMimeTypes[0]
                    invariant(
                      name && virtualFileMeta,
                      'name and convertibleToMimeTypes is required',
                    )
                    const [copyResult] = await keepLocalCopy({
                      files: [
                        {
                          uri: pickedUri,
                          fileName: `${name}.${virtualFileMeta.extension ?? ''}`,
                          convertVirtualFileToType: virtualFileMeta.mimeType,
                        },
                      ],
                      destination: 'cachesDirectory',
                    })
                    if (copyResult.status === 'success') {
                      return copyResult.localUri
                    } else {
                      throw new Error(copyResult.copyError)
                    }
                  },
                  default: async () => {
                    const [copyResult] = await keepLocalCopy({
                      files: [
                        {
                          uri: pickedUri,
                          fileName: name ?? 'fallback',
                        },
                      ],
                      destination: 'cachesDirectory',
                    })
                    if (copyResult.status === 'success') {
                      return copyResult.localUri
                    } else {
                      throw new Error(copyResult.copyError)
                    }
                  },
                })
                const localUri = await getLocalUri()
                addResult([{ status: 'success', sourceUri: pickedUri, localUri }])
              } catch (err) {
                handleError(err)
              }
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
