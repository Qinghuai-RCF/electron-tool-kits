import fs from 'fs'
import { ipcMain } from 'electron'
import { readdirSync, statSync } from 'fs'
import { join } from 'path'
import csv from 'csv-parser'
import store from '../renderer/src/store'

export const initFn2 = (mainWindow) => {
  /*   ipcMain.on('fold', () => {
    const folderPath = 'E:\\User_files_2\\文档'
    const csvPath =
      'E:\\User_files_sync\\Files\\Projects\\Electron\\electron-vue-app\\folder_names - 副本.csv'
    getList(folderPath, csvPath)

    // 序列化
    const serializedFolders = JSON.stringify(fn2Data.folders)
    const serializedFolderRemarks = JSON.stringify(fn2Data.folderRemarks)

    mainWindow.webContents.send('data-from-main-to-fn2', serializedFolders, serializedFolderRemarks)
  }) */

  ipcMain.on('init-fn2-table', (event, fn2DataFromVue) => {
    // 反序列化
    store.fn2Data = JSON.parse(fn2DataFromVue)

    initTable(mainWindow)
  })
}

const initTable = async (mainWindow) => {
  console.log('----# 尝试读取', store.fn2Data.csvPath, '----')
  // 检查文件是否存在
  if (fs.existsSync(store.fn2Data.csvPath)) {
    // 文件存在，读取文件内容
    try {
      fs.createReadStream(store.fn2Data.csvPath)
        .pipe(csv())
        .on('data', (row) => {
          // 从行分离 '文件夹名' 和 '备注'
          store.fn2Data.csvData[row['文件夹名']] = row['备注']
        })
        .on('end', () => {
          console.log('读到数据', store.fn2Data.csvData)
          console.log('----CSV读取完成----')
          // 开始读取文件夹
          const folderList = getFolderList(store.fn2Data.folderPath)

          buildTable(folderList)
          // 更新vue表格数据
          const tableDataString = JSON.stringify(store.fn2Data.tableData)
          mainWindow.webContents.send('update-fn2-table-data', tableDataString)
        })
    } catch (error) {
      console.error('读取文件时出错:', error)
    }
  } else {
    console.log('文件不存在')
  }
}

const buildTable = (folderList) => {
  // 开始生成表格
  console.log('----# 准备生成表格----')
  folderList.forEach((folder) => {
    if (folder in store.fn2Data.csvData) {
      store.fn2Data.tableData[folder] = store.fn2Data.csvData[folder]
    } else {
      store.fn2Data.tableData[folder] = ''
    }
    console.log('文件夹：', folder, ' 备注：', store.fn2Data.tableData[folder])
  })
  console.log('得到表格：')
  console.log(store.fn2Data.tableData)
  console.log('----成功生成表格----')
}

const getFolderList = (path) => {
  try {
    // 读取指定路径下的所有文件和文件夹
    const files = readdirSync(path)

    // 正则匹配规则 开头为'.'
    const regu = /^\./

    // 过滤出文件夹
    // filter()：内部回调函数需要返回一个布尔值，如果回调函数返回true，则当前元素会被包含在新数组中
    // 将当前项 file 传入回调函数进行判断
    const folders = files.filter((file) => {
      // 过滤'.'开头的文件
      if (!regu.test(file)) {
        // Node.js 的path.join 方法：这是Node.js 特有的一个方法，用于将多个路径片段合并成一个完整的路径字符串。这个方法自动使用平台特定的分隔符（如Windows上的反斜杠\或Unix系统上的正斜杠/）来连接路径片段，并且可以忽略零长度的路径片段。例如，path.join ('/home', 'user', 'document')会返回'/home/user/document'。
        const fullPath = join(path, file)
        // fs.statSync 方法是Node.js 中用于同步获取给定文件路径信息的函数。它返回一个Stats对象，该对象包含了文件或目录的详细信息，如大小、模式和修改时间等。使用fs.statSync 时，需要传入两个参数：第一个参数是文件或目录的路径，第二个参数是一个可选的选项对象，用于指定返回的数值是否应为长整数（bigint）。
        return statSync(fullPath).isDirectory()
      }
      return false
    })

    console.log('得到文件夹列表', folders)

    return folders
  } catch (error) {
    console.error('获取文件夹名时发生错误:', error)
    return []
  }
}

// const updateCsvFile = () => {}

// const onRemarkEdited = () => {}
