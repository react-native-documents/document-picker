declare module 'react-native-document-picker' {
  type UTI = 'public.png' | 'public.jpeg' | 'com.adobe.pdf' | 'com.adobe.doc' | 'com.adobe.docx'| 'com.adobe.xls' | 'com.adobe.xlsx';
  type MimeType = 'image/jpg' | 'image/jpeg' | 'image/png' | 'application/pdf' | 'application/doc' | 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' | 'application/vnd.ms-excel' | 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' | 'application/vnd.ms-powerpoint' |'application/vnd.openxmlformats-officedocument.presentationml.presentation'
    ;
  type Extension = '.jpeg' | '.jpg' | '.png' | '.txt' | '.pdf' | '.doc' | '.docx' | '.xls' | '.xlsx' | '.ppt' | '.pptx';

  type DocumentType = {
    android: MimeType | MimeType[]
    ios: UTI | UTI[]
    windows: Extension | Extension[]
  };

  type Types = {
    mimeTypes: {
      allFiles: '*/*',
      audio: 'audio/*',
      images: 'image/*',
      plainText: 'text/plain',
      pdf: 'application/pdf',
      video: 'video/*',
      doc: 'application/doc',
      docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      xls: 'application/vnd.ms-excel',
      xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      ppt: 'application/vnd.ms-powerpoint',
      pptx:
        'application/vnd.openxmlformats-officedocument.presentationml.presentation'
    },
    utis: {
      allFiles: 'public.content',
      audio: 'public.audio',
      images: 'public.image',
      plainText: 'public.plain-text',
      pdf: 'com.adobe.pdf',
      video: 'public.movie',
      doc: 'com.adobe.doc',
      docx: 'com.adobe.docx',
      xls: 'com.adobe.xls',
      xlsx: 'com.adobe.xlsx',
      ppt: 'com.adobe.ppt',
      pptx: 'com.adobe.pptx'
    },
    extensions: {
      allFiles: '*',
      audio:
      '.3g2 .3gp .aac .adt .adts .aif .aifc .aiff .asf .au .m3u .m4a .m4b .mid .midi .mp2 .mp3 .mp4 .rmi .snd .wav .wax .wma',
      images: '.jpeg .jpg .png',
      plainText: '.txt',
      pdf: '.pdf',
      video: '.mp4',
      doc: '.doc',
      docx: '.docx',
      xls: '.xls',
      xlsx: '.xlsx',
      ppt: '.ppt',
      pptx: '.pptx'
    },
  };
  type PlatformTypes = {
    android: Types['mimeTypes']
    ios: Types['utis']
    windows: Types['extensions']
  };
  interface DocumentPickerOptions<OS extends keyof PlatformTypes> {
    type: Array<PlatformTypes[OS][keyof PlatformTypes[OS]]> | DocumentType[OS]
  }
  interface DocumentPickerResponse {
    uri: string;
    type: string;
    name: string;
    size: string;
  }
  type Platform = 'ios' | 'android' | 'windows'
  export default class DocumentPicker<OS extends keyof PlatformTypes = Platform> {
    static types: PlatformTypes['ios'] | PlatformTypes['android'] | PlatformTypes['windows']
    static pick<OS extends keyof PlatformTypes = Platform>(
      options: DocumentPickerOptions<OS>
    ): Promise<DocumentPickerResponse>;
    static pickMultiple<OS extends keyof PlatformTypes = Platform>(
      options: DocumentPickerOptions<OS>
    ): Promise<DocumentPickerResponse[]>;
    static isCancel<IError extends { code?: string }>(err?: IError): boolean;
  }
}
