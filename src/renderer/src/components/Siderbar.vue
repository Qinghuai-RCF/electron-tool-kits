<script setup>
const changeToSystemTheme = () => {
  window.electronAPI.sendSignal('system-theme')
}

const changeToLightTheme = () => {
  window.electronAPI.sendSignal('light-theme')
}

const changeToDarkTheme = () => {
  window.electronAPI.sendSignal('dark-theme')
}
</script>

<template>
  <div class="aside-wrap">
    <div class="aside-top">
      <!-- <button class="back-btn" @click="onBackButtonDown">返回</button> -->
      <!-- <router-link :to="..."></router-link> -->
      <!-- <button>主页</button> -->
      <router-link to="/" draggable="false">
        <button class="aside-btn">主页</button>
      </router-link>
    </div>
    <div class="aside-bottom">
      <button class="aside-btn" @click="changeToSystemTheme">系统</button>
      <button class="aside-btn" @click="changeToLightTheme">亮色</button>
      <button class="aside-btn" @click="changeToDarkTheme">暗色</button>
    </div>
  </div>
</template>

<style>
.aside-wrap {
  height: 100%;
}

.aside-bottom {
  position: absolute;
  bottom: 0;
  /* height: 98px; */
}

.aside-btn {
  user-select: none;
  width: 49px;
  text-align: center;
  /* line-height: 29px; */
  line-height: 49px;
  color: var(--color-text);
  height: 50px;
  display: block;
}

.aside-btn:hover {
  background-color: var(--color-background-3);
}
</style>
