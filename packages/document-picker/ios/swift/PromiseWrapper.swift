// LICENSE: see License.md in the package root

import Foundation

class PromiseWrapper {
  private var promiseResolve: RNDPPromiseResolveBlock?
  private var promiseReject: RNDPPromiseRejectBlock?
  private var nameOfCallInProgress: String?

  private let E_DOCUMENT_PICKER_CANCELED = "E_DOCUMENT_PICKER_CANCELED"
  private let ASYNC_OP_IN_PROGRESS = "ASYNC_OP_IN_PROGRESS"

  func setPromiseRejectingPrevious(_ resolve: @escaping RNDPPromiseResolveBlock,
                                   rejecter reject: @escaping RNDPPromiseRejectBlock,
                                   fromCallSite callsite: String) {
    if let previousReject = promiseReject {
      rejectPreviousPromiseBecauseNewOneIsInProgress(previousReject, requestedOperation: callsite)
    }
    promiseResolve = resolve
    promiseReject = reject
    nameOfCallInProgress = callsite
  }

  func trySetPromiseRejectingIncoming(_ resolve: @escaping RNDPPromiseResolveBlock,
                                      rejecter reject: @escaping RNDPPromiseRejectBlock,
                                      fromCallSite callsite: String) -> Bool {
    if promiseReject != nil {
      rejectNewPromiseBecauseOldOneIsInProgress(reject, requestedOperation: callsite)
      return false
    }
    promiseResolve = resolve
    promiseReject = reject
    nameOfCallInProgress = callsite
    return true
  }

  func resolve(_ result: Any?) {
    guard let resolver = promiseResolve else {
      print("cannot resolve promise because it's null")
      return
    }
    resetMembers()
    resolver(result)
  }

  func reject(_ message: String, withError error: NSError) {
    let errorCode = String(error.code)
    reject(message, withCode: errorCode, withError: error)
  }

  func reject(_ message: String, withCode errorCode: String, withError error: NSError) {
    guard let rejecter = promiseReject else {
      print("cannot reject promise because it's null")
      return
    }
    let errorMessage = "RNDPPromiseWrapper: \(message), \(error.description)"
    resetMembers()
    rejecter(errorCode, errorMessage, error)
  }

  func rejectAsUserCancelledOperation() {
    let error = NSError(domain: NSCocoaErrorDomain,
                        code: NSUserCancelledError,
                        userInfo: nil)
    reject("user canceled the document picker",
           withCode: E_DOCUMENT_PICKER_CANCELED,
           withError: error)
  }

  private func resetMembers() {
    promiseResolve = nil
    promiseReject = nil
    nameOfCallInProgress = nil
  }

  // TODO error messages
  private func rejectPreviousPromiseBecauseNewOneIsInProgress(_ reject: RNDPPromiseRejectBlock,
                                                              requestedOperation callSiteName: String) {
    let msg = "Warning: previous promise did not settle and was overwritten. " +
    "You've called \"\(callSiteName)\" while \"\(nameOfCallInProgress ?? "")\" " +
    "was already in progress and has not completed yet."
    reject(ASYNC_OP_IN_PROGRESS, msg, nil)
  }

  private func rejectNewPromiseBecauseOldOneIsInProgress(_ reject: RNDPPromiseRejectBlock,
                                                         requestedOperation callSiteName: String) {
    let msg = "Warning: previous promise did not settle and you attempted to overwrite it. " +
    "You've called \"\(callSiteName)\" while \"\(nameOfCallInProgress ?? "")\" " +
    "was already in progress and has not completed yet."
    reject(ASYNC_OP_IN_PROGRESS, msg, nil)
  }
}
