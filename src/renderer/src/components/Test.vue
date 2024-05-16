<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const num = ref(0)

const numPlus = () => {
  window.electronAPI.sendTest()
}

onMounted(() => {
  console.log('挂载测试组件')
  window.electronAPI.initTestListeners((data) => {
    console.log('preload发来的数据', data)
    num.value = data
    console.log(num)
  })
})

onUnmounted(() => {
  console.log('卸载测试组件')
  window.electronAPI.uninitTestListeners()
})
</script>

<template>
  <el-main>
    <el-row>
      <el-text>测试数据互传</el-text>
    </el-row>
    <el-row>
      <el-button type="primary" @click="numPlus()">加一</el-button>
    </el-row>
    <el-row>
      <el-col span="12">
        <p>{{ num }}</p>
      </el-col>
    </el-row>
  </el-main>
</template>
