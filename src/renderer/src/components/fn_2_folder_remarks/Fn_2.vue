<script setup>
import { onMounted, onUnmounted, ref } from 'vue'
import store from '../../store.js'
import dm from './data_management'

const folderPath = ref('')
const csvPath = ref('')

folderPath.value = 'E:\\User_files_2\\文档'
csvPath.value =
  'E:\\User_files_sync\\Files\\Projects\\Electron\\electron-vue-app\\folder_names - 副本.csv'

const runFolderRemarks = () => {
  window.electronAPI.sendSignal(
    'request-cmd',
    'E:\\User_files_sync\\Files\\Projects\\自制软件\\文件夹备注\\FolderRemarks.exe'
  )
}

onMounted(() => {
  dm.init()
})

onUnmounted(() => {
  dm.deinitListener()
})

const getTable = () => {
  dm.initFn2Table()
}
</script>

<template>
  <header>
    <div class="main-title">
      <span>文件夹备注</span>
      <div class="fn2-header-right-bar">
        <button class="header-btn">设置</button>
      </div>
    </div>
  </header>
  <div class="fn2-contain">
    <div class="fn2-wrap">
      <div class="fn2-container1">
        <input type="text" class="fn2-address-input" />
        <button class="fn2-btn1" @click="getTable">刷新</button>
        <button class="fn2-btn1" @click="getTable">转到</button>
        <button class="fn2-btn1">选择文件夹</button>
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
              <td>{{ store.fn2Data.tableData[folder] }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <button class="fn2-btn1">保存更改</button>
      <br /><br />
      <div>
        <h2>QT版：</h2>
        <button class="fn2-runFolderRemarks-btn" @click="runFolderRemarks">打开</button>
      </div>
    </div>
  </div>
</template>

<style>
:root {
  --gap: 7px;
}

.fn2-contain {
  /* 内部内容居中显示 */
  display: grid;
  justify-items: center;
  align-items: center;

  height: calc(100% - 49px);
  /* 启用滚动条 */
  overflow: auto;

  margin: 0 50px;
}

.fn2-wrap {
  max-width: 900px;
  width: 100%;
  display: grid;
  gap: var(--gap);
}

.fn2-runFolderRemarks-btn {
  border: var(--color-background-3) solid 1px;
  height: 34px;
  width: 100px;
}

button {
  display: inline-block;
}

button:hover {
  background-color: var(--color-background-3);
}

.fn2-table-container {
  width: 100%; /* 设置容器宽度 */
  height: 350px;
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

.fn2-address-input {
  background-color: var(--color-background-1);
  color: var(--color-text-1);
  border: var(--color-background-3) solid 1px;
  height: 34px;
  display: inline-block;
  margin-right: 5px;
  width: 100%;
}

.fn2-address-input:focus {
  border: var(--color-selected) solid 1px;
}

.fn2-header-right-bar {
  float: right;
  height: 49px;
  line-height: 49px;
  top: -5px;
  right: 0;
  align-self: center;
}

.fn2-container1 {
  display: grid;
  grid-template-columns: auto 100px 100px 100px;
  gap: var(--gap);
}

.header-btn {
  height: 49px;
  line-height: 49px;
  width: 49px;
  display: block;
}
</style>
