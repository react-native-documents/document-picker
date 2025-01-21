// LICENSE: see License.md in the package root
package com.reactnativedocumentpicker;

import android.util.Log;

import androidx.annotation.NonNull;

import com.facebook.react.bridge.Promise;

public class PromiseWrapper {

  private Promise promise;
  private String nameOfCallInProgress;
  public static final String ASYNC_OP_IN_PROGRESS = "ASYNC_OP_IN_PROGRESS";
  public static final String E_DOCUMENT_PICKER_CANCELED = "OPERATION_CANCELED";
  private final String MODULE_NAME;

  public PromiseWrapper(String moduleName) {
    MODULE_NAME = moduleName;
  }

  public void setPromiseRejectingPrevious(Promise promise, @NonNull String fromCallsite) {
    Promise previousPromise = this.promise;
    if (previousPromise != null) {
      rejectPreviousPromiseBecauseNewOneIsInProgress(previousPromise, fromCallsite);
    }
    this.promise = promise;
    nameOfCallInProgress = fromCallsite;
  }

  public boolean trySetPromiseRejectingIncoming(Promise promise, @NonNull String fromCallsite) {
    Promise previousPromise = this.promise;
    if (previousPromise != null) {
      rejectNewPromiseBecauseOldOneIsInProgress(promise, fromCallsite);
      return false;
    }
    this.promise = promise;
    nameOfCallInProgress = fromCallsite;
    return true;
  }

  public void resolve(Object value) {
    Promise resolver = promise;
    if (resolver == null) {
      Log.e(MODULE_NAME, "cannot resolve promise because it's null");
      return;
    }

    resetMembers();
    resolver.resolve(value);
  }

  public void reject(@NonNull String code, Exception e) {
    String message = e.getLocalizedMessage() != null ? e.getLocalizedMessage() :
      e.getMessage() != null ? e.getMessage() : "unknown error";

    this.reject(code, message, e);
  }

  public void reject(Exception e) {
    String message = e.getLocalizedMessage() != null ? e.getLocalizedMessage() :
      e.getMessage() != null ? e.getMessage() : "unknown error";

    this.reject(nameOfCallInProgress, message, e);
  }

  public void rejectAsUserCancelledOperation() {
    this.reject(E_DOCUMENT_PICKER_CANCELED, "user canceled the document picker");
  }

  public void reject(@NonNull String code, @NonNull String message) {
    reject(code, message, null);
  }
  public void reject(@NonNull String code, @NonNull String message, Exception e) {
    Promise rejecter = promise;
    if (rejecter == null) {
      Log.e(MODULE_NAME, "cannot reject promise because it's null");
      return;
    }

    resetMembers();
    rejecter.reject(code, message, e);
  }

  public String getNameOfCallInProgress() {
    return nameOfCallInProgress;
  }

  private void resetMembers() {
    nameOfCallInProgress = null;
    promise = null;
  }


  private void rejectPreviousPromiseBecauseNewOneIsInProgress(Promise promise, String requestedOperation) {
    // TODO better message
    promise.reject(ASYNC_OP_IN_PROGRESS, "Warning: previous promise did not settle and was overwritten. " +
      "You've called \"" + requestedOperation + "\" while \"" + getNameOfCallInProgress() + "\" was already in progress and has not completed yet.");
  }
  private void rejectNewPromiseBecauseOldOneIsInProgress(Promise promise, String requestedOperation) {
    // TODO better message
    promise.reject(ASYNC_OP_IN_PROGRESS, "Warning: previous promise did not settle and you attempted to overwrite it. " +
      "You've called \"" + requestedOperation + "\" while \"" + getNameOfCallInProgress() + "\" was already in progress and has not completed yet.");
  }
}
