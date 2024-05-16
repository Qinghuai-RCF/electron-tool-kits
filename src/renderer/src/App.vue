<script setup>
import { onMounted } from 'vue'
import RootNavigation from './components/RootNavigation.vue'
import { useDark } from '@vueuse/core'

const isDark = useDark({
  storageKey: 'vitepress-theme-appearance'
})

onMounted(() => {
  window.electronAPI.initIsDark((isDarkResult) => {
    isDark.value = isDarkResult
  })
})
</script>

<template>
  <el-container>
    <el-aside width="180px">
      <RootNavigation />
    </el-aside>
    <router-view></router-view>
  </el-container>
</template>

<style>
@import './assets/base.css';

.el-container {
  height: 100vh;
}

.el-aside {
  border-right: 1px solid var(--el-menu-border-color);
}
</style>
