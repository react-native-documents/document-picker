// LICENSE: see License.md in the package root

import Foundation
import UIKit
import UniformTypeIdentifiers

@objc public class SaverOptions: NSObject {
  let transitionStyle: UIModalTransitionStyle
  let presentationStyle: UIModalPresentationStyle
  let initialDirectoryUrl: URL?
  let sourceUrls: [URL]
  let shouldShowFileExtensions: Bool
  let asCopy: Bool
  
  @objc public init(sourceUrlStrings: [String], asCopy: Bool, initialDirectoryUrl: String? = nil, shouldShowFileExtensions: Bool, transitionStyle: UIModalTransitionStyle = .coverVertical, presentationStyle: UIModalPresentationStyle = .fullScreen) {
    self.sourceUrls = sourceUrlStrings.map({ it in
      URL(string: it)!
    })
    self.asCopy = asCopy
    self.transitionStyle = transitionStyle
    self.presentationStyle = presentationStyle
    if let unwrappedUrl = initialDirectoryUrl, let url = URL(string: unwrappedUrl) {
      self.initialDirectoryUrl = url
    } else {
      self.initialDirectoryUrl = nil
    }
    self.shouldShowFileExtensions = shouldShowFileExtensions
  }
  
}
