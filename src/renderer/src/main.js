import { createApp } from 'vue'
import App from './App.vue'
import router from './router/router'
// import store from './store'

// 5. 创建并挂载根实例
const app = createApp(App)

app.use(router)
// app.use(store)

app.mount('#app')

// 现在，应用已经启动了！
