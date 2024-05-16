<script setup>
import { onMounted, onUnmounted, ref } from 'vue'
import store from '../../store.js'
import dm from './data_management'
import { Folder, Warning } from '@element-plus/icons-vue'
import '../../../../../node_modules/element-plus/theme-chalk/el-message.css'

const tableSize = ref('default')
const drawer = ref(false)

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
  window.electronAPI.initFolderRemarksListeners()
})

onUnmounted(() => {
  window.electronAPI.uninitFolderRemarksListeners()
})
</script>

<template>
  <el-container>
    <el-main>
      <el-row gutter="10">
        <el-col>
          <el-input
            v-model="store.fn2Data.nowFolderPath"
            placeholder="请输入或选择文件夹"
            :suffix-icon="Folder"
            class="fn2-input"
          />
        </el-col>
      </el-row>

      <el-row gutter="10">
        <el-col :span="6" gutter="10"
          ><el-button class="fn2-btn1" @click="fillDefultPath">回到默认</el-button></el-col
        >
        <el-col :span="6"
          ><el-button class="fn2-btn1" @click="setAsDefultPath">设为默认</el-button></el-col
        >
        <el-col :span="6"
          ><el-button class="fn2-btn1" @click="selectFolderPath">选择文件夹</el-button></el-col
        >
        <el-col :span="3"
          ><el-button class="fn2-btn1" @click="refreshTable">刷新</el-button></el-col
        >
        <el-col :span="3"
          ><el-button class="fn2-btn1" type="primary" @click="goToNewPath">转到</el-button></el-col
        >
      </el-row>

      <el-row gutter="10" justify="center">
        <el-col span="0">
          <el-radio-group v-model="tableSize">
            <el-radio-button :value="'small'">紧凑</el-radio-button>
            <el-radio-button :value="'default'">普通</el-radio-button>
            <el-radio-button :value="'large'">松散</el-radio-button>
          </el-radio-group>
        </el-col>
      </el-row>

      <el-row gutter="10">
        <el-col>
          <div class="fn2-folder-remark-body">
            <el-scrollbar height="calc(100vh - 253px)">
              <table>
                <tr v-for="(folder, index) in Object.keys(store.fn2Data.tableData)" :key="index">
                  <td :class="setTrColorClass(store.fn2Data.tableData[folder])">{{ folder }}</td>
                  <td>
                    <el-input
                      v-model="store.fn2Data.tableData[folder]"
                      :size="tableSize"
                      @change="saveKeyValuePair(folder, store.fn2Data.tableData[folder])"
                    ></el-input>
                  </td>
                </tr>
              </table>
            </el-scrollbar>
          </div>
        </el-col>
      </el-row>

      <el-row gutter="10">
        <el-col>
          <div style="float: left">
            <el-button :icon="Warning" @click="drawer = true">说明</el-button>
          </div>
          <div style="float: right">
            <el-text v-if="store.fn2Data.isRemarksChanged" style="margin-right: 10px" type="error"
              >有未保存更改</el-text
            >
            <el-button
              :disabled="!store.fn2Data.isRemarksChanged"
              type="primary"
              @click="saveNewData"
            >
              保存更改
            </el-button>
          </div>
        </el-col>
      </el-row>
    </el-main>
  </el-container>

  <el-drawer v-model="drawer" title="文件夹备份使用说明" :direction="rtl">
    <p>如果没有备注，显示红色背景</p>
    <p>如果备注中含有“游戏”，显示紫色背景</p>
  </el-drawer>
</template>

<style scoped>
.fn2-folder-remark-body {
  width: 100%;
  border: 1px solid var(--el-border-color);
  border-radius: var(--el-border-radius-base);
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
  color: black;
}
</style>
./data_management.js ./data_management.js
