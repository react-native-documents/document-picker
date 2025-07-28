// LICENSE: see License.md in the package root

import Foundation
import UIKit
import UniformTypeIdentifiers

@objc public class SaverOptions: NSObject {
  @objc public var transitionStyle: UIModalTransitionStyle
  @objc public var presentationStyle: UIModalPresentationStyle
  @objc public var initialDirectoryUrl: URL?
  @objc public var sourceUrls: [URL]
  @objc public var shouldShowFileExtensions: Bool
  @objc public var asCopy: Bool
  @objc public var fileName: String?
  @objc public var data: String?
  @objc public var uri: String?
  
  @objc public override init() {
    transitionStyle = .coverVertical
    presentationStyle = .fullScreen
    initialDirectoryUrl = nil
    sourceUrls = []
    shouldShowFileExtensions = true
    asCopy = true
    fileName = nil
    data = nil
    uri = nil
    super.init()
  }
  
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
