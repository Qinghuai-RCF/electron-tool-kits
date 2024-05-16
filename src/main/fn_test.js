import { ipcMain } from 'electron'
let win = null
let num = 0

export const initFnTest = async (mainWindow) => {
  console.log('开始 初始化文件夹备注功能')
  win = mainWindow
  ipcMain.on('test-signal', () => {
    num++
    win.webContents.send('fn-test-reply', num)
  })
  console.log('结束 初始化文件夹备注功能')
}
