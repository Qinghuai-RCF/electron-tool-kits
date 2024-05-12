<script setup>
import themePopup from './components/ThemePopup.vue'
import { HomeFilled, TurnOff, EditPen, VideoCamera, Switch } from '@element-plus/icons-vue'

import { onMounted } from 'vue'
import store from './store'

onMounted(() => {
  window.electronAPI.sendSignal('get-theme-data')
  window.electronAPI.onSignal('update-theme-data', (event, themeDataString) => {
    const themeData = JSON.parse(themeDataString)
    store.AppData.theme = themeData
  })
})
</script>

<template>
  <el-container>
    <el-aside id="menu-container" width="180px">
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
          <span>音视频转码</span>
        </el-menu-item>
      </el-menu>

      <el-button id="theme-btn">
        <el-icon>
          <TurnOff />
        </el-icon>
        主题
      </el-button>
      <themePopup id="theme-popup"></themePopup>
    </el-aside>
    <router-view></router-view>
  </el-container>
</template>

<style>
@import './assets/base.css';

.el-container {
  height: 100vh;
}

.el-menu {
  border-right: none;
}

.el-aside {
  border-right: 1px solid var(--el-menu-border-color);
}
</style>
