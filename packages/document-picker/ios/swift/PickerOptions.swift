// LICENSE: see License.md in the package root

import Foundation
import UIKit
import UniformTypeIdentifiers

@objc public class PickerOptions: NSObject {
  @objc public var allowedTypes: Array<UTType>
  @objc public var mode: String // "import" or "open"
  @objc public var allowMultiSelection: Bool
  @objc public var transitionStyle: UIModalTransitionStyle
  @objc public var presentationStyle: UIModalPresentationStyle
  @objc public var initialDirectoryUrl: URL?
  @objc public var shouldShowFileExtensions: Bool
  @objc public var requestLongTermAccess: Bool
  
  @objc public override init() {
    allowedTypes = []
    mode = "import"
    allowMultiSelection = false
    transitionStyle = .coverVertical
    presentationStyle = .fullScreen
    initialDirectoryUrl = nil
    shouldShowFileExtensions = true
    requestLongTermAccess = false
    super.init()
  }
  
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
