package io.github.elyx0.reactnativedocumentpicker;

import android.app.Activity;
import android.content.ContentResolver;
import android.content.Intent;
import android.database.Cursor;
import android.net.Uri;
import android.os.Bundle;
import android.provider.OpenableColumns;

import com.facebook.react.bridge.ActivityEventListener;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.WritableMap;

/**
 * @see <a href="https://developer.android.com/guide/topics/providers/document-provider.html">android documentation</a>
 */
public class DocumentPickerModule extends ReactContextBaseJavaModule implements ActivityEventListener {
	private static final String NAME = "RNDocumentPicker";
	private static final int READ_REQUEST_CODE = 41;

	private static final String E_UNKNOWN_ACTIVITY_RESULT = "UNKNOWN_ACTIVITY_RESULT";
	private static final String E_INVALID_DATA_RETURNED = "INVALID_DATA_RETURNED";
	private static final String E_UNEXPECTED_EXCEPTION = "UNEXPECTED_EXCEPTION";

	private static class Fields {
		private static final String FILE_SIZE = "fileSize";
		private static final String FILE_NAME = "fileName";
		private static final String TYPE = "type";
	}

	private Promise promise;

	public DocumentPickerModule(ReactApplicationContext reactContext) {
		super(reactContext);
		reactContext.addActivityEventListener(this);
	}

	@Override
	public String getName() {
		return NAME;
	}

	@ReactMethod
	public void show(ReadableMap args, Promise promise) {
		Intent intent = new Intent(Intent.ACTION_GET_CONTENT);
		intent.addCategory(Intent.CATEGORY_OPENABLE);

		if (!args.isNull("filetype")) {
			ReadableArray filetypes = args.getArray("filetype");
			if (filetypes.size() > 0) {
				intent.setType(filetypes.getString(0));
			}
		}

		this.promise = promise;

		getReactApplicationContext().startActivityForResult(intent, READ_REQUEST_CODE, Bundle.EMPTY);
	}

	// removed @Override temporarily just to get it working on RN0.33 and RN0.32 - will remove
	public void onActivityResult(Activity activity, int requestCode, int resultCode, Intent data) {
		onActivityResult(requestCode, resultCode, data);
	}

	// removed @Override temporarily just to get it working on RN0.33 and RN0.32
	public void onActivityResult(int requestCode, int resultCode, Intent data) {
		if (requestCode != READ_REQUEST_CODE)
			return;

		if (resultCode != Activity.RESULT_OK) {
			promise.reject(E_UNKNOWN_ACTIVITY_RESULT, "Unknown activity result: " + resultCode);
			return;
		}

		if (data == null) {
			promise.reject(E_INVALID_DATA_RETURNED, "Invalid data returned by intent");
			return;
		}

		try {
			Uri uri = data.getData();
			promise.resolve(toMapWithMetadata(uri));
		} catch (Exception e) {
			promise.reject(E_UNEXPECTED_EXCEPTION, e.getMessage(), e);
		}
	}

	private WritableMap toMapWithMetadata(Uri uri) {
		WritableMap map = Arguments.createMap();

		map.putString("uri", uri.toString());

		ContentResolver contentResolver = getReactApplicationContext().getContentResolver();

		map.putString(Fields.TYPE, contentResolver.getType(uri));

		Cursor cursor = contentResolver.query(uri, null, null, null, null, null);

		try {
			if (cursor != null && cursor.moveToFirst()) {

				map.putString(Fields.FILE_NAME, cursor.getString(cursor.getColumnIndex(OpenableColumns.DISPLAY_NAME)));

				int sizeIndex = cursor.getColumnIndex(OpenableColumns.SIZE);
				if (!cursor.isNull(sizeIndex)) {
					String size = cursor.getString(sizeIndex);
					if (size != null)
						map.putInt(Fields.FILE_SIZE, Integer.valueOf(size));
				}
			}
		} finally {
			if (cursor != null) {
				cursor.close();
			}
		}

		return map;
	}

	// Required for RN 0.30+ modules than implement ActivityEventListener
	public void onNewIntent(Intent intent) {
	}
}
