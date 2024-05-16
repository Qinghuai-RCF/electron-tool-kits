const { ipcRenderer } = require('electron')

let warpCallback

// 初始化测试监听器
export const initTestListeners = (callback) => {
  console.log('初始化测试监听器')
  warpCallback = (event, dataReceive) => {
    console.log('main发来的数据', dataReceive)
    callback(dataReceive)
  }
  ipcRenderer.on('fn-test-reply', warpCallback)
}

// 取消测试监听器
export const uninitTestListeners = () => {
  console.log('取消测试监听器')
  ipcRenderer.removeListener('fn-test-reply', warpCallback)
}

// 发送测试信号
export const sendTest = () => {
  ipcRenderer.send('test-signal')
}
