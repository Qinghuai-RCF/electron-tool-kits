<script setup>
import store from '../../store.js'
import { EditPen, Switch, Promotion, ArrowLeft } from '@element-plus/icons-vue'
import { ElMessageBox, ElMessage } from 'element-plus'
import '../../../../../node_modules/element-plus/theme-chalk/el-message-box.css'
import { useRouter } from 'vue-router'

const router = useRouter()

const currentDevice = store.ADB.currentDevice
const device = store.ADB.device

const changeCustomDeviceName = () => {
  console.log('changeCustomDeviceName', currentDevice.ID)
  ElMessageBox.prompt('请输入新设备名', '设备重命名', {
    confirmButtonText: '确认',
    cancelButtonText: '取消',
    // inputPattern: /.*\S+.*/,
    inputErrorMessage: '设备名不能为空'
  }).then(({ value }) => {
    console.log('新设备名', value)
    if (value !== null) {
      if (value.trim() !== '') {
        value = value.trim()
      } else {
        value = ''
      }
    } else {
      value = ''
    }
    const newName = value
    console.log('新设备名', newName)

    let changeFlag = false

    for (let tDevice of device.deviceList) {
      if (tDevice.ID === currentDevice.ID) {
        // 修改name属性
        tDevice.name = newName
        console.log(`设备ID ${tDevice.ID} 的名称已更新为 ${tDevice.name}`)
        saveDeviceName()
        refreshList()
        currentDevice.name = newName

        changeFlag = true

        ElMessage({
          showClose: true,
          type: 'success',
          message: `已更新 ${tDevice.ID} 设备名为: ${tDevice.name}`
        })
        return // 找到并修改后退出函数
      }
    }

    if (!changeFlag) {
      ElMessage({
        showClose: true,
        type: 'error',
        message: `未找到设备ID ${currentDevice.ID}, 设备重命名失败`
      })
    }
  })
}

const saveDeviceName = () => {
  window.electronAPI.sendSignal('mcfs-save-device-name', JSON.stringify(device.deviceList))
}

const refreshList = () => {
  window.electronAPI.onceSignal('mcfs-init-to-renderer', (event, data) => {
    data = JSON.parse(data)
    console.log('mcfs-init-to-renderer', data)
    device.deviceLoading = false
    device.deviceList = data[1].map((id, index) => {
      const tName = getNameById(data[1], id.ID)
      console.log('设备名', tName)
      let name
      let enable
      if (data[0].find((item) => item === id.ID)) {
        enable = true
      } else {
        enable = false
      }
      if (tName) {
        name = tName
      } else {
        name = `设备${index + 1}`
      }
      return {
        name: name,
        ID: id.ID,
        enable: enable
      }
    })

    device.deviceList.sort((a, b) => {
      if (a.enable && !b.enable) {
        return -1 // a排在b的前面
      } else if (!a.enable && b.enable) {
        return 1 // b排在a的前面
      } else {
        return 0 // 保持不变
      }
    })
  })
  device.deviceLoading = true
  window.electronAPI.sendSignal('mcfs-init')
}

const getNameById = (data, id) => {
  console.log('getNameById', data, id)
  const item = data.find((item) => item.ID === id)
  return item ? item.name : null
}
</script>

<template>
  <el-container>
    <el-main>
      <el-row>
        <!-- 返回上一级 -->
        <el-button :icon="ArrowLeft" @click="router.back()"></el-button>
        <div class="main-title" style="margin-left: 10px; margin-right: 10px">
          {{ currentDevice.name }} ({{ currentDevice.ID }})
        </div>
        <el-button @click="changeCustomDeviceName()">
          <el-icon><EditPen /></el-icon>
          <el-text>更名</el-text>
        </el-button>
      </el-row>
      <el-row>
        <el-button :icon="Switch" @click="router.push({ name: 'mobile-computer-file-sync' })">
          文件同步
        </el-button>
        <el-button :icon="Promotion" @click="router.push({ name: 'run-adb-cmd' })">
          执行命令
        </el-button>
      </el-row>
    </el-main>
  </el-container>
</template>

<style scoped></style>
