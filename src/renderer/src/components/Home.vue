<script setup>
import { ref } from "vue"
const version = ref("0.0.6")
</script>

<template>
  <el-main>
    <h1>当前版本：{{ version }}</h1>
  </el-main>
</template>

<style scoped>
</style>
