const util = require('util')
const exec = util.promisify(require('child_process').exec)
import { join } from 'path'
import store from '../renderer/src/store'
import { ipcMain, dialog, shell } from 'electron'
import dirMgr from './dirMgr'
import fileMgr from './fileMgr'
const fs = require('fs')

let win
let adbPath
const DataPath = join(dirMgr.appDataPath, 'mobile_computer_file_sync')
const ConfigFolderPath = join(dirMgr.appConfigPath, 'mobile_computer_file_sync')
const DeviceNameFilePath = join(ConfigFolderPath, 'device_name.json')
const ConfigPath = join(ConfigFolderPath, 'config.json')
const DevicePresetsPath = join(DataPath, 'presets.json')

export const initMobileComputerFileSync = async (mainWindow) => {
  win = mainWindow
  adbPath = join(store.AppData.libPath, 'adb', 'adb.exe')
}

ipcMain.on('mcfs-init', async () => {
  console.log('mcfs-init')
  await dirMgr.makeDir(DataPath)
  const deviceList = await getDeviceList()
  const tDeviceNameData = await getDeviceNameData()
  const deviceNameData = initNewDevice(deviceList, tDeviceNameData)
  const data = JSON.stringify([deviceList, deviceNameData])
  win.webContents.send('mcfs-init-to-renderer', data)
})

ipcMain.on('mcfs-init-settings-and-presets', async () => {
  console.log('mcfs-init-settings-and-presets')

  initSettingsAndPresets()
})

const initSettingsAndPresets = async () => {
  console.log('初始化配置和预设数据')
  // 初始化配置数据
  await readConfig()
  await readPresets()

  // 发送配置数据给渲染进程
  win.webContents.send(
    'mcfs-init-settings-and-presets-to-renderer',
    JSON.stringify(store.MobileComputerFileSync)
  )
}

const readConfig = async () => {
  // 尝试读取配置文件
  const config = await fileMgr.readJsonSync(ConfigPath)
  if (config) {
    // 成功读取到配置数据
    store.MobileComputerFileSync.settings = config
    console.log('读取到的mcfs配置文件数据:', store.MobileComputerFileSync.settings)
  } else {
    // 失败读取到配置数据
    console.log('没有设置')
    saveConfigToFile()
  }
}

const readPresets = async () => {
  const presets = await fileMgr.readJsonSync(DevicePresetsPath)
  if (presets) {
    // 成功读取到预设数据
    console.log('读取到的预设数据:', presets)
    store.MobileComputerFileSync.presets = presets
  } else {
    // 失败读取到预设数据
    console.log('没有预设')
  }
}

const getDeviceList = async () => {
  // 调用adb命令获取设备列表
  const cmd = `"${adbPath}" devices`

  try {
    console.log('执行adb devices命令:', cmd)
    const { stdout } = await exec(cmd)
    console.log('adb devices输出:', stdout)

    // 提取设备列表
    const deviceList = stdout
      .split('\n') // 从换行符分割字符串
      .slice(1) // 去掉第一行
      .filter((line) => line.includes('device')) // 过滤包含'device'的行
      .map((line) => {
        const cleanLine = line.replace('\r', '') // 去除回车符
        // eslint-disable-next-line no-unused-vars
        const [deviceId, status] = cleanLine.split('\t') // 假设设备ID和状态由制表符分隔
        return deviceId
      })
    console.log('设备列表:', deviceList)
    return deviceList
  } catch (err) {
    console.error(`执行adb命令时出错: ${err}`)
    return null
  }
}

const getDeviceNameData = async () => {
  let data
  data = await fileMgr.readJsonSync(DeviceNameFilePath)
  if (data != null) {
    console.log('读取到保存的设备名数据:', data)
  } else {
    console.log('没有保存的设备名数据')
    data = []
  }

  return data
}

const initNewDevice = (deviceList, tDeviceNameData) => {
  console.log('初始化新设备:', deviceList, tDeviceNameData)
  deviceList.forEach((deviceID) => {
    if (tDeviceNameData === null) {
      tDeviceNameData.push({
        name: '',
        ID: deviceID
      })
    } else if (!tDeviceNameData.find((item) => item.ID === deviceID)) {
      tDeviceNameData.push({
        name: '',
        ID: deviceID
      })
    }
  })
  console.log('写入设备名数据:', tDeviceNameData)
  fileMgr.writeJsonSync(DeviceNameFilePath, tDeviceNameData)
  return tDeviceNameData
}

ipcMain.on('mcfs-select-computer-file-path', (event, type) => {
  console.log('mcfs-select-computer-file-path', type)
  if (type === 'folder') {
    // 选择文件夹路径
    selectFolder()
  } else if (type === 'file') {
    // 选择文件路径
    selectFile()
  }
})

const selectFolder = () => {
  console.log('选择文件夹路径')
  dialog
    .showOpenDialog(win, {
      properties: ['openDirectory']
    })
    .then((result) => {
      if (!result.canceled) {
        // 用户选择的文件夹路径
        console.log('选择的文件夹路径:', result.filePaths[0])
        // 将路径回传给渲染进程
        win.webContents.send('mcfs-select-computer-file-path-to-renderer', result.filePaths[0])
      }
    })
    .catch((err) => {
      console.log(err)
    })
}

const selectFile = () => {
  console.log('选择文件路径')
  dialog
    .showOpenDialog(win, {
      properties: ['openFile']
    })
    .then((result) => {
      if (!result.canceled) {
        // 用户选择的文件夹路径
        console.log('选择的文件路径:', result.filePaths[0])
        // 将路径回传给渲染进程
        win.webContents.send('mcfs-select-computer-file-path-to-renderer', result.filePaths[0])
      }
    })
    .catch((err) => {
      console.log(err)
    })
}

// 检查手机路径类型并回传给渲染进程
ipcMain.on('mcfs-check-phone-path-type', async (event, data) => {
  console.log('mcfs-check-phone-path-type', data)
  const phonePath = data.phonePath
  const deviceID = data.deviceID
  const cmd = `${adbPath} -s ${deviceID} shell stat '${phonePath}'`
  // const cmd = `${adbPath} -s ${deviceID} shell ls test -d "/sdcard/# 个人文件"`
  console.log('尝试执行命令:', cmd)
  try {
    const result = await exec(cmd)
    console.log('命令执行结果:', result)
    if (result.stdout.includes('directory')) {
      console.log(phonePath, '为文件夹')
      win.webContents.send('mcfs-send-phone-path-type-to-renderer', 'folder')
    } else if (result.stdout.includes('file')) {
      console.log(phonePath, '为文件')
      win.webContents.send('mcfs-send-phone-path-type-to-renderer', 'file')
    } else {
      console.log(phonePath, '类型错误')
      win.webContents.send('mcfs-send-phone-path-type-to-renderer', 'error')
    }
  } catch (error) {
    console.error(phonePath, '不存在')
    win.webContents.send('mcfs-send-phone-path-type-to-renderer', 'error')
  }
})

// 检查手机路径类型并回传给渲染进程
ipcMain.on('mcfs-check-computer-path-type', async (event, path) => {
  console.log('mcfs-check-computer-path-type', path)
  if (fs.existsSync(path)) {
    // 路径存在
    const type = fs.lstatSync(path).isDirectory() ? 'folder' : 'file'
    console.log('路径类型:', type)
    win.webContents.send('mcfs-send-computer-path-type-to-renderer', type)
  } else {
    console.log('路径不存在')
    win.webContents.send('mcfs-send-computer-path-type-to-renderer', 'error')
  }
})

// 备份设置更改时保存设置
ipcMain.on('mcfs-change-backup-config', async (event, isBackup) => {
  // 将新的备份设置保存到变量
  store.MobileComputerFileSync.settings.isBackup = isBackup
  // 保存到配置文件
  saveConfigToFile()
})

// 保存到配置文件
const saveConfigToFile = async () => {
  fileMgr.writeJsonSync(ConfigPath, store.MobileComputerFileSync.settings)
}

// 设备预设操作
ipcMain.on('mcfs-preset-operation', async (event, data) => {
  data = JSON.parse(data)
  console.log('mcfs-preset-operation', data)
  // 新增预设
  if (data.operation === 'save') {
    // 确保指定设备ID层级存在
    if (!store.MobileComputerFileSync.presets[data.deviceID]) {
      store.MobileComputerFileSync.presets[data.deviceID] = {}
    }
    store.MobileComputerFileSync.presets[data.deviceID][data.presetName] = data.preset
  } else if (data.operation === 'delete') {
    // 删除预设
    delete store.MobileComputerFileSync.presets[data.deviceID][data.presetName]
    if (Object.keys(store.MobileComputerFileSync.presets[data.deviceID]).length === 0) {
      delete store.MobileComputerFileSync.presets[data.deviceID]
    }
  }
  console.log('所有预设:', store.MobileComputerFileSync.presets)
  fileMgr.writeJsonSync(DevicePresetsPath, store.MobileComputerFileSync.presets)
  initSettingsAndPresets()
})

// 保存设备名列表
ipcMain.on('mcfs-save-device-name', async (event, data) => {
  const deviceNameData = JSON.parse(data)
  console.log('mcfs-save-device-name', data)
  fileMgr.writeJsonSync(DeviceNameFilePath, deviceNameData)
})

// 监听同步事件
ipcMain.on('mcfs-start-sync', async (event, data) => {
  data = JSON.parse(data)
  console.log('mcfs-start-sync', data)
  let backupError = false

  if (data.direction === 'computer2phone') {
    if (data.isBackup) {
      // 备份手机文件
      backupError = await renameBackupFileOrFolder('phone', data.phonePath, data.isFolder)
    }
    // 电脑向手机同步
    const cmd = `${adbPath} -s ${data.deviceID} push -a "${data.computerPath}" "${data.phonePath}"`
    // console.log('执行命令:', cmd)
    const sycnResult = runCmd(cmd)
    win.webContents.send(
      'mcfs-sync-result',
      JSON.stringify({
        sycnResult: sycnResult,
        backupError: backupError
      })
    )
  } else if (data.direction === 'phone2computer') {
    if (data.isBackup) {
      // 备份电脑文件
      backupError = await renameBackupFileOrFolder('computer', data.computerPath, data.isFolder)
      console.log('备份错误', backupError)
    }
    // 手机向电脑同步
    const cmd = `${adbPath} -s ${data.deviceID} pull -a "${data.phonePath}" "${data.computerPath}"`
    // console.log('执行命令:', cmd)
    const sycnResult = runCmd(cmd)
    win.webContents.send(
      'mcfs-sync-result',
      JSON.stringify({
        sycnResult: sycnResult,
        backupError: backupError
      })
    )
  }

  // 先做打开电脑路径 再直接做adb文件复制命令 备份先放一放
})

// 生成备份文件文件夹名
const generateBackupName = (deviceType, path, isFolder) => {
  console.log('生成备份文件文件夹名', deviceType, path, isFolder)
  const backupPath = join(DataPath, `${deviceType}_backup_${Date.now()}`)
  // 生成路径

  return backupPath
}

const renameBackupFileOrFolder = async (deviceType, path, isFolder) => {
  console.log('生成备份文件或文件夹')
  const backupPath = generateBackupName(deviceType, path, isFolder)
  console.log('需要备份的路径:', backupPath)

  const timestamp = generateTimeStamp()
  let newPath
  let backupError = false

  if (isFolder) {
    newPath = `${path}_${timestamp}`
    console.log('新的文件夹路径:', newPath)
  } else {
    const ext = path.split('.').pop()
    const baseName = path.slice(0, path.lastIndexOf('.'))
    newPath = `${baseName}_${timestamp}.${ext}`
    console.log('新的文件路径:', newPath)
  }

  if (deviceType === 'computer') {
    // 重命名电脑文件
    try {
      fs.renameSync(path, newPath)
      console.log('文件夹重命名成功')
    } catch (err) {
      console.error('重命名文件夹时出错:', err)
      backupError = true
    }
    if (isFolder) {
      // 新建文件夹
      try {
        fs.mkdirSync(path)
        console.log('文件夹创建成功')
      } catch (err) {
        console.error('创建文件夹时出错:', err)
        backupError = true
      }
    }
  } else if (deviceType === 'phone') {
    // 重命名手机文件
    // 暂无手机文件备份功能
  }
  return backupError
}

const runCmd = async (cmd) => {
  try {
    console.log('执行命令:', cmd)
    const { stdout } = await exec(cmd)
    console.log('输出:', stdout)
    return true
  } catch (err) {
    console.error(`执行命令时出错: ${err}`)
    return false
  }
}

const generateTimeStamp = () => {
  console.log('生成时间戳')
  // 获取当前时间
  const now = new Date()

  // 格式化日期和时间
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0') // 月份从0开始，需要加1
  const day = String(now.getDate()).padStart(2, '0')
  const hour = String(now.getHours()).padStart(2, '0')
  const minute = String(now.getMinutes()).padStart(2, '0')
  const second = String(now.getSeconds()).padStart(2, '0')

  // 生成时间戳
  const timeStamp = `${year}${month}${day}_${hour}${minute}${second}`
  console.log('时间戳:', timeStamp)
  return timeStamp
}

ipcMain.on('mcfs-open-computer-path', (event, path) => {
  fs.stat(path, (err, stats) => {
    if (stats.isDirectory()) {
      shell.openPath(path)
    } else if (stats.isFile()) {
      shell.showItemInFolder(path)
    }
  })
})
