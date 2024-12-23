// LICENSE: see License.md in the package root

import Foundation
import UniformTypeIdentifiers
import MobileCoreServices

@objc public class DocPicker: PickerWithMetadataImpl {

  var currentOptions: PickerOptions? = nil

  @objc public func present(options: PickerOptions, resolve: @escaping RNDPPromiseResolveBlock, reject: @escaping RNDPPromiseRejectBlock) {
    // TODO fix callsite param
    if (!promiseWrapper.trySetPromiseRejectingIncoming(resolve, rejecter: reject, fromCallSite: "pick")) {
      return;
    }
    currentOptions = options;
    DispatchQueue.main.async {
      let documentPicker = UIDocumentPickerViewController(forOpeningContentTypes: options.allowedTypes, asCopy: options.modeAsCopy())

      documentPicker.modalPresentationStyle = options.presentationStyle
      documentPicker.allowsMultipleSelection = options.allowMultiSelection
      documentPicker.modalTransitionStyle = options.transitionStyle
      //        documentPicker.directoryURL = options.initialDirectoryUrl
      //        documentPicker.shouldShowFileExtensions = options.shouldShowFileExtensions

      self.presentInternal(documentPicker: documentPicker)
    }
  }

  public func getMetadataFor(url: URL) throws -> DocumentMetadataBuilder {
    if (currentOptions?.isOpenMode() == true) {
      return try self.getOpenedDocumentInfo(url: url, requestLongTermAccess: currentOptions?.requestLongTermAccess ?? false)
    } else {
      return try self.getAnyModeMetadata(url: url)
    }
  }

  private func getAnyModeMetadata(url: URL) throws -> DocumentMetadataBuilder {
    let resourceValues = try url.resourceValues(forKeys: [.fileSizeKey, .nameKey, .isDirectoryKey, .contentTypeKey])

    return DocumentMetadataBuilder(forUri: url, resourceValues: resourceValues)
  }

  enum KeepLocalCopyError: Error {
    case sourceAccessError
  }

  func getOpenedDocumentInfo(url: URL, requestLongTermAccess: Bool) throws -> DocumentMetadataBuilder {
    guard url.startAccessingSecurityScopedResource() else {
      throw KeepLocalCopyError.sourceAccessError
    }

    // url.stopAccessingSecurityScopedResource() must be called later
    openedUrls.append(url)

    // Use file coordination for reading and writing any of the URL’s content.
    var error: NSError? = nil
    var success = false
    var metadataBuilder: DocumentMetadataBuilder = DocumentMetadataBuilder(forUri: url)

    NSFileCoordinator().coordinate(readingItemAt: url, error: &error) { (url) in
      do {
        metadataBuilder = try self.getAnyModeMetadata(url: url)
        success = true
      } catch {
        metadataBuilder.setMetadataReadingError(error)
      }

      if (requestLongTermAccess == true) {
        do {
          let bookmarkData = try url.bookmarkData(options: .minimalBookmark, includingResourceValuesForKeys: nil, relativeTo: nil)
          metadataBuilder.setBookmark(bookmarkData)
        } catch {
          metadataBuilder.setBookmarkError(error)
        }
      }
    }
    if let err = error, success == false {
      throw err
    }
    return metadataBuilder
  }

}
