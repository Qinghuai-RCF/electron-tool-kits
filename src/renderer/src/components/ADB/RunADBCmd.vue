<script setup>
import store from '../../store.js'
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowLeft } from '@element-plus/icons-vue'

const router = useRouter()

const currentDevice = store.ADB.currentDevice

const cmd = ref('')

const cmdOutputList = ref([])

const runADBCmd = () => {
  if (cmd.value) {
    window.electronAPI.onceSignal('adb-send-output-to-renderer', (event, output) => {
      console.log('adb命令输出', output)
      cmdOutputList.value.unshift({
        time: new Date().toLocaleTimeString(),
        content: output
      })
    })
    const adbcmd = `adb -s ${currentDevice.ID} ${cmd.value}`
    window.electronAPI.sendSignal('adb-run-cmd', adbcmd)
    console.log('adb命令发送', adbcmd)
    cmdOutputList.value.unshift({
      time: new Date().toLocaleTimeString(),
      content: `发送：${adbcmd}`
    })
  }
}
</script>

<template>
  <el-container>
    <el-main>
      <el-row>
        <!-- 返回上一级 -->
        <el-button :icon="ArrowLeft" @click="router.back()"></el-button>
        <div class="main-title" style="margin-left: 10px; margin-right: 10px">
          {{ currentDevice.name }} ({{ currentDevice.ID }}) / 执行命令
        </div>
      </el-row>
      <el-row>
        <el-text>请省略命令中 adb -s deviceID 的部分</el-text>
      </el-row>
      <el-row>
        <el-input v-model="cmd" placeholder="请输入adb命令"></el-input>
      </el-row>
      <el-row justify="end">
        <el-button @click="runADBCmd">运行</el-button>
      </el-row>
      <el-row>
        <div class="border-padding-box">
          <!-- 根据列表，for 循环遍历生成命令输出 -->
          <el-table ref="tableRef" :data="cmdOutputList" height="calc(100vh - 230px)">
            <el-table-column prop="time" label="时间" width="150"></el-table-column>
            <el-table-column prop="content" label="输出"></el-table-column>
          </el-table>
        </div>
      </el-row>
    </el-main>
  </el-container>
</template>

<style scoped></style>
