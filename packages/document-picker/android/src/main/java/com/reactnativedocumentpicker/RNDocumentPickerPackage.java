// LICENSE: see License.md in the package root
package com.reactnativedocumentpicker;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;

import com.facebook.react.TurboReactPackage;
import com.facebook.react.bridge.NativeModule;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.module.model.ReactModuleInfo;
import com.facebook.react.module.model.ReactModuleInfoProvider;

import java.util.HashMap;
import java.util.Map;

public class RNDocumentPickerPackage extends TurboReactPackage {

  @Nullable
  @Override
  public NativeModule getModule(String name, @NonNull ReactApplicationContext reactContext) {
    if (name.equals(RNDocumentPickerModule.NAME)) {
      return new RNDocumentPickerModule(reactContext);
    } else {
      return null;
    }
  }

  @Override
  public ReactModuleInfoProvider getReactModuleInfoProvider() {
    return () -> {
      boolean isTurboModule = BuildConfig.IS_NEW_ARCHITECTURE_ENABLED;
      final Map<String, ReactModuleInfo> moduleInfos = new HashMap<>();
      moduleInfos.put(
        RNDocumentPickerModule.NAME,
        // deprecated in RN 0.73
        new ReactModuleInfo(
          RNDocumentPickerModule.NAME,
          RNDocumentPickerModule.NAME,
//          "DocumentPickerModule",
          false, // canOverrideExistingModule
          false, // needsEagerInit
          false, // hasConstants
          false, // isCxxModule
          isTurboModule // isTurboModule
        ));
      return moduleInfos;
    };
  }
}
