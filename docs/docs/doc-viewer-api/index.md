# document-viewer API

## Type Aliases

### BaseOptions

> **BaseOptions**: \{`grantPermissions`: `"read"` \| `"write"`;`headerTitle`: `string`;`mimeType`: `string`;`presentationStyle`: [`PresentationStyle`](index.md#presentationstyle); \}

#### Type declaration

| Name                 | Type                                              | Description                                                                                                                                                                              |
| -------------------- | ------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `grantPermissions`?  | `"read"` \| `"write"`                             | Android only: The type of permission to grant to the receiving app that will open the document. This only has effect if you're viewing a file that lives in the app's sandboxed storage. |
| `headerTitle`?       | `string`                                          | iOS only: The title to display in the header of the document viewer. If not provided, the filename will be used.                                                                         |
| `mimeType`?          | `string`                                          | Optional, but recommended: the mimetype of the document. This will help the Android OS to find the right app(s) to open the document.                                                    |
| `presentationStyle`? | [`PresentationStyle`](index.md#presentationstyle) | iOS only - Controls how the picker is presented, e.g. on an iPad you may want to present it fullscreen. Defaults to `pageSheet`.                                                         |

---

### OptionsViewBookmark

> **OptionsViewBookmark**: [`BaseOptions`](index.md#baseoptions) & \{`bookmark`: `string`; \}

BaseOptions with the bookmark data from the DocumentPicker module. Obtain the bookmark using the "open" mode, with `requestLongTermAccess` flag set to true.

A bookmark enables long-term access to a file.

#### Type declaration

| Name       | Type     | Description                                                                                                                                                                              |
| ---------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `bookmark` | `string` | bookmark data from the DocumentPicker module. Obtain it using the "open" mode, with `requestLongTermAccess` flag set to true. A bookmark allows a long-term permission to access a file. |

---

### OptionsViewUri

> **OptionsViewUri**: [`BaseOptions`](index.md#baseoptions) & \{`uri`: `string`; \}

BaseOptions with the uri of the document to view

#### Type declaration

| Name  | Type     | Description                     |
| ----- | -------- | ------------------------------- |
| `uri` | `string` | The uri of the document to view |

---

### PresentationStyle

> **PresentationStyle**: `"fullScreen"` \| `"pageSheet"` \| `"formSheet"` \| `"overFullScreen"` \| `undefined`

iOS only. Configure the presentation style of the picker.

---

### ViewDocumentOptions

> **ViewDocumentOptions**: [`OptionsViewBookmark`](index.md#optionsviewbookmark) \| [`OptionsViewUri`](index.md#optionsviewuri)

options for viewing a document

If you're trying to open a file that you have long-term permission to access, you should use the `bookmark` option (provided by the DocumentPicker module).

## Functions

### viewDocument()

> **viewDocument**(`data`: [`ViewDocumentOptions`](index.md#viewdocumentoptions)): `Promise`\<`null`\>

#### Parameters

| Parameter | Type                                                  |
| --------- | ----------------------------------------------------- |
| `data`    | [`ViewDocumentOptions`](index.md#viewdocumentoptions) |

#### Returns

`Promise`\<`null`\>
