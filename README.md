# react-native-document-picker

🚧🚧 GH discussions available 🚧🚧

If you want to ask questions, we opened [GH discussions](https://github.com/rnmods/react-native-document-picker/discussions) for that purpose! 🤗 Issue tracker is now reserved for bugs and feature requests only and issues not following the issue template can be closed. Thank you!

A React Native wrapper for:

- Apple's `UIDocumentPickerViewController`
- Android's `Intent.ACTION_GET_CONTENT`
- Windows `Windows.Storage.Pickers`

Requires Android 5.0+ and iOS 10+

### Installation

```bash
npm i --save react-native-document-picker

OR

yarn add react-native-document-picker
```

You need to enable iCloud Documents to access iCloud

<img src="https://camo.githubusercontent.com/ac300ca7e3bbab573a76c151469a89efd8b31e72/68747470733a2f2f33313365353938373731386233343661616638332d66356538323532373066323961383466373838313432333431303338343334322e73736c2e6366312e7261636b63646e2e636f6d2f313431313932303637342d656e61626c652d69636c6f75642d64726976652e706e67" width="600">

#### RN >= 0.60

If you are using RN >= 0.60, only run `pod install` from the ios directory. Then rebuild your project.

#### RN < 0.60 / Manual Instructions

See [this](./install-old.md)

## API

#### `DocumentPicker.pick(options)` and `DocumentPicker.pickMultiple(options)`

Use `pick` or `pickMultiple` to open a document picker for the user to select file(s). Both methods return a Promise. `pick` will only allow a single selection and the Promise will resolve to that single result. `pickMultiple` will allow multiple selection and the Promise returned will always resolve to an array of results.

### Options

All of the options are optional

##### `type`:`string|Array<string>`:

The type or types of documents to allow selection of. May be an array of types as single type string.

- On Android these are MIME types such as `text/plain` or partial MIME types such as `image/*`. See [common MIME types](https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/MIME_types/Common_types).
- On iOS these must be Apple "[Uniform Type Identifiers](https://developer.apple.com/library/content/documentation/Miscellaneous/Reference/UTIRef/Articles/System-DeclaredUniformTypeIdentifiers.html)"
- If `type` is omitted it will be treated as `*/*` or `public.item`.

##### [iOS only] `mode`:`"import" | "open"`:

Defaults to `import`. If `mode` is set to `import` the document picker imports the file from outside to inside the sandbox, otherwise if `mode` is set to `open` the document picker opens the file right in place.

##### [iOS and Android only] `copyTo`:`"cachesDirectory" | "documentDirectory"`:

If specified, the picked file is copied to `NSCachesDirectory` / `NSDocumentDirectory` (iOS) or `getCacheDir` / `getFilesDir` (Android). The uri of the copy will be available in result's `fileCopyUri`. If copying the file fails (eg. due to lack of space), `fileCopyUri` will be the same as `uri`, and more details about the error will be available in `copyError` field in the result.

This should help if you need to work with the file(s) later on, because by default, [the picked documents are temporary files. They remain available only until your application terminates](https://developer.apple.com/documentation/uikit/uidocumentpickerdelegate/2902364-documentpicker). This may impact performance for large files, so keep this in mind if you expect users to pick particularly large files and your app does not need immediate read access.

##### [UWP only] `readContent`:`boolean`

Defaults to `false`. If `readContent` is set to true the content of the picked file/files will be read and supplied in the result object.

- Be aware that this can introduce a huge performance hit in case of big files. (The files are read completely and into the memory and encoded to base64 afterwards to add them to the result object)
- However reading the file directly from within the Thread which managed the picker can be necessary on Windows: Windows Apps can only read the Downloads folder and their own app folder by default and If a file is outside of these locations it cannot be acessed directly. However if the user picks the file through a file picker permissions to that file are granted implicitly.

  ```
  In addition to the default locations, an app can access additional files and folders by declaring capabilities in the app manifest (see App capability declarations), or by calling a file picker to let the user pick files and folders for the app to access (see Open files and folders with a picker).
  ```

  https://docs.microsoft.com/en-us/windows/uwp/files/file-access-permissions

  Unfortunately that permission is not granted to the whole app, but only the Thread which handled the filepicker. Therefore it can be useful to read the file directly.

- You can use `react-native-fs` on Android and IOS to read the picked file.

### Result

The object a `pick` Promise resolves to or the objects in the array a `pickMultiple` Promise resolves to will contain the following keys.

##### `uri`:

The URI representing the document picked by the user. _On iOS this will be a `file://` URI for a temporary file in your app's container if `mode` is not specified or set at `import` otherwise it will be the original `file://` URI. On Android this will be a `content://` URI for a document provided by a DocumentProvider that must be accessed with a ContentResolver._

##### `fileCopyUri`:

Same as `uri`, but has special meaning if `copyTo` option is specified.

##### `type`:

The MIME type of the file. _On Android some DocumentProviders may not provide MIME types for their documents. On iOS this MIME type is based on the best MIME type for the file extension according to Apple's internal "Uniform Type Identifiers" database._

##### `name`:

The display name of the file. _This is normally the filename of the file, but Android does not guarantee that this will be a filename from all DocumentProviders._

##### `size`:

The file size of the document. _On Android some DocumentProviders may not provide this information for a document._

##### [UWP only] `content`:

The base64 encoded content of the picked file if the option `readContent` was set to `true`.

### `DocumentPicker.types.*`

`DocumentPicker.types.*` provides a few common types for use as `type` values, these types will use the correct format for each platform (MIME types on Android, UTIs on iOS).

- `DocumentPicker.types.allFiles`: All document types, on Android this is `*/*`, on iOS is `public.item`
- `DocumentPicker.types.images`: All image types
- `DocumentPicker.types.plainText`: Plain text files
- `DocumentPicker.types.audio`: All audio types
- `DocumentPicker.types.pdf`: PDF documents
- `DocumentPicker.types.zip`: Zip files
- `DocumentPicker.types.csv`: Csv files
- `DocumentPicker.types.doc`: doc files
- `DocumentPicker.types.docx`: docx files
- `DocumentPicker.types.ppt`: ppt files
- `DocumentPicker.types.pptx`: pptx files
- `DocumentPicker.types.xls`: xls files
- `DocumentPicker.types.xlsx`: xlsx files

#### `DocumentPicker.isCancel(err)`

If the user cancels the document picker without choosing a file (by pressing the system back button on Android or the Cancel button on iOS) the Promise will be rejected with a cancellation error. You can check for this error using `DocumentPicker.isCancel(err)` allowing you to ignore it and cleanup any parts of your interface that may not be needed anymore.

#### [iOS only] `DocumentPicker.releaseSecureAccess(uris: Array<string>)`

If `mode` is set to `open` iOS is giving you a secure access to a file located outside from your sandbox.
In that case Apple is asking you to release the access as soon as you finish using the resource.

## Example

```javascript
import DocumentPicker from 'react-native-document-picker';

// Pick a single file
try {
  const res = await DocumentPicker.pick({
    type: [DocumentPicker.types.images],
  });
  console.log(
    res.uri,
    res.type, // mime type
    res.name,
    res.size
  );
} catch (err) {
  if (DocumentPicker.isCancel(err)) {
    // User cancelled the picker, exit any dialogs or menus and move on
  } else {
    throw err;
  }
}

// Pick multiple files
try {
  const results = await DocumentPicker.pickMultiple({
    type: [DocumentPicker.types.images],
  });
  for (const res of results) {
    console.log(
      res.uri,
      res.type, // mime type
      res.name,
      res.size
    );
  }
} catch (err) {
  if (DocumentPicker.isCancel(err)) {
    // User cancelled the picker, exit any dialogs or menus and move on
  } else {
    throw err;
  }
}
```

## Here is how it looks:

<img src="http://i.stack.imgur.com/dv0iQ.png" height="400">

## How to send it back ?

Use blob support that is built-in into react natve - [see comment](https://github.com/rnmods/react-native-document-picker/issues/70#issuecomment-384335402).

Alternatively, use [https://github.com/johanneslumpe/react-native-fs](https://github.com/johanneslumpe/react-native-fs)
I had to modify [Uploader.m](https://gist.github.com/Elyx0/5dc53bef294b42c847f1baea7cc5e911) so it would use `NSFileCoordinator` with `NSFileCoordinatorReadingForUploading` option.

I added a check for file length that would be thrown into RNFS catch block.

```obj-c
if ([fileData length] == 0) {
    NSError *errorUp = [NSError errorWithDomain:@"com.whatever.yourapp" code:77 userInfo:[NSDictionary dictionaryWithObject:@"empty" forKey:NSLocalizedDescriptionKey]];
    _params.errorCallback(errorUp);
    return;
}
```

```javascript
let url = 'file://whatever/com.bla.bla/file.ext'; //The url you received from the DocumentPicker

// I STRONGLY RECOMMEND ADDING A SMALL SETTIMEOUT before uploading the url you just got.
const split = url.split('/');
const name = split.pop();
const inbox = split.pop();
const realPath = `${RNFS.TemporaryDirectoryPath}${inbox}/${name}`;

const uploadBegin = (response) => {
  const jobId = response.jobId;
  console.log('UPLOAD HAS BEGUN! JobId: ' + jobId);
};

const uploadProgress = (response) => {
  const percentage = Math.floor(
    (response.totalBytesSent / response.totalBytesExpectedToSend) * 100
  );
  console.log('UPLOAD IS ' + percentage + '% DONE!');
};

RNFS.uploadFiles({
  toUrl: uploadUrl,
  files: [
    {
      name,
      filename: name,
      filepath: realPath,
    },
  ],
  method: 'POST',
  headers: {
    Accept: 'application/json',
  },
  begin: uploadBegin,
  beginCallback: uploadBegin, // Don't ask me, only way I made it work as of 1.5.1
  progressCallback: uploadProgress,
  progress: uploadProgress,
})
  .then((response) => {
    console.log(response, '<<< Response');
    if (response.statusCode == 200) {
      //You might not be getting a statusCode at all. Check
      console.log('FILES UPLOADED!');
    } else {
      console.log('SERVER ERROR');
    }
  })
  .catch((err) => {
    if (err.description) {
      switch (err.description) {
        case 'cancelled':
          console.log('Upload cancelled');
          break;
        case 'empty':
          console.log('Empty file');
        default:
        //Unknown
      }
    } else {
      //Weird
    }
    console.log(err);
  });
```

## Help wanted: Improvements

- Fix Xcode warning about constraints
- support options for the [UIDocumentPickerViewController](https://developer.apple.com/library/ios/documentation/FileManagement/Conceptual/DocumentPickerProgrammingGuide/AccessingDocuments/AccessingDocuments.html#//apple_ref/doc/uid/TP40014451-CH2-SW5)
