<script setup>
import Siderbar from './components/Siderbar/Siderbar.vue'
import { onMounted } from 'vue'
import store from './store'

onMounted(() => {
  window.electronAPI.sendSignal('get-theme-data')

  window.electronAPI.onSignal('update-theme-data', (event, themeDataString) => {
    const themeData = JSON.parse(themeDataString)
    store.AppData.theme = themeData
  })
})
</script>

<template>
  <div class="app-window">
    <!-- <header>
      <div class="header-title">主页</div>
      <div class="header-right">
        <button class="btn win-btn hover-gray">_</button>
        <button class="btn win-btn hover-gray">口</button>
        <button class="btn win-btn hover-red">X</button>
      </div>
    </header> -->
    <aside>
      <Siderbar></Siderbar>
    </aside>
    <main>
      <router-view></router-view>
    </main>
  </div>
</template>

<style>
@import './assets/base.css';

.app-window {
  display: grid;
  grid-template-areas: 'aside main';
  grid-template-columns: 50px 1fr;
  /* grid-template-rows: 30px 1fr; */
  height: 100vh;
}

button {
  transition: background-color 0.1s;
}

header {
  position: relative;
  grid-area: header;
  /* padding-left: 10px; */
  font-weight: bold;
  line-height: 49px;
  height: 49px;
  font-size: 20px;
  user-select: none;
  background-color: var(--color-background-2);
}

aside {
  grid-area: aside;
  background-color: var(--color-background-2);
}

main {
  grid-area: main;
  height: 100vh;
}

.header-right {
  position: absolute;
  right: 0px;
  top: 0px;
  display: flex;
}

.win-btn {
  user-select: none;
  width: 45px;
  text-align: center;
  line-height: 29px;
  color: var(--color-text-1);
}

.hover-gray:hover {
  background-color: var(--color-background-2);
}

.hover-red:hover {
  background-color: #e81123;
}

.main-title {
  font-size: 1.5em;
  font-weight: bold;
  text-align: center;
  line-height: 50px;
  color: var(--color-text-1);
}
</style>
