import { createApp } from 'vue'
import App from './App.vue'
import router from './router/router'

// 5. 创建并挂载根实例
const app = createApp(App)

app.use(router)

app.mount('#app')

// 现在，应用已经启动了！
