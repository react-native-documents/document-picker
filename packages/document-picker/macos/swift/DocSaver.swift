// LICENSE: see License.md in the package root

import Foundation
import UniformTypeIdentifiers
import CoreServices
import AppKit

@objc public class DocSaver: PickerWithMetadataImpl {

  @objc public func present(options: SaverOptions, resolve: @escaping RNDPPromiseResolveBlock, reject: @escaping RNDPPromiseRejectBlock) {
    if (!promiseWrapper.trySetPromiseRejectingIncoming(resolve, rejecter: reject, fromCallSite: "saveDocument")) {
      return;
    }
    
    DispatchQueue.main.async {
      let savePanel = NSSavePanel()
      
      if let fileName = options.fileName {
        savePanel.nameFieldStringValue = fileName
      }
      
      // Set allowed file types based on filename extension
      if let fileName = options.fileName {
        let fileExtension = (fileName as NSString).pathExtension
        if !fileExtension.isEmpty {
          if let utType = UTType(filenameExtension: fileExtension) {
            savePanel.allowedContentTypes = [utType]
          }
        }
      }
      
      savePanel.begin { (result) in
        if result == .OK {
          guard let url = savePanel.url else {
            self.promiseWrapper.reject(fromCallSite: "saveDocument", code: "SAVE_FAILED", message: "Failed to get save URL", error: nil)
            return
          }
          
          self.saveDocumentToURL(url: url, options: options)
        } else {
          self.promiseWrapper.reject(fromCallSite: "saveDocument", code: "DOCUMENT_PICKER_CANCELED", message: "User canceled save dialog", error: nil)
        }
      }
    }
  }
  
  private func saveDocumentToURL(url: URL, options: SaverOptions) {
    do {
      if let data = options.data {
        // Save base64 data
        guard let decodedData = Data(base64Encoded: data) else {
          promiseWrapper.reject(fromCallSite: "saveDocument", code: "INVALID_DATA", message: "Invalid base64 data", error: nil)
          return
        }
        try decodedData.write(to: url)
      } else if let sourceUri = options.uri {
        // Copy from source URI
        let sourceURL = URL(string: sourceUri)!
        try FileManager.default.copyItem(at: sourceURL, to: url)
      } else {
        promiseWrapper.reject(fromCallSite: "saveDocument", code: "INVALID_OPTIONS", message: "Either data or uri must be provided", error: nil)
        return
      }
      
      // Return success with saved file metadata
      let resourceValues = try url.resourceValues(forKeys: [.fileSizeKey, .nameKey, .isDirectoryKey, .contentTypeKey])
      let builder = DocumentMetadataBuilder(forUri: url, resourceValues: resourceValues)
      let metadata = builder.build()
      
      promiseWrapper.resolve(fromCallSite: "saveDocument", result: metadata)
    } catch {
      promiseWrapper.reject(fromCallSite: "saveDocument", code: "SAVE_FAILED", message: "Failed to save document: \(error.localizedDescription)", error: error)
    }
  }
  
  // MARK: - GetsMetadataProtocol
  public func getMetadataFor(url: URL) throws -> DocumentMetadataBuilder {
    let resourceValues = try url.resourceValues(forKeys: [.fileSizeKey, .nameKey, .isDirectoryKey, .contentTypeKey])
    return DocumentMetadataBuilder(forUri: url, resourceValues: resourceValues)
  }
}