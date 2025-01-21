export interface NativeModuleError extends Error {
  code: string
}

const OPERATION_CANCELED = 'OPERATION_CANCELED'
const IN_PROGRESS = 'ASYNC_OP_IN_PROGRESS'
const UNABLE_TO_OPEN_FILE_TYPE = 'UNABLE_TO_OPEN_FILE_TYPE'

export const errorCodes = Object.freeze({
  OPERATION_CANCELED,
  IN_PROGRESS,
  UNABLE_TO_OPEN_FILE_TYPE,
})

/**
 * TypeScript helper to check if an object has the `code` property.
 * This is used to avoid `as` casting when you access the `code` property on errors returned by the module.
 */
export const isErrorWithCode = (error: any): error is NativeModuleError => {
  // to account for https://github.com/facebook/react-native/issues/41950
  const isNewArchErrorIOS = typeof error === 'object' && error != null
  return (error instanceof Error || isNewArchErrorIOS) && 'code' in error
}
