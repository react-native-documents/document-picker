import { $ } from '@wdio/globals'
import Page from './page'

export type CopyResponse = {
  status: 'success'
  sourceUri: string
  localUri: string
  copyError: string
}

class ImportPage extends Page {
  public async importSinglePdf() {
    return $('~IMPORT SINGLE PDF FILE').click()
  }

  public async openSingleImport() {
    return $('~SINGLE FILE IMPORT, AND ENSURE IT IS AVAILABLE IN THE LOCAL STORAGE').click()
  }

  async importMultipleFiles() {
    return $('~IMPORT MULTIPLE FILES').click()
  }

  async importMultipleDocxOrPdfFiles() {
    return $('~IMPORT MULTIPLE DOCX OR PDF FILES').click()
  }

  async importVirtualFile() {
    return $('~IMPORT VIRTUAL FILE (SUCH AS IN GDRIVE)').click()
  }

  async viewLastImportedFile() {
    await $('~VIEW THE LAST IMPORTED FILE').click()
    await this.pickFromIntentChooser()
  }

  public async scrollToResults() {
    await $(`android=new UiSelector().resourceId("screenContainer")`).waitForDisplayed()
    await $('android=new UiScrollable(new UiSelector().scrollable(true)).scrollToEnd(1,5)')
  }
}

export default new ImportPage()
