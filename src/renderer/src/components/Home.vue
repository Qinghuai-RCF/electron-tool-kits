<script setup>
import { ref } from 'vue'
import store from '../store'
const version = ref('1.0.3')

// 打开开发者工具
const openDevTools = () => {
  window.electronAPI.sendOpenDevTools()
}

const themeOptions = [
  {
    value: 'system',
    label: '系统'
  },
  {
    value: 'light',
    label: '明亮'
  },
  {
    value: 'dark',
    label: '黑暗'
  }
]

const changeToSystemTheme = () => {
  window.electronAPI.sendSignal('system-theme')
}

const changeToLightTheme = () => {
  window.electronAPI.sendSignal('light-theme')
}

const changeToDarkTheme = () => {
  window.electronAPI.sendSignal('dark-theme')
}

const changeTheme = (value) => {
  if (value === 'system') {
    changeToSystemTheme()
  } else if (value === 'light') {
    changeToLightTheme()
  } else if (value === 'dark') {
    changeToDarkTheme()
  }
}
</script>

<template>
  <el-main>
    <h1>当前版本：{{ version }}</h1>
    <el-row>
      <el-button @click="openDevTools">开发者工具</el-button>
    </el-row>
    <el-row>
      <el-text style="margin-right: var(--gap)">主题</el-text>
      <el-select
        v-model="store.AppData.theme"
        placeholder="选择主题"
        style="width: 240px"
        @change="changeTheme"
      >
        <el-option
          v-for="item in themeOptions"
          :key="item.value"
          :label="item.label"
          :value="item.value"
        />
      </el-select>
    </el-row>
  </el-main>
</template>

<style scoped></style>
