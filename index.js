'use strict';
import {Platform, NativeModules} from "react-native";
const {RNDocumentPicker} = NativeModules;

if (!RNDocumentPicker) {
  // Use a timeout to ensure the warning is displayed in the YellowBox
  setTimeout(() => {
    console.warn('RNDocumentPicker: Native module is not available, make sure you have finished the installation process and rebuilt your app');
  }, 0);
}

class DocumentPicker {
  static show(opts) {
    opts = opts || {};
    return RNDocumentPicker.show(opts);
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