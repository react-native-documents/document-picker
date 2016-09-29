# react-native-document-picker

A React Native wrapper for Apple's ``UIDocumentMenuViewController``

### Installation

```bash
npm i --save react-native-document-picker
```

### Easy way: With [rnpm](https://github.com/rnpm/rnpm)

`$ react-native link`

### Option: Manually

1. Run `npm install react-native-document-picker --save`
2. Open your project in XCode, right click on `Libraries` and click `Add
   Files to "Your Project Name"` [(Screenshot)](http://url.brentvatne.ca/jQp8) then [(Screenshot)](http://url.brentvatne.ca/1gqUD).
3. Add `libRNDocumentPicker.a` to `Build Phases -> Link Binary With Libraries`
   [(Screenshot)](http://url.brentvatne.ca/17Xfe).





## Example
```javascript
const DocumentPicker = require('react-native').NativeModules.RNDocumentPicker;

DocumentPicker.show({
      filetype: ['public.image'],
    },(error,url) => {
      alert(url);
    });

```

### Note
The full list of UTI is available here:
[(https://developer.apple.com/library/ios/documentation/Miscellaneous/Reference/UTIRef/Articles/System-DeclaredUniformTypeIdentifiers.html)](https://developer.apple.com/library/ios/documentation/Miscellaneous/Reference/UTIRef/Articles/System-DeclaredUniformTypeIdentifiers.html
)]

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
- support options for the [UIDocumentMenuViewController](https://developer.apple.com/library/ios/documentation/FileManagement/Conceptual/DocumentPickerProgrammingGuide/AccessingDocuments/AccessingDocuments.html#//apple_ref/doc/uid/TP40014451-CH2-SW5)
- Handle Upload by itself ?
