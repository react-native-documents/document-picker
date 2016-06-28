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
