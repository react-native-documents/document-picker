package com.reactnativedocumentpicker;

import android.content.Intent;
import android.os.Bundle;

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
        Intent intent = new Intent(Intent.ACTION_OPEN_DOCUMENT);
        intent.addCategory(Intent.CATEGORY_OPENABLE);
        intent.setType("image/*");
        getReactApplicationContext().startActivityForResult(intent, OPEN_REQUEST_CODE, Bundle.EMPTY);
    }
}
