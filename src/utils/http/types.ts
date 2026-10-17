export interface RequestHeaders {
  isToken?: boolean
  [key: string]: string | boolean | undefined
}

export interface RequestOptions {
  url: string
  method?: UniApp.RequestOptions['method']
  data?: unknown
  params?: Record<string, unknown>
  header?: Record<string, string>
  headers?: RequestHeaders
  baseUrl?: string
  timeout?: number
  /** 为 true 时 401 不再尝试刷新令牌，避免刷新接口自身循环 */
  skipAuthRefresh?: boolean
}

export interface UploadOptions {
  url: string
  filePath: string
  name?: string
  method?: string
  formData?: Record<string, unknown>
  header?: Record<string, string>
  headers?: RequestHeaders
  params?: Record<string, unknown>
  timeout?: number
}

export interface ApiEnvelope<T = unknown> {
  code: number
  data: T
  msg: string
}
