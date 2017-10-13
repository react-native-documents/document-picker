'use strict';
import {Platform, NativeModules} from 'react-native';
const {RNDocumentPicker} = NativeModules;

if (!RNDocumentPicker) {
  // Use a timeout to ensure the warning is displayed in the YellowBox
  setTimeout(() => {
    console.warn('RNDocumentPicker: Native module is not available, make sure you have finished the installation process and rebuilt your app');
  }, 0);
}

const E_DOCUMENT_PICKER_CANCELED = 'DOCUMENT_PICKER_CANCELED';

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

  static show(opts) {
    opts = opts || {};

    if ( 'filetype' in opts ) {
      throw new TypeError('A `filetype` option was passed to DocumentPicker.show, the correct option is `type`');
    }
    if ( 'types' in opts ) {
      throw new TypeError('A `types` option was passed to DocumentPicker.show, the correct option is `type`');
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

    return RNDocumentPicker.show(opts);
  }

  static isCancel(err) {
    return err && err.code === E_DOCUMENT_PICKER_CANCELED;
  }
}
