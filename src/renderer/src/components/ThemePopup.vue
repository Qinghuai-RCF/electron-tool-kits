<script setup>
import { onMounted } from 'vue'
import { ref } from 'vue'
import store from '../store'

const isPopupVisible = ref(false)

const changeToSystemTheme = () => {
  window.electronAPI.sendSignal('system-theme')
}

const changeToLightTheme = () => {
  window.electronAPI.sendSignal('light-theme')
}

const changeToDarkTheme = () => {
  window.electronAPI.sendSignal('dark-theme')
}

onMounted(() => {
  // 弹窗管理
  const themeBtn = document.getElementById('theme-btn')
  const themePopupObj = document.getElementById('theme-popup')

  document.addEventListener('click', function (e) {
    if (!themeBtn.contains(e.target) && !themePopupObj.contains(e.target)) {
      themeBtn.classList.remove('aside-btn-selected')
      isPopupVisible.value = false
    } else if (themeBtn.contains(e.target)) {
      if (isPopupVisible.value) {
        themeBtn.classList.remove('aside-btn-selected')
        isPopupVisible.value = false
      } else {
        themeBtn.classList.add('aside-btn-selected')
        isPopupVisible.value = true
      }
    }
  })
})
</script>

<template>
  <div v-show="isPopupVisible" class="theme-popup">
    <button class="theme-popup-btn" @click="changeToSystemTheme">
      <div
        class="selection-indicator"
        :class="{ 'selected-theme': store.AppData.theme === 'system' }"
      ></div>
      系统
    </button>
    <button class="theme-popup-btn" @click="changeToLightTheme">
      <div
        class="selection-indicator"
        :class="{ 'selected-theme': store.AppData.theme === 'light' }"
      ></div>
      亮色
    </button>
    <button class="theme-popup-btn" @click="changeToDarkTheme">
      <div
        class="selection-indicator"
        :class="{ 'selected-theme': store.AppData.theme === 'dark' }"
      ></div>
      暗色
    </button>
  </div>
</template>

<style>
.theme-popup {
  /* position: absolute; */
  z-index: 20;
  /* bottom: 0; */
  /* left: 100%; */
  background-color: var(--color-background-2);
  border: 1px solid var(--color-background-3);
}

.theme-popup-btn {
  /* position: relative; */
  width: 100px;
  height: 49px;
  line-height: 49px;
}

.selection-indicator {
  width: 4px;
  height: 100%;
  float: left;
}

.selected-theme {
  background-color: var(--color-selected);
}
</style>
