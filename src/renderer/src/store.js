import { reactive } from 'vue'

const store = reactive({
  AppData: {
    theme: '',
    appDocPath: '',
    appConfigsPath: '',
    libPath: ''
  },
  fn1Data: {
    BDownloadDir: '',
    outPutDir: '',
    cleanOutputDir: false
  },
  fn2Data: {
    dataPath: '',
    folderPath: '',
    nowFolderPath: '',
    tableData: {},
    isRemarksChanged: false,
    remarksData: {},
    newData: {}
  },
  AudioExtraction: {
    settings: {
      isCustomFolder: false,
      customFolder: ''
    },
    fileList: [],
    isEmpty: true
  }
})

export default store
