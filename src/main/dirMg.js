import fs from 'fs'
import { join } from 'path'
import { app } from 'electron'

const appDocPath = join(app.getPath('documents'), 'electron-tool-kits')
const appConfigsPath = join(appDocPath, 'config')
const mainCfgPath = join(appConfigsPath, 'app_config.json')

const makeDir = (path) => {
  return new Promise((resolve, reject) => {
    console.log('开始创建文件夹', path)
    fs.stat(path, (err) => {
      if (err) {
        // 如果文件夹不存在，则创建它
        fs.mkdir(path, (err) => {
          if (err) {
            console.error('Failed to create folder:', err)
            reject()
          }
          console.log('Folder has been created successfully.')
        })
      } else {
        // 如果文件夹存在，则不需要创建
        console.log('Folder already exists.')
      }
      resolve()
    })
  })
}

export default { makeDir, appDocPath, appConfigsPath, mainCfgPath }
