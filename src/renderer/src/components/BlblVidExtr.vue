<script setup>
import { onMounted, ref } from 'vue'
import store from '../store'
import { Folder, Warning } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const drawer = ref(false)
const isInputSelected = ref(false)
const isOutputSelected = ref(false)
const isExecutable = ref(false)
const loadingDuration = ref(0)
const loadingPercentage = ref(0)
const isLoading = ref(true)
const isDone = ref(false)
const isError = ref(false)

onMounted(() => {
  window.electronAPI.onceSignal('update-blbl-vid-extr-setting', (event, data) => {
    data = JSON.parse(data)
    console.log('update-blbl-vid-extr-setting', data)
    store.fn1Data = data

    if (store.fn1Data.BDownloadDir !== '') {
      isInputSelected.value = true
    }
    if (store.fn1Data.OutputDir !== '') {
      isOutputSelected.value = true
    }
    if (isInputSelected.value !== '' && isOutputSelected.value !== '') {
      isExecutable.value = true
      console.log('isExecutable', isExecutable.value)
    }
  })
  window.electronAPI.sendSignal('init-blbl-vid-extr')
})

const updateRendererBlblVidExtrCfg = (event, cfg) => {
  cfg = JSON.parse(cfg)
  console.log('更新渲染进程B站视频提取配置', cfg)
  store.fn1Data = cfg
}

const runScript = () => {
  updateMainBlblVidExtrCfg()
  window.electronAPI.onceSignal('send-bve-path-test-result', (event, resultIn, resultOut) => {
    if (!resultIn) {
      ElMessage({
        showClose: true,
        message: '输入路径错误',
        type: 'error',
        duration: 2000
      })
    }
    if (!resultOut) {
      ElMessage({
        showClose: true,
        message: '输出路径错误',
        type: 'error',
        duration: 2000
      })
    }
    if (resultIn && resultOut) {
      isExecutable.value = false
      loadingPercentage.value = 100
      loadingDuration.value = 5
      isLoading.value = true
      isDone.value = false
      isError.value = false
      window.electronAPI.onceSignal('bve-done', (event, result) => {
        isExecutable.value = true
        loadingDuration.value = 0
        if (result === true) {
          isLoading.value = false
          isDone.value = true
          isError.value = false
          window.electronAPI.sendSignal('open-folder', store.fn1Data.outPutDir)
        } else {
          isLoading.value = false
          isDone.value = false
          isError.value = true
        }
      })
    }
  })
  window.electronAPI.sendSignal('run-blbl-vid-extr')
}

const openDownloadFolder = () => {
  window.electronAPI.sendSignal('open-folder', store.fn1Data.BDownloadDir)
}

const openOutputFolder = () => {
  window.electronAPI.sendSignal('open-folder', store.fn1Data.outPutDir)
}

const selectInputFolderPath = () => {
  window.electronAPI.onceSignal('update-renderer-bve-input-path', (event, newPath) => {
    store.fn1Data.BDownloadDir = newPath
    console.log('新输入目录', newPath)
  })
  window.electronAPI.sendSignal('bve-select-input-path')
}

const selectOutputFolderPath = () => {
  window.electronAPI.onceSignal('update-renderer-bve-output-path', (event, newPath) => {
    store.fn1Data.outPutDir = newPath
    console.log('新输出目录', newPath)
  })
  window.electronAPI.sendSignal('bve-select-output-path')
}

const changeCleanOutputDirMode = () => {
  console.log('cleanOutputDir', store.fn1Data.cleanOutputDir)
  updateMainBlblVidExtrCfg()
}

const resetToDefaultInDir = () => {
  store.fn1Data.BDownloadDir = 'E:\\User_files_sync\\Documents\\leidian9\\Pictures'
  updateMainBlblVidExtrCfg()
}

const resetToDefaultOutDir = () => {
  window.electronAPI.onceSignal('update-redner-bve-cfg', updateRendererBlblVidExtrCfg)
  window.electronAPI.sendSignal('reset-to-default-out-dir')
}

const updateMainBlblVidExtrCfg = () => {
  console.log('更新主进程B站视频提取配置', store.fn1Data)
  const cfg = JSON.stringify(store.fn1Data)
  window.electronAPI.sendSignal('update-main-bve-cfg', cfg)
}
</script>

<template>
  <el-container>
    <el-main>
      <el-row>
        <el-input
          v-model="store.fn1Data.BDownloadDir"
          placeholder="请选择额B站视频缓存目录"
          :suffix-icon="Folder"
        ></el-input>
      </el-row>

      <el-row>
        <el-button @click="selectInputFolderPath">选择缓存目录</el-button>
        <el-button :disabled="!isInputSelected" @click="openDownloadFolder">打开缓存目录</el-button>
        <el-button @click="resetToDefaultInDir">恢复默认目录</el-button>
      </el-row>

      <el-row>
        <el-input
          v-model="store.fn1Data.outPutDir"
          placeholder="请选择输出目录"
          :suffix-icon="Folder"
        ></el-input>
      </el-row>

      <el-row>
        <el-button @click="selectOutputFolderPath">选择输出目录</el-button>
        <el-button :disabled="!isOutputSelected" @click="openOutputFolder">打开输出目录</el-button>
        <el-button @click="resetToDefaultOutDir">恢复默认目录</el-button>
      </el-row>

      <el-row>
        <el-button id="run-btn" type="primary" :disabled="!isExecutable" @click="runScript"
          >运行</el-button
        >
        <el-checkbox
          v-model="store.fn1Data.cleanOutputDir"
          border
          class="left-margin"
          @change="changeCleanOutputDirMode"
          >清空输出目录</el-checkbox
        >
        <el-button class="left-margin" :icon="Warning" @click="drawer = true">说明</el-button>
      </el-row>
      <el-row>
        <el-col>
          <div v-if="isLoading">
            <el-progress
              :percentage="loadingPercentage"
              status="warning"
              :indeterminate="true"
              :duration="loadingDuration"
            />
          </div>
          <div v-if="isDone">
            <el-progress
              :percentage="loadingPercentage"
              status="success"
              :indeterminate="true"
              :duration="loadingDuration"
            />
          </div>
          <div v-if="isError">
            <el-progress
              :percentage="loadingPercentage"
              status="danger"
              :indeterminate="true"
              :duration="loadingDuration"
            />
          </div>
        </el-col>
      </el-row>
    </el-main>
  </el-container>

  <el-drawer v-model="drawer" title="B站视频提取使用说明" :direction="rtl">
    <p>如果不清空输出路径，不会更新已存在的文件</p>
  </el-drawer>
</template>

<style scoped>
.el-progress__text {
  min-width: 0;
}

.left-margin {
  margin-left: var(--gap);
}
</style>
