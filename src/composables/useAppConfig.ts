import configModule from '@/config'
import type { AppConfig } from '@/config'

/** 同步 globalData.config（供仍直接读 getApp 的代码使用） */
function ensureGlobalConfig(): AppConfig {
  try {
    const app = getApp<{ globalData?: { config?: AppConfig } }>()
    if (!app) return configModule
    if (!app.globalData) {
      app.globalData = { config: configModule }
    } else if (!app.globalData.config) {
      app.globalData.config = configModule
    }
    return app.globalData.config ?? configModule
  } catch {
    return configModule
  }
}

export function useAppConfig(): AppConfig {
  return ensureGlobalConfig()
}
