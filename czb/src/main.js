import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import App from './App.vue'
import router from './router'
import store from './store'
import '@/assets/responsive.css'

// 创建 Vue 应用
const app = createApp(App)

// 使用插件
app.use(ElementPlus)
app.use(store)
app.use(router)

// 挂载应用
app.mount('#app')