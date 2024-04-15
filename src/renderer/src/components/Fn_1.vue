<script setup>
import { onMounted } from 'vue'

onMounted(() => {
  window.electronAPI.fn1Listener()
})

const runScript = () => {
  window.electronAPI.sendSignal(
    'run-blbl-vid-extr',
    'python "E:\\User_files_sync\\Files\\Projects\\自制软件\\# 安卓端B站视频快速提取\\Bilibili video extraction.py"'
  )
  document.getElementById('run-btn').style.backgroundColor = 'yellow'
  document.getElementById('run-btn').style.color = 'black'
}

const openDownloadFolder = () => {
  window.electronAPI.sendSignal('open-folder', 'E:\\User_files_sync\\Documents\\leidian9\\Pictures')
}

const openOutputFolder = () => {
  window.electronAPI.sendSignal(
    'open-folder',
    'E:\\User_files_sync\\Files\\Projects\\自制软件\\# 安卓端B站视频快速提取\\output'
  )
}

const openAppFolder = () => {
  window.electronAPI.sendSignal(
    'open-folder',
    'E:\\User_files_sync\\Files\\Projects\\自制软件\\# 安卓端B站视频快速提取'
  )
}
</script>

<template>
  <el-container>
    <el-main>
      <el-row>
        <el-col><el-button id="run-btn" @click="runScript">运行</el-button></el-col>
      </el-row>
      <el-row>
        <el-col><el-button @click="openDownloadFolder">打开下载目录</el-button></el-col>
      </el-row>
      <el-row>
        <el-col><el-button @click="openOutputFolder">打开输出目录</el-button></el-col>
      </el-row>
      <el-row>
        <el-col><el-button @click="openAppFolder">打开软件目录</el-button></el-col>
      </el-row>
      <el-row>
        <el-text>注意：点击运行后会<el-text type="error">清空</el-text>输出目录</el-text>
      </el-row>
    </el-main>
  </el-container>
</template>

<style scoped>
.el-row {
  margin-bottom: 10px;
}
</style>
