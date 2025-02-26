import * as VueRouter from 'vue-router'

import Home from '../components/Home.vue'
import BlblVidExtr from '../components/BlblVidExtr.vue'
import FolderRemarks from '../components/folder_remarks/FolderRemarks.vue'
import AudioExtraction from '../components/FFmpeg/audio_extraction/AudioExtraction.vue'
import ADB from '../components/ADB/DeviceList.vue'
import FunctionSelect from '../components/ADB/FunctionSelect.vue'
import MobileComputerFileSync from '../components/ADB/MobileComputerFileSync.vue'
import RunADBCmd from '../components/ADB/RunADBCmd.vue'

const router = VueRouter.createRouter({
  history: VueRouter.createWebHashHistory(),
  routes: [
    {
      name: 'home',
      path: '/',
      component: Home
    },
    {
      name: 'fn-1',
      path: '/fn-1',
      component: BlblVidExtr
    },
    {
      name: 'folder-remarks',
      path: '/folder-remarks',
      component: FolderRemarks
    },
    {
      name: 'audio-extraction',
      path: '/audio-extraction',
      component: AudioExtraction
    },
    {
      name: 'adb',
      path: '/adb',
      component: ADB
    },
    {
      name: 'adb-function-select',
      path: '/adb/adb-function-select',
      component: FunctionSelect
    },
    {
      name: 'mobile-computer-file-sync',
      path: '/adb/mobile-computer-file-sync',
      component: MobileComputerFileSync
    },
    {
      name: 'run-adb-cmd',
      path: '/adb/run-adb-cmd',
      component: RunADBCmd
    }
  ]
})

export default router
