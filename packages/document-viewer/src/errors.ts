const UNABLE_TO_OPEN_FILE_TYPE = 'UNABLE_TO_OPEN_FILE_TYPE'
const NULL_PRESENTER = 'NULL_PRESENTER'

export const errorCodes = Object.freeze({
  UNABLE_TO_OPEN_FILE_TYPE,
  NULL_PRESENTER,
})

type ErrorCodes = (typeof errorCodes)[keyof typeof errorCodes]

export interface NativeModuleError extends Error {
  code: ErrorCodes | (string & {})
}

/**
 * TypeScript helper to check if an object has the `code` property.
 * This is used to avoid `as` casting when you access the `code` property on errors returned by the module.
 */
export const isErrorWithCode = (error: unknown): error is NativeModuleError => {
  return error instanceof Error && 'code' in error
}
