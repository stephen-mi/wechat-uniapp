import type { App } from 'vue'
import tab from './tab'
import auth from './auth'
import modal from './modal'

export default {
  install(app: App) {
    app.config.globalProperties.$tab = tab
    app.config.globalProperties.$auth = auth
    app.config.globalProperties.$modal = modal
  }
}
