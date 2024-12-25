export interface NativeModuleError extends Error {
  code: string
}

const OPERATION_CANCELED = 'OPERATION_CANCELED'
const IN_PROGRESS = 'ASYNC_OP_IN_PROGRESS'
const UNABLE_TO_OPEN_FILE_TYPE = 'UNABLE_TO_OPEN_FILE_TYPE'

/**
 * Error codes that can be returned by the module, and are available on the `code` property of the error.
 *
 * @example
 * ```ts
 *   const handleError = (err: unknown) => {
 *     if (isErrorWithCode(err)) {
 *       switch (err.code) {
 *         case errorCodes.IN_PROGRESS:
 *           ...
 *           break
 *         case errorCodes.UNABLE_TO_OPEN_FILE_TYPE:
 *           ...
 *           break
 *         case errorCodes.OPERATION_CANCELED:
 *           // ignore
 *           break
 *         default:
 *           console.error(err)
 *       }
 *     } else {
 *        console.error(err)
 *     }
 *   }
 * ```
 * */
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
