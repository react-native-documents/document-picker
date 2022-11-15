package oldarch.com.reactnativedocumentpicker;

import androidx.annotation.Nullable;

import com.facebook.react.TurboReactPackage;
import com.facebook.react.bridge.NativeModule;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.module.model.ReactModuleInfo;
import com.facebook.react.module.model.ReactModuleInfoProvider;
import com.reactnativedocumentpicker.RNDocumentPickerModuleImpl;

import java.util.HashMap;
import java.util.Map;

public class DocumentPickerPackage extends TurboReactPackage {

  @Nullable
  @Override
  public NativeModule getModule(String name, ReactApplicationContext reactContext) {
    if (name.equals(RNDocumentPickerModuleImpl.NAME)) {
      return new DocumentPickerModule(reactContext);
    } else {
      return null;
    }
  }

  @Override
  public ReactModuleInfoProvider getReactModuleInfoProvider() {
    return () -> {
      final Map<String, ReactModuleInfo> moduleInfos = new HashMap<>();
      moduleInfos.put(
        DocumentPickerModule.NAME,
        new ReactModuleInfo(
          DocumentPickerModule.NAME,
          DocumentPickerModule.NAME,
          false, // canOverrideExistingModule
          false, // needsEagerInit
          true, // hasConstants
          false, // isCxxModule
          false // isTurboModule
        ));
      return moduleInfos;
    };
  }
}
