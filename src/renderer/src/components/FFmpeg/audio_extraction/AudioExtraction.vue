<script setup>
import { onMounted, onUnmounted, ref, computed } from 'vue'
import { Folder, Check, Delete, Close } from '@element-plus/icons-vue'
import store from '../../../store.js'

console.log('载入AudioExtraction组件')
console.log('store.AudioExtraction.isCustomFolder：', store.AudioExtraction.settings.isCustomFolder)

const loadding = ref({
  progress: 0,
  total: 0
})

const showProgress1 = computed(() => loadding.value.progress == 0)
const showProgress2 = computed(() => loadding.value.progress > 0)
const showProgress = ref(false)
const progressStatus = ref('')
const duration = computed(() => Math.floor(percentage.value / 10))
const percentage = computed(() =>
  Math.floor((loadding.value.progress / loadding.value.total) * 100)
)

let isReadyToUpdateSettings = true
const isReadyToStartAudioExtraction = ref(true)

// 初始化文件列表
store.AudioExtraction.fileList = []

const options = [
  {
    value: false,
    label: '源文件夹'
  },
  {
    value: true,
    label: '自定义文件夹'
  }
]

const handleDelete = (index) => {
  console.log('删除行：', index)
  store.AudioExtraction.fileList.splice(index, 1)
}

const handleDeleteAll = () => {
  console.log('清空列表')
  store.AudioExtraction.fileList = []
  store.AudioExtraction.isEmpty = true
}

const handleSelectChange = (value) => {
  console.log('选择：', value)
  store.AudioExtraction.settings.isCustomFolder = value
  updataSettingsToMain()
}

const updataSettingsToMain = () => {
  console.log('更新设置到主进程')
  const settings = JSON.stringify(store.AudioExtraction.settings)
  window.electronAPI.sendSignal('update-audio-extraction-settings-to-main', settings)
}

const initSettings = () => {
  console.log('初始化音频转换设置')
  listenForSettings()
  window.electronAPI.sendSignal('init-audio-extraction-settings')
}

const listenForSettings = () => {
  if (isReadyToUpdateSettings) {
    console.log('监听音频转换设置')
    isReadyToUpdateSettings = false
    window.electronAPI.onceSignal(
      'update-audio-extraction-settings-to-renderer',
      (event, settings) => {
        console.log('从主进程获取音频转换设置：', settings)
        store.AudioExtraction.settings = JSON.parse(settings)
        console.log('音频转换设置：', store.AudioExtraction.settings)
        isReadyToUpdateSettings = true
      }
    )
  } else {
    console.log('监听音频转换设置失败，已存在')
  }
}

const changeCustomPath = (path) => {
  console.log('手动填写自定义路径', path)
  listenForSettings()
  window.electronAPI.sendSignal('change-audio-extraction-custom-path', path)
}

const selectCustomFolder = () => {
  console.log('选择自定义文件夹')
  listenForSettings()
  window.electronAPI.sendSignal('audio-extraction-select-folder-path')
}

const openCustomFolder = () => {
  window.electronAPI.sendSignal('open-folder', store.AudioExtraction.settings.customFolder)
}

const startAudioExtraction = () => {
  console.log('开始音频转换')
  listenForResult()
  window.electronAPI.sendSignal(
    'start-audio-extraction',
    JSON.stringify(store.AudioExtraction.fileList)
  )
}

const listenForResult = () => {
  if (isReadyToStartAudioExtraction.value) {
    console.log('监听音频转换结果')
    loadding.value.total = store.AudioExtraction.fileList.length
    loadding.value.progress = 0
    progressStatus.value = ''
    showProgress.value = true
    isReadyToStartAudioExtraction.value = false
    window.electronAPI.onceSignal('audio-extraction-done', () => {
      isReadyToStartAudioExtraction.value = true
      progressStatus.value = 'success'
    })
  } else {
    console.log('监听音频转换结果失败，已存在')
  }
}

onMounted(() => {
  initSettings()

  const inputDropArea = document.getElementById('input-drop-area')

  inputDropArea.addEventListener('drop', (event) => {
    // 阻止默认行为，阻止文件打开
    event.preventDefault()
    const files = event.dataTransfer.files

    for (let i = 0; i < files.length; i++) {
      console.log('拖入文件：', files) // 打印文件路径
      // 判断文件类型是否为视频
      if (files[i].type.includes('video')) {
        console.log('是视频文件')
        let notExists = true
        for (let j = 0; j < store.AudioExtraction.fileList.length; j++) {
          console.log('对比文件：', store.AudioExtraction.fileList[j].name)
          if (store.AudioExtraction.fileList[j].name === files[i].name) {
            console.log('文件已存在')
            notExists = false
            break
          }
        }
        if (notExists) {
          const newFile = { name: files[i].name, path: files[i].path, result: '' }
          store.AudioExtraction.fileList.push(newFile)
          console.log('文件添加成功：', newFile)
          store.AudioExtraction.isEmpty = false
        }
      }
    }
    console.log('文件列表：', store.AudioExtraction.fileList)
  })

  inputDropArea.addEventListener('dragover', (event) => {
    // 阻止默认行为，阻止文件打开
    event.preventDefault()
  })

  window.electronAPI.setAudioExtractionListener((dataReceive) => {
    dataReceive = JSON.parse(dataReceive)
    console.log('main发来的文件列表', dataReceive.fileList)
    console.log('main发来的进度', dataReceive.progress)
    store.AudioExtraction.fileList = dataReceive.fileList
    loadding.value.progress = dataReceive.progress
    percentage.value = (loadding.value.progress / loadding.value.total) * 100
  })
})

onUnmounted(() => {
  window.electronAPI.removeAudioExtractionListener()
})
</script>

<template>
  <el-main>
    <el-row>
      <el-col>
        <div id="input-drop-area" class="border-box">
          <div v-if="isEmpty" class="empty">
            <el-empty description="将音频文件拖入此区域" />
          </div>
          <el-table
            :data="store.AudioExtraction.fileList"
            stripe
            style="width: 100%"
            empty-text="将视频文件拖入此区域"
            height="100%"
            :table-layout="auto"
          >
            <el-table-column fixed prop="name" label="文件名" />
            <el-table-column prop="path" label="路径" />
            <el-table-column width="60">
              <template #default="scope">
                <el-button v-if="scope.row.result === 'done'" type="success">
                  <el-icon><Check /></el-icon>
                </el-button>
                <el-button v-if="scope.row.result === 'error'" type="danger">
                  <el-icon><Close /></el-icon>
                </el-button>
              </template>
            </el-table-column>
            <el-table-column width="60">
              <template #header>
                <el-button type="danger" @click="handleDeleteAll">
                  <el-icon><Delete /></el-icon>
                </el-button>
              </template>
              <template #default="scope">
                <el-button type="danger" @click="handleDelete(scope.$index)">
                  <el-icon><Delete /></el-icon>
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </el-col>
    </el-row>
    <el-row gutter="10" align="middle">
      <el-col :span="20">
        <el-text>输出位置：</el-text>
        <el-select
          v-model="store.AudioExtraction.settings.isCustomFolder"
          placeholder="请选择输出位置"
          style="width: 240px"
          @change="handleSelectChange"
        >
          <el-option
            v-for="item in options"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-col>
      <el-col :span="4">
        <el-button
          type="primary"
          :disabled="!isReadyToStartAudioExtraction"
          @click="startAudioExtraction"
          >开始</el-button
        >
      </el-col>
    </el-row>
    <el-row v-if="store.AudioExtraction.settings.isCustomFolder" gutter="10">
      <el-col :span="16">
        <el-input
          v-model="store.AudioExtraction.settings.customFolder"
          :suffix-icon="Folder"
          placeholder="请选择输出位置"
          @change="changeCustomPath"
        ></el-input>
      </el-col>
      <el-col :span="4">
        <el-button @click="selectCustomFolder">选择</el-button>
      </el-col>
      <el-col :span="4">
        <el-button @click="openCustomFolder">打开</el-button>
      </el-col>
    </el-row>
    <el-row>
      <el-col v-if="showProgress" :span="24">
        <el-progress
          v-if="showProgress1"
          :percentage="100"
          :indeterminate="true"
          :format="() => '0%'"
          :stroke-width="10"
        />
        <el-progress
          v-if="showProgress2"
          :percentage="percentage"
          :striped="!isReadyToStartAudioExtraction"
          striped-flow
          :duration="duration"
          :status="progressStatus"
          :indeterminate="!isReadyToStartAudioExtraction"
          :stroke-width="10"
        />
      </el-col>
    </el-row>
  </el-main>
</template>

<style scoped>
#input-drop-area {
  height: calc(100vh - 152px);
}

.empty {
  display: grid;
  align-content: center;
  height: 100%;
}
</style>
