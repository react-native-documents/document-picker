// LICENSE: see License.md in the package root

import Foundation
import UniformTypeIdentifiers
import CoreServices
import AppKit

@objc public class DocPicker: PickerWithMetadataImpl {

  var currentOptions: PickerOptions? = nil

  @objc public func present(options: PickerOptions, resolve: @escaping RNDPPromiseResolveBlock, reject: @escaping RNDPPromiseRejectBlock) {
    if (!promiseWrapper.trySetPromiseRejectingIncoming(resolve, rejecter: reject, fromCallSite: "pick")) {
      return;
    }
    currentOptions = options;
    DispatchQueue.main.async {
      let openPanel = NSOpenPanel()
      
      openPanel.allowsMultipleSelection = options.allowMultiSelection
      openPanel.canChooseDirectories = false
      openPanel.canChooseFiles = true
      openPanel.canCreateDirectories = false
      
      // Set allowed file types
      if !options.allowedTypes.isEmpty {
        var allowedExtensions: [String] = []
        for utType in options.allowedTypes {
          if let extensions = utType.tags[.filenameExtension] {
            allowedExtensions.append(contentsOf: extensions)
          }
        }
        if !allowedExtensions.isEmpty {
          openPanel.allowedContentTypes = options.allowedTypes
        }
      }
      
      openPanel.begin { (result) in
        if result == .OK {
          self.handlePickerResult(urls: openPanel.urls)
        } else {
          self.promiseWrapper.reject(fromCallSite: "pick", code: "DOCUMENT_PICKER_CANCELED", message: "User canceled document picker", error: nil)
        }
      }
    }
  }

  @objc public func presentDirectory(options: PickerOptions, resolve: @escaping RNDPPromiseResolveBlock, reject: @escaping RNDPPromiseRejectBlock) {
    if (!promiseWrapper.trySetPromiseRejectingIncoming(resolve, rejecter: reject, fromCallSite: "pickDirectory")) {
      return;
    }
    currentOptions = options;
    DispatchQueue.main.async {
      let openPanel = NSOpenPanel()
      
      openPanel.allowsMultipleSelection = options.allowMultiSelection
      openPanel.canChooseDirectories = true
      openPanel.canChooseFiles = false
      openPanel.canCreateDirectories = false
      
      openPanel.begin { (result) in
        if result == .OK {
          self.handlePickerResult(urls: openPanel.urls)
        } else {
          self.promiseWrapper.reject(fromCallSite: "pickDirectory", code: "DOCUMENT_PICKER_CANCELED", message: "User canceled directory picker", error: nil)
        }
      }
    }
  }

  public func getMetadataFor(url: URL) throws -> DocumentMetadataBuilder {
    return if (currentOptions?.isOpenMode() == true) {
      try self.getOpenedDocumentInfo(url: url, requestLongTermAccess: currentOptions?.requestLongTermAccess ?? false)
    } else {
      try self.getAnyModeMetadata(url: url)
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
    // On macOS, we don't need security scoped resources for files picked by NSOpenPanel
    // They are automatically accessible
    defer {
      // No need to stop accessing on macOS for NSOpenPanel results
    }

    let resourceValues = try url.resourceValues(forKeys: [.fileSizeKey, .nameKey, .isDirectoryKey, .contentTypeKey])
    let builder = DocumentMetadataBuilder(forUri: url, resourceValues: resourceValues)

    return builder
  }
}