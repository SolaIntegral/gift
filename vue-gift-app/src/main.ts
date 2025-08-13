import './assets/main.css'
import './styles/accessibility.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

const app = createApp(App)

app.use(createPinia())
app.use(router)

// 認証の初期化
import { useAuthStore } from '@/stores/auth'
const authStore = useAuthStore()
authStore.initialize()

app.mount('#app')
