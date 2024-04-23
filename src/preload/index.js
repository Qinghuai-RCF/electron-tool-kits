import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import { ElMessage } from 'element-plus'

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
const sendSignal = (signal, content1 = null, content2 = null) => {
  ipcRenderer.send(signal, content1, content2)
  console.log('成功发送', signal, content1, content2)
}

// 接收信号
const onSignal = (signal, callback) => {
  ipcRenderer.on(signal, callback)
}

const onceSignal = (signal, callback) => {
  ipcRenderer.once(signal, callback)
}

const sendOpenDevTools = () => {
  ipcRenderer.send('open-devtools')
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

// fn2 文件夹备注监听器
const folderOpenError = (event, error) => {
  console.log('弹窗');
  if (error.code === 'ENOENT') {
    ElMessage({
      showClose: true,
      message: '路径不存在，请重新选择！',
      type: 'error',

      duration: 2000
    })
  } else {
    ElMessage({
      showClose: true,
      message: '打开路径失败，请重新选择！',
      type: 'error',
      duration: 2000
    })
  }
}

const initFolderRemarksListeners = () => {
  ipcRenderer.on('fn2-folder-open-error', folderOpenError)
}

const uninitFolderRemarksListeners = () => {
  ipcRenderer.removeListener('fn2-folder-open-error', folderOpenError)
}

// 暴露函数
contextBridge.exposeInMainWorld('electronAPI', {
  // 尽早弃用
  onSignal,

  sendSignal,
  onceSignal,

  sendOpenDevTools,

  fn1Listener,

  // fn2 文件夹备注监听器
  initFolderRemarksListeners,
  uninitFolderRemarksListeners
})
