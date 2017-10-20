'use strict';
import {Platform, NativeModules} from 'react-native';
const {RNDocumentPicker} = NativeModules;

if ( !RNDocumentPicker ) {
  // Use a timeout to ensure the warning is displayed in the YellowBox
  setTimeout(() => {
    console.warn('RNDocumentPicker: Native module is not available, make sure you have finished the installation process and rebuilt your app');
  }, 0);
} else if ( !RNDocumentPicker.pick && RNDocumentPicker.show ) {
  // Use a timeout to ensure the warning is displayed in the YellowBox
  setTimeout(() => {
    console.warn('RNDocumentPicker: Native module is obsolete, you may not have rebuilt your app after upgrading the library');
  }, 0);
}

const E_DOCUMENT_PICKER_CANCELED = 'DOCUMENT_PICKER_CANCELED';

function pick(opts) {
  if ( 'filetype' in opts ) {
    throw new TypeError('A `filetype` option was passed to DocumentPicker.pick, the correct option is `type`');
  }
  if ( 'types' in opts ) {
    throw new TypeError('A `types` option was passed to DocumentPicker.pick, the correct option is `type`');
  }

  if ( !('type' in opts) ) {
    opts.type = DocumentPicker.types.allFiles;
  }

  opts.type = Array.isArray(opts.type) ? opts.type : [opts.type]

  if ( opts.type.some((type) => type === undefined) ) {
    throw new TypeError('Unexpected undefined type option, did you try using a DocumentPicker.types.* that does not exist?');
  }

  if ( Array.isArray(opts.type) && opts.type.length < 1 ) {
    throw new TypeError('`type` option should not be an empty array, at least one type must be passed if the `type` option is not omitted');
  }

  opts.type.forEach((type) => {
    if ( typeof type !== 'string' ) {
      throw new TypeError('Invalid type option, expected a string not: ' + type);
    }
  });

  if ( opts.type.length > 1 && Platform.OS === 'android' && Platform.Version < 19 ) {
    console.warn(`RNDocumentPicker: Android API level ${Platform.Version} does not support multiple types, falling back to */*`);
  }

  return RNDocumentPicker.pick(opts);
}

export default class DocumentPicker {
  /**
   * Android requires mime types, iOS is a bit more complicated:
   *
   * @see https://developer.apple.com/library/ios/documentation/Miscellaneous/Reference/UTIRef/Articles/System-DeclaredUniformTypeIdentifiers.html
   */
  static types = {
    allFiles: Platform.OS === 'ios' ? 'public.content' : '*/*',
    images: Platform.OS === 'ios' ? 'public.image' : 'image/*',
    plainText: Platform.OS === 'ios' ? 'public.plain-text' : 'text/plain',
    audio: Platform.OS === 'ios' ? 'public.audio' : 'audio/*',
    pdf: Platform.OS === 'ios' ? 'com.adobe.pdf' : 'application/pdf',
  };

  static pick(opts) {
    opts = opts || {};
    opts.multiple = false;
    return pick(opts).then((results) => results[0]);
  }

  static pickMultiple(opts) {
    opts = opts || {};
    opts.multiple = true;
    return pick(opts);
  }

  static isCancel(err) {
    return err && err.code === E_DOCUMENT_PICKER_CANCELED;
  }
}
