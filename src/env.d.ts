/// <reference types="@dcloudio/types" />
/// <reference types="vite/client" />

import type { AppConfig } from '@/config'

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<object, object, unknown>
  export default component
}

declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $tab: typeof import('@/plugins/tab').default
    $auth: typeof import('@/plugins/auth').default
    $modal: typeof import('@/plugins/modal').default
  }
}

interface AppGlobalData {
  config: AppConfig
}

declare global {
  function getApp<T extends { globalData: AppGlobalData }>(): T
  function requirePlugin(name: string): {
    getRecordRecognitionManager: () => {
      start: (options: { duration: number; lang: string }) => void
      stop: () => void
      onStop: ((res: { tempFilePath: string; result: string }) => void) | null
      onStart: ((res: unknown) => void) | null
      onError: ((res: { msg: string }) => void) | null
      onRecognize: ((res: unknown) => void) | null
    }
  }
}

declare module '@vue/runtime-dom' {
  interface ButtonHTMLAttributes {
    type?: 'button' | 'submit' | 'reset' | 'primary' | 'default' | 'warn'
  }
}

export {}
