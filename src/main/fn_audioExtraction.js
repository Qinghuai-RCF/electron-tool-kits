import { ipcMain, dialog } from 'electron'
import store from '../renderer/src/store'
import fileMgr from './fileMgr'
import dirMgr from './dirMgr'
import { join } from 'path'
import { exec } from 'child_process'
const fs = require('fs').promises

let win
const CfgPath = join(dirMgr.appConfigPath, 'audio-extraction_cfg.json')
let loadding = {
  done: 0,
  total: 0
}

export const initAudioExtraction = (mainWindow) => {
  win = mainWindow
}

ipcMain.on('init-audio-extraction-settings', async () => {
  // 读取文件
  const data = await fileMgr.readJsonSync(CfgPath)
  if (data) {
    console.log('读取到的 JSON 数据:', data)
    store.AudioExtraction.settings = data
  } else {
    console.log('没有设置')
  }
  updateSettingsToRenderer()
  saveSettings()
})

ipcMain.on('update-audio-extraction-settings-to-main', (event, settings) => {
  store.AudioExtraction.settings = JSON.parse(settings)
  console.log('更新后的设置:', store.AudioExtraction.settings)
  saveSettings()
})

ipcMain.on('change-audio-extraction-custom-path', async (event, path) => {
  console.log('尝试自定义路径:', path)
  try {
    await fs.access(path) // 检查路径是否存在
    console.log('文件夹存在')
    store.AudioExtraction.settings.customFolder = path
    saveSettings()
    updateSettingsToRenderer()
    return
  } catch (err) {
    if (err.code !== 'ENOENT') {
      // 其他错误，抛出以通知调用者
      console.error('文件夹访问失败：', path)
      console.error(err)
      throw err
    }
    console.log('路径不存在！')
    updateSettingsToRenderer()
  }
})

ipcMain.on('audio-extraction-select-folder-path', () => {
  dialog
    .showOpenDialog(win, {
      properties: ['openDirectory']
    })
    .then((result) => {
      if (!result.canceled) {
        // 用户选择的文件夹路径
        store.AudioExtraction.settings.customFolder = result.filePaths[0]
        updateSettingsToRenderer()
        saveSettings()
        // 您可以在这里处理文件夹路径
      }
    })
    .catch((err) => {
      console.log(err)
    })
})

ipcMain.on('start-audio-extraction', async (event, fileList) => {
  console.log('开始音频提取')
  store.AudioExtraction.fileList = JSON.parse(fileList)
  console.log('文件列表:', store.AudioExtraction.fileList)
  const isCustomFolder = store.AudioExtraction.settings.isCustomFolder
  loadding.done = 0
  loadding.total = store.AudioExtraction.fileList.length
  // 调用 ffmpeg 进行音频提取
  for (let key in store.AudioExtraction.fileList) {
    const file = store.AudioExtraction.fileList[key]
    console.log('开始提取文件:', file)
    if (!file.isDone) {
      // 音频未提取，开始提取
      let outputFilePath
      if (isCustomFolder) {
        outputFilePath = join(store.AudioExtraction.settings.customFolder, file.name).replace(
          /\.[^/.]+$/,
          '.mp3'
        )
      } else {
        outputFilePath = file.path.replace(/\.[^/.]+$/, '.mp3')
      }
      runAudioExtraction(file.path, outputFilePath, key)
    } else {
      console.log('文件已提取，跳过')
      loadding.done++
    }
  }
  do {
    // 等待所有文件提取完成
    console.log('等待文件提取完成:', loadding.done, '/', loadding.total)
    await new Promise((resolve) => {
      setTimeout(resolve, 100)
    })
  } while (loadding.done < loadding.total)
  console.log('等待文件提取完成:', loadding.done, '/', loadding.total)
  updateFileSListToRenderer()
})

const saveSettings = () => {
  console.log('保存设置')
  fileMgr.writeJsonSync(CfgPath, store.AudioExtraction.settings)
}

const updateSettingsToRenderer = () => {
  console.log('更新设置到渲染器')
  win.webContents.send(
    'update-audio-extraction-settings-to-renderer',
    JSON.stringify(store.AudioExtraction.settings)
  )
}

const updateFileSListToRenderer = () => {
  console.log('更新文件列表到渲染器')
  win.webContents.send(
    'update-audio-extraction-file-list-to-renderer',
    JSON.stringify(store.AudioExtraction.fileList)
  )
}

const runAudioExtraction = async (inputFilePath, outputFilePath, key) => {
  // 调用 ffmpeg 进行音频提取
  const cmd = `ffmpeg -y -i "${inputFilePath}" -vn -c:a libmp3lame -q:a 0 "${outputFilePath}"`
  // 执行命令
  console.log('执行命令:', cmd)
  await new Promise((resolve, reject) => {
    exec(cmd, (error, stdout) => {
      if (error) {
        reject(error)
        return
      }
      resolve(stdout)
    })
  })
  loadding.done++
  store.AudioExtraction.fileList[key].isDone = true
  console.log('文件提取完成:', outputFilePath)
}
