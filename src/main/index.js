import { app, shell, BrowserWindow } from 'electron'
import { join, resolve } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import fs from 'fs'
import store from '../renderer/src/store'

import { initFn } from './fn'

const WINDOW_WIDTH = 1200
const WINDOW_HEIGHT = 670
const WINDOW_MIN_WIDTH = 650
const WINDOW_MIN_HEIGHT = 500

let mainWindow

function createWindow() {
  console.log('开始初始化窗口')
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: WINDOW_WIDTH,
    height: WINDOW_HEIGHT,
    minWidth: WINDOW_MIN_WIDTH,
    minHeight: WINDOW_MIN_HEIGHT,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: resolve(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // 调试工具
  mainWindow.webContents.openDevTools()

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

const readyToMkDir = () => {
  return new Promise((resolve) => {
    console.log('readyToMkDir')
    store.AppData.appDocPath = join(app.getPath('documents'), 'electron-tool-kits')
    store.AppData.appConfigsPath = join(store.AppData.appDocPath, 'config')
    resolve()
  })
}

const mkDir = (path) => {
  return new Promise((resolve, reject) => {
    console.log(`mkDir: ${path}`)
    fs.mkdir(path, { recursive: true }, (err) => {
      if (err) {
        console.error('Failed to create folder:', err)
        reject()
      } else {
        console.log('Folder has been created successfully.')
        resolve()
      }
    })
  })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(async () => {
  console.log('app准备就绪')
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  await Promise.all([
    createWindow(),
    readyToMkDir(),
    mkDir(store.AppData.appDocPath),
    mkDir(store.AppData.appConfigsPath)
  ])
  initFn(mainWindow)

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
