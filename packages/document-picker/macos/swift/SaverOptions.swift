// LICENSE: see License.md in the package root

import Foundation
import UniformTypeIdentifiers

@objc public class SaverOptions: NSObject {
  let initialDirectoryUrl: URL?
  let fileName: String?
  let data: String?
  let uri: String?
  let shouldShowFileExtensions: Bool
  let asCopy: Bool
  
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