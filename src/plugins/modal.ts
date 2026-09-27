import type { ConfirmResult } from '@/utils/common'

type ToastOption = UniApp.ShowToastOptions

export default {
  msg(content: string) {
    uni.showToast({ title: content, icon: 'none' })
  },
  msgError(content: string) {
    uni.showToast({ title: content, icon: 'error' })
  },
  msgSuccess(content: string) {
    uni.showToast({ title: content, icon: 'success' })
  },
  hideMsg() {
    uni.hideToast()
  },
  alert(content: string) {
    uni.showModal({ title: '提示', content, showCancel: false })
  },
  confirm(content: string): Promise<boolean> {
    return new Promise((resolve) => {
      uni.showModal({
        title: '系统提示',
        content,
        cancelText: '取消',
        confirmText: '确定',
        success(res) {
          if (res.confirm) {
            resolve(true)
          }
        }
      })
    })
  },
  showToast(option: string | ToastOption) {
    if (typeof option === 'object') {
      uni.showToast(option)
    } else {
      uni.showToast({ title: option, icon: 'none', duration: 2500 })
    }
  },
  loading(content: string) {
    uni.showLoading({ title: content, icon: 'none' })
  },
  closeLoading() {
    uni.hideLoading()
  }
}

export type { ConfirmResult }
