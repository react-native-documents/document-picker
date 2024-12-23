---
sidebar_position: 2
---

# Migrating from the old document-picker

The new package has a new name (`@react-native-documents/picker`), so you need to update your import statements. You also need to tell your package manager where to find the new package. This is covered in the [installation guide](../install.mdx#accessing-the-premium-version).

### Migrating your code

Good news: You need to make only a few changes:

1. update import statements

```ts
import { ... } from 'react-native-document-picker'
```

becomes

```ts
import { ... } from '@react-native-documents/picker'
```

2. remove `pickSingle`

Replace `pickSingle` with `pick`:

```ts
const result = await pickSingle(options)
```

becomes:

```ts
const [result] = await pick(options)
```

3. replace `copyTo` with [`keepLocalCopy`](picker/keeping-local-copy.mdx)

> This change makes your app more responsive: previously you'd use the `copyTo` option and before the returned `Promise` resolved, you needed to wait not only for the user to pick the file, but also for the file to be copied to your app's directory. For large files or with slow network, this could be a problem that you, as a dev don't see, but your users do.

```ts
const localCopy = await pick({
  copyTo: 'documentDirectory',
})
```

becomes

```ts
const [file] = await pick()

const [localCopy] = await keepLocalCopy({
  files: [
    {
      uri: file.uri,
      fileName: file.name ?? 'fallbackName',
    },
  ],
  destination: 'documentDirectory',
})
```
