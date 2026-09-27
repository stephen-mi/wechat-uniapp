export function toast(content: string): void {
  uni.showToast({
    icon: 'none',
    title: content
  })
}

export interface ConfirmResult {
  confirm: boolean
  cancel?: boolean
}

export function showConfirm(content: string): Promise<ConfirmResult> {
  return new Promise((resolve) => {
    uni.showModal({
      title: '提示',
      content,
      cancelText: '取消',
      confirmText: '确定',
      success(res) {
        resolve({ confirm: res.confirm, cancel: res.cancel })
      }
    })
  })
}

export function tansParams(params: Record<string, unknown>): string {
  let result = ''
  for (const propName of Object.keys(params)) {
    const value = params[propName]
    const part = `${encodeURIComponent(propName)}=`
    if (value !== null && value !== '' && value !== undefined) {
      if (typeof value === 'object') {
        for (const key of Object.keys(value as Record<string, unknown>)) {
          const nested = (value as Record<string, unknown>)[key]
          if (nested !== null && nested !== '' && nested !== undefined) {
            const nestedKey = `${propName}[${key}]`
            result += `${encodeURIComponent(nestedKey)}=${encodeURIComponent(String(nested))}&`
          }
        }
      } else {
        result += `${part}${encodeURIComponent(String(value))}&`
      }
    }
  }
  return result
}
