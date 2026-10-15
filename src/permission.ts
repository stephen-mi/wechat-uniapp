import { getAccessToken } from '@/utils/auth'

const loginPage = '/pages/login'

const whiteList = ['/pages/login', '/pages/common/webview/index']

function checkWhite(url: string): boolean {
  const path = url.split('?')[0]
  return whiteList.indexOf(path) !== -1
}

const interceptors = ['navigateTo', 'redirectTo', 'reLaunch', 'switchTab'] as const

interceptors.forEach((item) => {
  uni.addInterceptor(item, {
    invoke(to: { path?: string; url?: string }) {
      const url = to.url || to.path || ''
      if (getAccessToken()) {
        return true
      }
      if (checkWhite(url)) {
        return true
      }
      uni.reLaunch({ url: loginPage })
      return false
    },
    fail(err: unknown) {
      console.log(err)
    }
  })
})
