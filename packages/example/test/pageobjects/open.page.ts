import { $ } from '@wdio/globals'
import Page from './page'

class OpenPage extends Page {
  public async openPdfFile() {
    return $('~OPEN PDF FILE WITH REQUESTLONGTERMACCESS: TRUE').click()
  }

  public async viewLastDocument() {
    await $('~VIEW FILE THAT WAS PREVIOUSLY OPENED (ALSO WORKS AFTER APP RESTART)').click()
    await this.pickFromIntentChooser()
  }
}

export default new OpenPage()
