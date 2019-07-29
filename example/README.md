#How to Check

Define `projectRoot` is `react-native-document-picker` direcotry

## ios

```shell
# at projectRoot
yarn install
# at projectRoot/example/ios
pod install
# at projectRoot
yarn start
```

And in Xcode, change provisioning file with setting your team. Then, run button with example scheme.

## android

We need settings of debug.keystore and emulator setting see if [failure install](https://stackoverflow.com/questions/42706286/application-installation-failed-install-failed-verification-failure) or [empty debug keystore](https://stackoverflow.com/questions/9516881/deleted-debug-keystore-file-how-do-i-generate-it-again)

```shell
# at projectRoot
yarn install
# at projectRoot
npx react-native run-android --root example
```

if some errors occur, these may be due to gradle settings or versions, emulator settings, lost debug.keystore, or path of command execution wrong.