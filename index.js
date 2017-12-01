'use strict';

import {Platform, NativeModules} from "react-native";
const DocumentPicker = NativeModules.RNDocumentPicker;

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
  
  static video() {
    return (Platform.OS === 'android') ? "video/*" : "public.video";
  }

  static pdf() {
    return (Platform.OS === 'android') ? "application/pdf" : "com.adobe.pdf";
  }
}

module.exports = {DocumentPickerUtil, DocumentPicker};
