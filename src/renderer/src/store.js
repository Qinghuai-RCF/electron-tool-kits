import { reactive } from 'vue'

const store = reactive({
  AppData: {
    theme: '',
    publicPath: './src/renderer/public'
  },
  fn1Data: {},
  fn2Data: {
    dataPath: '',
    folderPath: '',
    nowFolderPath: '',
    tableData: {},
    isRemarksChanged: false,
    remarksData: {},
    newData: {}
  }
})

export default store
