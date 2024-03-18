<script setup>
const runFolderRemarks = () => {
  window.electronAPI.sendSignal(
    'request-cmd',
    'E:\\User_files_sync\\Files\\Projects\\自制软件\\文件夹备注\\FolderRemarks.exe'
  )
}
</script>

<template>
  <header>
    <div class="title">文件夹备注</div>
  </header>
  <div class="contain">
    <button class="runFolderRemarks-btn" @click="runFolderRemarks">打开现有QT版</button>
  </div>
</template>

<style>
.contain {
  display: grid;
  height: 100vh;
  justify-items: center;
  align-items: center;
  height: calc(100% - 49px);
}

.runFolderRemarks-btn {
  text-align: center;
  border-radius: 10px;
  padding: 10px;
  background-color: var(--color-background-2);
  height: 70px;
  width: 150px;
}

button:hover {
  background-color: var(--color-background-3);
}
</style>
