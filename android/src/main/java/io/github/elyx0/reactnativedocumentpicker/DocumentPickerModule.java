package io.github.elyx0.reactnativedocumentpicker;

import android.app.Activity;
import android.content.ActivityNotFoundException;
import android.content.ClipData;
import android.content.ContentResolver;
import android.content.Context;
import android.content.Intent;
import android.database.Cursor;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.provider.DocumentsContract;
import android.provider.OpenableColumns;
import android.util.Log;

import com.facebook.react.bridge.ActivityEventListener;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.BaseActivityEventListener;
import com.facebook.react.bridge.GuardedResultAsyncTask;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.WritableArray;
import com.facebook.react.bridge.WritableMap;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.List;

/**
 * @see <a href="https://developer.android.com/guide/topics/providers/document-provider.html">android documentation</a>
 */
public class DocumentPickerModule extends ReactContextBaseJavaModule {
	private static final String NAME = "RNDocumentPicker";
	private static final int READ_REQUEST_CODE = 41;

	private static final String E_ACTIVITY_DOES_NOT_EXIST = "ACTIVITY_DOES_NOT_EXIST";
	private static final String E_FAILED_TO_SHOW_PICKER = "FAILED_TO_SHOW_PICKER";
	private static final String E_DOCUMENT_PICKER_CANCELED = "DOCUMENT_PICKER_CANCELED";
	private static final String E_UNABLE_TO_OPEN_FILE_TYPE = "UNABLE_TO_OPEN_FILE_TYPE";
	private static final String E_UNKNOWN_ACTIVITY_RESULT = "UNKNOWN_ACTIVITY_RESULT";
	private static final String E_INVALID_DATA_RETURNED = "INVALID_DATA_RETURNED";
	private static final String E_UNEXPECTED_EXCEPTION = "UNEXPECTED_EXCEPTION";

	private static final String OPTION_TYPE = "type";
	private static final String OPTION_MULIPLE = "multiple";
	private static final String OPTION_COPYTO = "copyTo";

	private static final String FIELD_URI = "uri";
	private static final String FIELD_FILE_COPY_URI = "fileCopyUri";
	private static final String FIELD_COPY_ERROR = "copyError";
	private static final String FIELD_NAME = "name";
	private static final String FIELD_TYPE = "type";
	private static final String FIELD_SIZE = "size";

	private final ActivityEventListener activityEventListener = new BaseActivityEventListener() {
		@Override
		public void onActivityResult(Activity activity, int requestCode, int resultCode, Intent data) {
			if (requestCode == READ_REQUEST_CODE) {
				if (promise != null) {
					onShowActivityResult(resultCode, data, promise);
				}
			}
		}
	};

	private Promise promise;
	private String copyTo;

	public DocumentPickerModule(ReactApplicationContext reactContext) {
		super(reactContext);
		reactContext.addActivityEventListener(activityEventListener);
	}

	@Override
	public void onCatalystInstanceDestroy() {
		super.onCatalystInstanceDestroy();
		getReactApplicationContext().removeActivityEventListener(activityEventListener);
	}

	@Override
	public String getName() {
		return NAME;
	}

	@ReactMethod
	public void pick(ReadableMap args, Promise promise) {
		Activity currentActivity = getCurrentActivity();
		this.promise = promise;
		this.copyTo = args.hasKey(OPTION_COPYTO) ? args.getString(OPTION_COPYTO) : null;

		if (currentActivity == null) {
			sendError(E_ACTIVITY_DOES_NOT_EXIST, "Current activity does not exist");
			return;
		}

		try {
			Intent intent = new Intent(Intent.ACTION_GET_CONTENT);
			intent.addCategory(Intent.CATEGORY_OPENABLE);

			intent.setType("*/*");
			if (!args.isNull(OPTION_TYPE)) {
				ReadableArray types = args.getArray(OPTION_TYPE);
				if (types != null && types.size() > 1) {
					if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.KITKAT) {
						intent.putExtra(Intent.EXTRA_MIME_TYPES, Arguments.toList(types));
					} else {
						Log.e(NAME, "Multiple type values not supported below API level 19");
					}
				} else if (types.size() == 1) {
					intent.setType(types.getString(0));
				}
			}

			boolean multiple = !args.isNull(OPTION_MULIPLE) && args.getBoolean(OPTION_MULIPLE);
			if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.JELLY_BEAN_MR2) {
				intent.putExtra(Intent.EXTRA_ALLOW_MULTIPLE, multiple);
			}

			if (Build.VERSION.SDK_INT < Build.VERSION_CODES.KITKAT) {
				intent = Intent.createChooser(intent, null);
			}

			currentActivity.startActivityForResult(intent, READ_REQUEST_CODE, Bundle.EMPTY);
		} catch (ActivityNotFoundException e) {
			sendError(E_UNABLE_TO_OPEN_FILE_TYPE, e.getLocalizedMessage());
		} catch (Exception e) {
			e.printStackTrace();
			sendError(E_FAILED_TO_SHOW_PICKER, e.getLocalizedMessage());
		}
	}

	public void onShowActivityResult(int resultCode, Intent data, Promise promise) {
		if (resultCode == Activity.RESULT_CANCELED) {
			sendError(E_DOCUMENT_PICKER_CANCELED, "User canceled document picker");
		} else if (resultCode == Activity.RESULT_OK) {
			Uri uri = null;
			ClipData clipData = null;

			if (data != null) {
				uri = data.getData();
				clipData = data.getClipData();
			}

			try {
				List<Uri> uris = new ArrayList<>();
				if (uri != null) {
					uris.add(uri);
				} else if (clipData != null && clipData.getItemCount() > 0) {
					final int length = clipData.getItemCount();
					for (int i = 0; i < length; ++i) {
						ClipData.Item item = clipData.getItemAt(i);
						uris.add(item.getUri());
					}
				} else {
					sendError(E_INVALID_DATA_RETURNED, "Invalid data returned by intent");
					return;
				}

				new ProcessDataTask(getReactApplicationContext(), uris, copyTo, promise).execute();
			} catch (Exception e) {
				sendError(E_UNEXPECTED_EXCEPTION, e.getLocalizedMessage(), e);
			}
		} else {
			sendError(E_UNKNOWN_ACTIVITY_RESULT, "Unknown activity result: " + resultCode);
		}
	}

	private static class ProcessDataTask extends GuardedResultAsyncTask<ReadableArray> {
		private Context context;
		private final List<Uri> uris;
		private final String copyTo;
		private final Promise promise;

		protected ProcessDataTask(ReactContext reactContext, List<Uri> uris, String copyTo, Promise promise) {
			super(reactContext.getExceptionHandler());
			this.context = reactContext.getApplicationContext();
			this.uris = uris;
			this.copyTo = copyTo;
			this.promise = promise;
		}

		@Override
		protected ReadableArray doInBackgroundGuarded() {
			WritableArray results = Arguments.createArray();
			for (Uri uri : uris) {
				results.pushMap(getMetadata(uri));
			}
			return results;
		}

		@Override
		protected void onPostExecuteGuarded(ReadableArray readableArray) {
			promise.resolve(readableArray);
		}

		private WritableMap getMetadata(Uri uri) {
			ContentResolver contentResolver = context.getContentResolver();
			WritableMap map = Arguments.createMap();
			map.putString(FIELD_URI, uri.toString());
			map.putString(FIELD_TYPE, contentResolver.getType(uri));
			String fileName = null;
			try (Cursor cursor = contentResolver.query(uri, null, null, null, null, null)) {
				if (cursor != null && cursor.moveToFirst()) {
					int displayNameIndex = cursor.getColumnIndex(OpenableColumns.DISPLAY_NAME);
					if (!cursor.isNull(displayNameIndex)) {
						fileName = cursor.getString(displayNameIndex);
						map.putString(FIELD_NAME, fileName);
					}
					if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.KITKAT) {
						int mimeIndex = cursor.getColumnIndex(DocumentsContract.Document.COLUMN_MIME_TYPE);
						if (!cursor.isNull(mimeIndex)) {
							map.putString(FIELD_TYPE, cursor.getString(mimeIndex));
						}
					}
					int sizeIndex = cursor.getColumnIndex(OpenableColumns.SIZE);
					if (!cursor.isNull(sizeIndex)) {
						map.putInt(FIELD_SIZE, cursor.getInt(sizeIndex));
					}
				}
			}

			if (copyTo != null) {
				File dir = context.getCacheDir();
				if (copyTo.equals("documentDirectory")) {
					dir = context.getFilesDir();
				}
				if (fileName == null) {
					fileName = DocumentsContract.getDocumentId(uri);
				}
				try {
					File destFile = new File(dir, fileName);
					String path = copyFile(context, uri, destFile);
					map.putString(FIELD_FILE_COPY_URI, path);
				} catch (IOException e) {
					e.printStackTrace();
					map.putString(FIELD_FILE_COPY_URI, uri.toString());
					map.putString(FIELD_COPY_ERROR, e.getMessage());
				}
			} else {
				map.putString(FIELD_FILE_COPY_URI, uri.toString());
			}
			return map;
		}

		public static String copyFile(Context context, Uri uri, File destFile) throws IOException {
			InputStream in = null;
			FileOutputStream out = null;
			try {
				in = context.getContentResolver().openInputStream(uri);
				if (in != null) {
					out = new FileOutputStream(destFile);
					byte[] buffer = new byte[1024];
					while (in.read(buffer) > 0) {
						out.write(buffer);
					}
					out.close();
					in.close();
					return destFile.getAbsolutePath();
				} else {
					throw new NullPointerException("Invalid input stream");
				}
			} catch (Exception e) {
				try {
					if (in != null) {
						in.close();
					}
					if (out != null) {
						out.close();
					}
				} catch (IOException ignored) {}
				throw e;
			}
		}

	}

	private void sendError(String code, String message) {
		sendError(code, message, null);
	}

	private void sendError(String code, String message, Exception e) {
		if (this.promise != null) {
			Promise temp = this.promise;
			this.promise = null;
			temp.reject(code, message, e);
		}
	}
}
