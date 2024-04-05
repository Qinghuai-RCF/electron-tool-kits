<script setup>
import themePopup from './ThemePopup.vue'
</script>

<template>
  <div class="aside-wrap">
    <div class="aside-top">
      <router-link to="/" draggable="false">
        <button class="aside-btn">主页</button>
      </router-link>
    </div>
    <div class="aside-bottom">
      <button id="theme-btn" class="aside-btn">系统</button>
    </div>
    <themePopup id="theme-popup"></themePopup>
  </div>
</template>

<style>
.aside-wrap {
  height: 100%;
  position: relative;
  width: 100%;
}

.aside-bottom {
  position: absolute;
  bottom: 0;
  width: 100%;
}

.aside-btn {
  user-select: none;
  width: 100%;
  text-align: center;
  line-height: 49px;
  color: var(--color-text-1);
  height: 50px;
  display: block;
}

.aside-btn:hover {
  background-color: var(--color-background-3);
}

.aside-btn-selected {
  background-color: var(--color-background-3);
}
</style>
