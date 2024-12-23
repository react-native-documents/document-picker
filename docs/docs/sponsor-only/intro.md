---
sidebar_position: 0
---

# Introduction

Welcome to the docs for `@react-native-documents/picker` and `@react-native-documents/viewer` packages. These packages provide a way to pick, save ('save as' dialog) documents and view documents on the device's file system or remote locations.

## What's new in the premium packages?

There's the improved (list of changes below) picker package (called `@react-native-documents/picker`) with api that's very similar to the [original](../public/document-picker). Secondly, there's the completely new `@react-native-documents/viewer` package which is designed to work well together with `picker`.

### TypeScript

- improved type definitions that make use of [Discriminated Unions](https://basarat.gitbook.io/typescript/type-system/discriminated-unions) and other goodies so that you don't try to read fields that are not there, and nullable fields are also reduced. (You can use vanilla JS too if you like.).
- [mocks](./jest-mocks.md) for testing
- `pickSingle` method was replaced for more streamlined `const [result] = pick()`

### iOS

- new: [`saveDocuments`](./picker/save-as-dialog) function
- new: [`isKnownType`](./picker/limiting-selectable-files.md#isknowntype) utility
- new: support for long-term file access permissions - across app and even device reboots! ([`requestLongTermAccess`](./picker/open-mode.mdx))
- new: [`keepLocalCopy`](./picker/keeping-local-copy.mdx) function that separates picking a file and copying it to a local directory. This makes your app more responsive: previously you'd use the `copyTo` option and before the resulting `Promise` resolved, you needed to wait not only for user to pick the file, but also for the file to be copied to your app's directory. For large files or with slow network, this could be a problem that you, as a dev don't see, but your users do.
- improved: the majority of the code is now written in Swift, making code safer and more readable.
- improved: less use of the main thread.
- improved: using the new `UIDocumentPickerViewController` apis instead of those deprecated in iOS 14
- improved: instead of the old `copyTo` parameter making unnecessary copies, the new `keepLocalCopy` function moves the imported file.

### Android

- new: [`saveDocuments`](./picker/save-as-dialog) function
- new: support for [open mode](./picker/open-mode.mdx)
- new: support for long-term file access permissions - across app and even device reboots! ([`requestLongTermAccess`](./picker/open-mode.mdx))
- new: [`keepLocalCopy`](./picker/keeping-local-copy.mdx) function that separates picking a file and copying it to a local directory. This makes your app more responsive: previously you'd use the `copyTo` option and before the resulting `Promise` resolved, you needed to wait not only for user to pick the file, but also for the file to be copied to your app's directory. For large files or with slow network, this could be a problem that you, as a dev don't see, but your users do.
- new: support for [virtual files](./picker/virtual-files.md)
- improved: deprecated [AsyncTask](https://developer.android.com/reference/android/os/AsyncTask) usage was replaced with Kotlin Coroutines.
- improved: the code is better at operating with I/O, for example buffering is replaced with a potentially much more efficient alternative from `java.nio`
- improved: reading file metadata is more defensive and efficient because only the necessary columns are queried from [ContentResolver](<https://developer.android.com/reference/android/content/ContentResolver#query(android.net.Uri,%20java.lang.String[],%20android.os.Bundle,%20android.os.CancellationSignal)>). The native Android apis are full of calls that can return null or throw so extra care is taken to handle these cases.

### Windows

Windows is not supported at the moment. While there is Windows-related code in the public module, it's not maintained and probably does not work.

### How do I know it works?

With so many changes, you might wonder if the new package is stable - especially with Android because... well, we know Android 😜.

To prove the new code is solid, I have written an e2e test suite using Appium that covers the majority of the features:

- import mode
- open mode
- viewing files, including long-term permissions

<iframe width="560" height="315" src="https://www.youtube.com/embed/tE3WMA4nxGE?si=N8p535owAFnenBwz" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>

The test suite focuses on Android, and was executed on real devices from Samsung, Google and Huawei, with Android versions ranging between 8 and 14. iOS tests were done manually on a real device with iOS 17.

As a result, I have greater confidence in the new package than in the old one!

## Why do I ask for sponsorship?

I ([vonovak](https://github.com/vonovak)) have been maintaining the original [`react-native-document-picker`](../public/document-picker) package more or less since 2020. The package has been used by thousands of devs, but I could see that there was a lot to improve.

In January 2024 I decided to rewrite the package from scratch and make it better! The new package has a new name: `@react-native-documents/picker` and is hosted on the [GitHub packages npm registry](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-npm-registry).

While I was at it, I also created a new `viewer` package.

How to make OSS sustainable? My take is this: rather than asking for support, I provide full-featured packages and ask for a fee in return. I believe that the new packages are worth it.

Feel free to read more in my [GitHub Sponsors profile](https://github.com/sponsors/vonovak).

## Migrating from the old package

See the 3-step [migration guide](./migration.md).
