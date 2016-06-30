# react-native-document-picker

A React Native wrapper for Apple's ``UIDocumentMenuViewController``

### Installation

```bash
npm i --save react-native-document-picker
```

### Easy way: With [rnpm](https://github.com/rnpm/rnpm)

`$ rnpm link`

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

```javascript
let url = "file://whatever/com.bla.bla/file.ext"; //The url you received from the DocumentPicker
const split = url.split('/');
const name = split.pop();
const inbox = split.pop();
const realPath = `${RNFS.TemporaryDirectoryPath}${inbox}/${name}`;

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
   progress: uploadProgress
   })
   .then((response) => {
     if (response.statusCode == 200) {
        console.log('FILES UPLOADED!'); // response.statusCode, response.headers, response.body
      } else {
        console.log('SERVER ERROR');
       }
     })
     .catch((err) => {
       if(err.description === "cancelled") {
         // cancelled by user
       }
       console.log(err);
    });
```
## Reminder

You need to enable iCloud Documents to access iCloud 
![screen](https://313e5987718b346aaf83-f5e825270f29a84f7881423410384342.ssl.cf1.rackcdn.com/1411920674-enable-icloud-drive.png)
