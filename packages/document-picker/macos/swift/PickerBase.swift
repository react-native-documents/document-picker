// LICENSE: see License.md in the package root

import Foundation
import UniformTypeIdentifiers
import CoreServices

public protocol GetsMetadataProtocol {
    func getMetadataFor(url: URL) throws -> DocumentMetadataBuilder
}

// https://stackoverflow.com/a/51333906/2070942
public typealias PickerWithMetadataImpl = PickerBase & GetsMetadataProtocol

public class PickerBase: NSObject {
  let promiseWrapper = PromiseWrapper()
  var openedUrls: Array<URL> = []

  func handlePickerResult(urls: [URL]) {
    DispatchQueue.global(qos: .userInitiated).async {
      // this doesn't run on the main thread
      let documentsInfo = urls.compactMap(self.createDocumentMetadata).compactMap { $0.build() }
      self.promiseWrapper.resolve(fromCallSite: "picker", result: documentsInfo)
    }
  }
  
  private func createDocumentMetadata(for url: URL) -> DocumentMetadataBuilder? {
    guard let subclassThatGetsMetadata = self as? GetsMetadataProtocol else {
      let error = NSError(domain: NSCocoaErrorDomain, code: 0, userInfo: nil)
      self.promiseWrapper.reject(fromCallSite: "picker", code: "BAD_CLASS", message: "PickerBase", error: error)
      return nil
    }
    
    do {
      return try subclassThatGetsMetadata.getMetadataFor(url: url)
    } catch {
      return DocumentMetadataBuilder(forUri: url, error: error)
    }
  }

  @objc public func stopAccessingOpenedUrls(_ urlStrings: [String]) {
    let incomingUrls = Set(urlStrings.compactMap { URL(string: $0) })
    openedUrls.removeAll { url in
      guard incomingUrls.contains(url) else { return false }
      url.stopAccessingSecurityScopedResource()
      return true
    }
  }

}