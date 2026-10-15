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
  /** Bimface 查看页。小程序 web-view 只能打开已配置的业务域名，需与 public/static 中的 viewer.html 对应 */
  bimfaceViewerPage: string
  /** 演示用 viewToken，留空时查看器显示图框；填入后任务页图纸走 Bimface SDK */
  bimfaceDemoViewToken: string
}

const config: AppConfig = {
  baseUrl,
  baseApi,
  apiBase: `${baseUrl}${baseApi}`,
  bimfaceViewerPage: 'https://www.siteflow.com.cn/bimface/viewer.html',
  bimfaceDemoViewToken: '',
  appInfo: {
    name: 'siteflow',
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
