import store from '../../store.js'

const init = () => {
  // 参数初始化
  store.fn2Data.csvPath =
    'E:\\User_files_sync\\Files\\Projects\\Electron\\electron-vue-app\\folder_names - 副本.csv'
  store.fn2Data.folderPath = 'E:\\User_files_sync\\Documents'
  store.fn2Data.isRemarksChanged = false

  // 添加监听器
  initListener()
  // 初始化表格
  initFn2Table()
}

// 添加监听器
const initListener = () => {
  // 接收主进程传回的表格
  window.electronAPI.onSignal('update-fn2-table-data', UpdateTableData)
}

// 移除监听器
const deinitListener = () => {
  window.electronAPI.offSignal('update-fn2-table-data', UpdateTableData)
}

// 数据监听器
const UpdateTableData = (event, tableDataString) => {
  // 反序列化
  store.fn2Data.tableData = JSON.parse(tableDataString)
  console.log('收到表格数据', store.fn2Data.tableData)
}

// 初始化表格
const initFn2Table = () => {
  // 序列化数据
  const data = JSON.stringify(store.fn2Data)
  // 向主进程请求初始化表格，同时发送fn2所有数据
  window.electronAPI.sendSignal('init-fn2-table', data)
}

export default {
  init,
  deinitListener,
  initFn2Table
}
