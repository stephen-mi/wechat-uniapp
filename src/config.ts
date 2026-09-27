// API 与 site-flow-web 一致：VITE_BASE_URL + VITE_API_URL
const baseUrl = 'https://www.siteflow.com.cn/api/v1'
const baseApi = '/admin-api'

export interface AppInfo {
  name: string
  version: string
  logo: string
  site_url: string
  agreements: Array<{ title: string; url: string }>
}

export interface AppConfig {
  baseUrl: string
  baseApi: string
  apiBase: string
  appInfo: AppInfo
}

const config: AppConfig = {
  baseUrl,
  baseApi,
  apiBase: `${baseUrl}${baseApi}`,
  appInfo: {
    name: '黑米云',
    version: '1.0.0',
    logo: '/static/logo.jpeg',
    site_url: 'https://www.siteflow.com.cn/',
    agreements: [
      { title: '隐私政策', url: 'https://iocoder.cn' },
      { title: '用户服务协议', url: 'https://iocoder.cn' }
    ]
  }
}

export default config
