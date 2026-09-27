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
    invoke(to: { path?: string; url: string }) {
      if (getAccessToken()) {
        if (to.path === loginPage) {
          uni.reLaunch({ url: '/' })
        }
        return true
      }
      if (checkWhite(to.url)) {
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
