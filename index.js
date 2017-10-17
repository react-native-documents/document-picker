'use strict';

import {Platform, NativeModules} from "react-native";
const DocumentPicker = NativeModules.RNDocumentPicker || NativeModules.DocumentPickerModule;

/**
 * Android requires mime types, iOS is a bit more complicated:
 *
 * @see https://developer.apple.com/library/ios/documentation/Miscellaneous/Reference/UTIRef/Articles/System-DeclaredUniformTypeIdentifiers.html
 */
class DocumentPickerUtil {

  static getAllTypes() {
    switch(Platform.OS) {
      case 'ios':
        return {
          'allFiles': 'public.content',
          'images': 'public.image',
          'plainText': 'public.plain-text',
          'audio': 'public.audio',
          'pdf': 'com.adobe.pdf',
        };
      case 'android':
        return {
          'allFiles': '*/*',
          'images': 'image/*',
          'plainText': 'text/plain',
          'audio': 'audio/*',
          'pdf': 'application/pdf',
        };
      case 'windows':
        return {
          'allFiles': '*',
          'images': '.png .jpg .jpeg',
          'plainText': '.txt',
          'audio': '.adts .adt .aac .aif .aifc .aiff .au .snd .mid .midi .rmi .mp3 .mp2 .m3u .m4a .wav .wma .wax .asf .3g2 .3gp .m4b .mp4',
          'pdf': '.pdf',
        };
      default:
        return null;
    } 
    return null;
  }

  static allFiles() {
    return this.getAllTypes().allFiles;
  }

  static images() {
    return this.getAllTypes().images;
  }

  static plainText() {
    return this.getAllTypes().plainText;
  }

  static audio() {
    return this.getAllTypes().audio
  }

  static pdf() {
    return this.getAllTypes().pdf;
  }
}

module.exports = {DocumentPickerUtil, DocumentPicker};