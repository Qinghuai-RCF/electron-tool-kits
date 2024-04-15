import { ElMessage } from 'element-plus'
import { ipcRenderer } from'electron'

const folderOpenError = (event, error) => {
  console.log('弹窗');
  if (error.code === 'ENOENT') {
    ElMessage({
      showClose: true,
      message: '路径不存在，请重新选择！',
      type: 'error',

      duration: 2000,
    })
  } else {
    ElMessage({
      showClose: true,
      message: '打开路径失败，请重新选择！',
      type: 'error',
      duration: 2000,
    })
  }
}

// fn2 文件夹备注监听器
const initFolderRemarksListeners = () => {
  ipcRenderer.on('fn2-folder-open-error', folderOpenError)
}

const uninitFolderRemarksListeners = () => {
  ipcRenderer.removeListener('fn2-folder-open-error', folderOpenError)
}

export default {
  initFolderRemarksListeners,
  uninitFolderRemarksListeners,
}
