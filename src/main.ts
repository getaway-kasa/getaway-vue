import { createApp } from 'vue'
import App from './App.vue'
import { router } from './router'
import { connectWs } from '@/ws/config'

connectWs()

createApp(App).use(router).mount('#app')
