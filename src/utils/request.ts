import appConfig from '@/config'
import { getAccessToken, getRefreshToken, getTenantId, setToken } from '@/utils/auth'
import { tansParams, toast } from '@/utils/common'
import { resolveApiEnvelope } from '@/utils/http/process-api-result'
import type { ApiEnvelope, RequestOptions } from '@/utils/http/types'
import type { TokenVO } from '@/types/api'

const DEFAULT_TIMEOUT = 10000
const apiBase = appConfig.apiBase || appConfig.baseUrl + appConfig.baseApi

let refreshing: Promise<boolean> | null = null

function refreshAccessToken(): Promise<boolean> {
  if (refreshing) return refreshing
  const refreshToken = getRefreshToken()
  if (!refreshToken) return Promise.resolve(false)
  refreshing = new Promise((resolve) => {
    const tenantId = getTenantId()
    uni.request({
      method: 'POST',
      timeout: DEFAULT_TIMEOUT,
      url: `${apiBase}/system/auth/refresh-token?refreshToken=${encodeURIComponent(String(refreshToken))}`,
      header: tenantId ? { 'tenant-id': String(tenantId) } : {},
      dataType: 'json',
      success: (res) => {
        const body = res.data as ApiEnvelope<TokenVO>
        if (body?.code === 200 && body.data?.accessToken && body.data.refreshToken) {
          setToken(body.data)
          resolve(true)
          return
        }
        resolve(false)
      },
      fail: () => resolve(false),
      complete: () => {
        refreshing = null
      }
    })
  })
  return refreshing
}

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
        const payload = res.data as ApiEnvelope<T>
        if (payload?.code === 401 && !options.skipAuthRefresh) {
          void refreshAccessToken().then((ok) => {
            if (!ok) {
              void resolveApiEnvelope(payload).then(resolve).catch(reject)
              return
            }
            request<T>({ ...options, skipAuthRefresh: true }).then(resolve).catch(reject)
          })
          return
        }
        void resolveApiEnvelope(payload).then(resolve).catch(reject)
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
