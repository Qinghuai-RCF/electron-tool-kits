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
    fileList: []
  },
  ADB: {
    currentDevice: {},
    device: {
      deviceLoading: false,
      deviceList: []
    },
    MobileComputerFileSync: {
      presets: {},
      settings: {
        isBackup: false
      },
      // fileStatus: {
      //   computer: 0,
      //   phone: 0,
      //   phoneFileTime: '',
      //   phoneFileNew: false,
      //   computerFileTime: '',
      //   computerFileNew: false,
      //   buttonDisabled: true
      // },
      // currentPresetOption: '',
      // presetsOption: [],
      // isFolder: false,
      // phonePath: '',
      // computerPath: '',
      // phonePathMatchingStatus: '0',
      // 0: 路径为空
      // 1: 路径错误
      // 2: 路径匹配成功
      // computerPathMatchingStatus: '0'
      // 0: 路径为空
      // 1: 路径错误
      // 2: 路径匹配成功
    }
  }
})

export default store
