<script setup>
import { ref } from 'vue'

// 打开开发者工具

const version = ref('1.0.0')

const openDevTools = () => {
  window.electronAPI.sendOpenDevTools()
}
</script>

<template>
  <el-main>
    <h1>当前版本：{{ version }}</h1>
    <el-button @click="openDevTools">开发者工具</el-button>
  </el-main>
</template>

<style scoped></style>
