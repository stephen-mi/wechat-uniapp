<script setup lang="ts">
import { onLaunch } from '@dcloudio/uni-app'
import config from './config'
import { getAccessToken } from '@/utils/auth'
import { useTab } from '@/composables/useTab'

defineOptions({
  globalData: {
    config
  }
})

const tab = useTab()

function syncGlobalConfig(): void {
  try {
    const app = getApp<{ globalData?: { config?: typeof config } }>()
    if (!app) return
    if (!app.globalData) {
      app.globalData = { config }
    } else {
      app.globalData.config = config
    }
  } catch {
    /* onLaunch 早期 getApp 可能尚未就绪，useAppConfig 会回退 @/config */
  }
}

function checkLogin(): void {
  if (!getAccessToken()) {
    tab.reLaunch('/pages/login')
  }
}

onLaunch(() => {
  syncGlobalConfig()
  // 小程序端 getApp 在 onLaunch 同步阶段可能未挂载，下一帧再写一次 globalData
  setTimeout(syncGlobalConfig, 0)
  // #ifdef H5
  checkLogin()
  // #endif
})
</script>

<style lang="scss">
@import 'uview-plus/index.scss';
@import '@/static/scss/index.scss';
</style>
