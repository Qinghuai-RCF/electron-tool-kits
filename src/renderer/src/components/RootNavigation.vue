<script setup>
import { HomeFilled, EditPen, VideoCamera, Switch } from '@element-plus/icons-vue'
import { onMounted } from 'vue'
import store from '../store'

onMounted(() => {
  window.electronAPI.sendSignal('get-theme-data')
  window.electronAPI.onSignal('update-theme-data', (event, themeDataString) => {
    const themeData = JSON.parse(themeDataString)
    store.AppData.theme = themeData
  })
})
</script>

<template>
  <el-menu default-active="/" router>
    <el-menu-item index="/">
      <el-icon>
        <HomeFilled />
      </el-icon>
      <span>主页</span>
    </el-menu-item>
    <el-menu-item index="/fn-1">
      <el-icon>
        <VideoCamera />
      </el-icon>
      <span>B站视频提取</span>
    </el-menu-item>
    <el-menu-item index="/folder-remarks">
      <el-icon>
        <EditPen />
      </el-icon>
      <span>文件夹备注</span>
    </el-menu-item>
    <el-menu-item index="/audio-extraction">
      <el-icon>
        <Switch />
      </el-icon>
      <span>视频转mp4</span>
    </el-menu-item>
  </el-menu>
</template>

<style>
.el-menu {
  border-right: none;
}
</style>
