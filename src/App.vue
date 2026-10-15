<script setup lang="ts">
import { onLaunch } from '@dcloudio/uni-app'
import config from './config'

defineOptions({
  globalData: {
    config
  }
})

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

onLaunch(() => {
  syncGlobalConfig()
  // 小程序端 getApp 在 onLaunch 同步阶段可能未挂载，下一帧再写一次 globalData
  setTimeout(syncGlobalConfig, 0)
})
</script>

<style lang="scss">
@import 'uview-plus/index.scss';
@import '@/static/scss/index.scss';

page {
  --u-primary: #23c993;
  --u-primary-dark: #14b07e;
  --u-primary-disabled: #a8ead4;
  --u-primary-light: #e8f8f2;
  --up-primary: #23c993;
  --up-primary-dark: #14b07e;
  --up-primary-disabled: #a8ead4;
  --up-primary-light: #e8f8f2;
}
</style>
