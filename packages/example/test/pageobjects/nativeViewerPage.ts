import Page from './page'

class NativeViewerPage extends Page {
  public async getToolbarHeading() {
    const headingElement = await driver.$(`//android.widget.TextView[@text="samplePdf.pdf"]`)
    return headingElement.getText()
  }
}

export default new NativeViewerPage()
