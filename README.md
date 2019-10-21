# react-native-document-picker

⚠️ Breaking: New Interface: use v2 branch if you need to go back.
PR are welcome to add what's missing.

A React Native wrapper for:

- Apple's `UIDocumentPickerViewController`
- Android's `Intent.ACTION_OPEN_DOCUMENT` / `Intent.ACTION_PICK`
- Windows `Windows.Storage.Pickers`

### Installation

```bash
npm i --save react-native-document-picker
```

**Automatically Link Native Modules**

Link native packages via the following command:

```
react-native link
```

**Manually Link Native Modules**

1. Run `npm install react-native-document-picker --save`
2. Open your project in XCode, right click on `Libraries` and click `Add Files to "Your Project Name"` [(Screenshot)](http://url.brentvatne.ca/jQp8) then [(Screenshot)](http://url.brentvatne.ca/1gqUD).
3. Add `libRNDocumentPicker.a` to `Build Phases -> Link Binary With Libraries`
   [(Screenshot)](http://url.brentvatne.ca/17Xfe).

**CocoaPods**

Add the following to your podfile:

```
pod 'react-native-document-picker', :path => '../node_modules/react-native-document-picker'
```

### Android

```gradle
// file: android/settings.gradle
...

include ':react-native-document-picker'
project(':react-native-document-picker').projectDir = new File(rootProject.projectDir, '../node_modules/react-native-document-picker/android')
```

```gradle
// file: android/app/build.gradle
...

dependencies {
    ...
    compile project(':react-native-document-picker')
}
```

```java
// file: MainApplication.java
...

import io.github.elyx0.reactnativedocumentpicker.DocumentPickerPackage; // Import package

public class MainApplication extends Application implements ReactApplication {

   /**
   * A list of packages used by the app. If the app uses additional views
   * or modules besides the default ones, add more packages here.
   */
    @Override
    protected List<ReactPackage> getPackages() {
      return Arrays.<ReactPackage>asList(
          new MainReactPackage(),
            new DocumentPickerPackage() // Add package
      );
    }
...
}
```

### Windows

Follow the instructions in the ['Linking Libraries'](https://github.com/Microsoft/react-native-windows/blob/master/docs/LinkingLibrariesWindows.md) documentation on the react-native-windows GitHub repo. For the first step of adding the project to the Visual Studio solution file, the path to the project should be `../node_modules/react-native-document-picker/windows/RNDocumentPicker/RNDocumentPicker.csproj`.

## API

### `DocumentPicker.pick(opts)` and `DocumentPicker.pickMultiple(opts)`

Use `pick` or `pickMultiple` to open a document picker for the user to select file(s). Both methods return a Promise. `pick` will only allow a single selection and the Promise will resolve to that single result. `pickMultiple` will allow multiple selection and the Promise returned will always resolve to an array of results.

**Options:**

- **`type`**:`string|Array<string>`: The type or types of documents to allow selection of. May be an array of types as single type string.
  - On Android these are MIME types such as `text/plain` or partial MIME types such as `image/*`.
  - On iOS these must be Apple "[Uniform Type Identifiers](https://developer.apple.com/library/content/documentation/Miscellaneous/Reference/UTIRef/Articles/System-DeclaredUniformTypeIdentifiers.html)"
  - If `type` is omitted it will be treated as `*/*` or `public.content`.
  - Multiple type strings are not supported on Android before KitKat (API level 19), Jellybean will fall back to `*/*` if you provide an array with more than one value.
- **[UWP only] `readContent`**: Boolean which defaults to `false`. If `readContent` is set to true the content of the picked file/files will be read and supplied in the result object.

  - Be aware that this can introduce a huge performance hit in case of big files. (The files are read completely and into the memory and encoded to base64 afterwards to add them to the result object)
  - However reading the file directly from within the Thread which managed the picker can be necessary on Windows: Windows Apps can only read the Downloads folder and their own app folder by default and If a file is outside of these locations it cannot be acessed directly. However if the user picks the file through a file picker permissions to that file are granted implicitly.

    ```
    In addition to the default locations, an app can access additional files and folders by declaring capabilities in the app manifest (see App capability declarations), or by calling a file picker to let the user pick files and folders for the app to access (see Open files and folders with a picker).
    ```

    https://docs.microsoft.com/en-us/windows/uwp/files/file-access-permissions

    Unfortunately that permission is not granted to the whole app, but only the Thread which handled the filepicker. Therefore it can be useful to read the file directly.

  - You can use `react-native-fs` on Android and IOS to read the picked file.

**Result:**

The object a `pick` Promise resolves to or the objects in the array a `pickMultiple` Promise resolves to will contain the following keys.

- **`uri`**: The URI representing the document picked by the user. _On iOS this will be a `file://` URI for a temporary file in your app's container. On Android this will be a `content://` URI for a document provided by a DocumentProvider that must be accessed with a ContentResolver._
- **`type`**: The MIME type of the file. _On Android some DocumentProviders may not provide MIME types for their documents. On iOS this MIME type is based on the best MIME type for the file extension according to Apple's internal "Uniform Type Identifiers" database._
- **`name`**: The display name of the file. _This is normally the filename of the file, but Android does not guarantee that this will be a filename from all DocumentProviders._
- **`size`**: The file size of the document. _On Android some DocumentProviders may not provide this information for a document._
- **[UWP only] `content`**: The base64 encoded content of the picked file if the option `readContent` was set to `true`.

### `DocumentPicker.types.*`

`DocumentPicker.types.*` provides a few common types for use as `type` values, these types will use the correct format for each platform (MIME types on Android, UTIs on iOS).

- `DocumentPicker.types.allFiles`: All document types, on Android this is `*/*`, on iOS is `public.content` (note that some binary and archive types do not inherit from `public.content`)
- `DocumentPicker.types.images`: All image types (`image/*` or `public.image`)
- `DocumentPicker.types.plainText`: Plain text files ie: `.txt` (`text/plain` or `public.plain-text`)
- `DocumentPicker.types.audio`: All audio types (`audio/*` or `public.audio`)
- `DocumentPicker.types.pdf`: PDF documents (`application/pdf` or `com.adobe.pdf`)

### `DocumentPicker.isCancel(err)`

If the user cancels the document picker without choosing a file (by pressing the system back button on Android or the Cancel button on iOS) the Promise will be rejected with a cancellation error. You can check for this error using `DocumentPicker.isCancel(err)` allowing you to ignore it and cleanup any parts of your interface that may not be needed anymore.

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

![screenshot](http://i.stack.imgur.com/dv0iQ.png)

## How to send it back ?

I recommend using [https://github.com/johanneslumpe/react-native-fs](https://github.com/johanneslumpe/react-native-fs)
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
let url = "file://whatever/com.bla.bla/file.ext"; //The url you received from the DocumentPicker

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
  const percentage = Math.floor((response.totalBytesSent/response.totalBytesExpectedToSend) * 100);
  console.log('UPLOAD IS ' + percentage + '% DONE!');
};

RNFS.uploadFiles({
   toUrl: uploadUrl,
   files: [{
      name,
      filename:name,
      filepath: realPath,
    }],
   method: 'POST',
   headers: {
      'Accept': 'application/json',
   },
   begin: uploadBegin,
   beginCallback: uploadBegin, // Don't ask me, only way I made it work as of 1.5.1
   progressCallback: uploadProgress,
   progress: uploadProgress
   })
   .then((response) => {
     console.log(response,"<<< Response");
     if (response.statusCode == 200) { //You might not be getting a statusCode at all. Check
        console.log('FILES UPLOADED!');
      } else {
        console.log('SERVER ERROR');
       }
     })
     .catch((err) => {
       if (err.description) {
         switch (err.description) {
           case "cancelled":
             console.log("Upload cancelled");
             break;
           case "empty"
             console.log("Empty file");
           default:
            //Unknown
         }
       } else {
        //Weird
       }
       console.log(err);
    });
```

## Reminder

You need to enable iCloud Documents to access iCloud
![screen](https://313e5987718b346aaf83-f5e825270f29a84f7881423410384342.ssl.cf1.rackcdn.com/1411920674-enable-icloud-drive.png)

## Halp wanted: Improvements

- Fix Xcode warning about constraints
- support options for the [UIDocumentPickerViewController](https://developer.apple.com/library/ios/documentation/FileManagement/Conceptual/DocumentPickerProgrammingGuide/AccessingDocuments/AccessingDocuments.html#//apple_ref/doc/uid/TP40014451-CH2-SW5)
- Handle Upload by itself ?
