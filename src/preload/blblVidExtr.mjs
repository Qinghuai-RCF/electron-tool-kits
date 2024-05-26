const { ipcRenderer } = require('electron')

let warpCallback

// 初始文件列表监听器
export const setBlblVidExtrListener = (callback) => {
  console.log('初始化文件列表监听器')
  warpCallback = (event, dataReceive) => {
    callback(dataReceive)
  }
  ipcRenderer.on('update-redner-bve-cfg', warpCallback)
}

// 取消文件列表监听器
export const removeBlblVidExtrListener = () => {
  console.log('取消文件列表监听器')
  ipcRenderer.removeListener('update-redner-bve-cfg', warpCallback)
}
