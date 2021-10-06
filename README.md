# react-native-document-picker

🚧🚧 GH discussions available 🚧🚧

If you want to ask questions, we opened [GH discussions](https://github.com/rnmods/react-native-document-picker/discussions) for that purpose! 🤗 Issue tracker is now reserved for bugs and feature requests only and issues not following the issue template can be closed. Thank you!

A React Native wrapper for:

- Apple's `UIDocumentPickerViewController`
- Android's `Intent.ACTION_GET_CONTENT`
- Windows `Windows.Storage.Pickers`

<table>
  <tr><td><strong>iOS</strong></td><td><strong>Android</strong></td></tr>
  <tr>
    <td><p align="center"><img src="/docs/ios_screenshot.jpeg" height="500"></p></td>
    <td><p align="center"><img src="/docs/android_screenshot.jpg" height="500"></p></td>
  </tr>
</table>

Requires RN >= 0.63, Android 5.0+ and iOS 11+

# Table of Contents

- [react-native-document-picker](#react-native-document-picker)
  - [Installation](#installation)
  - [RN &gt;= 0.63](#rn--063)
  - [API](#api)
    - [DocumentPicker.pickMultiple(options) / DocumentPicker.pickSingle(options) / DocumentPicker.pick(options)](#documentpickerpickmultipleoptions--documentpickerpicksingleoptions--documentpickerpickoptions)
    - [DocumentPicker.pickDirectory()](#documentpickerpickdirectory)
    - [DocumentPicker.pick(options) and DocumentPicker.pickMultiple(options)](#documentpickerpickoptions-and-documentpickerpickmultipleoptions)
    - [Options](#options)
      - [allowMultiSelection:boolean](#allowmultiselectionboolean)
      - [type:string|Array&lt;string&gt;](#typestringarraystring)
      - [[iOS only] presentationStyle:'fullScreen' | 'pageSheet' | 'formSheet' | 'overFullScreen'](#ios-only-presentationstylefullscreen--pagesheet--formsheet--overfullscreen)
      - [[iOS only] mode:"import" | "open"](#ios-only-modeimport--open)
      - [[iOS and Android only] copyTo:"cachesDirectory" | "documentDirectory"](#ios-and-android-only-copytocachesdirectory--documentdirectory)
      - [[Windows only] readContent:boolean](#windows-only-readcontentboolean)
    - [Result](#result)
      - [uri](#uri)
      - [fileCopyUri](#filecopyuri)
      - [type](#type)
      - [name](#name)
      - [size](#size)
      - [[Windows only] content](#windows-only-content)
    - [DocumentPicker.types.\*](#documentpickertypes)
      - [DocumentPicker.isCancel(err)](#documentpickeriscancelerr)
      - [DocumentPicker.isInProgress(err)](#documentpickerisinprogresserr)
      - [[iOS only] DocumentPicker.releaseSecureAccess(uris: Array&lt;string&gt;)](#ios-only-documentpickerreleasesecureaccessuris-arraystring)
  - [Example](#example)
  - [How to upload picked files?](#how-to-upload-picked-files)
  - [Help wanted: Improvements](#help-wanted-improvements)

### Installation

```bash
npm i --save react-native-document-picker

OR

yarn add react-native-document-picker
```

#### RN >= 0.63

If you are using RN >= 0.63, only run `pod install` from the ios directory. Then rebuild your project. Older RN versions are not supported.

## API

#### `DocumentPicker.pickMultiple(options)` / `DocumentPicker.pickSingle(options)` / `DocumentPicker.pick(options)`

⚠️ Breaking in v6: `pick` returns a `Promise<Array<DocumentPickerResponse>>` instead of `Promise<DocumentPickerResponse>`. If you were using `pick`, change those usages to `pickSingle`.

Use `pickMultiple`, `pickSingle` or `pick` to open a document picker for the user to select file(s). All methods return a Promise.

#### `DocumentPicker.pickDirectory()`

Open a system directory picker. Returns a promise that resolves to (`{ uri: string }`) of the directory selected by user.

#### `DocumentPicker.pick(options)` and `DocumentPicker.pickMultiple(options)`

- `pick` is the most universal, you can use `allowMultiSelection` param to control whether or not user can select multiple files (`false` by default). Returns a `Promise<Array<DocumentPickerResponse>>`

`pickSingle` and `pickMultiple` are "sugar functions" on top of `pick`, and they _might be removed_ in a future release for increased API clarity.

- `pickSingle` only allows a single selection and the Promise will resolve to that single result (same behavior as `pick` in v5)
- `pickMultiple` allows multiple selection and the Promise will resolve to an array of results.

### Options

All of the options are optional

##### `allowMultiSelection`:`boolean`

Whether or not selecting multiple files is allowed. For `pick`, this is `false` by default. `allowMultiSelection` is `false` for `pickSingle` and `true` for `pickMultiple` and cannot be overridden for those calls.

##### `type`:`string|Array<string>`

The type or types of documents to allow selection of. May be an array of types as single type string.

- On Android these are MIME types such as `text/plain` or partial MIME types such as `image/*`. See [common MIME types](https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/MIME_types/Common_types).
- On iOS these must be Apple "[Uniform Type Identifiers](https://developer.apple.com/library/content/documentation/Miscellaneous/Reference/UTIRef/Articles/System-DeclaredUniformTypeIdentifiers.html)"
- If `type` is omitted it will be treated as `*/*` or `public.item`.

##### [iOS only] `presentationStyle`:`'fullScreen' | 'pageSheet' | 'formSheet' | 'overFullScreen'`

Controls how the picker is presented, eg. on an iPad you may want to present it fullscreen. Defaults to `pageSheet`.

##### [iOS only] `mode`:`"import" | "open"`

Defaults to `import`. If `mode` is set to `import` the document picker imports the file from outside to inside the sandbox, otherwise if `mode` is set to `open` the document picker opens the file right in place.

##### [iOS and Android only] `copyTo`:`"cachesDirectory" | "documentDirectory"`

If specified, the picked file is copied to `NSCachesDirectory` / `NSDocumentDirectory` (iOS) or `getCacheDir` / `getFilesDir` (Android). The uri of the copy will be available in result's `fileCopyUri`. If copying the file fails (eg. due to lack of free space), `fileCopyUri` will be `null`, and more details about the error will be available in `copyError` field in the result.

This should help if you need to work with the file(s) later on, because by default, [the picked documents are temporary files. They remain available only until your application terminates](https://developer.apple.com/documentation/uikit/uidocumentpickerdelegate/2902364-documentpicker). This may impact performance for large files, so keep this in mind if you expect users to pick particularly large files and your app does not need immediate read access.

On Android, this can be used to obtain local, on-device copy of the file (eg. if user picks a document from google drive, this will download it locally to the phone).

##### [Windows only] `readContent`:`boolean`

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

The `pick` Promise resolves to an array of objects with the following keys.

##### `uri`

The URI representing the document picked by the user. _On iOS this will be a `file://` URI for a temporary file in your app's container if `mode` is not specified or set at `import` otherwise it will be the original `file://` URI. On Android this will be a `content://` URI for a document provided by a DocumentProvider that must be accessed with a ContentResolver._

##### `fileCopyUri`

If `copyTo` option is specified, this will point to a local copy of picked file. Otherwise, this is `null`.

##### `type`

The MIME type of the file. _On Android some DocumentProviders may not provide MIME types for their documents. On iOS this MIME type is based on the best MIME type for the file extension according to Apple's internal "Uniform Type Identifiers" database._

##### `name`

The display name of the file. _This is normally the filename of the file, but Android does not guarantee that this will be a filename from all DocumentProviders._

##### `size`

The file size of the document. _On Android some DocumentProviders may not provide this information for a document._

##### [Windows only] `content`

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

#### `DocumentPicker.isInProgress(err)`

If the user somehow manages to open multiple file pickers (eg. due the app being unresponsive), then only the picked result from the last opened picker will be considered and the promises form previous opened pickers will be rejected with an error that you can check using `DocumentPicker.isInProgress()`.

This behavior might change in future to allow opening only a single picker at a time. The internal logic is currently implemented only on iOS.

#### [iOS only] `DocumentPicker.releaseSecureAccess(uris: Array<string>)`

If `mode` is set to `open` iOS is giving you a secure access to a file located outside from your sandbox.
In that case Apple is asking you to release the access as soon as you finish using the resource.

## Example

See the example app in `example` folder.

```javascript
import DocumentPicker from 'react-native-document-picker'

// Pick a single file
try {
  const res = await DocumentPicker.pick({
    type: [DocumentPicker.types.images],
  })
  console.log(
    res.uri,
    res.type, // mime type
    res.name,
    res.size,
  )
} catch (err) {
  if (DocumentPicker.isCancel(err)) {
    // User cancelled the picker, exit any dialogs or menus and move on
  } else {
    throw err
  }
}

// Pick multiple files
try {
  const results = await DocumentPicker.pickMultiple({
    type: [DocumentPicker.types.images],
  })
  for (const res of results) {
    console.log(
      res.uri,
      res.type, // mime type
      res.name,
      res.size,
    )
  }
} catch (err) {
  if (DocumentPicker.isCancel(err)) {
    // User cancelled the picker, exit any dialogs or menus and move on
  } else {
    throw err
  }
}
```

## How to upload picked files?

Use blob support that is built into react native - [see comment](https://github.com/rnmods/react-native-document-picker/issues/70#issuecomment-384335402).
If you need to track upload progress, use `XMLHttpRequest` [see here](https://gist.github.com/Tamal/9231005f0c62e1a3f23f60dc2f46ae35)

Alternatively, use [https://github.com/johanneslumpe/react-native-fs](https://github.com/johanneslumpe/react-native-fs)

## Help wanted: Improvements

- Fix Xcode warning about constraints
- support options for the [UIDocumentPickerViewController](https://developer.apple.com/library/ios/documentation/FileManagement/Conceptual/DocumentPickerProgrammingGuide/AccessingDocuments/AccessingDocuments.html#//apple_ref/doc/uid/TP40014451-CH2-SW5)
