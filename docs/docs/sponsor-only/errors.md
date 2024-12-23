---
sidebar_position: 60
---

# Error handling

This page describes the case when calling any of the modules' method rejects. Keep in mind other errors can also happen in `pick` ([see `error` and `hasRequestedType`](../doc-picker-api#documentpickerresponse)) and `keepLocalCopy` ([see `copyError`](../doc-picker-api#localcopyresponse)).

### Error codes

Both `picker` and `viewer` expose the `errorCodes` object which contains an object of possible error codes that can be returned by the native module.

Error codes are useful when determining which kind of error has occurred during the picking or viewing process.

| Error Code Key             | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `IN_PROGRESS`              | This is rather a warning, that happens when you invoke an operation (e.g. `pick`) while a previous one has not finished yet. For example: if you call `pick()` quickly twice in a row, 2 calls to `pick()` in the native module will be done. The first call will open the native document picker and user action will be expected. The promise from the second call to `pick` will be rejected with this error. Later, the first promise will resolve (or reject) with the actual files that the user has selected. Only one document picker window will be presented to the user. The reason the module explicitly rejects "duplicated" calls is to avoid memory leaks and to inform you that something probably isn't done right. |
| `UNABLE_TO_OPEN_FILE_TYPE` | When you try to use the picker or viewer using a configuration that system cannot comply with. On Android, this corresponds to [ActivityNotFoundException](https://developer.android.com/reference/android/content/ActivityNotFoundException). On iOS, this only happens in the Viewer module when you attempt to preview a file that's not supported by the [QuickLook framework](https://developer.apple.com/documentation/quicklook/qlpreviewcontroller/1617016-canpreviewitem?language=objc).                                                                                                                                                                                                                                    |
| `OPERATION_CANCELED`       | When user cancels the operation                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |

:::note

In a future release, `OPERATION_CANCELED` will be replaced with a more streamlined cancellation handling. I'm keeping it now to make [migration](migration.md) easier.

:::

```ts title="error-handling.ts"
import { errorCodes } from '@react-native-documents/picker'
// or
import { errorCodes } from '@react-native-documents/viewer'

const handleError = (err: unknown) => {
  if (isErrorWithCode(err)) {
    switch (err.code) {
      case errorCodes.IN_PROGRESS:
        console.warn('user attempted to present a picker, but a previous one was already presented')
        break
      case errorCodes.UNABLE_TO_OPEN_FILE_TYPE:
        setError('unable to open file type')
        break
      case errorCodes.OPERATION_CANCELED:
        // ignore
        break
      default:
        setError(String(err))
        console.error(err)
    }
  } else {
    setError(String(err))
  }
}
```

### `isErrorWithCode(value)`

TypeScript helper to check if the passed parameter is an instance of `Error` which has the `code` property. All errors thrown by the picker and viewer native modules have the `code` property, which contains a value from [`errorCodes`](#error-codes) or some other string for the less-usual errors.

`isErrorWithCode` can be used to avoid `as` casting when you want to access the `code` property on errors returned by the module.

```ts
import { pick, isErrorWithCode } from '@react-native-documents/picker'

try {
  const [pickResult] = await pick()
  // do something with pickResult
} catch (error) {
  if (isErrorWithCode(error)) {
    // here you can safely read `error.code` and TypeScript will know that it has a value
  } else {
    // this error does not have a `code`, and does not come from the native module
  }
}
```
