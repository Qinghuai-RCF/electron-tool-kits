<script setup lang="ts">
import Siderbar from './components/Siderbar.vue'
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

/* code {
  font-weight: 600;
  padding: 3px 5px;
  border-radius: 2px;
  background-color: var(--color-background-mute);
  font-family:
    ui-monospace,
    SFMono-Regular,
    SF Mono,
    Menlo,
    Consolas,
    Liberation Mono,
    monospace;
  font-size: 85%;
} */

.app-window {
  display: grid;
  grid-template-areas: 'aside main';
  grid-template-columns: 50px 1fr;
  /* grid-template-rows: 30px 1fr; */
  height: 100vh;
}

button {
  /* transition: background-color 0.2s; */
  transition: background-color 0.1s;
}

header {
  position: relative;
  grid-area: header;
  /* background-color: var(--color-background); */
  /* text-align: center; */
  padding-left: 10px;
  font-weight: bold;
  line-height: 49px;
  height: 49px;
  font-size: 20px;
  user-select: none;
  background-color: var(--color-background-2);
  /* padding-bottom: 1px; */
  /* border-bottom: 1px solid red; */
}

aside {
  grid-area: aside;
  background-color: var(--color-background-2);
}

main {
  grid-area: main;
}

.header-right {
  position: absolute;
  right: 0px;
  top: 0px;
  /* float: right; */
  display: flex;
}

.win-btn {
  user-select: none;
  width: 45px;
  text-align: center;
  line-height: 29px;
  color: var(--color-text);
}

.hover-gray:hover {
  background-color: var(--color-background-2);
}

.hover-red:hover {
  background-color: #e81123;
}
</style>
