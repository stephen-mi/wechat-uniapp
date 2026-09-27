export default {
  reLaunch(url: string) {
    return uni.reLaunch({ url })
  },
  switchTab(url: string) {
    return uni.switchTab({ url })
  },
  redirectTo(url: string) {
    return uni.redirectTo({ url })
  },
  navigateTo(url: string) {
    return uni.navigateTo({ url })
  },
  navigateBack() {
    return uni.navigateBack()
  }
}
