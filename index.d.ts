declare module "react-native-document-picker" {

  interface DocumentPickerOptions {
    filetype: Array<string>;
  }

  interface DocumentPickerResponse {
    uri: string;
    type: string;
    fileName: string;
    fileSize: string;
  }

  export class DocumentPickerUtil {
    static allFiles(): string;

    static pdf(): string;

    static audio(): string;

    static video(): string;

    static plainText(): string;

    static images(): string;
  }

  export class DocumentPicker {
    static show(
      options: DocumentPickerOptions,
      callback: (error: any, res: DocumentPickerResponse) => void
    ): void;
  }

}
