import { reactive } from 'vue'

const store = reactive({
  AppData: {
    theme: ''
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
