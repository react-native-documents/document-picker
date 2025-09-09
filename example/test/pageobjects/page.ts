import { $ } from '@wdio/globals'
import { DocumentPickerResponse } from '@react-native-documents/picker/src'

/**
 * main page object containing all methods, selectors and functionality
 * that is shared across all page objects
 */
export default class Page {
  public async getResultById(index: number): Promise<DocumentPickerResponse> {
    const text = await $(`~result-${index}`).getText()
    return JSON.parse(text)
  }

  public async pickFromIntentChooser() {
    await driver.pause(1500)
    const targetActivityElement = $('id:android:id/text2')
    const activityLabelExists = await targetActivityElement.isExisting()

    if (activityLabelExists) {
      await targetActivityElement.click()
    }

    const buttonOnceElement = $('id:android:id/button_once')
    const justOnceEnabled =
      (await buttonOnceElement.isExisting()) && (await buttonOnceElement.isEnabled())
    if (justOnceEnabled) {
      await buttonOnceElement.click()
    }
    // sometimes, the intent chooser is not shown, sometimes it is shown with no pre-selection (2 taps needed))
    // sometimes there is pre-selection (1 tap needed)

    // wait for new activity to start
    await driver.pause(3000)
  }
}
