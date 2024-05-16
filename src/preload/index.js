import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import { initTestListeners, uninitTestListeners, sendTest } from './testListeners.mjs'
// import { ElMessage } from 'element-plus'
// import store from '../renderer/src/store'

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
const sendSignal = (signal, content1 = null, content2 = null, content3 = null) => {
  ipcRenderer.send(signal, content1, content2, content3)
  console.log('成功发送', signal, content1, content2, content3)
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

// fn2 文件夹备注监听器
const folderOpenError = (event, error) => {
  console.log('弹窗')
  if (error.code === 'ENOENT') {
    // eslint-disable-next-line no-undef
    ElMessage({
      showClose: true,
      message: '路径不存在，请重新选择！',
      type: 'error',

      duration: 2000
    })
  } else {
    // eslint-disable-next-line no-undef
    ElMessage({
      showClose: true,
      message: '打开路径失败，请重新选择！',
      type: 'error',
      duration: 2000
    })
  }
}

// 文件夹备注监听器
const initFolderRemarksListeners = () => {
  console.log('初始化文件夹备注监听器')
  ipcRenderer.on('fn2-folder-open-error', folderOpenError)
}

const uninitFolderRemarksListeners = () => {
  console.log('取消文件夹备注监听器')
  ipcRenderer.removeListener('fn2-folder-open-error', folderOpenError)
}

const initIsDark = (callback) => {
  console.log('初始化element-plus暗黑模式')
  // 持续监听isDark
  ipcRenderer.on('update-is-dark', (event, isDark) => {
    callback(isDark)
  })
  ipcRenderer.send('init-is-dark')
}
// 暴露函数
contextBridge.exposeInMainWorld('electronAPI', {
  // 尽早弃用
  onSignal,

  sendSignal,
  onceSignal,

  sendOpenDevTools,

  // fn2 文件夹备注监听器
  initFolderRemarksListeners,
  uninitFolderRemarksListeners,

  // 测试监听器
  initTestListeners,
  uninitTestListeners,
  sendTest,

  initIsDark
})
