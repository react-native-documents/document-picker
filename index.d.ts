declare module 'react-native-document-picker' {
  type UTI = 'public.png' | 'public.jpeg' | 'com.adobe.pdf';
  type MimeType = 'image/jpg' | 'image/jpeg' | 'image/png' | 'application/pdf';
  type Extension = '.jpeg' | '.jpg' | '.png' | '.txt' | '.pdf';

  type DocumentType = {
    android: MimeType | MimeType[];
    ios: UTI | UTI[];
    windows: Extension | Extension[];
  };

  type Types = {
    mimeTypes: {
      allFiles: '*/*';
      audio: 'audio/*';
      csv: 'text/csv';
      doc: 'application/msword';
      docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
      images: 'image/*';
      pdf: 'application/pdf';
      plainText: 'text/plain';
      ppt: 'application/vnd.ms-powerpoint';
      pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation';
      video: 'video/*';
      xls: 'application/vnd.ms-excel';
      xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
      zip: 'application/zip';
    };
    utis: {
      allFiles: 'public.item';
      audio: 'public.audio';
      csv: 'public.comma-separated-values-text';
      doc: 'com.microsoft.word.doc';
      docx: 'org.openxmlformats.wordprocessingml.document';
      images: 'public.image';
      pdf: 'com.adobe.pdf';
      plainText: 'public.plain-text';
      ppt: 'com.microsoft.powerpoint.ppt';
      pptx: 'org.openxmlformats.presentationml.presentation';
      video: 'public.movie';
      xls: 'com.microsoft.excel.xls';
      xlsx: 'org.openxmlformats.spreadsheetml.sheet';
      zip: 'public.zip-archive';
    };
    extensions: {
      allFiles: '*';
      audio: '.3g2 .3gp .aac .adt .adts .aif .aifc .aiff .asf .au .m3u .m4a .m4b .mid .midi .mp2 .mp3 .mp4 .rmi .snd .wav .wax .wma';
      csv: '.csv';
      doc: '.doc';
      docx: '.docx';
      images: '.jpeg .jpg .png';
      pdf: '.pdf';
      plainText: '.txt';
      ppt: '.ppt';
      pptx: '.pptx';
      video: '.mp4';
      xls: '.xls';
      xlsx: '.xlsx';
      zip: '.zip .gz';
      folder: 'folder';
    };
  };
  type PlatformTypes = {
    android: Types['mimeTypes'];
    ios: Types['utis'];
    windows: Types['extensions'];
  };
  interface DocumentPickerOptions<OS extends keyof PlatformTypes> {
    type: Array<PlatformTypes[OS][keyof PlatformTypes[OS]]> | DocumentType[OS];
    mode?: 'import' | 'open';
    copyTo?: 'cachesDirectory' | 'documentDirectory';
  }
  interface DocumentPickerResponse {
    uri: string;
    fileCopyUri: string;
    copyError?: string;
    type: string;
    name: string;
    size: number;
  }
  type Platform = 'ios' | 'android' | 'windows';
  export default class DocumentPicker<OS extends keyof PlatformTypes = Platform> {
    static types: PlatformTypes['ios'] | PlatformTypes['android'] | PlatformTypes['windows'];
    static pick<OS extends keyof PlatformTypes = Platform>(
      options: DocumentPickerOptions<OS>
    ): Promise<DocumentPickerResponse>;
    static pickMultiple<OS extends keyof PlatformTypes = Platform>(
      options: DocumentPickerOptions<OS>
    ): Promise<DocumentPickerResponse[]>;
    static isCancel<IError extends { code?: string }>(err?: IError): boolean;
    static releaseSecureAccess(uris: Array<string>): void;
  }
}
