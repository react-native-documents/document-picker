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
    switch self {
    case .success(let sourceUri, let localUri):
      return ["sourceUri": sourceUri, "localUri": localUri, "status": "success"]
    case .error(let sourceUri, let copyError):
      var result = ["copyError": copyError, "status": "error"]
      result["sourceUri"] = sourceUri ?? nil
      return result
    }
  }
}
