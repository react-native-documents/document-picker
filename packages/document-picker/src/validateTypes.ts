import type { DocumentPickerResponse } from './types'

export const safeValidate = (
  requestedTypes: string[],
  singlePickResult: Pick<DocumentPickerResponse, 'nativeType'>,
) => {
  const { nativeType } = singlePickResult
  return requestedTypes.some((it) => nativeTypeMatches(it, nativeType))
}

const nativeTypeMatches = (requiredType: string, actualType: string | null) => {
  if (requiredType === actualType || requiredType === '*/*') {
    return true
  }
  if (actualType === null) {
    return false
  }
  if (requiredType.endsWith('/*')) {
    const requiredTypeWithoutStar = requiredType.slice(0, -2)
    if (actualType.startsWith(requiredTypeWithoutStar)) {
      return true
    }
  }

  return false
}
