<!-- <script setup lang="ts">

</script> -->

<template>
  <header>
    <div class="main-title">自制工具集</div>
  </header>
  <div class="box">
    <div class="outer-frame">
      <div class="fn-box">
        <router-link to="/fn-1">
          <button class="btn fn-btn">
            <img class="fn-btn-img" src="../../public/icon/转换文件.svg" />
            <div class="fn-btn-text">安卓端B站视频快速提取</div>
          </button>
        </router-link>
        <router-link to="/folder-remarks">
          <button class="btn fn-btn">
            <img class="fn-btn-img" src="../../public/icon/标签.svg" />
            <div class="fn-btn-text">文件夹备注</div>
          </button>
        </router-link>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* header {
  height: 40px;
} */

.box {
  height: calc(100vh - 49px);
  display: grid;
  justify-content: center;
  align-items: center;
  user-select: none;
}

.outer-frame {
  width: 510px;
  height: auto;
  padding-bottom: 50px;
}

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
  text-align: center;
  width: 120px;
  height: 170px;
  border-radius: 10px;
  padding: 10px;
  background-color: var(--color-background-2);
}

.fn-btn-img {
  width: 100px;
  height: 100px;
  border-radius: 5px;
}

/* .btn {
  background-color: rgb(243, 243, 243);
  cursor: pointer;
} */

.fn-btn:hover {
  background-color: var(--color-background-3);
}
</style>
