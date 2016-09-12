package com.reactnativedocumentpicker;

import android.app.Activity;
import android.content.ContentResolver;
import android.content.Intent;
import android.database.Cursor;
import android.net.Uri;
import android.os.Bundle;
import android.provider.OpenableColumns;
import android.util.Log;

import com.facebook.react.bridge.ActivityEventListener;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.WritableMap;

/**
 * @see <a href="https://developer.android.com/guide/topics/providers/document-provider.html">android documentation</a>
 */
public class DocumentPicker extends ReactContextBaseJavaModule implements ActivityEventListener {
    private static final String NAME = "RNDocumentPicker";
    private static final int READ_REQUEST_CODE = 41;

    private Callback callback;

    public DocumentPicker(ReactApplicationContext reactContext) {
        super(reactContext);
        reactContext.addActivityEventListener(this);
    }

    @Override
    public String getName() {
        return NAME;
    }

    @ReactMethod
    public void show(ReadableMap args, Callback callback) {
        Intent intent;
        if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.KITKAT) {
            intent = new Intent(Intent.ACTION_OPEN_DOCUMENT);
        } else {
            intent = new Intent(Intent.ACTION_PICK);
        }
        intent.addCategory(Intent.CATEGORY_OPENABLE);

        if(!args.isNull("filetype")) {
            ReadableArray filetypes = args.getArray("filetype");
            if(filetypes.size() > 0) {
                intent.setType(filetypes.getString(0));
            }
        }

        this.callback = callback;

        getReactApplicationContext().startActivityForResult(intent, READ_REQUEST_CODE, Bundle.EMPTY);
    }

    // removed @Override temporarily just to get it working on RN0.33 and RN0.32
    public void onActivityResult(Activity activity, int requestCode, int resultCode, Intent data) {
        // Ignored, required to implement ActivityEventListener for RN 0.33
    }

    // removed @Override temporarily just to get it working on RN0.33 and RN0.32
    public void onActivityResult(int requestCode, int resultCode, Intent data) {
        if (requestCode != READ_REQUEST_CODE)
            return;

        if (resultCode != Activity.RESULT_OK) {
            callback.invoke("Bad result code: " + resultCode, null);
            return;
        }

        if (data == null) {
            callback.invoke("No data", null);
            return;
        }

        try {
            Uri uri = data.getData();
            callback.invoke(null, toMapWithMetadata(uri));
        } catch (Exception e) {
            Log.e(NAME, "Failed to read", e);
            callback.invoke(e.getMessage(), null);
        }
    }

    public WritableMap toMapWithMetadata(Uri uri) {
        WritableMap map = Arguments.createMap();
        map.putString("uri", uri.toString());

        ContentResolver contentResolver = getReactApplicationContext().getContentResolver();

        map.putString("type", contentResolver.getType(uri));

        Cursor cursor = contentResolver.query(uri, null, null, null, null, null);
        try {
            if (cursor != null && cursor.moveToFirst()) {

                map.putString("fileName", cursor.getString(cursor.getColumnIndex(OpenableColumns.DISPLAY_NAME)));

                int sizeIndex = cursor.getColumnIndex(OpenableColumns.SIZE);
                if (!cursor.isNull(sizeIndex)) {
                    String size = cursor.getString(sizeIndex);
                    if (size != null)
                        map.putInt("fileSize", Integer.valueOf(size));
                }
            }
        } finally {
            cursor.close();
        }

        return map;
    }

    // Required for RN 0.30+ modules than implement ActivityEventListener
    public void onNewIntent(Intent intent) { }
}
