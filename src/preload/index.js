import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

// Custom APIs for renderer
const api = {}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  window.electron = electronAPI
  window.api = api
}

// 发送信号
const sendSignal = (signal, content = null) => {
  ipcRenderer.send(signal, content)
}

// 监听
const fn1Listener = () => {
  console.log('fn1Listener')
  // 监听来自主进程的命令执行结果
  ipcRenderer.on('fn1-done', (event, result) => {
    console.log('fn1-done')
    if (result.success) {
      // 命令执行成功，修改按钮背景颜色为绿色
      document.getElementById('run-btn').style.backgroundColor = 'green'
      document.getElementById('run-btn').style.color = 'white'
      sendSignal(
        'open-folder',
        'E:\\User_files_sync\\Files\\Projects\\自制软件\\# 安卓端B站视频快速提取\\output'
      )
    } else {
      // 命令执行失败，可以根据具体的错误信息进行处理
      console.error('命令执行失败:', result.error)
    }
  })
}

// 暴露函数
contextBridge.exposeInMainWorld('electronAPI', {
  sendSignal,

  fn1Listener
})
