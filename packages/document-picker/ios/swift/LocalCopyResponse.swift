// LICENSE: see License.md in the package root

import Foundation

// export type LocalCopyResponse =
//   | {
//       status: 'success'
//       sourceUri: string
//       localUri: string
//     }
//   | { status: 'error'; sourceUri: string; copyError: string }

enum LocalCopyResponse {
  case success(sourceUri: String, localUri: String)
  case error(sourceUri: String?, copyError: String)

  var dictionaryRepresentation: [String: String?] {
    return switch self {
    case .success(let sourceUri, let localUri):
      ["sourceUri": sourceUri, "localUri": localUri, "status": "success"]
    case .error(let sourceUri, let copyError):
      ["sourceUri": sourceUri, "copyError": copyError, "status": "error"]
    }
  }
}
