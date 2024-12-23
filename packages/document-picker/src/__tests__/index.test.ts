import '../../jest/setup' // set up the mock, same effect as setupFiles
import { expect, it } from '@jest/globals'

// this import path not is mocked, we're mocking on the native module boundary
import * as RNDP from '@react-native-documents/picker'
import { safeValidate } from '../validateTypes'

describe('DocumentPicker mock should', () => {
  describe('safeValidate', () => {
    it.each([
      // [requestedTypes, type, expected]
      [['*/*'], null, true],
      [['*/*'], 'image/jpeg', true],
      [['image/jpeg'], 'image/jpeg', true],
      [['image/jpeg', 'image/png'], 'image/png', true],
      [['application/pdf'], 'image/jpeg', false],
      [['image/*'], 'image/gif', true],
      [['image/*'], 'video/mp4', false],
      [['application/*'], 'application/json', true],
      [['text/*', 'image/*'], 'text/html', true],
      [['text/*', 'image/*'], 'application/json', false],
      [['image/jpeg'], null, false], // Testing null type in singlePickResult
      [['image/*'], null, false],
    ])(
      'correctly validates requestedTypes %s with type %s as %s',
      (requestedTypes, nativeType, expected) => {
        const singlePickResult = { nativeType }
        const result = safeValidate(requestedTypes, singlePickResult)
        expect(result).toBe(expected)
      },
    )
  })

  it('have the expected methods', () => {
    expect(RNDP).toMatchSnapshot()
  })

  it('allow picking a mock document', async () => {
    const response = await RNDP.pick()
    expect(response).toStrictEqual([
      {
        convertibleToMimeTypes: null,
        error: null,
        hasRequestedType: true,
        isVirtual: false,
        name: 'mockName.pdf',
        nativeType: 'com.adobe.pdf',
        size: 1234,
        type: 'application/pdf',
        uri: 'file:///mock/uri/mockName.pdf',
      },
    ])
  })
  //.. todo can test more mock methods
})
