// LICENSE: see License.md in the package root

import Foundation
import UIKit
import UniformTypeIdentifiers
import React

public struct SaverOptions: Sendable {
  var transitionStyle: UIModalTransitionStyle?
  var presentationStyle: UIModalPresentationStyle?
  var initialDirectoryUri: URL?
  let sourceUrls: [URL]
  let shouldShowFileExtensions: Bool
  let asCopy: Bool

  public init(dictionary: NSDictionary) {
    let sourceUrlStrings = dictionary["sourceUris"] as? [String] ?? []
    let asCopy = dictionary["copy"] as? Bool ?? false
    let shouldShowFileExtensions = dictionary["showFileExtensions"] as? Bool ?? false

    self.sourceUrls = sourceUrlStrings.compactMap { URL(string: $0) }
    self.asCopy = asCopy
    self.shouldShowFileExtensions = shouldShowFileExtensions

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

  @MainActor
  public func createDocumentPicker() -> UIDocumentPickerViewController {
    let picker = UIDocumentPickerViewController(forExporting: sourceUrls, asCopy: asCopy)

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
