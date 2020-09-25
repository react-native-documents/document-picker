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
      excel: 'application/vnd.ms-excel';
      images: 'image/*';
      pdf: 'application/pdf';
      plainText: 'text/plain';
      powerpoint: 'application/vnd.ms-powerpoint';
      video: 'video/*';
      zip: 'application/zip';
    };
    utis: {
      allFiles: 'public.content';
      audio: 'public.audio';
      csv: 'public.comma-separated-values-text';
      doc: 'com.microsoft.word.doc';
      excel: 'com.microsoft.excel.xls';
      images: 'public.image';
      pdf: 'com.adobe.pdf';
      plainText: 'public.plain-text';
      powerpoint: 'com.microsoft.powerpoint.ppt';
      video: 'public.movie';
      zip: 'public.zip-archive';
    };
    extensions: {
      allFiles: '*';
      audio: '.3g2 .3gp .aac .adt .adts .aif .aifc .aiff .asf .au .m3u .m4a .m4b .mid .midi .mp2 .mp3 .mp4 .rmi .snd .wav .wax .wma';
      csv: '.csv';
      doc: '.doc .docx';
      excel: '.xls .xlsx';
      images: '.jpeg .jpg .png';
      pdf: '.pdf';
      plainText: '.txt';
      powerpoint: '.ppt .pptx';
      video: '.mp4';
      zip: '.zip .gz';
    };
  };
  type PlatformTypes = {
    android: Types['mimeTypes'];
    ios: Types['utis'];
    windows: Types['extensions'];
  };
  interface DocumentPickerOptions<OS extends keyof PlatformTypes> {
    type: Array<PlatformTypes[OS][keyof PlatformTypes[OS]]> | DocumentType[OS];
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
  }
}
