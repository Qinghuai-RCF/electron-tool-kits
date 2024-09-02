<script setup>
import { ref, onMounted } from 'vue'
import { Right, Back, Monitor, Iphone, EditPen, WarningFilled } from '@element-plus/icons-vue'
import { ElMessageBox, ElMessage } from 'element-plus'
import { SuccessFilled, CircleCloseFilled } from '@element-plus/icons-vue'
import store from '../../store.js'
import '../../../../../node_modules/element-plus/theme-chalk/el-message-box.css'

const deviceLoading = ref(false)
const isDeviceSelected = ref(false)
const isFolder = ref(false)
const sycning = ref(false)

const phonePathMatchingStatus = ref('0')
// 0: 路径为空
// 1: 路径错误
// 2: 路径匹配成功
const computerPathMatchingStatus = ref('0')
// 0: 路径为空
// 1: 路径错误
// 2: 路径匹配成功

const currentPresetOption = ref('')
let tempPresetOption = null
const presetsOption = ref([])

const currentDevice = ref({})

const onIsFolderChange = () => {
  console.log('onIsFolderChange')
  checkComputerPath()
  checkPhonePath()
  refreshFileStatus()
}

const customDeviceName = ref('设备1')

const deviceList = ref([])

const phonePath = ref('')
const computerPath = ref('')

const fileStatus = ref({
  phoneFileTime: '',
  phoneFileNew: false,
  computerFileTime: '',
  computerFileNew: false,
  buttonDisabled: true
})

onMounted(() => {
  // 启动时获取设备名数据以及当前连接设备列表
  refreshList()
  initSettingsAndPresets()
})

const onPresetOptionChange = () => {
  console.log('onPresetOptionChange', currentPresetOption.value)
  for (let tOption of presetsOption.value) {
    if (tOption.value === currentPresetOption.value) {
      console.log('当前选择的预设选项', tOption.label)
      const preset = store.MobileComputerFileSync.presets[currentDevice.value.ID][tOption.label]
      console.log('当前选择的预设数据', preset)
      phonePath.value = preset.phonePath
      computerPath.value = preset.computerPath
      isFolder.value = preset.isFolder
      phonePathMatchingStatus.value = '2'
      computerPathMatchingStatus.value = '2'
      checkPhonePath()
      checkComputerPath()
      refreshFileStatus()
      break
    }
  }
}

const onOpenComputerPathBtnDown = () => {
  console.log('onOpenComputerPathBtnDown')
  window.electronAPI.sendSignal('mcfs-open-computer-path', computerPath.value)
}

const onSyncButtonDown = (direction) => {
  console.log('onSyncButtonDown', direction)
  let type
  let backupText
  let directionText
  if (direction === 'phone2computer') {
    directionText = '<手机> 同步到 <电脑>'
  } else if (direction === 'computer2phone') {
    directionText = '<电脑> 同步到 <手机>'
  }
  if (isFolder.value) {
    type = '<文件夹>'
  } else {
    type = '<文件>'
  }
  if (store.MobileComputerFileSync.settings.isBackup) {
    backupText = '并 <备份>'
  } else {
    backupText = ''
  }
  ElMessageBox.confirm(`确认将 ${type} 从 ${directionText} ${backupText} 吗？`, '警告', {
    confirmButtonText: '确认',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(() => {
      startSync(direction)
    })
    .catch(() => {
      ElMessage({
        type: 'info',
        message: '同步操作取消'
      })
    })
}

const startSync = (direction) => {
  console.log('startSync', direction)
  window.electronAPI.onceSignal('mcfs-sync-result', (event, result) => {
    result = JSON.parse(result)
    console.log('mcfs-sync-result', result)
    sycning.value = false
    if (result.sycnResult) {
      ElMessage({
        type: 'success',
        message: '同步成功'
      })
    } else {
      ElMessage({
        type: 'error',
        message: '同步失败'
      })
    }
    if (result.backupError) {
      ElMessage({
        type: 'error',
        message: '备份失败'
      })
    }
  })

  sycning.value = true
  const data = {
    direction: direction,
    phonePath: phonePath.value,
    computerPath: computerPath.value,
    isBackup: store.MobileComputerFileSync.settings.isBackup,
    isFolder: isFolder.value,
    deviceID: currentDevice.value.ID
  }
  window.electronAPI.sendSignal('mcfs-start-sync', JSON.stringify(data))
}

const refreshList = () => {
  window.electronAPI.onceSignal('mcfs-init-to-renderer', (event, data) => {
    data = JSON.parse(data)
    console.log('mcfs-init-to-renderer', data)
    deviceLoading.value = false
    deviceList.value = data[1].map((id, index) => {
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

    deviceList.value.sort((a, b) => {
      if (a.enable && !b.enable) {
        return -1 // a排在b的前面
      } else if (!a.enable && b.enable) {
        return 1 // b排在a的前面
      } else {
        return 0 // 保持不变
      }
    })
  })
  deviceLoading.value = true
  window.electronAPI.sendSignal('mcfs-init')
}

const getNameById = (data, id) => {
  console.log('getNameById', data, id)
  const item = data.find((item) => item.ID === id)
  return item ? item.name : null
}

const deleteDevice = (device) => {
  console.log('删除设备', device.ID)
  window.electronAPI.onceSignal('mcfs-delete-device', device.ID)
}

const selectDevice = (device) => {
  console.log('selectDevice', device.ID)
  isDeviceSelected.value = true
  currentDevice.value = {
    name: deviceList.value.find((item) => item.ID === device.ID).name,
    ID: device.ID
  }
  customDeviceName.value = deviceList.value.find((item) => item.ID === device.ID).name
  currentPresetOption.value = ''
  resetAllData()

  // 初始化预设选项
  generatePresetOptions(device.ID)
}

const changeCustomDeviceName = (device) => {
  console.log('changeCustomDeviceName', device.ID)
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
    ElMessage({
      type: 'success',
      message: `已更新 ${device.ID} 设备名为: ${newName}`
    })

    for (let tDevice of deviceList.value) {
      if (tDevice.ID === device.ID) {
        // 修改name属性
        tDevice.name = newName
        console.log(`设备ID ${device.ID} 的名称已更新为 ${newName}`)
        saveDeviceName()
        refreshList()
        currentDevice.value.name = newName
        return // 找到并修改后退出函数
      }
    }
  })
}

const saveDeviceName = () => {
  window.electronAPI.sendSignal('mcfs-save-device-name', JSON.stringify(deviceList.value))
}

const resetAllData = () => {
  console.log('resetAllData')
  currentPresetOption.value = ''
  phonePath.value = ''
  computerPath.value = ''
  phonePathMatchingStatus.value = '0'
  computerPathMatchingStatus.value = '0'
  // fileStatus.value.phoneFileTime = ''
  // fileStatus.value.phoneFileNew = false
  // fileStatus.value.computerFileTime = ''
  // fileStatus.value.computerFileNew = false
  // fileStatus.value.buttonDisabled = true
  // refreshFileStatus()
}

const refreshFileStatus = () => {
  console.log('refreshFileStatus', phonePathMatchingStatus.value, computerPathMatchingStatus.value)
  // 判断两个输入框不为空
  if (phonePathMatchingStatus.value === '2' && computerPathMatchingStatus.value === '2') {
    console.log('两路径不为空且匹配，开始刷新文件状态')
    window.electronAPI.onceSignal('mcfs-refresh-file-status-to-renderer', (event, data) => {
      data = JSON.parse(data)
      console.log('获得的文件时间', data)
      fileStatus.value.phoneFileTime = data.phoneFileTime
      fileStatus.value.computerFileTime = data.computerFileTime
      if (data.phone && data.computer) {
        fileStatus.value.buttonDisabled = false
        if (data.phoneFileTime > data.computerFileTime) {
          fileStatus.value.phoneFileNew = true
          fileStatus.value.computerFileNew = false
        } else if (data.phoneFileTime < data.computerFileTime) {
          fileStatus.value.phoneFileNew = false
          fileStatus.value.computerFileNew = true
        } else {
          fileStatus.value.phoneFileNew = false
          fileStatus.value.computerFileNew = false
        }
      }
    })
    window.electronAPI.sendSignal('mcfs-refresh-file-status')
    // 检查手机和电脑文件的修改时间，对比新旧，更新文件状态变量
    // 启用按钮

    // 临时
    fileStatus.value.buttonDisabled = false
  } else {
    fileStatus.value.buttonDisabled = true
  }
}

const selectComputerPath = () => {
  window.electronAPI.onceSignal('mcfs-select-computer-file-path-to-renderer', (event, path) => {
    console.log('选择的电脑文件路径', path)
    computerPath.value = path
    checkComputerPath()
  })
  if (isFolder.value) {
    window.electronAPI.sendSignal('mcfs-select-computer-file-path', 'folder')
  } else {
    window.electronAPI.sendSignal('mcfs-select-computer-file-path', 'file')
  }
}

const selectPhonePath = () => {
  window.electronAPI.onceSignal('mcfs-select-phone-file-path-to-renderer', (event, path) => {
    console.log('选择的手机文件路径', path)
  })
  // 使用adb命令打开手机shell
  // 可暂时不做，因为手机文件路径的选择比较复杂，暂时不支持
  window.electronAPI.sendSignal('mcfs-select-phone-file-path')
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

const initSettingsAndPresets = () => {
  // 获取预设数据以及是否开启备份
  settingsAndPresetsListenerOnce()
  window.electronAPI.sendSignal('mcfs-init-settings-and-presets')
}

const generatePresetOptions = (ID) => {
  presetsOption.value = []
  if (store.MobileComputerFileSync.presets[ID]) {
    const presets = store.MobileComputerFileSync.presets[ID]
    for (const presetName in presets) {
      presetsOption.value.push({
        value: presetName,
        label: presetName
      })
    }
  }
}

const onPhonePathInput = () => {
  console.log('onPhonePathInput')
  if (phonePath.value !== '') {
    console.log('路径不为空,开始检查路径类型是否正确且类型匹配')
    checkPhonePath()
  } else {
    phonePathMatchingStatus.value = '0'
    refreshFileStatus()
  }
}

const onComputerPathInput = () => {
  console.log('onComputerPathInput')
  if (computerPath.value !== '') {
    console.log('路径不为空,开始检查路径类型是否正确且类型匹配')
    checkComputerPath()
  } else {
    computerPathMatchingStatus.value = '0'
    refreshFileStatus()
  }
}

const checkPhonePath = () => {
  console.log('checkPhonePath')
  // 检查手机路径是否存在且是否与预设类型匹配
  if (phonePath.value !== '') {
    window.electronAPI.onceSignal('mcfs-send-phone-path-type-to-renderer', (event, type) => {
      console.log('手机路径类型', type)
      if (
        (type === 'folder' && isFolder.value === true) ||
        (type === 'file' && isFolder.value === false)
      ) {
        console.log('手机路径类型匹配')
        phonePathMatchingStatus.value = '2'
      } else {
        console.log('手机路径类型不匹配或错误')
        phonePathMatchingStatus.value = '1'
      }
      refreshFileStatus()
    })
    window.electronAPI.sendSignal('mcfs-check-phone-path-type', {
      phonePath: phonePath.value,
      deviceID: currentDevice.value.ID
    })
  }
}

const checkComputerPath = () => {
  console.log('checkComputerPath')
  // 检查电脑路径是否存在且是否与预设类型匹配
  if (computerPath.value !== '') {
    window.electronAPI.onceSignal('mcfs-send-computer-path-type-to-renderer', (event, type) => {
      console.log('电脑路径类型', type)
      if (
        (type === 'folder' && isFolder.value === true) ||
        (type === 'file' && isFolder.value === false)
      ) {
        console.log('电脑路径类型匹配')
        computerPathMatchingStatus.value = '2'
      } else {
        console.log('电脑路径类型不匹配或错误')
        computerPathMatchingStatus.value = '1'
      }
      refreshFileStatus()
    })
    window.electronAPI.sendSignal('mcfs-check-computer-path-type', computerPath.value)
  }
}

const onIsBackupChange = () => {
  console.log('onIsBackupChange')
  console.log('sendIsBackupValue', store.MobileComputerFileSync.settings.isBackup)
  window.electronAPI.sendSignal(
    'mcfs-change-backup-config',
    store.MobileComputerFileSync.settings.isBackup
  )
}

const OnSavePresetBtnDown = () => {
  console.log('OnSavePresetBtnDown')
  if (currentPresetOption.value === '') {
    ElMessageBox.prompt('请输入预设名', '保存预设', {
      confirmButtonText: '确认',
      cancelButtonText: '取消',
      inputPattern: /.*\S+.*/,
      inputErrorMessage: '预设名不能为空'
    }).then(({ value }) => {
      ElMessage({
        type: 'success',
        message: `已保存预设: ${value}`
      })
      savePresetAs(value)
    })
  } else {
    savePreset(currentPresetOption.value)
  }
}

const OnSavePresetAsBtnDown = () => {
  console.log('OnSavePresetAsBtnDown')
  ElMessageBox.prompt('请输入预设名', '保存预设', {
    confirmButtonText: '确认',
    cancelButtonText: '取消',
    inputPattern: /.*\S+.*/,
    inputErrorMessage: '预设名不能为空'
  }).then(({ value }) => {
    ElMessage({
      type: 'success',
      message: `已保存预设: ${value}`
    })
    savePresetAs(value)
  })
}

const OnDeletePresetBtnDown = () => {
  console.log('OnDeletePresetBtnDown')
  deletePreset()
}

const OnRenamePresetBtnDown = () => {
  console.log('OnRenamePresetBtnDown')
  ElMessageBox.prompt('请输入新预设名', '重命名预设', {
    confirmButtonText: '确认',
    cancelButtonText: '取消',
    inputPattern: /.*\S+.*/,
    inputErrorMessage: '新预设名不能为空'
  }).then(({ value }) => {
    ElMessage({
      type: 'success',
      message: `预设重命名为: ${value}`
    })
    renamePreset(value)
  })
}

const OnResetPresetBtnDown = () => {
  console.log('OnResetPresetBtnDown')
  onPresetOptionChange()
}

const savePreset = (name) => {
  console.log('savePreset')
  // 保存当前预设
  const data = {
    operation: 'save',
    deviceID: currentDevice.value.ID,
    presetName: name,
    preset: {
      phonePath: phonePath.value,
      computerPath: computerPath.value,
      isFolder: isFolder.value
    }
  }
  settingsAndPresetsListenerOnce(currentDevice.value.ID)
  window.electronAPI.sendSignal('mcfs-preset-operation', JSON.stringify(data))
}

const savePresetAs = (name) => {
  console.log('savePresetAs')
  // 去除预设名前后空格
  name = name.trim()
  // 保存当前预设
  const data = {
    operation: 'save',
    deviceID: currentDevice.value.ID,
    presetName: name,
    preset: {
      phonePath: phonePath.value,
      computerPath: computerPath.value,
      isFolder: isFolder.value
    }
  }
  settingsAndPresetsListenerOnce(currentDevice.value.ID)
  tempPresetOption = name
  window.electronAPI.sendSignal('mcfs-preset-operation', JSON.stringify(data))
}

const deletePreset = () => {
  console.log('deletePreset')
  // 删除当前预设
  const data = {
    operation: 'delete',
    deviceID: currentDevice.value.ID,
    presetName: currentPresetOption.value
  }
  settingsAndPresetsListenerOnce(currentDevice.value.ID)
  window.electronAPI.sendSignal('mcfs-preset-operation', JSON.stringify(data))
  resetAllData()
}

const renamePreset = (name) => {
  console.log('renamePreset')
  const delData = {
    operation: 'delete',
    deviceID: currentDevice.value.ID,
    presetName: currentPresetOption.value.label
  }
  const addData = {
    operation: 'save',
    deviceID: currentDevice.value.ID,
    presetName: name,
    preset: {
      phonePath: phonePath.value,
      computerPath: computerPath.value,
      isFolder: isFolder.value
    }
  }
  // 删除当前预设
  settingsAndPresetsListenerOnce(currentDevice.value.ID)
  window.electronAPI.sendSignal('mcfs-preset-operation', JSON.stringify(delData))
  settingsAndPresetsListenerOnce(currentDevice.value.ID)
  window.electronAPI.sendSignal('mcfs-preset-operation', JSON.stringify(addData))
}

const settingsAndPresetsListenerOnce = (id = null) => {
  console.log('settingsAndPresetsListenerOnce', id)
  window.electronAPI.onceSignal('mcfs-init-settings-and-presets-to-renderer', (event, data) => {
    data = JSON.parse(data)
    console.log('mcfs-init-settings-and-presets-to-renderer', data)
    store.MobileComputerFileSync = data
    if (id) {
      generatePresetOptions(id)
      if (tempPresetOption) {
        currentPresetOption.value = tempPresetOption
        tempPresetOption = null
      }
      onPresetOptionChange()
    }
  })
}
</script>

<template>
  <el-container>
    <el-main v-if="!isDeviceSelected">
      <el-row>
        <el-col>
          <div class="main-title" style="float: left">当前设备</div>
          <div style="float: right">
            <el-button :disabled="deviceLoading" @click="refreshList">刷新</el-button>
          </div>
        </el-col>
      </el-row>
      <el-row
        v-loading="deviceLoading"
        element-loading-text="正在初始化adb..."
        style="height: calc(100% - 52px)"
      >
        <div class="border-box" style="width: 100%">
          <el-table
            :data="deviceList"
            style="width: 100%"
            empty-text="未检测到设备"
            height="100%"
            :default-sort="{ prop: 'enable', order: 'descending' }"
          >
            <el-table-column prop="name" label="设备名" />
            <el-table-column prop="ID" label="设备ID" />
            <el-table-column label="" width="170">
              <template #default="scope">
                <el-button @click="changeCustomDeviceName(scope.row)"> 重命名 </el-button>

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

    <!-- 已选择设备 -->
    <el-main v-if="isDeviceSelected">
      <el-row>
        <el-button @click="isDeviceSelected = false">返回</el-button>
        <div class="main-title" style="margin-left: 10px; margin-right: 10px">
          {{ currentDevice.name }} ({{ currentDevice.ID }})
        </div>
        <el-button @click="changeCustomDeviceName(currentDevice)">
          <el-icon><EditPen /></el-icon>
          <el-text>更名</el-text>
        </el-button>
      </el-row>
      <el-row>
        <el-col :span="24">
          <div class="title" style="float: left">预设</div>
          <div style="float: right">
            <el-row gutter="10">
              <el-col :span="4">
                <el-button :disabled="currentPresetOption === ''" @click="OnDeletePresetBtnDown"
                  >删除</el-button
                >
              </el-col>
              <el-col :span="4">
                <el-button :disabled="currentPresetOption === ''" @click="OnResetPresetBtnDown"
                  >重置</el-button
                >
              </el-col>
              <el-col :span="6">
                <el-button
                  :disabled="phonePathMatchingStatus !== '2' || computerPathMatchingStatus !== '2'"
                  @click="OnRenamePresetBtnDown"
                  >重命名</el-button
                >
              </el-col>
              <el-col :span="6">
                <el-button
                  :disabled="phonePathMatchingStatus !== '2' || computerPathMatchingStatus !== '2'"
                  @click="OnSavePresetAsBtnDown"
                  >另存为</el-button
                >
              </el-col>
              <el-col :span="4">
                <el-button
                  :disabled="phonePathMatchingStatus !== '2' || computerPathMatchingStatus !== '2'"
                  @click="OnSavePresetBtnDown"
                  >保存</el-button
                >
              </el-col>
            </el-row>
          </div>
        </el-col>
      </el-row>
      <el-row>
        <el-col>
          <el-select
            v-model="currentPresetOption"
            placeholder="选择预设"
            @change="onPresetOptionChange"
          >
            <el-option
              v-for="item in presetsOption"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-col>
      </el-row>

      <el-row>
        <el-col>
          <div style="float: left">
            <div class="title" style="float: left">同步设置</div>
          </div>
          <div style="float: right">
            <el-text style="margin-right: 10px">文件夹模式</el-text>
            <el-switch v-model="isFolder" @click="onIsFolderChange" />
          </div>
        </el-col>
      </el-row>
      <el-row>
        <div class="border-padding-box">
          <el-row>
            <el-col :span="18">
              <div style="float: left">
                <div style="float: left"><el-text>手机文件路径</el-text></div>
              </div>
              <div>
                <div
                  v-if="phonePathMatchingStatus === '1'"
                  class="path-maching-status-seccess float-left"
                >
                  <div class="path-matching-status-icon">
                    <el-icon color="rgb(245, 108, 108)">
                      <CircleCloseFilled />
                    </el-icon>
                  </div>
                  <el-text class="path-matching-status-test" type="danger"
                    >路径类型不匹配或错误</el-text
                  >
                </div>
                <div
                  v-if="phonePathMatchingStatus === '2'"
                  class="path-maching-status-seccess float-left"
                >
                  <div class="path-matching-status-icon">
                    <el-icon color="rgb(103, 194, 58)">
                      <SuccessFilled />
                    </el-icon>
                  </div>
                  <el-text class="path-matching-status-test" type="success"></el-text>
                </div>
              </div>
            </el-col>
            <el-col :span="6">
              <el-button disabled @click="selectPhonePath">暂不支持选择</el-button>
            </el-col>
          </el-row>
          <el-row>
            <el-input
              v-model="phonePath"
              type="textarea"
              placeholder="选择或输入手机文件路径"
              autosize
              resize="none"
              spellcheck="false"
              @input="onPhonePathInput"
            />
          </el-row>
          <el-row>
            <el-text type="warning">
              <el-icon><WarningFilled /></el-icon>
              安卓文件路径示例：/sdcard/DCIM/Camera
            </el-text>
          </el-row>
          <el-row>
            <el-text type="warning">
              <el-icon><WarningFilled /></el-icon>
              暂不支持符号链接路径（路径匹配功能目前无法识别符号路径）
            </el-text>
          </el-row>
          <el-row></el-row>
          <el-row gutter="10">
            <el-col :span="18">
              <div style="float: left">
                <div style="float: left"><el-text>电脑文件路径</el-text></div>
              </div>
              <div>
                <div
                  v-if="computerPathMatchingStatus === '1'"
                  class="path-maching-status-seccess float-left"
                >
                  <div class="path-matching-status-icon">
                    <el-icon color="rgb(245, 108, 108)">
                      <CircleCloseFilled />
                    </el-icon>
                  </div>
                  <el-text class="path-matching-status-test" type="danger"
                    >路径类型不匹配或错误</el-text
                  >
                </div>
                <div
                  v-if="computerPathMatchingStatus === '2'"
                  class="path-maching-status-seccess float-left"
                >
                  <div class="path-matching-status-icon">
                    <el-icon color="rgb(103, 194, 58)">
                      <SuccessFilled />
                    </el-icon>
                  </div>
                  <el-text class="path-matching-status-test" type="success"></el-text>
                </div>
              </div>
            </el-col>
            <el-col :span="3">
              <el-button :disabled="!computerPath" @click="onOpenComputerPathBtnDown"
                >打开</el-button
              >
            </el-col>
            <el-col :span="3">
              <el-button @click="selectComputerPath">选择</el-button>
            </el-col>
          </el-row>
          <el-row>
            <el-input
              v-model="computerPath"
              type="textarea"
              placeholder="选择或输入电脑文件路径"
              autosize
              resize="none"
              spellcheck="false"
              @input="onComputerPathInput"
            />
          </el-row>
        </div>
      </el-row>

      <el-row>
        <el-col>
          <div class="title" style="float: left">同步方向</div>
          <div style="float: right">
            <el-row gutter="10">
              <el-col span="12">
                <el-button disabled>刷新文件状态</el-button>
              </el-col>
              <el-col span="12">
                <el-text style="margin-right: 10px">备份</el-text>
                <el-switch
                  v-model="store.MobileComputerFileSync.settings.isBackup"
                  @change="onIsBackupChange"
                />
              </el-col>
            </el-row>
          </div>
        </el-col>
      </el-row>
      <div class="border-padding-box">
        <el-row v-loading="sycning">
          <el-col :span="8">
            <el-row justify="center" align="middle" style="height: 100%">
              <el-badge :show-zero="false" :value="fileStatus.computer" :offset="[-15, 0]">
                <el-icon size="60"><Monitor /></el-icon>
              </el-badge>
            </el-row>
          </el-col>
          <el-col :span="8">
            <el-row>
              <el-button
                :disabled="fileStatus.buttonDisabled"
                type="primary"
                @click="onSyncButtonDown('computer2phone')"
              >
                <el-icon><Right /></el-icon>
              </el-button>
            </el-row>
            <el-row>
              <el-button
                :disabled="fileStatus.buttonDisabled"
                type="primary"
                @click="onSyncButtonDown('phone2computer')"
              >
                <el-icon><Back /></el-icon>
              </el-button>
            </el-row>
          </el-col>
          <el-col :span="8">
            <el-row justify="center" align="middle" style="height: 100%">
              <el-badge :show-zero="false" :value="fileStatus.phone" :offset="[-15, 0]">
                <el-icon size="60"><Iphone /></el-icon>
              </el-badge>
            </el-row>
          </el-col>
        </el-row>
        <el-row>
          <el-text type="warning">
            <el-icon><WarningFilled /></el-icon>
            暂无文件状态功能 暂不支持手机端文件备份
          </el-text>
        </el-row>
      </div>
    </el-main>
  </el-container>
</template>

<style scoped>
.box {
  width: 330px;
}

.path-matching-status-icon {
  display: grid;
  float: left;
  margin-left: 10px;
  margin-right: 5px;
  height: 28.8px;
  align-items: center;
}
.path-matching-status-test {
  float: left;
  height: 28.8px;
  align-items: center;
  display: grid;
}

.float-left {
  float: left;
}
</style>
