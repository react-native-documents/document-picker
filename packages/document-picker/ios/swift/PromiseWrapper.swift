// LICENSE: see License.md in the package root

import Foundation
import React

/// React Native promise blocks are safe to call from background queues, but they are not annotated
/// as `Sendable`. Wrap them so Swift 6 doesn't warn when captured by `@Sendable` closures
/// (e.g. `Task.detached`, GCD `DispatchQueue.async`).
struct ResolveCallback: @unchecked Sendable {
  let resolve: RCTPromiseResolveBlock
}

/// React Native promise blocks are safe to call from background queues, but they are not annotated
/// as `Sendable`. Wrap them so Swift 6 doesn't warn when captured by `@Sendable` closures
/// (e.g. `Task.detached`, GCD `DispatchQueue.async`).
struct RejectCallback: @unchecked Sendable {
  let reject: RCTPromiseRejectBlock
}

/// Promise callbacks for React Native bridges.
///
/// React Native promise blocks are safe to call from background queues, but they are not annotated
/// as `Sendable`. We wrap them so this value can be captured by `@Sendable` closures without
/// Swift 6 warnings.
struct PromiseCallbacks: @unchecked Sendable {
  private let resolveCallback: ResolveCallback
  private let rejectCallback: RejectCallback

  private let E_DOCUMENT_PICKER_CANCELED = "OPERATION_CANCELED"

  init(resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
    self.resolveCallback = ResolveCallback(resolve: resolve)
    self.rejectCallback = RejectCallback(reject: reject)
  }

  func resolve(_ result: Any?) {
    resolveCallback.resolve(result)
  }

  func reject(_ message: String, withCode code: String, withError error: NSError?) {
    let errorMessage = "RNDocumentPicker: \(message)\(error.map { ", \($0.description)" } ?? "")"
    rejectCallback.reject(code, errorMessage, error)
  }

  func rejectAsUserCancelledOperation() {
    let error = NSError(domain: NSCocoaErrorDomain,
                        code: NSUserCancelledError,
                        userInfo: nil)
    reject("user canceled the document picker",
           withCode: E_DOCUMENT_PICKER_CANCELED,
           withError: error)
  }
}

/// Promise lifecycle manager.
///
/// **Lifecycle:** Stores the promise callbacks between the initial call and delegate callbacks.
/// Call `takeCallbacks()` to extract callbacks for async operations.
///
/// **Usage:** Cancellation/dismissal settles the in-flight promise (on whatever queue calls it).
final class PromiseWrapper {
  private var callbacks: PromiseCallbacks?
  private var nameOfCallInProgress: String?

  private let ASYNC_OP_IN_PROGRESS = "ASYNC_OP_IN_PROGRESS"

  func trySetPromiseRejectingIncoming(_ resolve: @escaping RCTPromiseResolveBlock,
                                      rejecter reject: @escaping RCTPromiseRejectBlock,
                                      fromCallSite callsite: String = #function) -> Bool {
    if callbacks != nil {
      let newCallbacks = PromiseCallbacks(resolve: resolve, reject: reject)
      rejectNewPromiseBecauseOldOneIsInProgress(newCallbacks, requestedOperation: callsite)
      return false
    }
    callbacks = PromiseCallbacks(resolve: resolve, reject: reject)
    nameOfCallInProgress = callsite
    return true
  }

  /// Extract callbacks for async work (e.g. file I/O off the main thread).
  /// After extraction, this wrapper is cleared and the callbacks are moved out.
  func takeCallbacks(caller: String = #function) -> PromiseCallbacks? {
    guard let cb = callbacks else {
      NSLog("RNDocumentPicker: \(caller) called with no in-flight promise. Dropping result.")
      return nil
    }

    callbacks = nil
    nameOfCallInProgress = nil
    return cb
  }

  func rejectAsUserCancelledOperation() {
    takeCallbacks()?.rejectAsUserCancelledOperation()
  }

  private func rejectNewPromiseBecauseOldOneIsInProgress(_ callbacks: PromiseCallbacks,
                                                         requestedOperation callSiteName: String) {
    let msg = "Warning: previous promise did not settle and you attempted to overwrite it. " +
    "You've called \"\(callSiteName)\" while \"\(nameOfCallInProgress ?? "")\" " +
    "was already in progress and has not completed yet."
    let error = NSError(domain: NSCocoaErrorDomain, code: 0, userInfo: [NSLocalizedDescriptionKey: msg])
    callbacks.reject(msg, withCode: ASYNC_OP_IN_PROGRESS, withError: error)
  }
}
