# Virtual files

Virtual files are an Android-only concept. You have almost surely encountered them in your Google Drive - all the Google Docs, Sheets, Presentations, etc. are virtual files and cannot normally be selected.

Pass `allowVirtualFiles: true` to the `pick` function to allow picking virtual files in import mode.

When a virtual file is picked, the `isVirtual` field is `true`, and the `convertibleToMimeTypes` field contains an array of [`VirtualFileMeta`](/docs/doc-picker-api#virtualfilemeta).

This array describes what kind(s) of regular file the virtual file can be exported into - for example, Google Docs files can be exported as `application/pdf` and so the array will be `[{ mimeType: 'application/pdf', extension: 'pdf' }]`.

:::note

Picking virtual files is supported since Android 7.0.

:::

## Obtaining a regular file from a virtual file

If you want to export a virtual file into a local one, use the [`keepLocalCopy`](./keeping-local-copy.mdx) function and

1. double-check that the `fileName` parameter includes the extension.
2. pass a `mimeType` value to the `convertVirtualFileToType` parameter.

```tsx title="Picking a virtual file and exporting it to a local one"
<Button
  title="import virtual file (such as a document from GDrive)"
  onPress={async () => {
    const [file] = await pick({
      allowVirtualFiles: true,
    })
    const { name, uri: pickedUri, convertibleToMimeTypes } = file

    const virtualFileMeta = convertibleToMimeTypes && convertibleToMimeTypes[0]
    invariant(name && virtualFileMeta, 'name and virtualFileMeta is required')
    const [copyResult] = await keepLocalCopy({
      files: [
        {
          uri: pickedUri,
          fileName: `${name}.${virtualFileMeta.extension ?? ''}`,
          convertVirtualFileToType: virtualFileMeta.mimeType,
        },
      ],
      destination: 'cachesDirectory',
    })
    if (copyResult.status === 'success') {
      const localCopy = copyResult.localUri
      // do something with the local copy
    }
  }}
/>
```

For viewing or editing of virtual files you'll need to rely on the app that provided the virtual file (for example, Google Docs app for Google Docs files). The [Document Viewer](../viewer.mdx) module can help you with that.

Learn more about virtual files in [this video](https://www.youtube.com/watch?v=4h7yCZt231Y).
