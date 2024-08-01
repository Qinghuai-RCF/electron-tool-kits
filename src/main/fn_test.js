const { exec } = require('child_process')
import { join } from 'path'
import store from '../renderer/src/store'

// eslint-disable-next-line no-unused-vars
export const initFnTest = async (mainWindow) => {
  adbtest()
}

const adbtest = () => {
  const adbPath = join(store.AppData.libPath, 'adb', 'adb.exe')
  // 调用adb命令获取设备列表
  const cmd = `"${adbPath}" devices`
  // eslint-disable-next-line no-unused-vars
  exec(cmd, (err, stdout, stderr) => {
    if (err) {
      console.error(`执行adb命令时出错: ${err}`)
      return
    }
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
        return { deviceId }
      })
    console.log('设备列表:', deviceList)
  })
}
