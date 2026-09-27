import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import uniModule from '@dcloudio/vite-plugin-uni'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const uni = typeof uniModule === 'function' ? uniModule : (uniModule as { default: () => unknown }).default

const uviewTheme = path.resolve(__dirname, 'node_modules/uview-plus/theme.scss').replace(/\\/g, '/')

/** 抑制 uview-plus / Dart Sass 的 @import、legacy-js-api 弃用刷屏（依赖侧暂未全面 @use） */
const scssSilenceOptions = {
  api: 'modern-compiler' as const,
  silenceDeprecations: ['legacy-js-api', 'import'] as ('legacy-js-api' | 'import')[],
  quietDeps: true,
  additionalData: `@use "${uviewTheme}" as *;\n`
}

export default defineConfig({
  plugins: [uni()],
  resolve: {
    alias: {
      'uview-plus': path.resolve(__dirname, 'node_modules/uview-plus')
    }
  },
  css: {
    preprocessorOptions: {
      scss: scssSilenceOptions,
      sass: scssSilenceOptions
    }
  }
})
