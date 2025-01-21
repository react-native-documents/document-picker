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

public protocol GetsMetadataProtocol {
    func getMetadataFor(url: URL) throws -> DocumentMetadataBuilder
}

// https://stackoverflow.com/a/51333906/2070942
public typealias PickerWithMetadataImpl = PickerBase & GetsMetadataProtocol

public class PickerBase: NSObject, UIDocumentPickerDelegate, UIAdaptivePresentationControllerDelegate {
  let promiseWrapper = PromiseWrapper()
  var openedUrls: Array<URL> = []

  func presentInternal(documentPicker: UIDocumentPickerViewController) {
    documentPicker.delegate = self
    documentPicker.presentationController?.delegate = self;
        
    if let viewController = RCTPresentedViewController() {
      viewController.present(documentPicker, animated: true, completion: nil)
    } else {
      let error = NSError(domain: NSCocoaErrorDomain, code: 0, userInfo: nil)
      promiseWrapper.reject("RCTPresentedViewController was nil", withCode: "PRESENTER_IS_NULL", withError: error)
    }
  }
  
  public func documentPicker(_ controller: UIDocumentPickerViewController, didPickDocumentsAt urls: [URL]) {
    DispatchQueue.global(qos: .userInitiated).async {
      // this doesn't run on the main thread
      let documentsInfo = urls.compactMap(self.createDocumentMetadata).compactMap { $0.build() }
      self.promiseWrapper.resolve(documentsInfo)
    }
    // https://developer.apple.com/library/archive/documentation/FileManagement/Conceptual/DocumentPickerProgrammingGuide/AccessingDocuments/AccessingDocuments.html#//apple_ref/doc/uid/TP40014451-CH2-SW4 "Accessing Files Outside Your Sandbox"
    // https://developer.apple.com/documentation/uikit/view_controllers/providing_access_to_directories
  }
  
  private func createDocumentMetadata(for url: URL) -> DocumentMetadataBuilder? {
    guard let subclassThatGetsMetadata = self as? GetsMetadataProtocol else {
      let error = NSError(domain: NSCocoaErrorDomain, code: 0, userInfo: nil)
      self.promiseWrapper.reject("PickerBase", withCode: "BAD_CLASS", withError: error)
      return nil
    }
    
    do {
      return try subclassThatGetsMetadata.getMetadataFor(url: url)
    } catch {
      return DocumentMetadataBuilder(forUri: url, error: error)
    }
  }
  
  public func documentPickerWasCancelled(_ controller: UIDocumentPickerViewController) {
    promiseWrapper.rejectAsUserCancelledOperation()
  }

  public func presentationControllerDidDismiss(_ presentationController: UIPresentationController) {
    promiseWrapper.rejectAsUserCancelledOperation()
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
