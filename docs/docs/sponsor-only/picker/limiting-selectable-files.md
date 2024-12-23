---
sidebar_position: 3
description: Limit selectable file types in the document picker
---

# Limiting selectable file types

<details>
    <summary>Video introduction</summary>
    <iframe width="560" height="315" src="https://www.youtube.com/embed/CUNDpURFx4U?si=xr3jHKpWRDo3uFLi&amp;start=150" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>
</details>

The default document picker allows any file to be selected (except [virtual files](./virtual-files.md)). Use the `type` parameter of `pick()` to restrict the selectable file types.

- On iOS, these are Apple [Uniform Type Identifiers](https://developer.apple.com/documentation/uniformtypeidentifiers/system-declared_uniform_type_identifiers) such as `public.plain-text`.

- On Android, these are MIME types such as `text/plain` or partial MIME types such as `image/*`. See [common MIME types](https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/MIME_types/Common_types) or a more comprehensive [IANA Media Types listing](https://www.iana.org/assignments/media-types/media-types.xhtml).

Figuring out the correct MIME type or UTType identifier for a file type can be a bit of a hassle. To make it easier, the module exports the [`isKnownType`](#isknowntype) utility and several [predefined file types](#predefined-file-types) that you can use.

:::warning

On Android, some [Document Providers](https://developer.android.com/guide/topics/providers/content-provider-basics) (this seems to be a problem especially in Asia) ignore the `type` parameter and allow any file to be selected. This is a problem with the Document Provider, not this module.

To detect this case, check the [`hasRequestedType`](../../doc-picker-api#documentpickerresponse) field and handle the situation in your app.

:::

```tsx title="Limiting selectable file types to pdf and docx"
import { pick, types } from '@react-native-documents/picker'

return (
  <Button
    title="import multiple docx or pdf files"
    onPress={() => {
      pick({
        allowMultiSelection: true,
        // highlight-next-line
        type: [types.pdf, types.docx],
      })
        .then((res) => {
          const allFilesArePdfOrDocx = res.every((file) => file.hasRequestedType)
          if (!allFilesArePdfOrDocx) {
            // tell the user they selected a file that is not a pdf or docx
          }
          addResult(res)
        })
        .catch(handleError)
    }}
  />
)
```

### isKnownType

`isKnownType` is a handy utility function that given one of:

- UTType identifier string
- MIME type string
- File extension string

returns the corresponding MIME type, file extension, and UTType identifier.

```ts
import { isKnownType } from '@react-native-documents/picker'

const { isKnown, mimeType, preferredFilenameExtension } = isKnownType({
  kind: 'extension',
  value: 'pdf',
})
```

If you know the file extension (or the MIME, or the UTType), then use `isKnownType` to find the corresponding MIME type for Android or UTType for iOS. Then pass the result to the `type` parameter of `pick`.

:::note
Prefer using the iOS implementation of `isKnownType`. On Android, the function does not provide `UTType` identifier information (as it's an iOS-only concept) and the results may not be as accurate.

Different devices, based on the installed apps, may recognize different file types.
:::

### Predefined File Types

These are the most common file types, and are available in the `types` export. See the usage example above.

```ts
import { types } from '@react-native-documents/picker'
```

- `types.allFiles`: All document types, on Android this is `*/*`, on iOS it's `public.item`
- `types.images`: All image types
- `types.plainText`: Plain text files
- `types.audio`: All audio types
- `types.video`: All video types
- `types.pdf`
- `types.zip`
- `types.csv`
- `types.json`
- `types.doc`
- `types.docx`
- `types.ppt`
- `types.pptx`
- `types.xls`
- `types.xlsx`
