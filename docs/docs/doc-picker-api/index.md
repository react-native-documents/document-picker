# document-picker API

## Type Aliases

### BookmarkingResponse

> **BookmarkingResponse**: \{`bookmark`: `string`;`bookmarkStatus`: `"success"`; \} \| \{`bookmarkError`: `string`;`bookmarkStatus`: `"error"`; \}

If you've requested long-term access to a directory or file, this object will be returned in the response.
In order to access the same directory or file in the future, you must store the `bookmark` opaque string,
and then pass it to the document viewer if you want to preview the file.

See the Document viewer source on how to retrieve the file from the bookmark, if you need to do that (advanced use case).

***

### FileToCopy

> **FileToCopy**: \{`convertVirtualFileToType`: `string`;`fileName`: `string`;`uri`: `string`; \}

Parameter of [keepLocalCopy](index.md#keeplocalcopy). Object type representing the file(s) whose copy should be kept in the app's storage.

#### Type declaration

| Name | Type | Description |
| ------ | ------ | ------ |
| `convertVirtualFileToType`? | `string` | Only for Android virtual files: the type of the file to export to. For example, `application/pdf` or `text/plain`. Use one of the values from `convertibleToMimeTypes` from the response of the `pick()` method: [DocumentPickerResponse](index.md#documentpickerresponse). |
| `fileName` | `string` | The name of the resulting file, with the file extension. You can use the `name` field from the response of the `pick()` method. Example: someFile.pdf |
| `uri` | `string` | The uri to keep a local copy of. This would be a `content://` uri (Android), or a `file://` uri (iOS) that the user has previously picked. |

***

### IsKnownTypeOptions

> **IsKnownTypeOptions**: \{`kind`: `"UTType"` \| `"mimeType"` \| `"extension"`;`value`: `string`; \}

#### Type declaration

| Name | Type | Description |
| ------ | ------ | ------ |
| `kind` | `"UTType"` \| `"mimeType"` \| `"extension"` | the kind of value you're passing |
| `value` | `string` | the value you're checking, for example: application/pdf, com.adobe.pdf, pdf |

***

### IsKnownTypeResponse

> **IsKnownTypeResponse**: \{`isKnown`: `boolean`;`mimeType`: `string` \| `null`;`preferredFilenameExtension`: `string` \| `null`;`UTType`: `string` \| `null`; \}

The result of calling [isKnownType](index.md#isknowntype)

#### Type declaration

| Name | Type | Description |
| ------ | ------ | ------ |
| `isKnown` | `boolean` | On iOS, this is true if the type is known to the device. That means it can be used with the document picker to filter what files can be picked. On Android, this is true if the internal mime type database contains the given value. |
| `mimeType` | `string` \| `null` | the mime type for the given value, if any |
| `preferredFilenameExtension` | `string` \| `null` | the preferred filename extension for the given value, if any |
| `UTType` | `string` \| `null` | the UTType identifier for the given value, if any |

***

### KeepLocalCopyOptions

> **KeepLocalCopyOptions**: \{`destination`: `"cachesDirectory"` \| `"documentDirectory"`;`files`: `NonEmptyArray`\<[`FileToCopy`](index.md#filetocopy)\>; \}

options for [keepLocalCopy](index.md#keeplocalcopy)

#### Type declaration

| Name | Type |
| ------ | ------ |
| `destination` | `"cachesDirectory"` \| `"documentDirectory"` |
| `files` | `NonEmptyArray`\<[`FileToCopy`](index.md#filetocopy)\> |

***

### KeepLocalCopyResponse

> **KeepLocalCopyResponse**: `NonEmptyArray`\<[`LocalCopyResponse`](index.md#localcopyresponse)\>

Result of the call to [keepLocalCopy](index.md#keeplocalcopy). Please note the promise always resolves, even if there was an error processing any uri(s) (as indicated by the `status` field, and `copyError` field).

***

### LocalCopyResponse

> **LocalCopyResponse**: \{`localUri`: `string`;`sourceUri`: `string`;`status`: `"success"`; \} \| \{`copyError`: `string`;`sourceUri`: `string`;`status`: `"error"`; \}

Indicates, for each Uri that was passed to [keepLocalCopy](index.md#keeplocalcopy), whether the local copy was successfully created or not.

If the copy was successful, the status field is `success` and `localUri` contains the local Uri.
If the copy was not successful, the status field is `error` and `copyError` field contains the error message.

***

### PredefinedFileTypes

> **PredefinedFileTypes**: `Flatten`\<`AllMimeTypes`\> \| `AllAppleUTIs`

You'd rarely use this type directly.
It represents the predefined file types which are exported as `types` and can be used to limit the kinds of files that can be picked.

#### Example

```ts
import {
  pick,
  types,
} from '@react-native-documents/picker'
// ...
const result = await pick({
  type: [types.pdf, types.docx],
})
```

***

### PresentationStyle

> **PresentationStyle**: `"fullScreen"` \| `"pageSheet"` \| `"formSheet"` \| `"overFullScreen"` \| `undefined`

iOS only. Configure the presentation style of the picker.

***

### ReleaseLongTermAccessResult

> **ReleaseLongTermAccessResult**: (\{`status`: `"success"`;`uri`: `string`; \} \| \{`errorMessage`: `string`;`status`: `"error"`;`uri`: `string`; \})[]

For each uri whose release was requested, the result will contain an object with the uri and a status.

***

### TransitionStyle

> **TransitionStyle**: `"coverVertical"` \| `"flipHorizontal"` \| `"crossDissolve"` \| `"partialCurl"` \| `undefined`

iOS only. Configure the transition style of the picker.

## Variables

### errorCodes

> `const` **errorCodes**: `Readonly`\<\{`IN_PROGRESS`: `"ASYNC_OP_IN_PROGRESS"`;`OPERATION_CANCELED`: `"OPERATION_CANCELED"`;`UNABLE_TO_OPEN_FILE_TYPE`: `"UNABLE_TO_OPEN_FILE_TYPE"`; \}\>

Error codes that can be returned by the module, and are available on the `code` property of the error.

#### Type declaration

| Name | Type |
| ------ | ------ |
| `IN_PROGRESS` | `"ASYNC_OP_IN_PROGRESS"` |
| `OPERATION_CANCELED` | `"OPERATION_CANCELED"` |
| `UNABLE_TO_OPEN_FILE_TYPE` | `"UNABLE_TO_OPEN_FILE_TYPE"` |

#### Example

```ts
  const handleError = (err: unknown) => {
    if (isErrorWithCode(err)) {
      switch (err.code) {
        case errorCodes.IN_PROGRESS:
          ...
          break
        case errorCodes.UNABLE_TO_OPEN_FILE_TYPE:
          ...
          break
        case errorCodes.OPERATION_CANCELED:
          // ignore
          break
        default:
          console.error(err)
      }
    } else {
       console.error(err)
    }
  }
```

## Functions

### isErrorWithCode()

> **isErrorWithCode**(`error`: `any`): `error is NativeModuleError`

TypeScript helper to check if an object has the `code` property.
This is used to avoid `as` casting when you access the `code` property on errors returned by the module.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `error` | `any` |

#### Returns

`error is NativeModuleError`

***

### releaseLongTermAccess()

> **releaseLongTermAccess**(`uris`: `string`[]): `Promise`\<[`ReleaseLongTermAccessResult`](index.md#releaselongtermaccessresult)\>

Android only - Releases long-term access to the given URIs. There's no need to call this method on iOS - there's no iOS equivalent.

See [Android documentation](https://developer.android.com/reference/android/content/ContentResolver#releasePersistableUriPermission(android.net.Uri,%20int)) for more information.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `uris` | `string`[] |

#### Returns

`Promise`\<[`ReleaseLongTermAccessResult`](index.md#releaselongtermaccessresult)\>

***

### releaseSecureAccess()

> **releaseSecureAccess**(`uris`: `string`[]): `Promise`\<`null`\>

iOS only - Releases (stops) secure access to the given URIs. Use with URIs obtained with Open mode or with the Directory Picker.
See [iOS documentation](https://developer.apple.com/documentation/foundation/nsurl/1413736-stopaccessingsecurityscopedresou) for more information.
There's no need to call this method on Android - there's no equivalent method on Android.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `uris` | `string`[] |

#### Returns

`Promise`\<`null`\>

## DocumentPicker

### isKnownType()

> **isKnownType**(`options`: [`IsKnownTypeOptions`](index.md#isknowntypeoptions)): [`IsKnownTypeResponse`](index.md#isknowntyperesponse)

Checks if the given value (which can be a file extension, UTType identifier or mime) is known to the system.
Also returns the mime type which you can use to filter files on Android.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `options` | [`IsKnownTypeOptions`](index.md#isknowntypeoptions) |

#### Returns

[`IsKnownTypeResponse`](index.md#isknowntyperesponse)

***

### keepLocalCopy()

> **keepLocalCopy**(`options`: [`KeepLocalCopyOptions`](index.md#keeplocalcopyoptions)): `Promise`\<[`KeepLocalCopyResponse`](index.md#keeplocalcopyresponse)\>

Makes the file available in the app's storage. The behavior is different on iOS and Android, and for simple use cases (such as uploading file to remote server), you may not need to call this method at all.

On Android, it can be used to "convert" a `content://` Uri into a local file. It also "exports" virtual files (such as Google docs or sheets) into local files.

However, note that for some use cases, such as uploading the picked file to a server, you may not need to call `keepLocalCopy` at all. React Native's `fetch` can handle `content://` uris.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `options` | [`KeepLocalCopyOptions`](index.md#keeplocalcopyoptions) |

#### Returns

`Promise`\<[`KeepLocalCopyResponse`](index.md#keeplocalcopyresponse)\>

***

### pick()

> **pick**\<`O`\>(`options`?: `O`): `PickResponse`\<`O`\>

The method for picking a file, both for `import` and `open` modes.

For result types, see [DocumentPickerResponse](index.md#documentpickerresponse) or [DocumentPickerResponseOpenLongTerm](index.md#documentpickerresponseopenlongterm).

For options, see [DocumentPickerOptionsImport](index.md#documentpickeroptionsimport), [DocumentPickerOptionsOpenOnce](index.md#documentpickeroptionsopenonce) or [DocumentPickerOptionsOpenLongTerm](index.md#documentpickeroptionsopenlongterm).

#### Type Parameters

| Type Parameter |
| ------ |
| `O` *extends* `DocumentPickerOptions` |

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `options`? | `O` |

#### Returns

`PickResponse`\<`O`\>

***

### pickDirectory()

> **pickDirectory**\<`O`\>(`options`?: `O`): [`PickDirectoryResponse`](index.md#pickdirectoryresponseo)\<`O`\>

Opens a directory picker.

#### Type Parameters

| Type Parameter |
| ------ |
| `O` *extends* [`DirectoryPickerOptions`](index.md#directorypickeroptions) |

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `options`? | `O` |

#### Returns

[`PickDirectoryResponse`](index.md#pickdirectoryresponseo)\<`O`\>

***

### saveDocuments()

> **saveDocuments**(`options`: [`SaveDocumentsOptions`](index.md#savedocumentsoptions)): `Promise`\<`NonEmptyArray`\<[`SaveDocumentsResponse`](index.md#savedocumentsresponse)\>\>

The method for opening a "save as" dialog and saving source file(s) to a new location.

On Android, only one file can be saved at a time.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `options` | [`SaveDocumentsOptions`](index.md#savedocumentsoptions) |

#### Returns

`Promise`\<`NonEmptyArray`\<[`SaveDocumentsResponse`](index.md#savedocumentsresponse)\>\>

## pick() types

### DocumentPickerOptionsBase

> **DocumentPickerOptionsBase**: \{`allowMultiSelection`: `boolean`;`allowVirtualFiles`: `boolean`;`presentationStyle`: [`PresentationStyle`](index.md#presentationstyle);`transitionStyle`: [`TransitionStyle`](index.md#transitionstyle);`type`: `string` \| [`PredefinedFileTypes`](index.md#predefinedfiletypes) \| ([`PredefinedFileTypes`](index.md#predefinedfiletypes) \| `string`)[]; \}

Base options object for the document picker.
You'd rarely use this type directly, but instead use one of

[DocumentPickerOptionsImport](index.md#documentpickeroptionsimport), [DocumentPickerOptionsOpenOnce](index.md#documentpickeroptionsopenonce) or [DocumentPickerOptionsOpenLongTerm](index.md#documentpickeroptionsopenlongterm)

which extend this type

#### Type declaration

| Name | Type | Description |
| ------ | ------ | ------ |
| `allowMultiSelection`? | `boolean` | Whether to allow multiple files to be picked. False by default. |
| `allowVirtualFiles`? | `boolean` | Android only - Whether to allow virtual files (such as Google docs or sheets) to be picked. False by default. |
| `presentationStyle`? | [`PresentationStyle`](index.md#presentationstyle) | iOS only - Controls how the picker is presented, e.g. on an iPad you may want to present it fullscreen. Defaults to `pageSheet`. |
| `transitionStyle`? | [`TransitionStyle`](index.md#transitionstyle) | iOS only - Configures the transition style of the picker. Defaults to coverVertical, when the picker is presented, its view slides up from the bottom of the screen. |
| `type`? | `string` \| [`PredefinedFileTypes`](index.md#predefinedfiletypes) \| ([`PredefinedFileTypes`](index.md#predefinedfiletypes) \| `string`)[] | Specify file type(s) that you want to pick. Use `types` for some predefined values. |

***

### DocumentPickerOptionsImport

> **DocumentPickerOptionsImport**: [`DocumentPickerOptionsBase`](index.md#documentpickeroptionsbase) & \{`mode`: `"import"`;`requestLongTermAccess`: `never`; \}

Present the document picker in import mode.

#### Type declaration

| Name | Type |
| ------ | ------ |
| `mode`? | `"import"` |
| `requestLongTermAccess`? | `never` |

***

### DocumentPickerOptionsOpenLongTerm

> **DocumentPickerOptionsOpenLongTerm**: [`DocumentPickerOptionsBase`](index.md#documentpickeroptionsbase) & \{`mode`: `"open"`;`requestLongTermAccess`: `true`; \}

Present the document picker in open mode, with long-term permissions to access the opened file.

#### Type declaration

| Name | Type |
| ------ | ------ |
| `mode` | `"open"` |
| `requestLongTermAccess` | `true` |

***

### DocumentPickerOptionsOpenOnce

> **DocumentPickerOptionsOpenOnce**: [`DocumentPickerOptionsBase`](index.md#documentpickeroptionsbase) & \{`mode`: `"open"`;`requestLongTermAccess`: `false`; \}

Present the document picker in open mode, with permissions to access the file for a limited time (until the app terminates).

#### Type declaration

| Name | Type |
| ------ | ------ |
| `mode` | `"open"` |
| `requestLongTermAccess`? | `false` |

***

### DocumentPickerResponse

> **DocumentPickerResponse**: \{`convertibleToMimeTypes`: [`VirtualFileMeta`](index.md#virtualfilemeta)[] \| `null`;`error`: `string` \| `null`;`hasRequestedType`: `boolean`;`isVirtual`: `boolean` \| `null`;`name`: `string` \| `null`;`nativeType`: `string` \| `null`;`size`: `number` \| `null`;`type`: `string` \| `null`;`uri`: `string`; \}

#### Type declaration

| Name | Type | Description |
| ------ | ------ | ------ |
| `convertibleToMimeTypes` | [`VirtualFileMeta`](index.md#virtualfilemeta)[] \| `null` | Android: The target types the virtual file can be converted to. Useful for [keepLocalCopy](index.md#keeplocalcopy). This field is only present if `isVirtual` is true, and only on Android 7.0+. Always `null` on iOS. |
| `error` | `string` \| `null` | Error in case the file metadata could not be obtained. |
| `hasRequestedType` | `boolean` | Android: Some document providers on Android (especially those popular in Asia, it seems) do not respect the request for limiting selectable file types. `hasRequestedType` will be false if the user picked a file that does not have one of the requested types. You need to do your own post-processing and display an error to the user if this is important to your app. Always `true` on iOS. |
| `isVirtual` | `boolean` \| `null` | Android: whether the file is a virtual file (such as Google docs or sheets). Will be `null` on pre-Android 7.0 devices. On iOS, it's always `false`. |
| `name` | `string` \| `null` | The name of the picked file, including the extension. It's very unlikely that it'd be `null` but in theory, it can happen. |
| `nativeType` | `string` \| `null` | The "native" type of the picked file: on Android, this is the MIME type. On iOS, it is the UTType identifier. |
| `size` | `number` \| `null` | The size of the picked file in bytes. |
| `type` | `string` \| `null` | The MIME type of the picked file. |
| `uri` | `string` | The URI of the picked file. This is a percent-encoded `content://` uri (Android), or a `file://` uri (iOS). |

***

### DocumentPickerResponseOpenLongTerm

> **DocumentPickerResponseOpenLongTerm**: [`DocumentPickerResponse`](index.md#documentpickerresponse) & [`BookmarkingResponse`](index.md#bookmarkingresponse)

The result of calling [pick](index.md#pick) with `mode: 'open'` and `requestLongTermAccess: true`

***

### VirtualFileMeta

> **VirtualFileMeta**: \{`extension`: `string` \| `null`;`mimeType`: `string`; \}

#### Type declaration

| Name | Type | Description |
| ------ | ------ | ------ |
| `extension` | `string` \| `null` | The registered extension for the given MIME type. Note that some MIME types map to multiple extensions. This call will return the most common extension for the given MIME type. Example: `pdf` |
| `mimeType` | `string` | The MIME type of the file. This is necessary to export the virtual file to a local file. Example: `application/pdf` |

## pickDirectory() types

### DirectoryPickerOptions

> **DirectoryPickerOptions**: [`DirectoryPickerOptionsBase`](index.md#directorypickeroptionsbase) & \{`requestLongTermAccess`: `boolean`; \}

Options for [pickDirectory](index.md#pickdirectory).

#### Type declaration

| Name | Type |
| ------ | ------ |
| `requestLongTermAccess` | `boolean` |

***

### DirectoryPickerOptionsBase

> **DirectoryPickerOptionsBase**: \{`presentationStyle`: [`PresentationStyle`](index.md#presentationstyle);`transitionStyle`: [`TransitionStyle`](index.md#transitionstyle); \}

Base options object for the directory picker. They only slightly influence the appearance of the picker modal on iOS.
You'd rarely use this type directly, but instead use [DirectoryPickerOptions](index.md#directorypickeroptions)

which extend this type

#### Type declaration

| Name | Type | Description |
| ------ | ------ | ------ |
| `presentationStyle`? | [`PresentationStyle`](index.md#presentationstyle) | iOS only - Controls how the picker is presented, e.g. on an iPad you may want to present it fullscreen. Defaults to `pageSheet`. |
| `transitionStyle`? | [`TransitionStyle`](index.md#transitionstyle) | iOS only - Configures the transition style of the picker. Defaults to coverVertical, when the picker is presented, its view slides up from the bottom of the screen. |

***

### DirectoryPickerResponse

> **DirectoryPickerResponse**: \{`uri`: `string`; \}

This object represents the response from the directory picker, when long-term access was not requested.

#### Type declaration

| Name | Type | Description |
| ------ | ------ | ------ |
| `uri` | `string` | The (percent-encoded) directory selected by user. |

***

### DirectoryPickerResponseLongTerm

> **DirectoryPickerResponseLongTerm**: [`DirectoryPickerResponse`](index.md#directorypickerresponse) & [`BookmarkingResponse`](index.md#bookmarkingresponse)

This object represents the response from the directory picker, when long-term access was requested.

***

### PickDirectoryResponse\<O\>

> **PickDirectoryResponse**\<`O`\>: `Promise`\<`O` *extends* `DirectoryPickerOptionsLongTerm` ? [`DirectoryPickerResponseLongTerm`](index.md#directorypickerresponselongterm) : [`DirectoryPickerResponse`](index.md#directorypickerresponse)\>

You likely won't use this type directly, but instead use [DirectoryPickerResponse](index.md#directorypickerresponse) or [DirectoryPickerResponseLongTerm](index.md#directorypickerresponselongterm).

#### Type Parameters

| Type Parameter |
| ------ |
| `O` *extends* [`DirectoryPickerOptions`](index.md#directorypickeroptions) |

## saveDocuments() types

### SaveDocumentsOptions

> **SaveDocumentsOptions**: \{`copy`: `boolean`;`fileName`: `string`;`mimeType`: `string`;`sourceUris`: `string`[]; \}

Options object for the [saveDocuments](index.md#savedocuments) method. `sourceUris` is the only required field.

#### Type declaration

| Name | Type | Description |
| ------ | ------ | ------ |
| `copy`? | `boolean` | iOS-only: Whether to copy the file to a new location, or move it (default). On Android, file is always copied. |
| `fileName`? | `string` | Android-only: The suggested title of the file to be stored, which will be pre-filled in the UI. On iOS, the target name is taken from the source uri, and is changeable only when exactly one file is being saved. |
| `mimeType`? | `string` | Android-only: The MIME type of the file to be stored. It is recommended to provide this value, otherwise the system will try to infer it from the sourceUri using ContentResolver. |
| `sourceUris` | `string`[] | The source URIs of the files to save, percentage-encoded. Android only allows to save one file at a time, iOS allows multiple. |

***

### SaveDocumentsResponse

> **SaveDocumentsResponse**: \{`error`: `string` \| `null`;`name`: `string` \| `null`;`uri`: `string`; \}

The result of calling [saveDocuments](index.md#savedocuments). It is very unlikely that the metadata fields would be `null`, but in theory, it can happen.

#### Type declaration

| Name | Type | Description |
| ------ | ------ | ------ |
| `error` | `string` \| `null` | Error in case the file could not be written or some metadata could not be obtained. |
| `name` | `string` \| `null` | The name of the file that user entered, including extension. |
| `uri` | `string` | The target URI - the one user saved to. This is a percent-encoded `content://` uri (Android), or a `file://` uri (iOS). |
