declare module 'react-native-document-picker' {
  interface DocumentPickerOptions {
    filetype: Array<string>;
    multiple?: Boolean;
  }
  interface DocumentPickerResponse {
    uri: string;
    type: string;
    fileName: string;
    fileSize: string;
  }
  export class DocumentPicker {
    static pick(
      options: { multiple: false } & DocumentPickerOptions
    ): Promise<DocumentPickerResponse>;
    static pickMultiple(
      options: { multiple: true } & DocumentPickerOptions
    ): Promise<DocumentPickerResponse>;
    static isCancel(err: any): void;
  }
}
