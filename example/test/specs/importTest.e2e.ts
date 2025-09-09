import IntroPage from '../pageobjects/intro.page'
import NativePickerPage from '../pageobjects/nativePickerPage'
import ImportPage, { CopyResponse } from '../pageobjects/import.page'
import {
  pushSampleFiles,
  sampleFileNames,
  sampleFileNamesExceptExtension,
  sampleFileNamesExceptExtensions,
} from '../fileFactory/sampleFileFactory'
import { androidResolverActivity, appActivity, reloadApp } from '../utils'
import { DocumentPickerResponse } from '@react-native-documents/picker/src'

// TODO tests for file types

describe('documents-import-tests', () => {
  beforeAll(async () => {
    await pushSampleFiles()
  })

  beforeEach(async () => {
    await reloadApp()
    await IntroPage.gotoImportExample()
  })

  it('single file import, with copying to local storage', async () => {
    await ImportPage.openSingleImport()

    await NativePickerPage.ensureUserIsInDownloads()
    await NativePickerPage.selectSampleTxt()
    const expectedImportValues: Partial<DocumentPickerResponse> = {
      uri: jasmine.stringContaining('content://') as any,
      error: null,
      isVirtual: false,
      name: sampleFileNames.txt,
      convertibleToMimeTypes: null,
      size: 20,
      hasRequestedType: true,
      type: 'text/plain',
    }
    const importValues = await ImportPage.getResultById(1)
    expect(importValues).toEqual(jasmine.objectContaining(expectedImportValues))

    const expectedCopyValues: Partial<CopyResponse> = {
      status: 'success',
      sourceUri: importValues.uri,
      localUri: jasmine.stringContaining('file://') as any,
    }
    const copyValues = await ImportPage.getResultById(0)

    expect(copyValues).toEqual(jasmine.objectContaining(expectedCopyValues))
  })

  it('can import pdf file', async () => {
    await ImportPage.importSinglePdf()

    await NativePickerPage.ensureUserIsInDownloads()

    for (const name of sampleFileNamesExceptExtension('.pdf')) {
      expect(await NativePickerPage.getFileItemEnabled(name)).toBe(false)
    }
    await NativePickerPage.selectSamplePdf()
    const expectedPdfImportValues: Partial<DocumentPickerResponse> = {
      uri: jasmine.stringContaining('content://') as any,
      error: null,
      isVirtual: false,
      name: sampleFileNames.pdf,
      convertibleToMimeTypes: null,
      hasRequestedType: true,
      size: 13264,
      type: 'application/pdf',
    }
    const pdfImportValues = await ImportPage.getResultById(0)
    expect(pdfImportValues).toEqual(jasmine.objectContaining(expectedPdfImportValues))
    await ImportPage.viewLastImportedFile()
    const previewActivity = await driver.getCurrentActivity()
    expect(previewActivity).not.toBe(appActivity)
    expect(previewActivity).not.toBe(androidResolverActivity)
    await driver.back()
  })

  it('can import multiple docx or pdf files', async () => {
    await ImportPage.importMultipleDocxOrPdfFiles()

    await NativePickerPage.ensureUserIsInDownloads()
    for (const name of sampleFileNamesExceptExtensions(['.pdf', '.docx'])) {
      expect(await NativePickerPage.getFileItemEnabled(name)).toBe(false)
    }
    await NativePickerPage.selectMultipleSampleFiles([sampleFileNames.pdf, sampleFileNames.docx])
    const pdfValues = await ImportPage.getResultById(0)
    const docxValues = await ImportPage.getResultById(1)

    const expectedPdf: Partial<DocumentPickerResponse> = {
      error: null,
      isVirtual: false,
      name: sampleFileNames.pdf,
      convertibleToMimeTypes: null,
      hasRequestedType: true,
      size: 13264,
      type: 'application/pdf',
      uri: jasmine.stringContaining('content://') as any,
    }
    const expectedDocx: Partial<DocumentPickerResponse> = {
      error: null,
      isVirtual: false,
      name: sampleFileNames.docx,
      convertibleToMimeTypes: null,
      hasRequestedType: true,
      size: 9381,
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      uri: jasmine.stringContaining('content://') as any,
    }

    // sometimes the order is different
    const actualPdfValues = pdfValues.type === 'application/pdf' ? pdfValues : docxValues
    const actualDocxValues = pdfValues.type === 'application/pdf' ? docxValues : pdfValues
    expect(actualPdfValues).toEqual(jasmine.objectContaining(expectedPdf))
    expect(actualDocxValues).toEqual(jasmine.objectContaining(expectedDocx))
  })

  it('can import multiple files', async () => {
    await ImportPage.importMultipleFiles()

    await NativePickerPage.ensureUserIsInDownloads()
    await NativePickerPage.selectMultipleSampleFiles([sampleFileNames.png, sampleFileNames.pdf])

    const pngValues = await ImportPage.getResultById(0)
    const pdfValues = await ImportPage.getResultById(1)

    const expectedImportValues: Partial<DocumentPickerResponse>[] = [
      {
        error: null,
        isVirtual: false,
        name: sampleFileNames.png,
        convertibleToMimeTypes: null,
        hasRequestedType: true,
        size: 121364,
        type: 'image/png',
        uri: jasmine.stringContaining('content://') as any,
      },
      {
        error: null,
        isVirtual: false,
        name: sampleFileNames.pdf,
        convertibleToMimeTypes: null,
        hasRequestedType: true,
        size: 13264,
        type: 'application/pdf',
        uri: jasmine.stringContaining('content://') as any,
      },
    ]

    expect(pngValues).toEqual(jasmine.objectContaining(expectedImportValues[0]))
    expect(pdfValues).toEqual(jasmine.objectContaining(expectedImportValues[1]))
  })

  xit('can import virtual files', async () => {
    await ImportPage.importVirtualFile()
    await NativePickerPage.openSideMenu()
    // TODO
    await NativePickerPage.getGoogleDriveMenuItem.click()
    const myDriveItem = await $$(
      '-android uiautomator:new UiSelector().resourceId("com.google.android.documentsui:id/item_root")',
    )
    console.log({ chainablePromiseArray: myDriveItem })
    await myDriveItem[0].click()

    const docName = 'googleSheet'
    await NativePickerPage.getListItemElement(docName).click()
    const expectedImportValues: Partial<DocumentPickerResponse> = {
      error: null,
      isVirtual: true,
      name: docName,
      convertibleToMimeTypes: [{ extension: 'pdf', mimeType: 'application/pdf' }],
      hasRequestedType: true,
      size: null,
      type: 'application/vnd.google-apps.spreadsheet',
      uri: jasmine.stringContaining('content://') as any,
    }
    const importValues = await ImportPage.getResultById(1)

    const expectedCopyValues: Partial<CopyResponse> = {
      status: 'success',
      sourceUri: importValues.uri,
      localUri: jasmine.stringContaining('file://') as any,
    }
    const copyValues = await ImportPage.getResultById(0)

    expect(importValues).toEqual(jasmine.objectContaining(expectedImportValues))
    expect(copyValues).toEqual(jasmine.objectContaining(expectedCopyValues))
  })
})
