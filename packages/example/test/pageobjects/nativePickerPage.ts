// Show roots
import { $ } from '@wdio/globals'
import Page from './page'
import { SampleFileNames, sampleFileNames } from '../fileFactory/sampleFileFactory'
import ImportPage from './import.page'

class NativePickerPage extends Page {
  public get getHamburgerMenu() {
    return $(`~Show roots`)
  }
  public get getDownloadsMenuItem() {
    return $(
      `android=new UiSelector().className("android.widget.TextView").resourceId("android:id/title").text("Downloads")`,
    )
  }
  public get getGoogleDriveMenuItem() {
    return $(
      `android=new UiSelector().className("android.widget.TextView").resourceId("android:id/title").text("Drive")`,
    )
  }

  public async getFileItemEnabled(fileName: SampleFileNames) {
    return this.getListItemElement(fileName).isEnabled()
  }

  public async openSideMenu() {
    return this.getHamburgerMenu.click()
  }
  public async ensureUserIsInDownloads() {
    await driver.setOrientation('PORTRAIT')
    // TODO this can prob be optimized
    const downloadsHeadingElement = await driver.$(
      '-android uiautomator:new UiSelector().packageNameMatches("com\\.(google\\.)?android\\.documentsui").resourceIdMatches(".+id/toolbar").childSelector(new UiSelector().className("android.widget.TextView").text("Downloads"))',
    )
    const isDownloadsLabelDisplayed = await downloadsHeadingElement
      .waitForDisplayed({ timeout: 5000 })
      .catch(() => false)

    const switchToListView = async () => {
      const listViewButtonExists = await $('~List view')
        .waitForExist({ timeout: 1000 })
        .catch(() => false)
      if (listViewButtonExists) {
        await $('~List view').click()
      }
    }

    if (isDownloadsLabelDisplayed) {
      await switchToListView()
      return
    }

    await this.openSideMenu()
    await this.getDownloadsMenuItem.click()
    await switchToListView()
  }

  public getListItemElement(fileName: string) {
    return $(
      `xpath://android.widget.TextView[@resource-id="android:id/title" and @text="${fileName}"]`,
    )
  }
  public getSampleFileElement(fileName: SampleFileNames) {
    return this.getListItemElement(fileName)
  }

  public async selectSampleTxt() {
    await this.getSampleFileElement(sampleFileNames.txt).click()
    await ImportPage.scrollToResults()
  }
  public async selectSamplePdf() {
    await this.getSampleFileElement(sampleFileNames.pdf).click()
  }
  async selectMultipleSampleFiles(fileNames: SampleFileNames[]) {
    const fileName = fileNames[0]
    const elem = await this.getSampleFileElement(fileName)

    await driver.touchAction({
      action: 'longPress',
      element: elem,
    })
    {
      // alternative
      // const location = await elem.getLocation()
      // const size = await elem.getSize()
      //
      // // Calculate the center of the element
      // const centerX = location.x + size.width / 2
      // const centerY = location.y + size.height / 2
      //
      // await driver.execute('mobile: longClickGesture', {
      //   x: centerX,
      //   y: centerY,
      //   duration: 1000,
      // })
    }

    for (const name of fileNames.slice(1)) {
      await this.getSampleFileElement(name).click()
    }
    await clickConfirmAction()
    await ImportPage.scrollToResults()
  }
}

async function clickConfirmAction() {
  const clickActionMenuOpen = $(
    '-android uiautomator:new UiSelector().resourceIdMatches(".*menu_open")',
  ).then(async (element) => {
    if (await element.isExisting()) {
      await element.click()
      return 'Clicked action menu open'
    }
    throw new Error('Action menu open not found')
  })

  //com.android.documentsui:id/action_menu_select
  const clickActionMenuSelect = $(
    '-android uiautomator:new UiSelector().resourceIdMatches(".*action_menu_select")',
  ).then(async (element) => {
    if (await element.isExisting()) {
      await element.click()
      return 'Clicked action menu select'
    }
    throw new Error('Action menu select not found')
  })

  const importAction = await Promise.any([clickActionMenuOpen, clickActionMenuSelect])
  console.log({ importAction })
}

export default new NativePickerPage()
