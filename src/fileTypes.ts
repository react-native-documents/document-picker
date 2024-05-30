const mimeTypes = Object.freeze({
  allFiles: '*/*',
  audio: 'audio/*',
  csv: 'text/csv',
  doc: 'application/msword',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  images: 'image/*',
  json: 'application/json',
  pdf: 'application/pdf',
  plainText: 'text/plain',
  ppt: 'application/vnd.ms-powerpoint',
  pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  video: 'video/*',
  xls: 'application/vnd.ms-excel',
  xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  zip: 'application/zip',
} as const)

const utis = Object.freeze({
  allFiles: 'public.item',
  audio: 'public.audio',
  csv: 'public.comma-separated-values-text',
  doc: 'com.microsoft.word.doc',
  docx: 'org.openxmlformats.wordprocessingml.document',
  images: 'public.image',
  json: 'public.json',
  pdf: 'com.adobe.pdf',
  plainText: 'public.plain-text',
  ppt: 'com.microsoft.powerpoint.ppt',
  pptx: 'org.openxmlformats.presentationml.presentation',
  video: 'public.movie',
  xls: 'com.microsoft.excel.xls',
  xlsx: 'org.openxmlformats.spreadsheetml.sheet',
  zip: 'public.zip-archive',
} as const)

const extensions = Object.freeze({
  allFiles: '*',
  audio:
    '.3g2 .3gp .aac .adt .adts .aif .aifc .aiff .asf .au .m3u .m4a .m4b .mid .midi .mp2 .mp3 .mp4 .rmi .snd .wav .wax .wma',
  csv: '.csv',
  doc: '.doc',
  docx: '.docx',
  images: '.jpeg .jpg .png',
  json: '.json',
  pdf: '.pdf',
  plainText: '.txt',
  ppt: '.ppt',
  pptx: '.pptx',
  video: '.mp4',
  xls: '.xls',
  xlsx: '.xlsx',
  zip: '.zip .gz',
} as const)

export type PlatformTypes = typeof mimeTypes | typeof utis | typeof extensions

export const perPlatformTypes = {
  android: mimeTypes,
  ios: utis,
  windows: extensions,
  // unsupported, but added to make TS happy
  macos: extensions,
  web: extensions,
}

// ensure shapes of platformTypes are the same: https://stackoverflow.com/a/67027347/2070942
// let me know if there's a nicer way

type AssertEqualKeys<T1 extends object, T2 extends object> = [
  keyof T1 extends keyof T2 ? 1 : 0,
  keyof T2 extends keyof T1 ? 1 : 0,
] extends [1, 1]
  ? true
  : false

const mimesAndUtisAreEqual: AssertEqualKeys<typeof mimeTypes, typeof utis> = true
const mimesAndExtensionsAreEqual: AssertEqualKeys<typeof mimeTypes, typeof extensions> = true
export const typesAreEqual = mimesAndUtisAreEqual && mimesAndExtensionsAreEqual
