// LICENSE: see License.md in the package root

import Foundation
import UniformTypeIdentifiers

@objc public class SaverOptions: NSObject {
  @objc public var initialDirectoryUrl: URL?
  @objc public var fileName: String?
  @objc public var data: String?
  @objc public var uri: String?
  @objc public var shouldShowFileExtensions: Bool
  @objc public var asCopy: Bool
  
  @objc public override init() {
    initialDirectoryUrl = nil
    fileName = nil
    data = nil
    uri = nil
    shouldShowFileExtensions = true
    asCopy = true
    super.init()
  }
  
  @objc public init(fileName: String? = nil, data: String? = nil, uri: String? = nil, asCopy: Bool = true, initialDirectoryUrl: String? = nil, shouldShowFileExtensions: Bool = true) {
    self.fileName = fileName
    self.data = data
    self.uri = uri
    self.asCopy = asCopy
    if let unwrappedUrl = initialDirectoryUrl, let url = URL(string: unwrappedUrl) {
      self.initialDirectoryUrl = url
    } else {
      self.initialDirectoryUrl = nil
    }
    self.shouldShowFileExtensions = shouldShowFileExtensions
  }
  
}