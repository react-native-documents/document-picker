package com.reactnativedocumentpicker

import android.content.Intent
import android.os.Build
import android.provider.DocumentsContract

object IntentFactory {
  fun getPickIntent(options: PickOptions): Intent {
    // TODO option for extra task on stack?
    // reminder - flags are for granting rights to others

    return Intent(options.action).apply {
      val types = options.mimeTypes

      type =
        if (types.size > 1) {
          putExtra(Intent.EXTRA_MIME_TYPES, types)
          options.intentFilterTypes
        } else {
          types[0]
        }
      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O &&
        options.initialDirectoryUrl != null
      ) {
        // only works for ACTION_OPEN_DOCUMENT
        // TODO must be URI
        putExtra(DocumentsContract.EXTRA_INITIAL_URI, options.initialDirectoryUrl)
      }
      if (!options.allowVirtualFiles) {
        addCategory(Intent.CATEGORY_OPENABLE)
      }
      putExtra(Intent.EXTRA_LOCAL_ONLY, options.localOnly)
      putExtra(Intent.EXTRA_ALLOW_MULTIPLE, options.multiple)
    }
  }
}
