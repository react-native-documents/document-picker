// Pins the Swift API mirrored by
// spm-headers/react_native_document_picker-Swift.h. If this file fails to
// compile, update both files together.
import React

private let _docPickerType: NSObject.Type = DocPicker.self
private let _docSaverType: NSObject.Type = DocSaver.self
private let _fileOperationsType: NSObject.Type = FileOperations.self
private let _isKnownTypeType: NSObject.Type = IsKnownTypeImpl.self
private let _docPickerBase: PickerBase.Type = DocPicker.self
private let _docSaverBase: PickerBase.Type = DocSaver.self

// Swift cannot validate Objective-C nullability/lightweight generics or the
// generated class runtime names. Calls pin types; selectors pin method names.
@MainActor
private func _pinDocPickerPresent(
  _ picker: DocPicker,
  options: NSDictionary,
  resolve: @escaping RCTPromiseResolveBlock,
  reject: @escaping RCTPromiseRejectBlock
) {
  picker.present(optionsDict: options, resolve: resolve, reject: reject)
}

@MainActor
private func _pinStopAccessing(_ picker: DocPicker, urls: [String]) {
  picker.stopAccessingOpenedUrls(urls)
}

@MainActor
private func _pinDocSaverPresent(
  _ saver: DocSaver,
  options: NSDictionary,
  resolve: @escaping RCTPromiseResolveBlock,
  reject: @escaping RCTPromiseRejectBlock
) {
  saver.present(optionsDict: options, resolve: resolve, reject: reject)
}

private func _pinKeepLocalCopy(
  files: [[String: String]],
  destination: String,
  resolve: @escaping RCTPromiseResolveBlock
) {
  FileOperations.keepLocalCopyAtUniqueDestination(
    from: files,
    destinationPreset: destination,
    resolve: resolve
  )
}

private func _pinCheckType(_ kind: String, value: String) -> [String: Any] {
  IsKnownTypeImpl.checkType(kind, value: value)
}

private let _swiftHeaderSelectors: [Selector] = [
  #selector(DocPicker.init),
  #selector(DocPicker.present(optionsDict:resolve:reject:)),
  #selector(DocPicker.stopAccessingOpenedUrls(_:)),
  #selector(DocSaver.init),
  #selector(DocSaver.present(optionsDict:resolve:reject:)),
  #selector(FileOperations.keepLocalCopyAtUniqueDestination(from:destinationPreset:resolve:)),
  #selector(IsKnownTypeImpl.checkType(_:value:)),
]
