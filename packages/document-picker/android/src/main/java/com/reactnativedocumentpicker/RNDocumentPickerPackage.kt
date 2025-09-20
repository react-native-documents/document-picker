// LICENSE: see License.md in the package root
package com.reactnativedocumentpicker

import com.facebook.react.BaseReactPackage
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.module.model.ReactModuleInfo
import com.facebook.react.module.model.ReactModuleInfoProvider

class RNDocumentPickerPackage : BaseReactPackage() {
  override fun getModule(name: String, reactContext: ReactApplicationContext): NativeModule? {
    return if (name == NativeDocumentPickerSpec.NAME) {
      RNDocumentPickerModule(reactContext)
    } else {
      null
    }
  }

  override fun getReactModuleInfoProvider(): ReactModuleInfoProvider {
    return ReactModuleInfoProvider {
      val isTurboModule = BuildConfig.IS_NEW_ARCHITECTURE_ENABLED
      val moduleInfos = mapOf(
        NativeDocumentPickerSpec.NAME to ReactModuleInfo(
          NativeDocumentPickerSpec.NAME,
          NativeDocumentPickerSpec.NAME,  //          "DocumentPickerModule",
          false,  // canOverrideExistingModule
          false,  // needsEagerInit
          false,  // isCxxModule
          isTurboModule // isTurboModule
        )
      )
      moduleInfos
    }
  }
}
