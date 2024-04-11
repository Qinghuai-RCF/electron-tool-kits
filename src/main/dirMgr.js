const fs = require('fs').promises;
import { join } from 'path'
import { app } from 'electron'

// 软件文档目录
const appDocPath = join(app.getPath('documents'), 'electron-tool-kits')
// 必要文件夹目录
const appDataPath = join(appDocPath, 'data')
const appConfigPath = join(appDocPath, 'config')


const initDir = async () => {
  console.log('开始 初始化文件夹')
  await Promise.all([
    makeDir(appDataPath),
    makeDir(appConfigPath)
  ])
  console.log('结束 初始化文件夹')
}

const makeDir = async (path) => {
  try {
    console.log('开始创建文件夹', path);
    await fs.access(path); // 检查路径是否存在
    console.log('文件夹已存在：', path);
    return; // 文件夹已存在，退出函数
  } catch (err) {
    if (err.code !== 'ENOENT') {
      // 其他错误，抛出以通知调用者
      console.error('文件夹访问失败：', path);
      console.error(err);
      throw err;
    }
  }

  // 文件夹不存在，创建它
  try {
    await fs.mkdir(path, { recursive: true });
    console.log('文件夹创建成功：', path);
  } catch (mkdirErr) {
    console.error('文件夹创建失败：', path);
    console.error(mkdirErr);
    throw mkdirErr; // 将错误抛出以通知调用者
  }
}

export default { initDir, makeDir, appDataPath, appConfigPath }
