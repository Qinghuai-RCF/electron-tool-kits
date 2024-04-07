import { ipcMain } from 'electron'
import { exec } from 'child_process'

export const initFn1 = (mainWindow) => {
  // 监听渲染进程发送的'fn1-run'，执行收到的cmd命令，执行完毕后发送'fn1-done'
  ipcMain.on('run-blbl-vid-extr', (event, cmd) => {
    exec(cmd, (error, stdout, stderr) => {
      if (error) {
        console.error(`执行出错: ${error}`)
        mainWindow.webContents.send('fn1-error', { success: false, error: error.message })
      } else {
        console.log(`stdout: ${stdout}`)
        console.error(`stderr: ${stderr}`)
        mainWindow.webContents.send('fn1-done', { success: true, stdout: stdout, stderr: stderr })
        console.log('done')
      }
    })
  })
}
