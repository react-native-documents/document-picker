//
//  PickerBase.swift
//  react-native-document-picker
//
//  Created by Vojtech Novak on 25.05.2024.
//

// LICENSE: see License.md in the package root

import Foundation
import UniformTypeIdentifiers
import React

public class PickerBase: NSObject, UIDocumentPickerDelegate, UIAdaptivePresentationControllerDelegate {
  let promiseWrapper = PromiseWrapper()

  @MainActor
  @objc public func present(optionsDict: NSDictionary,
                           resolve: @escaping RCTPromiseResolveBlock,
                           reject: @escaping RCTPromiseRejectBlock) {
    guard promiseWrapper.trySetPromiseRejectingIncoming(resolve, rejecter: reject) else {
      return
    }

    presentInternal(optionsDict)
  }

  @MainActor
  func createDocumentPicker(from dictionary: NSDictionary) -> UIDocumentPickerViewController {
    fatalError("Subclasses must override createDocumentPicker(from:)")
  }

  // Subclasses must override this method to process picked documents
  public func documentPicker(_ controller: UIDocumentPickerViewController, didPickDocumentsAt urls: [URL]) {
    fatalError("Subclasses must override documentPicker(_:didPickDocumentsAt:)")
  }

  @MainActor
  func presentInternal(_ optionsDict: NSDictionary) {
    let documentPicker = self.createDocumentPicker(from: optionsDict)

    documentPicker.delegate = self
    documentPicker.presentationController?.delegate = self

    if let viewController = RCTPresentedViewController() {
      viewController.present(documentPicker, animated: true, completion: nil)
    } else {
      promiseWrapper.takeCallbacks()?.reject("RCTPresentedViewController was nil", withCode: "NULL_PRESENTER", withError: nil)
    }
  }

  public func documentPickerWasCancelled(_ controller: UIDocumentPickerViewController) {
    promiseWrapper.rejectAsUserCancelledOperation()
  }

  public func presentationControllerDidDismiss(_ presentationController: UIPresentationController) {
    promiseWrapper.rejectAsUserCancelledOperation()
  }

}
