//
//  DocSaver.swift
//  react-native-document-picker
//
//  Created by Vojtech Novak on 25.05.2024.
//

// LICENSE: see License.md in the package root

import Foundation
import UniformTypeIdentifiers

@objc public class DocSaver: PickerBase {

  @MainActor
  override func createDocumentPicker(from dictionary: NSDictionary) -> UIDocumentPickerViewController {
    let options = SaverOptions(dictionary: dictionary)
    return options.createDocumentPicker()
  }

  public override func documentPicker(_ controller: UIDocumentPickerViewController, didPickDocumentsAt urls: [URL]) {
    guard let promise = promiseWrapper.takeCallbacks() else { return }

    Task.detached(priority: .userInitiated) {
      // runs off main thread - preserves I/O performance
      let documentsInfo = urls.compactMap { url -> [String: Any?]? in
        let name = url.lastPathComponent.removingPercentEncoding
        var resourceValues = URLResourceValues()
        resourceValues.name = name
        return DocumentMetadataBuilder(forUri: url, resourceValues: resourceValues).build()
      }
      promise.resolve(documentsInfo)
    }
  }

}
