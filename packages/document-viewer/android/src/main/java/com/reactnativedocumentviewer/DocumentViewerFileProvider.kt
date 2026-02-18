package com.reactnativedocumentviewer;

import androidx.core.content.FileProvider

/**
 * Empty subclass of [FileProvider] used so this library's provider has a unique
 * [android:name] in the manifest. That prevents the manifest merger from merging
 * this provider with another library's FileProvider,
 * which would cause an "Attribute provider@authorities value=... is also present at..."
 * conflict.
 */
class DocumentViewerFileProvider : FileProvider()