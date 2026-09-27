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
