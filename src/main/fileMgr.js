import fs from 'fs'

// 同步读取json文件
const readJsonSync = (path) => {
  return new Promise((resolve, reject) => {
    try {
      const data = fs.readFileSync(path, 'utf8')
      // 转换为对象并返回
      console.log('成功读取 JSON 数据:', data);
      resolve(JSON.parse(data))
    } catch (err) {
      if (err.code === 'ENOENT') {
        console.log('JSON文件不存在', path);
        resolve(null)
      } else {
        console.error('读取或解析 JSON 数据时出错:', err)
        reject(err)
      }
    }
  })
}

// 同步写入json文件
const writeJsonSync = (path, data) => {
  console.log('writeJsonSync');
  // 将 JavaScript 对象转换回 JSON 字符串
  const json = JSON.stringify(data, null, '\t') // 使用 null和 2 来美化 JSON 输出
  try {
    fs.writeFileSync(path, json, 'utf8')
    console.log('成功写入 JSON 数据:', path)
  } catch (err) {
    console.error('写入 JSON 数据时出错:', err)
  }
}
export default {
  readJsonSync,
  writeJsonSync
}
