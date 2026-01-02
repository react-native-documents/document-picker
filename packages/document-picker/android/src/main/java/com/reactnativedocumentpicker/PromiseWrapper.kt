// LICENSE: see License.md in the package root
package com.reactnativedocumentpicker

import android.util.Log
import com.facebook.react.bridge.Promise

class PromiseWrapper(private val MODULE_NAME: String) {
  private var promise: Promise? = null
  private var nameOfCallInProgress: String? = null

  fun trySetPromiseRejectingIncoming(promise: Promise, fromCallsite: String): Boolean {
    val previousPromise = this.promise
    if (previousPromise != null) {
      rejectNewPromiseBecauseOldOneIsInProgress(promise, fromCallsite)
      return false
    }
    this.promise = promise
    nameOfCallInProgress = fromCallsite
    return true
  }

  fun resolve(value: Any?) {
    val resolver = promise
    if (resolver == null) {
      Log.e(MODULE_NAME, "cannot resolve promise because it's null")
      return
    }

    resetMembers()
    resolver.resolve(value)
  }

  fun reject(code: String, e: Exception) {
    val message =
      e.localizedMessage ?: e.message ?: "unknown error"

    this.reject(code, message, e)
  }

  fun reject(e: Exception) {
    val message =
      e.localizedMessage ?: e.message ?: "unknown error"

    this.reject(nameOfCallInProgress ?: "unknown call in progress", message, e)
  }

  fun rejectAsUserCancelledOperation() {
    this.reject(E_DOCUMENT_PICKER_CANCELED, "user canceled the document picker")
  }

  fun reject(code: String, message: String, e: Exception? = null) {
    val rejecter = promise
    if (rejecter == null) {
      Log.e(MODULE_NAME, "cannot reject promise because it's null")
      return
    }

    resetMembers()
    rejecter.reject(code, message, e)
  }

  private fun resetMembers() {
    nameOfCallInProgress = null
    promise = null
  }

  private fun rejectNewPromiseBecauseOldOneIsInProgress(
    promise: Promise,
    requestedOperation: String?
  ) {
    // TODO better message
    promise.reject(
      ASYNC_OP_IN_PROGRESS,
      "Warning: previous promise did not settle and you attempted to overwrite it. " +
              "You've called \"" + requestedOperation + "\" while \"" + this.nameOfCallInProgress + "\" was already in progress and has not completed yet."
    )
  }

  companion object {
    const val ASYNC_OP_IN_PROGRESS: String = "ASYNC_OP_IN_PROGRESS"
    const val E_DOCUMENT_PICKER_CANCELED: String = "OPERATION_CANCELED"
  }
}
