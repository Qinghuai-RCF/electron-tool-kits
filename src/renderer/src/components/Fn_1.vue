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
</script>

<template>
  <header>
    <div class="main-title">安卓端B站视频快速提取</div>
  </header>
  <div class="contain">
    <div class="btn-box">
      <button id="run-btn" class="btn btn1" @click="runScript">运行</button>
      <button class="btn btn1" @click="openDownloadFolder">打开下载目录</button>
      <button class="btn btn1" @click="openOutputFolder">打开输出目录</button>
      <p>注意：点击运行后会<span style="color: red">清空</span>输出目录</p>
    </div>
  </div>
</template>

<style scoped>
/* header {
  height: 40px;
} */

button {
  margin: 0 auto;
}

.contain {
  /* background-color: blueviolet; */
  /* width: 100%; */
  height: calc(100% - 49px);
  padding: 10px;
  display: grid;
  align-items: center;
  justify-items: center;
}

.btn1 {
  width: 150px;
  height: 30px;
  margin-bottom: 10px;
  display: block;
  font-size: 1em;
  border-radius: 5px;
  background-color: var(--color-background-2);
}

.btn1:hover {
  background-color: var(--color-background-3);
}
</style>
