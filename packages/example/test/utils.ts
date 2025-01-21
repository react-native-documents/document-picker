const packageName = 'com.rndocpicker.example'

export const appActivity = 'com.microsoft.reacttestapp.component.ComponentActivity'
export const androidResolverActivity = 'com.android.internal.app.ResolverActivity'
export const reloadApp = async () => {
  await driver.pause(1000)
  await driver.terminateApp(packageName)
  await launchApp()
}

export const launchApp = async () => {
  await driver.activateApp(packageName)
  await driver.pause(1000)
  await driver.setOrientation('PORTRAIT')
}
