package com.reactnativedocumentpicker;

import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;

public class DocumentPicker extends ReactContextBaseJavaModule {
    private static final int OPEN_REQUEST_CODE = 41;

    public DocumentPicker(ReactApplicationContext reactContext) {
        super(reactContext);
    }

    @Override
    public String getName() {
        return "react-native-document-picker";
    }

    @ReactMethod
    public void init(Callback callback) {
    }
}
