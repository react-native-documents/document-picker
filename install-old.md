#### RN < 0.60

For RN < 0.60, you need to link the dependency using `react-native link`:

```bash
react-native link react-native-document-picker
```

Then run `pod install` from the ios directory and rebuild your project.

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
