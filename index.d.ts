declare module 'react-native-document-picker' {
  type Types = {
    mimeTypes: {
      allFiles: '*/*',
      audio: 'audio/*',
      images: 'image/*',
      plainText: 'text/plain',
      pdf: 'application/pdf',
      video: 'video/*',
    },
    utis: {
      allFiles: 'public.content',
      audio: 'public.audio',
      images: 'public.image',
      plainText: 'public.plain-text',
      pdf: 'com.adobe.pdf',
      video: 'public.movie',
    },
    extensions: {
      allFiles: '*',
      audio:
        '.3g2 .3gp .aac .adt .adts .aif .aifc .aiff .asf .au .m3u .m4a .m4b .mid .midi .mp2 .mp3 .mp4 .rmi .snd .wav .wax .wma',
      images: '.jpeg .jpg .png',
      plainText: '.txt',
      pdf: '.pdf',
      video: '.mp4',
    },
  };
  type PlatformTypes = {
    android: Types['mimeTypes']
    ios: Types['utis']
    windows: Types['extensions']
  };
  interface DocumentPickerOptions<OS extends keyof PlatformTypes> {
    type: Array<PlatformTypes[OS][keyof PlatformTypes[OS]]>
  }
  interface DocumentPickerResponse {
    uri: string;
    type: string;
    fileName: string;
    fileSize: string;
  }
  type Platform = 'ios' | 'android' | 'windows'
  export default class DocumentPicker<OS extends keyof PlatformTypes = Platform> {
    static types: PlatformTypes['ios'] | PlatformTypes['android'] | PlatformTypes['windows']
    static pick<OS extends keyof PlatformTypes = Platform>(
      options: DocumentPickerOptions<OS>
    ): Promise<DocumentPickerResponse>;
    static pickMultiple<OS extends keyof PlatformTypes = Platform>(
      options: DocumentPickerOptions<OS>
    ): Promise<DocumentPickerResponse>;
    static isCancel<IError extends {code?: string}>(err?: IError): boolean;
  }
}
