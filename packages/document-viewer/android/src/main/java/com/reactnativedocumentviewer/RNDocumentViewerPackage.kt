// LICENSE: see License.md in the package root
package com.reactnativedocumentviewer

import com.facebook.react.BaseReactPackage
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.module.model.ReactModuleInfo
import com.facebook.react.module.model.ReactModuleInfoProvider

class RNDocumentViewerPackage : BaseReactPackage() {
  override fun getModule(name: String, reactContext: ReactApplicationContext): NativeModule? {
    return if (name == NativeDocumentViewerSpec.NAME) {
      RNDocumentViewerModule(reactContext)
    } else {
      null
    }
  }

  override fun getReactModuleInfoProvider(): ReactModuleInfoProvider {
    return ReactModuleInfoProvider {
      val isTurboModule = BuildConfig.IS_NEW_ARCHITECTURE_ENABLED
      mapOf(
        NativeDocumentViewerSpec.NAME to ReactModuleInfo(
        NativeDocumentViewerSpec.NAME,
        NativeDocumentViewerSpec.NAME,  //          "DocumentViewerModule",
        false,  // canOverrideExistingModule
        false,  // needsEagerInit
        false,  // isCxxModule
        isTurboModule // isTurboModule
      ))
    }
  }
}
