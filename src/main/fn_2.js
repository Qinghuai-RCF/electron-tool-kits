import fs from 'fs'
import { ipcMain, dialog, app } from 'electron'
import { join } from 'path'
import store from '../renderer/src/store'
import dirMgr from './dirMgr'
import fileMgr from './fileMgr'

const fn2CfgPath = join(dirMgr.appConfigPath, 'folder_remarks_cfg.json')
const fn2DataPath = join(dirMgr.appDataPath, 'folder_remarks_data.json')

let win

export const initFn2 = async (mainWindow) => {
  console.log('开始 初始化文件夹备注功能')
  win = mainWindow
  console.log('结束 初始化文件夹备注功能')
}

ipcMain.once('init-fn2-setting', async() => {
  // 读取文件
  const data = await fileMgr.readJsonSync(fn2CfgPath)
  if (data) {
    console.log('读取到的 JSON 数据:', data)
    store.fn2Data.folderPath = data.folderPath
    store.fn2Data.nowFolderPath = store.fn2Data.folderPath
    win.webContents.send('update-fn2-setting-data', JSON.stringify({
      folderPath: store.fn2Data.folderPath
    }))
  } else {
    store.fn2Data.folderPath = app.getPath('documents')
    store.fn2Data.nowFolderPath = store.fn2Data.folderPath
    win.webContents.send('update-fn2-setting-data', JSON.stringify({
      folderPath: store.fn2Data.folderPath
    }))
    console.log('没有设置')
  }
  initTable()
})

ipcMain.on('fn2-save-new-data', (event, tData) => {
  const data = JSON.parse(tData)
  Object.entries(data).forEach(([key, value]) => {
    if (value != '') {
      store.fn2Data.remarksData[key] = value
    } else {
      delete store.fn2Data.remarksData[key]
    }
  })
  updateDataFile()
})

ipcMain.on('fn2-refresh-table', () => {
  buildTable()
})

ipcMain.on('fn2-go-to-new-path', (event, folderPath) => {
  store.fn2Data.nowFolderPath = folderPath
  console.log('改变文件夹路径', store.fn2Data.nowFolderPath)

  buildTable()
})

ipcMain.on('update-main-fn2-defult-path', (event, folderPath) => {
  store.fn2Data.folderPath = folderPath
  store.fn2Data.nowFolderPath = store.fn2Data.folderPath

  saveFolderPath()
})

ipcMain.on('fn2-select-folder-path', () => {
  dialog
    .showOpenDialog(win, {
      properties: ['openDirectory']
    })
    .then((result) => {
      if (!result.canceled) {
        // 用户选择的文件夹路径
        store.fn2Data.nowFolderPath = result.filePaths[0]

        win.webContents.send(
          'update-renderer-fn2-now-folder-path',
          store.fn2Data.nowFolderPath
        )
        // 您可以在这里处理文件夹路径
        buildTable()
      }
    })
    .catch((err) => {
      console.log(err)
    })
})

const initTable = async () => {
  await getData()
  buildTable()
}

const buildTable = () => {
  store.fn2Data.tableData = {}

  // 开始读取文件夹
  const folderList = getFolderList(store.fn2Data.nowFolderPath)

  // 开始生成表格
  console.log('----# 准备生成表格----')
  folderList.forEach((folder) => {
    if (folder in store.fn2Data.remarksData) {
      store.fn2Data.tableData[folder] = store.fn2Data.remarksData[folder]
    } else {
      store.fn2Data.tableData[folder] = ''
    }
    console.log('文件夹：', folder, ' 备注：', store.fn2Data.tableData[folder])
  })
  console.log('得到表格：')
  console.log(store.fn2Data.tableData)
  console.log('----成功生成表格----')

  // 更新vue表格数据
  const tableDataString = JSON.stringify(store.fn2Data.tableData)
  win.webContents.send('update-fn2-table-data', tableDataString)
}

const getFolderList = (path) => {
  let folders = []
  try {
    // 读取指定路径下的所有文件和文件夹
    const files = fs.readdirSync(path)

    // 正则匹配规则 开头为'.'或'$'
    const regu = /^\.|^\$/

    // 过滤出文件夹
    // filter()：内部回调函数需要返回一个布尔值，如果回调函数返回true，则当前元素会被包含在新数组中
    // 将当前项 file 传入回调函数进行判断
    files.forEach((file) => {
      // 过滤开头为'.'或'$'的文件
      if (!regu.test(file)) {
        try {
          // Node.js 的path.join 方法：这是Node.js 特有的一个方法，用于将多个路径片段合并成一个完整的路径字符串。这个方法自动使用平台特定的分隔符（如Windows上的反斜杠\或Unix系统上的正斜杠/）来连接路径片段，并且可以忽略零长度的路径片段。例如，path.join ('/home', 'user', 'document')会返回'/home/user/document'。
          const fullPath = join(path, file)
          // fs.statSync 方法是Node.js 中用于同步获取给定文件路径信息的函数。它返回一个Stats对象，该对象包含了文件或目录的详细信息，如大小、模式和修改时间等。使用fs.statSync 时，需要传入两个参数：第一个参数是文件或目录的路径，第二个参数是一个可选的选项对象，用于指定返回的数值是否应为长整数（bigint）。
          if (fs.statSync(fullPath).isDirectory()) {
            folders.push(file)
          }
        } catch (statError) {
          if (statError.code === 'EACCES' || statError.code === 'EPERM') {
            console.error(`没有权限访问文件夹: ${file}`)
          } else if (statError.code === 'EBUSY') {
            console.error(`文件夹被占用: ${file}`)
          } else {
            throw statError // 如果是其他类型的错误，抛出异常
          }
        }
      }
    })

    console.log('得到文件夹列表', folders)
    return folders
  } catch (readError) {
    console.error('获取文件夹名时发生错误:', readError)
    win.webContents.send('fn2-folder-open-error', readError)
    console.log('发送fn2-folder-open-error');
    return []
  }
}

const updateDataFile = () => {
  // 写入文件
  fileMgr.writeJsonSync(fn2DataPath, store.fn2Data.remarksData)
}

const getData = async () => {
    const data = await fileMgr.readJsonSync(fn2DataPath)
    if (data) {
      console.log('读取到的 JSON 数据:', data)
      Object.entries(data).forEach(([key, value]) => {
        store.fn2Data.remarksData[key] = value
      })
    }
}

const saveFolderPath = () => {
  const tData = {
    folderPath: store.fn2Data.folderPath
  }
  fileMgr.writeJsonSync(fn2CfgPath, tData)
}
