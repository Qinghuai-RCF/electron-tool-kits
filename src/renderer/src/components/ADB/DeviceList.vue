<script setup>
import { onMounted } from 'vue'
import store from '../../store.js'
import { ElMessageBox } from 'element-plus'
import '../../../../../node_modules/element-plus/theme-chalk/el-message-box.css'
import { useRouter } from 'vue-router'

const router = useRouter()

const local = store.ADB.device
const refreshList = () => {
  window.electronAPI.onceSignal('mcfs-init-to-renderer', (event, data) => {
    data = JSON.parse(data)
    console.log('mcfs-init-to-renderer', data)
    local.deviceLoading = false
    local.deviceList = data[1].map((id, index) => {
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

    local.deviceList.sort((a, b) => {
      if (a.enable && !b.enable) {
        return -1 // a排在b的前面
      } else if (!a.enable && b.enable) {
        return 1 // b排在a的前面
      } else {
        return 0 // 保持不变
      }
    })
  })
  local.deviceLoading = true
  window.electronAPI.sendSignal('mcfs-init')
}

const getNameById = (data, id) => {
  console.log('getNameById', data, id)
  const item = data.find((item) => item.ID === id)
  return item ? item.name : null
}

const selectDevice = (device) => {
  console.log('selectDevice', device.ID)
  // store.ADB.page = 'function_select'
  store.ADB.currentDevice = {
    name: local.deviceList.find((item) => item.ID === device.ID).name,
    ID: device.ID
  }
  local.customDeviceName = local.deviceList.find((item) => item.ID === device.ID).name
  router.push({
    name: 'adb-function-select'
  })
}

const openConfirm = (device) => {
  const txt = `确认删除设备 ${device.name} (${device.ID})
  及其所有预设吗?`
  ElMessageBox.confirm(txt, '警告', {
    confirmButtonText: '确认',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    deleteDevice(device)
  })
}

const deleteDevice = (device) => {
  console.log('删除设备', device.ID)
  window.electronAPI.onceSignal('mcfs-delete-device', device.ID)
}

onMounted(() => {
  // 启动时获取设备名数据以及当前连接设备列表
  refreshList()
})
</script>

<template>
  <el-container>
    <el-main>
      <el-row>
        <el-col>
          <div class="main-title" style="float: left">当前设备</div>
          <div style="float: right">
            <el-button :disabled="local.deviceLoading" @click="refreshList">刷新</el-button>
          </div>
        </el-col>
      </el-row>
      <el-row
        v-loading="local.deviceLoading"
        element-loading-text="正在初始化adb..."
        style="height: calc(100% - 52px)"
      >
        <div class="border-box" style="width: 100%">
          <el-table
            :data="local.deviceList"
            style="width: 100%"
            empty-text="未检测到设备"
            height="100%"
            :default-sort="{ prop: 'enable', order: 'descending' }"
          >
            <el-table-column prop="name" label="设备名" />
            <el-table-column prop="ID" label="设备ID" />
            <el-table-column label="" width="84px">
              <template #default="scope">
                <el-button v-if="scope.row.enable" type="primary" @click="selectDevice(scope.row)">
                  连接
                </el-button>
                <el-button
                  v-if="!scope.row.enable"
                  plain
                  type="danger"
                  @click="openConfirm(scope.row)"
                >
                  删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </el-row>
    </el-main>
  </el-container>
</template>

<style scoped></style>
