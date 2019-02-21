# react-native-document-picker

A React Native wrapper for Apple's ``UIDocumentMenuViewController`` and for Android's ``Intent.ACTION_OPEN_DOCUMENT`` / ``Intent.ACTION_PICK``.

### Installation

```bash
npm i --save react-native-document-picker
```

**Automatically Link Native Modules**

For 0.29.2+ projects, simply link native packages via the following command (note: rnpm has been merged into react-native)

```
react-native link react-native-document-picker
```

As for projects < 0.29 you need `rnpm` to link native packages

```sh
rnpm link
```

**Manually Link Native Modules**

1. Run `npm install react-native-document-picker --save`
2. Open your project in XCode, right click on `Libraries` and click `Add
   Files to "Your Project Name"`, select `RNDocumentPicker.xcodeproj` [(Screenshot)](http://url.brentvatne.ca/jQp8) then [(Screenshot)](http://url.brentvatne.ca/1gqUD).
3. Add `libRNDocumentPicker.a` to `Build Phases -> Link Binary With Libraries`
   https://facebook.github.io/react-native/docs/linking-libraries-ios

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

import com.reactnativedocumentpicker.ReactNativeDocumentPicker; // Import package

public class MainApplication extends Application implements ReactApplication {

   /**
   * A list of packages used by the app. If the app uses additional views
   * or modules besides the default ones, add more packages here.
   */
    @Override
    protected List<ReactPackage> getPackages() {
      return Arrays.<ReactPackage>asList(
          new MainReactPackage(),
            new ReactNativeDocumentPicker() // Add package
      );
    }
...
}
```

## Example
```javascript
import { DocumentPicker, DocumentPickerUtil } from 'react-native-document-picker';

// iPhone/Android
DocumentPicker.show({
      filetype: [DocumentPickerUtil.images()],
    },(error,res) => {
      // Android
      console.log(
         res.uri,
         res.type, // mime type
         res.fileName,
         res.fileSize
      );
    });

// iPad
const {pageX, pageY} = event.nativeEvent;

DocumentPicker.show({
  top: pageY,
  left: pageX,
  filetype: ['public.image'],
}, (error, url) => {
  alert(url);
});

```

### Note
The full list of UTI is available here:
[(https://developer.apple.com/library/ios/documentation/Miscellaneous/Reference/UTIRef/Articles/System-DeclaredUniformTypeIdentifiers.html)](https://developer.apple.com/library/ios/documentation/Miscellaneous/Reference/UTIRef/Articles/System-DeclaredUniformTypeIdentifiers.html
)]

## Here is how it looks:
![screenshot](http://i.stack.imgur.com/dv0iQ.png)


## Common issues ⚠️

Please check these issues tagged [addTo FAQ](https://github.com/Elyx0/react-native-document-picker/issues?utf8=%E2%9C%93&q=+is%3Aissue+label%3A%22addto%3A+FAQ%22+)



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
## File Type 
***All type of Files*** ``` 'public.allFiles' or DocumentPickerUtil.allFiles()```<br/> 
***Only PDF*** ``` 'public.pdf' or DocumentPickerUtil.pdf() ``` <br/> 
***Audio*** ``` 'public.audio' or DocumentPickerUtil.audio()``` <br/> 
***Plain Text*** ``` 'public.plainText' or DocumentPickerUtil.plainText() ``` <br/> 

## Reminder

You need to enable iCloud Documents to access iCloud
![screen](https://313e5987718b346aaf83-f5e825270f29a84f7881423410384342.ssl.cf1.rackcdn.com/1411920674-enable-icloud-drive.png)


## Halp wanted: Improvements

- Fix Xcode warning about constraints
- support options for the [UIDocumentMenuViewController](https://developer.apple.com/library/ios/documentation/FileManagement/Conceptual/DocumentPickerProgrammingGuide/AccessingDocuments/AccessingDocuments.html#//apple_ref/doc/uid/TP40014451-CH2-SW5)
- Handle Upload by itself ?
