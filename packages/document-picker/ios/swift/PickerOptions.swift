// LICENSE: see License.md in the package root

import Foundation
import UIKit
import UniformTypeIdentifiers

@objc public class PickerOptions: NSObject {
  let allowedTypes: Array<UTType>
  let mode: String // "import" or "open"
  let allowMultiSelection: Bool
  let transitionStyle: UIModalTransitionStyle
  let presentationStyle: UIModalPresentationStyle
  let initialDirectoryUrl: URL?
  let shouldShowFileExtensions: Bool
  let requestLongTermAccess: Bool
  
  @objc public init(types: Array<String>, mode: String = "import", initialDirectoryUrl: String? = nil, allowMultiSelection: Bool, shouldShowFileExtensions: Bool, transitionStyle: UIModalTransitionStyle = .coverVertical, presentationStyle: UIModalPresentationStyle = .fullScreen, requestLongTermAccess: Bool = false) {
    // TODO check if types were valid
    allowedTypes = types.compactMap {
      UTType($0)
    }
    self.allowMultiSelection = allowMultiSelection
    self.transitionStyle = transitionStyle
    self.presentationStyle = presentationStyle
    self.mode = mode
    if let unwrappedUrl = initialDirectoryUrl, let url = URL(string: unwrappedUrl) {
      self.initialDirectoryUrl = url
    } else {
      self.initialDirectoryUrl = nil
    }
    self.shouldShowFileExtensions = shouldShowFileExtensions
    self.requestLongTermAccess = requestLongTermAccess
  }
  
  // asCopy: if true, the picker will give you access to a local copy of the document, otherwise you will have access to the original document
  public func modeAsCopy() -> Bool {
    return self.mode == "import"
  }

  public func isOpenMode() -> Bool {
    return self.mode == "open"
  }

}
