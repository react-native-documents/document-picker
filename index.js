/*
* @flow
*/

import { NativeModules } from 'react-native';

const RNDocumentPicker = NativeModules.RNDocumentPicker;

// TODO enum all possible Uniform type identifiers
type UTI = string;
type Options = {
  filetype: Array<UTI>
};
type ShowCallback = (error: Error, url: string) => void;

export default class DocumentPicker {

  static show(options: Options, callback: ShowCallback) {
    if(callback){
      RNDocumentPicker.show(options, callback);
      return;
    }

    return new Promise( (resolve, reject) => {
      RNDocumentPicker.show(options, (error, url) => {
        if(error){
          reject(error);
        }else{
          resolve(url);
        }
      });
    });
  }
}
