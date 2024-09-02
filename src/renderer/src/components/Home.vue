<script setup>
import { ref } from 'vue'
import store from '../store'
import { ElMessageBox, ElMessage } from 'element-plus'
import '../../../../node_modules/element-plus/theme-chalk/el-message-box.css'
const version = ref('1.1.1')

// 打开开发者工具
const openDevTools = () => {
  window.electronAPI.sendOpenDevTools()
}

// 打开数据文件夹
const openDataPath = () => {
  window.electronAPI.sendSignal('open-folder', 'AppDataPath')
}

const themeOptions = [
  {
    value: 'system',
    label: '系统'
  },
  {
    value: 'light',
    label: '明亮'
  },
  {
    value: 'dark',
    label: '黑暗'
  }
]

const changeToSystemTheme = () => {
  window.electronAPI.sendSignal('system-theme')
}

const changeToLightTheme = () => {
  window.electronAPI.sendSignal('light-theme')
}

const changeToDarkTheme = () => {
  window.electronAPI.sendSignal('dark-theme')
}

const changeTheme = (value) => {
  if (value === 'system') {
    changeToSystemTheme()
  } else if (value === 'light') {
    changeToLightTheme()
  } else if (value === 'dark') {
    changeToDarkTheme()
  }
}
</script>

<template>
  <el-main>
    <h1>当前版本：{{ version }}</h1>
    <el-row>
      <el-button @click="openDevTools">开发者工具</el-button>
      <el-button @click="openDataPath">软件数据文件夹</el-button>
    </el-row>
    <el-row>
      <el-text style="margin-right: var(--gap)">主题</el-text>
      <el-select
        v-model="store.AppData.theme"
        placeholder="选择主题"
        style="width: 240px"
        @change="changeTheme"
      >
        <el-option
          v-for="item in themeOptions"
          :key="item.value"
          :label="item.label"
          :value="item.value"
        />
      </el-select>
    </el-row>
    <el-row>
      <pre>
更新记录：

* 1.1.1： 优化/修复： 修复同步功能UI问题，优化部分注释，优化文件同步命令

描述：
- 修复：修复电脑向手机同步时，没有传回同步结果导致UI一直显示运行中的问题
- 优化：添加注释“暂不支持手机端文件备份”
- 优化：给adb文件同步命令添加 -a 参数，确保文件复制时保留文件修改时间等元数据

* 1.1.0： 修复/功能： 添加了手机电脑文件同步功能，并可保存预设,优化体验

描述：
- 功能：添加了手机电脑文件同步功能，并可保存预设
- 修复：修复了更新备注时传输了错误参数导致更新失败的问题
- 功能：在主页添加了打开数据文件夹的按钮

1.0.4： 优化/修复： 优化主页，修复B站视频提取脚本恶性bug

描述：
- 修复：修复B站视频提取脚本无法识别非gbk特殊符导致输出文件夹被删除的恶性bug
- 优化：主页添加更新记录文本
- 优化：B站视频提取脚本在转换弹幕时在目标文件夹会创建xml弹幕备份，以便后续重新转换弹幕
- 优化：修正目录文本错误


* 1.0.3： 修复： 修复B站视频提取更改路径时渲染进程没有即时更新的问题


* 1.0.2： 优化/修复： 优化音频转换界面，修复bug

描述：
- 优化：添加进度条，为转换结果添加错误状态，优化删除按钮显示效果
- 修复：修复当视频没有音频时exec命令无法结束运行的问题，并为此状态添加错误提示

* 1.0.1： 功能： 新增黑暗模式，优化主题切换
描述：
- 功能：优化应用结构，重写主题选择前后端代码
- 功能：添加element-plus黑暗模式并与nativeTheme同步

* 1.0.0： 功能： 增加视频转mp3功能


* 0.0.10: 优化: 优化B站视频合并

描述：
-优化: 优化B站视频合并，优化UI，优化合并脚本，使脚本支持自定义I/O路径，以及是否清空输出路径

* 0.0.9： 功能： 增加开启开发者工具的按钮


* 0.0.8： 修复： 修复打包后preload无法加载的问题

描述：
- 修复preload无法加载的问题
不要在preload里导入自己的js

* 删除多余测试代码


* 0.0.7： 功能： 完善UI体验

描述：
-功能：文件夹备注功能添加文件夹路径错误提示
-功能：文件夹备注功能添加添加使用说明书

* 0.0.6： 优化： 优化UI体验和文件系统代码

描述：
- 优化：备注表格可调节紧凑程度
- 优化：备注页添加颜色提示
- 优化：独立文件夹创建
- 优化：独立文件读写

* 0.0.5： UI更新：重写部分UI

描述：
- UI更新：添加element-plus库，重写侧边栏和文件夹备份UI

* 0.0.4： 修复： 将配置文件移到文档文件夹中

描述：
- 将配置文件移到文档文件夹中

问题：
- 未对fn2不合法路径进行检查，错误路径会后台报错但没有提示

* 0.0.3： 修复： 修复fn2读取文件夹时可能会报错的问题

描述：
- 修复读取文件夹时文件夹被占用以及无权限导致报错的问题

* 0.0.2：功能： 优化主题切换，查看文档文件夹备注

描述：
- 将主题切换移入弹窗，并支持显示当前是哪个主题
- fn2现支持显示文档文件夹的备注

* 0.0.1： feat： 新建库

描述：
功能:
- 主页
- 安卓端B站视频快速提取(运行时按钮黄色，运行结束按钮变绿)
- 文件夹备注(打开QT版软件)
- 切换主题
</pre>
    </el-row>
  </el-main>
</template>

<style scoped></style>
