import { createSSRApp } from 'vue'
import App from './App.vue'
import store from './store'
import plugins from './plugins'
import uviewPlus from 'uview-plus'
import { setUnauthorizedHandler } from '@/utils/http/unauthorized'
import './permission'

setUnauthorizedHandler(async () => {
  await store.dispatch('LogOut')
  uni.reLaunch({ url: '/pages/login' })
})

export function createApp() {
  const app = createSSRApp(App)
  app.use(store)
  app.use(plugins)
  app.use(uviewPlus)
  return {
    app
  }
}
