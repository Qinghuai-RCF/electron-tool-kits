// 等待解决监听器重复添加的问题

import store from '../../store.js'

const init = () => {
  // 添加监听器
  initListener()
  // 初始化
  initData()
}

const initData = () => {
  // 参数初始化
  store.fn2Data.isRemarksChanged = false
  window.electronAPI.sendSignal('init-fn2-setting')
}

// 添加监听器
const initListener = () => {
  // 接收主进程传回的表格
  window.electronAPI.onSignal('update-fn2-table-data', UpdateTableData)
  window.electronAPI.onSignal('update-fn2-setting-data', UpdateSettingData)
}

// 数据监听器
const UpdateTableData = (event, tableDataString) => {
  // 反序列化
  store.fn2Data.tableData = JSON.parse(tableDataString)
  console.log('收到表格数据', store.fn2Data.tableData)
}

// 设置参数监听器
const UpdateSettingData = (event, settingData) => {
  // 反序列化
  const data = JSON.parse(settingData)

  store.fn2Data.folderPath = data.folderPath
  store.fn2Data.nowFolderPath = store.fn2Data.folderPath

  console.log('更新默认文件夹', store.fn2Data.folderPath)
}

export default {
  init
}
