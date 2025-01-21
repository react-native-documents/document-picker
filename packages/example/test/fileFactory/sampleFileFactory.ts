import { samplePdfData } from './samplePdf'
import { sampleDocx } from './sampleDocx'
import { samplePng } from './samplePng'
import { sampleMp4 } from './sampleMp4'

export const pushSamplePdf = async () => {
  return await driver.pushFile('/sdcard/Download/samplePdf.pdf', samplePdfData)
}
export const pushSampleDocx = async () => {
  return await driver.pushFile('/sdcard/Download/sampleDocx.docx', sampleDocx)
}

export const pushSampleTxt = async () => {
  const data = new Buffer('Hello Appium Testing').toString('base64')
  return await driver.pushFile('/sdcard/Download/sampleTxt.txt', data)
}
export const pushSampleCsv = async () => {
  const data = new Buffer('Hello, Appium, Testing').toString('base64')
  return await driver.pushFile('/sdcard/Download/sampleCsv.csv', data)
}

export const pushSamplePng = async () => {
  return await driver.pushFile('/sdcard/Download/samplePng.png', samplePng)
}

export const pushSampleMp4 = async () => {
  return await driver.pushFile('/sdcard/Download/sampleMp4.mp4', sampleMp4)
}
export const pushSampleFiles = async () => {
  await pushSampleMp4()
  await pushSampleDocx()
  await pushSamplePdf()
  await pushSampleCsv()
  await pushSampleTxt()
  await pushSamplePng()
  console.log('pushed sample files')
  // it takes time for the media to be scanned
  // await driver.pause(5000)
}

export const sampleFileNames = {
  pdf: 'samplePdf.pdf',
  txt: 'sampleTxt.txt',
  docx: 'sampleDocx.docx',
  csv: 'sampleCsv.csv',
  png: 'samplePng.png',
  mp4: 'sampleMp4.mp4',
} as const

export type SampleFileNames = (typeof sampleFileNames)[keyof typeof sampleFileNames]

export const sampleFileNamesExceptExtension = (extension: `.${string}`) => {
  return Object.values(sampleFileNames).filter((name) => !name.endsWith(extension))
}
export const sampleFileNamesExceptExtensions = (extension: `.${string}`[]) => {
  return Object.values(sampleFileNames).filter((name) => {
    return !extension.some((ext) => name.endsWith(ext))
  })
}
