import { ipcMain, dialog } from 'electron'
import { exec } from 'child_process'
import store from '../renderer/src/store'
import { join } from 'path'
import dirMgr from './dirMgr'
import fileMgr from './fileMgr'
import fs from 'fs'
import { dir } from 'console'

const CfgPath = join(dirMgr.appConfigPath, 'blbl_vid_extr_cfg.json')
const DataPath = join(dirMgr.appDataPath, 'blbl_vid_extr')
const defultOutputDir = join(DataPath, 'output')

let win = null

export const initFn1 = async (mainWindow) => {
  win = mainWindow
  // 初始化设置
  ipcMain.on('init-blbl-vid-extr', async () => {
    // 读取文件
    const data = await fileMgr.readJsonSync(CfgPath)
    if (data) {
      console.log('读取到的 JSON 数据:', data)
      store.fn1Data = data
      win.webContents.send(
        'update-redner-bve-cfg',
        JSON.stringify({
          BDownloadDir: store.fn1Data.BDownloadDir,
          outPutDir: store.fn1Data.outPutDir,
          cleanOutputDir: store.fn1Data.cleanOutputDir
        })
      )
    } else {
      store.fn1Data.BDownloadDir = 'E:\\User_files_sync\\Documents\\leidian9\\Pictures'
      store.fn1Data.outPutDir = defultOutputDir
      await dirMgr.makeDir(defultOutputDir)
      fileMgr.writeJsonSync(CfgPath, store.fn1Data)
      win.webContents.send(
        'update-redner-bve-cfg',
        JSON.stringify({
          BDownloadDir: store.fn1Data.BDownloadDir,
          outPutDir: store.fn1Data.outPutDir,
          cleanOutputDir: store.fn1Data.cleanOutputDir
        })
      )
      console.log('没有设置')
    }

    dirMgr.makeDir(defultOutputDir)
  })

  ipcMain.on('update-main-bve-cfg', (event, cfg) => {
    cfg = JSON.parse(cfg)
    console.log('更新主进程B站视频提取配置并保存:', cfg)
    store.fn1Data = cfg
    fileMgr.writeJsonSync(CfgPath, cfg)
    dirMgr.makeDir(defultOutputDir)
  })

  ipcMain.on('run-blbl-vid-extr', async () => {
    await new Promise((resolve, reject) => {
      let resultIn = false
      let resultOut = false

      if (fs.existsSync(store.fn1Data.BDownloadDir)) {
        console.log('路径存在', store.fn1Data.BDownloadDir)
        resultIn = true
      } else {
        console.log('路径不存在', store.fn1Data.BDownloadDir)
      }
      if (fs.existsSync(store.fn1Data.outPutDir)) {
        console.log('路径存在', store.fn1Data.outPutDir)
        resultOut = true
      } else {
        console.log('路径不存在', store.fn1Data.outPutDir)
      }
      win.webContents.send('send-bve-path-test-result', resultIn, resultOut)
      if (!resultIn || !resultOut) {
        reject('路径不存在')
      }
      resolve()
    })
    let clnOpt = ''
    if (store.fn1Data.cleanOutputDir) {
      clnOpt = ' -clean'
    }
    const toolPath =
      store.AppData.libPath + '/Bilibili_video_extraction/Bilibili video extraction.py'
    const cmd = `python "${toolPath}" -i "${store.fn1Data.BDownloadDir}" -o "${store.fn1Data.outPutDir}"${clnOpt}`
    console.log('执行命令:', cmd)
    exec(cmd, (error, stdout, ffmpeg) => {
      if (error) {
        console.error(`执行出错: ${error}`)
        win.webContents.send('bve-done', false)
      } else {
        console.log(`stdout: ${stdout}`)
        console.log(`ffmpeg: ${ffmpeg}`)
        win.webContents.send('bve-done', true)
        console.log('done')
      }
    })
  })

  ipcMain.on('bve-select-input-path', () => {
    dialog
      .showOpenDialog(win, {
        properties: ['openDirectory']
      })
      .then((result) => {
        if (!result.canceled) {
          // 用户选择的文件夹路径
          store.fn1Data.BDownloadDir = result.filePaths[0]
          updateAndSaveRendererBlblVidExtrCfg()
        }
      })
      .catch((err) => {
        console.log(err)
      })
  })

  ipcMain.on('bve-select-output-path', () => {
    dialog
      .showOpenDialog(win, {
        properties: ['openDirectory']
      })
      .then((result) => {
        if (!result.canceled) {
          // 用户选择的文件夹路径
          store.fn1Data.outPutDir = result.filePaths[0]
          updateAndSaveRendererBlblVidExtrCfg()
        }
      })
      .catch((err) => {
        console.log(err)
      })
  })

  ipcMain.on('reset-to-default-out-dir', () => {
    store.fn1Data.outPutDir = defultOutputDir
    fileMgr.writeJsonSync(CfgPath, store.fn1Data)
    updateAndSaveRendererBlblVidExtrCfg()
  })
}

const updateAndSaveRendererBlblVidExtrCfg = () => {
  console.log('更新渲染进程B站视频提取配置:', store.fn1Data)
  const cfg = JSON.stringify(store.fn1Data)
  win.webContents.send('update-redner-bve-cfg', cfg)
  fileMgr.writeJsonSync(CfgPath, store.fn1Data)
}
