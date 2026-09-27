import errorCode from '@/utils/errorCode'
import { toast, showConfirm } from '@/utils/common'
import { handleUnauthorized } from '@/utils/http/unauthorized'
import type { ApiEnvelope } from '@/utils/http/types'

export async function assertApiSuccess<T>(
  payload: ApiEnvelope<T>,
  reject: (reason?: unknown) => void
): Promise<boolean> {
  const code = payload.code || 200
  const msg = errorCode[String(code)] || payload.msg || errorCode.default

  if (code === 401) {
    const modal = await showConfirm('登录状态已过期，您可以继续留在该页面，或者重新登录?')
    if (modal.confirm) {
      await handleUnauthorized()
    }
    reject('无效的会话，或者会话已过期，请重新登录。')
    return false
  }

  if (code === 500) {
    toast(msg)
    reject('500')
    return false
  }

  if (code !== 200) {
    toast(msg)
    reject(code)
    return false
  }

  return true
}

export function resolveApiEnvelope<T>(payload: ApiEnvelope<T>): Promise<ApiEnvelope<T>> {
  return new Promise((resolve, reject) => {
    void assertApiSuccess(payload, reject).then((ok) => {
      if (ok) {
        resolve(payload)
      }
    })
  })
}

export function parseUploadJson(raw: string): ApiEnvelope<unknown> {
  return JSON.parse(raw) as ApiEnvelope<unknown>
}
