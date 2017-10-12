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

class DocumentPicker {
  static show(opts) {
    opts = opts || {};

    if ( 'filetype' in opts ) {
      throw new TypeError('A `filetype` option was passed to DocumentPicker.show, the correct option is `type`');
    }
    if ( 'types' in opts ) {
      throw new TypeError('A `types` option was passed to DocumentPicker.show, the correct option is `type`');
    }

    if ( !('type' in opts) ) {
      opts.type = DocumentPickerUtil.allFiles();
    }

    opts.type = Array.isArray(opts.type) ? opts.type : [opts.type]

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

/**
 * Android requires mime types, iOS is a bit more complicated:
 *
 * @see https://developer.apple.com/library/ios/documentation/Miscellaneous/Reference/UTIRef/Articles/System-DeclaredUniformTypeIdentifiers.html
 */
class DocumentPickerUtil {
  static allFiles() {
    return (Platform.OS === 'android') ? "*/*" : "public.content";
  }

  static images() {
    return (Platform.OS === 'android') ? "image/*" : "public.image";
  }

  static plainText() {
    return (Platform.OS === 'android') ? "text/plain" : "public.plain-text";
  }

  static audio() {
    return (Platform.OS === 'android') ? "audio/*" : "public.audio";
  }

  static pdf() {
    return (Platform.OS === 'android') ? "application/pdf" : "com.adobe.pdf";
  }
}

module.exports = {DocumentPickerUtil, DocumentPicker};