// LICENSE: see License.md in the package root

import Foundation
import UniformTypeIdentifiers

public class DocumentMetadataBuilder {
  private let uri: URL
  private let resourceValues: URLResourceValues?
  private var bookmarkData: Data?
  private var metadataError: Error?
  private var bookmarkError: Error?
  
  init(forUri uri: URL) {
    self.uri = uri
    self.resourceValues = nil
  }
  
  init(forUri uri: URL, resourceValues: URLResourceValues) {
    self.uri = uri
    self.resourceValues = resourceValues
  }
  
  convenience init(forUri uri: URL, error: Error) {
    self.init(forUri: uri)
    self.metadataError = error
  }
  
  func setBookmark(_ bookmark: Data) {
    self.bookmarkData = bookmark
  }
  
  func setBookmarkError(_ bookmarkError: Error) {
    self.bookmarkError = bookmarkError
  }
  
  func setMetadataReadingError(_ error: Error) {
    self.metadataError = error
  }
  
  func build() -> [String: Any?] {
    var dictionary: [String: Any?] = [:]
    if (resourceValues?.isDirectory ?? false == false) {
      let utTypeFromFile: UTType? = resourceValues?.contentType
      let utType: UTType? = utTypeFromFile ?? UTType(filenameExtension: uri.pathExtension)

      dictionary = [
        "name": resourceValues?.name,
        "size": resourceValues?.fileSize,
        "type": utType?.preferredMIMEType,
        "nativeType": utType?.identifier,
        "error": metadataError?.localizedDescription,
        "isVirtual": false,
        "convertibleToMimeTypes": nil
      ]
    }

    dictionary["uri"] = uri.absoluteString

    if let bookmark = bookmarkData {
      dictionary["bookmarkStatus"] = "success"
      dictionary["bookmark"] = bookmark.base64EncodedString()
    } else if let bookmarkError = bookmarkError {
      dictionary["bookmarkStatus"] = "error"
      dictionary["bookmarkError"] = bookmarkError.localizedDescription
    }
    
    return dictionary
  }
}
