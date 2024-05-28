import * as VueRouter from 'vue-router'

import Home from '../components/Home.vue'
import BlblVidExtr from '../components/BlblVidExtr.vue'
import FolderRemarks from '../components/folder_remarks/FolderRemarks.vue'
import AudioExtraction from '../components/FFmpeg/audio_extraction/AudioExtraction.vue'
import MobileComputerFileSyn from '../components/mobile-computer_file_sync/Mobile-Computer_File_Sync.vue'

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
      name: 'mobile-computer-file-sync',
      path: '/mobile-computer-file-sync',
      component: MobileComputerFileSyn
    }
  ]
})

export default router
