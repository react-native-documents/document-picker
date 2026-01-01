//
//  IsKnownTypeImpl.swift
//  react-native-document-picker
//
//  Created by Vojtech Novak on 26.05.2024.
// LICENSE: see License.md in the package root
//

import Foundation
import UniformTypeIdentifiers

@objc public class IsKnownTypeImpl: NSObject {

  @objc public static func checkType(_ kind: String, value: String) -> [String: Any] {
    return getTypeResult(kind, value: value)
  }

  static func getTypeResult(_ kind: String, value: String) -> [String: Any] {
    if let utType = createUTType(kind: kind, value: value), utType.isDeclared == true {
      return [
        "isKnown": true,
        "UTType": utType.identifier,
        "preferredFilenameExtension": utType.preferredFilenameExtension ?? NSNull(),
        "mimeType": utType.preferredMIMEType ?? NSNull()
      ]
    }
    return [
      "isKnown": false,
      "UTType": NSNull(),
      "preferredFilenameExtension": NSNull(),
      "mimeType": NSNull()
    ]
  }

  static func createUTType(kind: String, value: String) -> UTType? {
    switch kind {
    case "UTType": UTType(value)
    case "mimeType": UTType(mimeType: value)
    case "extension": UTType(filenameExtension: value)
    default: nil
    }
  }
}

