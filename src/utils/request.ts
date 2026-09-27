import appConfig from '@/config'
import { getAccessToken, getTenantId } from '@/utils/auth'
import { tansParams, toast } from '@/utils/common'
import { resolveApiEnvelope } from '@/utils/http/process-api-result'
import type { ApiEnvelope, RequestOptions } from '@/utils/http/types'

const DEFAULT_TIMEOUT = 10000
const apiBase = appConfig.apiBase || appConfig.baseUrl + appConfig.baseApi

function buildHeaders(options: RequestOptions): Record<string, string> {
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
  return header
}

function buildUrl(options: RequestOptions): string {
  let path = options.url
  if (options.params) {
    path = `${path}?${tansParams(options.params)}`
    path = path.slice(0, -1)
  }
  return options.baseUrl ?? `${apiBase}${path}`
}

const request = <T = unknown>(options: RequestOptions): Promise<ApiEnvelope<T>> => {
  const header = buildHeaders(options)
  return new Promise((resolve, reject) => {
    uni.request({
      method: options.method ?? 'GET',
      timeout: options.timeout ?? DEFAULT_TIMEOUT,
      url: buildUrl(options),
        data: options.data as UniApp.RequestOptions['data'],
      header,
      dataType: 'json',
      success: (res) => {
        void resolveApiEnvelope(res.data as ApiEnvelope<T>).then(resolve).catch(reject)
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

export default request
