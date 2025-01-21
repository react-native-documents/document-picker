---
sidebar_position: 50
---

# Jest module mocks

You will need to mock the functionality of the native modules once you require them from your test files - otherwise you'll get [this error](https://github.com/rnmods/react-native-document-picker/issues/702).

The packages provide Jest mocks that you can add to the [`setupFiles`](https://jestjs.io/docs/configuration#setupfiles-array) array in the Jest config.

By default, the mocks behave as if the calls were successful and return mock document data.

```json title="jest.config"
{
  "setupFiles": [
    "./node_modules/@react-native-documents/picker/jest/build/jest/setup.js",
    "./node_modules/@react-native-documents/viewer/jest/build/jest/setup.js"
  ]
}
```
