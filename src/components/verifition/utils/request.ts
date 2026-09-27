import config from '@/config'

const apiBase = config.apiBase || config.baseUrl + config.baseApi

export interface UniRequestResult<T = unknown> {
  data: T
  statusCode?: number
}

export type MyRequestOption = {
  url: string
  data?: Record<string, unknown>
  method?: UniApp.RequestOptions['method']
}

export const myRequest = <T = unknown>(option: MyRequestOption): Promise<UniRequestResult<T>> => {
  return new Promise((resolve, reject) => {
    uni.request({
      url: apiBase + option.url,
      data: option.data as UniApp.RequestOptions['data'],
      method: option.method || 'GET',
      success: (result) => {
        resolve(result as unknown as UniRequestResult<T>)
      },
      fail: (error) => {
        reject(error)
      }
    })
  })
}
