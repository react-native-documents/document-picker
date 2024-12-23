//
//  DocSaver.swift
//  react-native-document-picker
//
//  Created by Vojtech Novak on 25.05.2024.
//

// LICENSE: see License.md in the package root

import Foundation
import UniformTypeIdentifiers
import MobileCoreServices

@objc public class DocSaver: PickerWithMetadataImpl {

  @objc public func present(options: SaverOptions, resolve: @escaping (Any?) -> Void, reject: @escaping (String?, String?, Error?) -> Void) {
    if (!promiseWrapper.trySetPromiseRejectingIncoming(resolve, rejecter: reject, fromCallSite: "saveDocuments")) {
      return;
    }
    DispatchQueue.main.async {
      let documentPicker = UIDocumentPickerViewController(forExporting: options.sourceUrls, asCopy: options.asCopy)

      documentPicker.modalPresentationStyle = options.presentationStyle
      documentPicker.modalTransitionStyle = options.transitionStyle
      //        documentPicker.directoryURL = options.initialDirectoryUrl
      //        documentPicker.shouldShowFileExtensions = options.shouldShowFileExtensions

      self.presentInternal(documentPicker: documentPicker)
    }
  }

  public func getMetadataFor(url: URL) throws -> DocumentMetadataBuilder {
    let name = url.lastPathComponent.removingPercentEncoding

    var resourceValues = URLResourceValues()
    resourceValues.name = name

    return DocumentMetadataBuilder(forUri: url, resourceValues: resourceValues)
  }

}
