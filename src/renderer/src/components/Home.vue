<script setup lang="ts">
import {
  EditPen,
  VideoCamera
} from '@element-plus/icons-vue'
</script>

<template>
  <el-main>
    <el-text>欢迎使用</el-text>
  </el-main>
</template>

<style scoped>
.fn-box {
  width: auto;
  height: auto;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  /* 二列，每列均分剩余空间 */
  grid-template-rows: auto;
  /* 两行，高度根据内容自动调整 */
  grid-gap: 10px;
  /* 网格间距 */
  justify-items: center;
}

.fn-btn {
  --el-button-font-weight: var(--el-font-weight-primary);
  --el-button-disabled-text-color: var(--el-disabled-text-color);
  --el-button-disabled-bg-color: var(--el-fill-color-blank);
  --el-button-disabled-border-color: var(--el-border-color-light);
  --el-button-divide-border-color: rgba(255, 255, 255, 0.5);
  --el-button-active-text-color: var(--el-button-hover-text-color);
  --el-button-active-border-color: var(--el-color-primary);
  --el-button-active-bg-color: var(--el-button-hover-bg-color);
  --el-button-outline-color: var(--el-color-primary-light-5);
  --el-button-hover-link-text-color: var(--el-color-info);
  --el-button-active-color: var(--el-text-color-primary);
  --el-button-bg-color: var(--el-fill-color-blank);
  --el-button-border-color: var(--el-border-color);
  --el-button-text-color: var(--el-text-color-regular);
  --el-button-hover-bg-color: var(--el-color-primary-light-9);
  --el-button-hover-border-color: var(--el-color-primary-light-7);
  --el-button-hover-text-color: var(--el-color-primary);
  text-align: center;
  width: 120px;
  height: 170px;
  border-radius: 10px;
  padding: 10px;
  cursor: pointer;
  background-color: var(--el-button-bg-color);
  border: var(--el-border);
  border-color: var(--el-button-border-color);
  border-radius: var(--el-border-radius-base);
  box-sizing: border-box;
  color: var(--el-button-text-color);
}

.fn-btn:hover {
  background-color: var(--el-button-hover-bg-color);
  border-color: var(--el-button-hover-border-color);
  color: var(--el-button-hover-text-color);
  outline: none;
}

.fn-btn:active {
  background-color: var(--el-button-active-bg-color);
  border-color: var(--el-button-active-border-color);
  color: var(--el-button-active-text-color);
  outline: none;
}
</style>
