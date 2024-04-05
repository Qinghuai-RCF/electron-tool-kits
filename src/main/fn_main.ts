import { nativeTheme, ipcMain, shell } from 'electron'
import { exec } from 'child_process'
import fs from 'fs'
import { join } from 'path'
import store from '../renderer/src/store'

export const initFnMain = (mainWindow) => {
  initChangeTheme(mainWindow)
  initCmdExec()
  initOpenFolder()
}

const initChangeTheme = (mainWindow) => {
  ipcMain.on('system-theme', () => {
    nativeTheme.themeSource = 'system'
    saveTheme('system')
    updateThemeData(mainWindow)
  })
  ipcMain.on('light-theme', () => {
    nativeTheme.themeSource = 'light'
    saveTheme('light')
    updateThemeData(mainWindow)
  })
  ipcMain.on('dark-theme', () => {
    nativeTheme.themeSource = 'dark'
    saveTheme('dark')
    updateThemeData(mainWindow)
  })

  // 主动获取主题数据
  ipcMain.on('get-theme-data', () => {
    updateThemeData(mainWindow)
  })
}

const initCmdExec = () => {
  ipcMain.on('request-cmd', (event, command) => {
    // 验证命令是否安全
    if (isCommandSafe(command)) {
      // 如果命令安全，则在主进程中执行
      exec(command)
    } else {
      // 如果命令不安全，则拒绝执行
      event.reply('cmd-executed', 'Command not executed due to security concerns.')
    }
  })
}

const initOpenFolder = () => {
  ipcMain.on('open-folder', (event, path) => {
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

const saveTheme = (theme) => {
  store.AppData.theme = theme
  // 读取 JSON 文件 获取主题色
  fs.readFile(join(__dirname, '../renderer/assets/config.json'), 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading file:', err)
      return
    }

    // 解析 JSON 数据
    const config = JSON.parse(data)
    console.log('保存', theme)
    config.AppData.theme = theme
    // 将 JavaScript 对象转换回 JSON 字符串
    const modifiedJsonData = JSON.stringify(config, null, '\t') // 使用 null 和 2 来美化 JSON 输出

    // 将修改后的 JSON 数据写入原始 JSON 文件的路径中
    fs.writeFileSync(join(__dirname, '../renderer/assets/config.json'), modifiedJsonData, 'utf8')

    console.log(
      'Modified JSON data has been saved to:',
      join(__dirname, '../renderer/assets/config.json')
    )
  })
}

const updateThemeData = (mainWindow) => {
  const themeDataString = JSON.stringify(store.AppData.theme)
  mainWindow.webContents.send('update-theme-data', themeDataString)
}
