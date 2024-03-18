import { nativeTheme, ipcMain, shell } from 'electron'
import { exec } from 'child_process'

export const initFnMain = () => {
  initChangeTheme()
  initCmdExec()
  initOpenFolder()
}

const initChangeTheme = () => {
  ipcMain.on('system-theme', () => {
    nativeTheme.themeSource = 'system'
  })
  ipcMain.on('light-theme', () => {
    nativeTheme.themeSource = 'light'
  })
  ipcMain.on('dark-theme', () => {
    nativeTheme.themeSource = 'dark'
  })
}

const initCmdExec = () => {
  console.log('asd')
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
