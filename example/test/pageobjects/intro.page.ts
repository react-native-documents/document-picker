import { $ } from '@wdio/globals'
import Page from './page'

const ScreenElements = {
  importHeading: '//android.widget.TextView[@text="importingExample"]',
  openHeading: '//android.widget.TextView[@text="openingExample"]',
}
class IntroPage extends Page {
  public async gotoImportExample() {
    await $(ScreenElements.importHeading).click()
    await driver.setOrientation('PORTRAIT')
  }
  public async gotoOpenExample() {
    await $(ScreenElements.openHeading).click()
    await driver.setOrientation('PORTRAIT')
  }
}

export default new IntroPage()
