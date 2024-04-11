<script setup>
import { onMounted, ref } from 'vue'
import store from '../../store.js'
import dm from './data_management'
import { Folder } from '@element-plus/icons-vue';


const tableSize = ref('default')



const runFolderRemarks = () => {
  window.electronAPI.sendSignal(
    'request-cmd',
    'E:\\User_files_sync\\Files\\Projects\\自制软件\\文件夹备注\\FolderRemarks.exe'
  )
}

const refreshTable = () => {
  window.electronAPI.sendSignal('fn2-refresh-table')
  store.fn2Data.isRemarksChanged = false
}

const goToNewPath = () => {
  window.electronAPI.sendSignal('fn2-go-to-new-path', store.fn2Data.nowFolderPath)
  store.fn2Data.isRemarksChanged = false
}

const saveKeyValuePair = (key, value) => {
  store.fn2Data.newData[key] = value
  store.fn2Data.isRemarksChanged = true
  console.log('update', key, value)
  console.log('isRemarksChanged', store.fn2Data.isRemarksChanged)
}

const saveNewData = () => {
  window.electronAPI.sendSignal('fn2-save-new-data', JSON.stringify(store.fn2Data.newData))
  store.fn2Data.isRemarksChanged = false
  console.log('保存新数据', store.fn2Data.newData)
  console.log('isRemarksChanged', store.fn2Data.isRemarksChanged)
}

const fillDefultPath = () => {
  store.fn2Data.nowFolderPath = store.fn2Data.folderPath
  goToNewPath()
}

const setAsDefultPath = () => {
  store.fn2Data.folderPath = store.fn2Data.nowFolderPath
  window.electronAPI.sendSignal('update-main-fn2-defult-path', store.fn2Data.folderPath)
}

const selectFolderPath = () => {
  window.electronAPI.sendSignal('fn2-select-folder-path')
  window.electronAPI.onceSignal('update-renderer-fn2-now-folder-path', (event, newPath) => {
    store.fn2Data.nowFolderPath = newPath
  })
}

const setTrColorClass = (cellContent) => {
  if (cellContent.includes('游戏')) {
    return 'fn2-tr-color-game'
  } else if (cellContent == '') {
    return 'fn2-tr-color-no-remark'
  }
}

onMounted(() => {
  dm.init()
})
</script>

<template>
  <el-container>
    <el-main>
      <el-row gutter=10>
        <el-col>
          <el-input v-model="store.fn2Data.nowFolderPath" placeholder="请输入或选择文件夹" :suffix-icon="Folder"
            class="fn2-input" />
        </el-col>
      </el-row>

      <el-row gutter=10>
        <el-col :span="6" gutter="10"><el-button class="fn2-btn1" @click="fillDefultPath">回到默认</el-button></el-col>
        <el-col :span="6"><el-button class="fn2-btn1" @click="setAsDefultPath">设为默认</el-button></el-col>
        <el-col :span="6"><el-button class="fn2-btn1" @click="selectFolderPath">选择文件夹</el-button></el-col>
        <el-col :span="3"><el-button class="fn2-btn1" @click="goToNewPath">转到</el-button></el-col>
        <el-col :span="3"><el-button class="fn2-btn1" @click="refreshTable">刷新</el-button></el-col>
      </el-row>

      <el-row gutter=10 justify="center">
        <el-col  span=0>
          <el-radio-group v-model="tableSize">
            <el-radio-button :value="'small'">紧凑</el-radio-button>
            <el-radio-button :value="'default'">普通</el-radio-button>
            <el-radio-button :value="'large'">松散</el-radio-button>
          </el-radio-group>
        </el-col>
      </el-row>


      <el-row gutter=10>
        <el-col>
          <el-card class="fn2-folder-remark-body">
            <table>
              <tr v-for="(folder, index) in Object.keys(store.fn2Data.tableData)" :key="index">
                <td :class="setTrColorClass(store.fn2Data.tableData[folder])">{{ folder }}</td>
                <td>
                  <el-input v-model="store.fn2Data.tableData[folder]" v-bind:size="tableSize"
                    @change="saveKeyValuePair(folder, store.fn2Data.tableData[folder])"></el-input>
                </td>
              </tr>
            </table>
          </el-card>
        </el-col>
      </el-row>

      <el-row gutter=10>
        <el-col :span="8">
          <el-button class="fn2-btn1" @click="runFolderRemarks">
            打开QT版
          </el-button>
        </el-col>
        <el-col :span="8">
          <div class="save-notification">
            <el-text type="warning" v-if="store.fn2Data.isRemarksChanged">有未保存更改</el-text>
          </div>
        </el-col>
        <el-col :span="8">
          <el-button class="fn2-btn1" @click="saveNewData" :disabled="!store.fn2Data.isRemarksChanged">
            保存更改
          </el-button>
        </el-col>
      </el-row>
    </el-main>
  </el-container>
</template>

<style scoped>
.fn2-folder-remark-body {
  height: calc(100vh - 211px);
  /* height: 400px; */
  overflow: auto;
}

.fn2-folder-remark-body table {
  width: 100%;
}

.fn2-btn1 {
  width: 100%;
}

.fn2-input {
  width: 100%;
}

.el-row {
  margin-bottom: 10px;
}

.el-row:last-child {
  margin-bottom: 0;
}

.save-notification {
  text-align: center;
}

/* fn2-tr-color */
.fn2-tr-color-no-remark {
  color: white;
  background-color: var(--el-color-danger);
}

.fn2-tr-color-game {
  background-color: rgb(234, 211, 255);
}
</style>
