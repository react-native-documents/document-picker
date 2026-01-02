// LICENSE: see License.md in the package root

import Foundation
import UniformTypeIdentifiers

@objc public class DocPicker: PickerBase {
  var pickerOptions: PickerOptions?
  var openedUrls: Set<URL> = []

  @MainActor
  override func createDocumentPicker(from dictionary: NSDictionary) -> UIDocumentPickerViewController {
    let options = PickerOptions(dictionary: dictionary)
    self.pickerOptions = options
    return options.createDocumentPicker()
  }

  public override func documentPicker(_ controller: UIDocumentPickerViewController, didPickDocumentsAt urls: [URL]) {
    guard let promise = promiseWrapper.takeCallbacks() else { return }
    let options = self.pickerOptions

    Task.detached(priority: .userInitiated) {
      let documentsInfo = self.createDocumentMetadataWithOptions(for: urls, options: options)
        .compactMap { $0.build() }
      promise.resolve(documentsInfo)
    }
  }

  nonisolated private func createDocumentMetadataWithOptions(for urls: [URL], options: PickerOptions?) -> [DocumentMetadataBuilder] {
    return urls.compactMap { url in
      do {
        return try self.getMetadataForWithOptions(url: url, options: options)
      } catch {
        return DocumentMetadataBuilder(forUri: url, error: error)
      }
    }
  }

  nonisolated private func getMetadataForWithOptions(url: URL, options: PickerOptions?) throws -> DocumentMetadataBuilder {
    return if options?.isOpenMode() == true {
      try self.getOpenedDocumentInfo(url: url, requestLongTermAccess: options?.requestLongTermAccess ?? false)
    } else {
      try self.getAnyModeMetadata(url: url)
    }
  }

  nonisolated private func getAnyModeMetadata(url: URL) throws -> DocumentMetadataBuilder {
    let resourceValues = try url.resourceValues(forKeys: [.fileSizeKey, .nameKey, .isDirectoryKey, .contentTypeKey])

    return DocumentMetadataBuilder(forUri: url, resourceValues: resourceValues)
  }

  enum KeepLocalCopyError: Error {
    case sourceAccessError
  }

  nonisolated private func getOpenedDocumentInfo(url: URL, requestLongTermAccess: Bool) throws -> DocumentMetadataBuilder {
    guard url.startAccessingSecurityScopedResource() else {
      throw KeepLocalCopyError.sourceAccessError
    }

    // url.stopAccessingSecurityScopedResource() must be called later by user
    DispatchQueue.main.async { [weak self] in
      self?.openedUrls.insert(url)
    }

    // Use file coordination for reading and writing any of the URL's content.
    var error: NSError? = nil
    var success = false
    var metadataBuilder = DocumentMetadataBuilder(forUri: url)

    NSFileCoordinator().coordinate(readingItemAt: url, error: &error) { (url) in
      do {
        metadataBuilder = try self.getAnyModeMetadata(url: url)
        success = true
      } catch {
        metadataBuilder.setMetadataReadingError(error)
      }

      if requestLongTermAccess {
        do {
          let bookmarkData = try url.bookmarkData(options: .minimalBookmark, includingResourceValuesForKeys: nil, relativeTo: nil)
          metadataBuilder.setBookmark(bookmarkData)
        } catch {
          metadataBuilder.setBookmarkError(error)
        }
      }
    }
    if let err = error, !success {
      throw err
    }
    return metadataBuilder
  }

  @objc public func stopAccessingOpenedUrls(_ urlStrings: [String]) {
    let incomingUrls = Set(urlStrings.compactMap { URL(string: $0) })
    for url in openedUrls.intersection(incomingUrls) {
      url.stopAccessingSecurityScopedResource()
      openedUrls.remove(url)
    }
  }

}
