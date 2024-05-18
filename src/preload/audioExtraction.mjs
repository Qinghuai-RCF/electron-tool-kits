const { ipcRenderer } = require('electron')

let warpCallback

// 初始文件列表监听器
export const setAudioExtractionListener = (callback) => {
  console.log('初始化文件列表监听器')
  warpCallback = (event, dataReceive) => {
    callback(dataReceive)
  }
  ipcRenderer.on('update-audio-extraction-file-list', warpCallback)
}

// 取消文件列表监听器
export const removeAudioExtractionListener = () => {
  console.log('取消文件列表监听器')
  ipcRenderer.removeListener('update-audio-extraction-file-list', warpCallback)
}
