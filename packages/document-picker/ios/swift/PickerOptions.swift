// LICENSE: see License.md in the package root

import Foundation
import UIKit
import UniformTypeIdentifiers
import React

public enum PickerMode: String, Sendable {
  case `import` = "import"
  case open = "open"
}

public struct PickerOptions: Sendable {
  let allowedTypes: Array<UTType>
  let mode: PickerMode
  let allowMultiSelection: Bool
  var transitionStyle: UIModalTransitionStyle?
  var presentationStyle: UIModalPresentationStyle?
  var initialDirectoryUri: URL?
  let shouldShowFileExtensions: Bool
  let requestLongTermAccess: Bool

  public init(dictionary: NSDictionary) {
    let types = dictionary["type"] as? [String] ?? []
    let modeString = dictionary["mode"] as? String ?? "import"
    let allowMultiSelection = dictionary["allowMultiSelection"] as? Bool ?? false
    let shouldShowFileExtensions = dictionary["showFileExtensions"] as? Bool ?? false
    let requestLongTermAccess = dictionary["requestLongTermAccess"] as? Bool ?? false

    // TODO check if types were valid
    self.allowedTypes = types.compactMap { UTType($0) }
    self.mode = PickerMode(rawValue: modeString) ?? .import
    self.allowMultiSelection = allowMultiSelection
    self.shouldShowFileExtensions = shouldShowFileExtensions
    self.requestLongTermAccess = requestLongTermAccess

    if let transitionStyle = dictionary["transitionStyle"] as? String {
      self.transitionStyle = RCTConvert.uiModalTransitionStyle(transitionStyle)
    }
    if let presentationStyle = dictionary["presentationStyle"] as? String {
      self.presentationStyle = RCTConvert.uiModalPresentationStyle(presentationStyle)
    }
    if let initialDirectoryUri = dictionary["initialDirectoryUri"] as? String, let url = URL(string: initialDirectoryUri) {
      self.initialDirectoryUri = url
    }
  }

  // asCopy: if true, the picker will give you access to a local copy of the document, otherwise you will have access to the original document
  func modeAsCopy() -> Bool {
    return self.mode == .import
  }

  func isOpenMode() -> Bool {
    return self.mode == .open
  }

  @MainActor
  public func createDocumentPicker() -> UIDocumentPickerViewController {
    let picker = UIDocumentPickerViewController(forOpeningContentTypes: allowedTypes, asCopy: modeAsCopy())
    picker.allowsMultipleSelection = allowMultiSelection

    if let presentationStyle = presentationStyle {
      picker.modalPresentationStyle = presentationStyle
    }
    if let transitionStyle = transitionStyle {
      picker.modalTransitionStyle = transitionStyle
    }
    picker.directoryURL = initialDirectoryUri
    picker.shouldShowFileExtensions = shouldShowFileExtensions

    return picker
  }

}
