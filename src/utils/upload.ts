import appConfig from '@/config'
import { getAccessToken, getTenantId } from '@/utils/auth'
import { tansParams, toast } from '@/utils/common'
import { assertApiSuccess, parseUploadJson } from '@/utils/http/process-api-result'
import type { ApiEnvelope, UploadOptions } from '@/utils/http/types'

const DEFAULT_TIMEOUT = 10000
const apiBase = appConfig.apiBase || appConfig.baseUrl + appConfig.baseApi

const upload = <T = unknown>(options: UploadOptions): Promise<ApiEnvelope<T>> => {
  const isToken = options.headers?.isToken === false
  const header: Record<string, string> = { ...(options.header ?? {}) }
  const token = getAccessToken()
  if (token && !isToken) {
    header.Authorization = `Bearer ${token}`
  }
  const tenantId = getTenantId()
  if (tenantId) {
    header['tenant-id'] = tenantId
  }

  let url = options.url
  if (options.params) {
    url = `${url}?${tansParams(options.params)}`
    url = url.slice(0, -1)
  }

  return new Promise((resolve, reject) => {
    uni.uploadFile({
      timeout: options.timeout ?? DEFAULT_TIMEOUT,
      url: `${apiBase}${url}`,
      filePath: options.filePath,
      name: options.name ?? 'file',
      header,
      formData: options.formData as Record<string, string> | undefined,
      method: options.method ?? 'post',
      success: (res) => {
        void (async () => {
          const result = parseUploadJson(res.data) as ApiEnvelope<T>
          const ok = await assertApiSuccess<T>(result, reject)
          if (ok) {
            resolve(result as ApiEnvelope<T>)
          }
        })()
      },
      fail: (error: UniApp.GeneralCallbackResult & { errMsg?: string }) => {
        let message = error.errMsg ?? 'Network Error'
        if (message === 'Network Error') {
          message = '后端接口连接异常'
        } else if (message.includes('timeout')) {
          message = '系统接口请求超时'
        } else if (message.includes('Request failed with status code')) {
          message = `系统接口${message.substr(message.length - 3)}异常`
        }
        toast(message)
        reject(error)
      }
    })
  })
}

export default upload
