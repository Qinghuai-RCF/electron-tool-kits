<script setup>
import { onMounted } from 'vue'
import store from '../../store.js'
import dm from './data_management'

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

onMounted(() => {
  dm.init()
})
</script>

<template>
  <header>
    <div class="main-title">
      <span>文件夹备注</span>
      <div class="fn2-right-btn-area">
        <button class="fn2-runFolderRemarks-btn" @click="runFolderRemarks">打开QT版</button>
      </div>
    </div>
  </header>
  <div class="fn2-contain">
    <div class="fn2-folder-path-area">
      <div class="row1">
        <input v-model="store.fn2Data.nowFolderPath" type="text" class="fn2-input" />
        <button class="fn2-btn1" @click="fillDefultPath">回到默认</button>
        <button class="fn2-btn1" @click="setAsDefultPath">设为默认</button>
      </div>
      <div class="row2">
        <button class="fn2-btn1" @click="refreshTable">刷新</button>
        <button class="fn2-btn1" @click="goToNewPath">转到</button>
        <button class="fn2-btn1" @click="selectFolderPath">选择文件夹</button>
      </div>
    </div>
    <div class="fn2-table-container">
      <table class="fn2-folder-remark-header">
        <thead>
          <tr>
            <th>文件夹名</th>
            <th>备注</th>
          </tr>
        </thead>
      </table>
      <table class="fn2-folder-remark-body">
        <tbody>
          <tr v-for="(folder, index) in Object.keys(store.fn2Data.tableData)" :key="index">
            <td>{{ folder }}</td>
            <td>
              <input
                v-model="store.fn2Data.tableData[folder]"
                type="text"
                class="fn2-input"
                @input="saveKeyValuePair(folder, store.fn2Data.tableData[folder])"
              />
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <button class="fn2-btn1" @click="saveNewData">保存更改</button>
    <p v-if="store.fn2Data.isRemarksChanged" class="save-notification">有未保存更改</p>

    <input type="folder" />
  </div>
</template>

<style>
:root {
  --gap: 7px;
}

.fn2-contain {
  height: calc(100% - 49px);
  overflow: auto;

  padding: 0 50px;
  width: 100%;
  display: grid;
  gap: var(--gap);
  align-items: center;
}

button {
  display: inline-block;
}

button:hover {
  background-color: var(--color-background-3);
}

.fn2-table-container {
  width: 100%; /* 设置容器宽度 */
  height: 100%;
  overflow: auto;
}

.fn2-folder-remark-body {
  width: 100%; /* 表格宽度100% */
  margin-top: -2px;
}

.fn2-folder-remark-header {
  width: 100%; /* 表格宽度100% */
  position: sticky; /* 启用固定定位 */
  top: 0; /* 将表头固定在顶部 */
  background-color: var(--color-background-2);
  z-index: 1; /* 设置层级 */
}

.fn2-btn1 {
  display: inline-block;
  border: var(--color-background-3) solid 1px;
  height: 34px;
}

.fn2-btn1:active,
.fn2-runFolderRemarks-btn:active {
  border: var(--color-selected) solid 1px;
}

.fn2-input {
  background-color: var(--color-background-1);
  color: var(--color-text-1);
  border: var(--color-background-3) solid 1px;
  height: 34px;
  display: inline-block;
  width: 100%;
}

.fn2-input:focus {
  border: var(--color-selected) solid 1px;
}

.fn2-folder-path-area {
  display: grid;
  grid-template-rows: 34px 34px;
  gap: var(--gap);
}

.fn2-folder-path-area .row1 {
  display: grid;
  grid-template-columns: auto 115px 115px;
  gap: var(--gap);
}

.fn2-folder-path-area .row2 {
  display: grid;
  grid-template-columns: auto auto auto;
  gap: var(--gap);
}

.save-notification {
  text-align: right;
  color: red;
}

.fn2-right-btn-area {
  /* float: right; */
  position: absolute;
  top: 0;
  right: 0;
  height: 48px;
}

.fn2-runFolderRemarks-btn {
  height: 48px;
  width: 100px;
  line-height: 48px;
  display: block;
  font-size: 16px;
}
</style>
