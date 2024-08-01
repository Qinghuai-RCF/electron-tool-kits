import { nativeTheme, ipcMain, shell, dialog } from 'electron'
import { exec } from 'child_process'
import store from '../renderer/src/store'
import dirMgr from './dirMgr'
import fileMgr from './fileMgr'
import { join } from 'path'
import { is } from '@electron-toolkit/utils'

const mainCfgPath = join(dirMgr.appConfigPath, 'main_cfg.json')

let win

export const initFnMain = async (mainWindow) => {
  return new Promise((resolve) => {
    win = mainWindow
    initChangeTheme()
    initCmdExec()
    initOpenFolder()
    initDevTools()
    initLibPath()

    resolve()
  })
}

const initChangeTheme = () => {
  ipcMain.on('system-theme', () => {
    changeSaveUpdateTheme('system')
  })
  ipcMain.on('light-theme', () => {
    changeSaveUpdateTheme('light')
  })
  ipcMain.on('dark-theme', () => {
    changeSaveUpdateTheme('dark')
  })

  // 主动获取主题数据
  ipcMain.on('get-theme-data', () => {
    initTheme()
  })
}

const initCmdExec = () => {
  ipcMain.on('request-cmd', async (event, command) => {
    console.log('执行命令：', command)
    // 验证命令是否安全
    if (isCommandSafe(command)) {
      // 如果命令安全，则在主进程中执行
      try {
        const { stdout } = await exec(command)
        console.log('输出:', stdout)
      } catch (err) {
        console.error(`执行命令时出错: ${err}`)
        event.reply('cmd-executed', `Error: ${err.message}`)
      }
    } else {
      // 如果命令不安全，则拒绝执行
      event.reply('cmd-executed', 'Command not executed due to security concerns.')
    }
  })
}

const initOpenFolder = () => {
  ipcMain.on('open-folder', (event, path) => {
    if (path === 'AppDataPath') {
      path = dirMgr.appDocPath
    }
    shell.openPath(path)
  })
}

const isCommandSafe = (command) => {
  // 检查命令是否为空
  if (!command) return false
  // 检查命令长度
  if (command.length > 100) return false // 示例：限制命令长度不超过100个字符
  // 检查命令是否包含特殊字符或环境变量
  // if (/[\s\'\"\$\(\)\{\}\[\]`]/.test(command)) return false
  // 检查命令是否为敏感命令或包含敏感词
  if (command.toLowerCase() === 'exit' || command.toLowerCase() === 'quit') return false
  // if (allowedCommands.some((allowed) => command.toLowerCase().startsWith(allowed.toLowerCase())))
  //   return false
  // 检查命令是否在黑名单中
  if (
    ['rm', 'shutdown', 'reboot'].some((blacklisted) => command.toLowerCase().includes(blacklisted))
  )
    return false
  // 简单的字符匹配，确保命令只包含字母和空格
  // if (!/^[a-zA-Z\s]+$/.test(command)) return false
  // 上下文验证（根据实际应用添加）
  // ...
  // 如果所有检查都通过，则命令被认为是安全的
  return true
}

const initTheme = async () => {
  console.log('初始化主题')
  const config = await fileMgr.readJsonSync(mainCfgPath)
  if (config) {
    console.log('读取到默认主题')
    changeSaveUpdateTheme(config.theme)
  } else {
    // 文件不存在，尝试创建文件
    console.log('主设置文件不存在，尝试创建文件')
    changeSaveUpdateTheme('system')
  }
  console.log('是否黑暗模式', nativeTheme.shouldUseDarkColors)
}

const changeSaveUpdateTheme = (theme) => {
  store.AppData.theme = theme
  nativeTheme.themeSource = store.AppData.theme
  console.log('是否黑暗模式', nativeTheme.shouldUseDarkColors)
  fileMgr.writeJsonSync(mainCfgPath, {
    theme: store.AppData.theme
  })
  updateIsDark()
  updateThemeData()
}

const updateThemeData = () => {
  const themeDataString = JSON.stringify(store.AppData.theme)
  win.webContents.send('update-theme-data', themeDataString)
}

const initDevTools = () => {
  ipcMain.on('open-devtools', () => {
    win.webContents.openDevTools()
  })
}

const initLibPath = () => {
  if (is.dev) {
    // 开发环境下，libPath指向开发环境的lib目录
    store.AppData.libPath = './lib'
  } else {
    // 生产环境下，libPath指向安装目录的lib目录
    store.AppData.libPath = 'resources/app.asar.unpacked/lib'
  }
}

const updateIsDark = () => {
  win.webContents.send('update-is-dark', nativeTheme.shouldUseDarkColors)
}
ipcMain.on('init-is-dark', () => {
  updateIsDark()
})

// 获取路径开始

ipcMain.on('main-select-path', (event, type) => {
  console.log('main-select-path', type)
  if (type === 'folder') {
    // 选择文件夹路径
    win.webContents.send('main-select-path-renderer', selectFolder())
  } else if (type === 'file') {
    // 选择文件路径
    win.webContents.send('main-select-path-to-renderer', selectFile())
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
        return result.filePaths[0]
        // 将路径回传给渲染进程
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
        return result.filePaths[0]
        // 将路径回传给渲染进程
      }
    })
    .catch((err) => {
      console.log(err)
    })
}

// 获取路径结束
