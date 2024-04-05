import { reactive } from 'vue'

const store = reactive({
  AppData: {
    theme: ''
  },
  fn1Data: {},
  fn2Data: {
    tableData: {},
    csvPath: '',
    isRemarksChanged: false,
    csvData: {},
    folderPath: ''
  }
})

export default store
