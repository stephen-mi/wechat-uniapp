import config from '@/config'

/** 开发者工具里用本机静态页，避免未部署时 web-view 打到线上 404 */
const DEV_VIEWER_PAGE = 'http://127.0.0.1:8765/viewer.html'

export function resolveBimfaceViewerPage(): string {
  try {
    const env = uni.getAccountInfoSync().miniProgram.envVersion
    if (env === 'develop') return DEV_VIEWER_PAGE
  } catch {
    /* 非小程序环境走线上地址 */
  }
  return config.bimfaceViewerPage
}

export function buildBimfaceViewerSrc(params: {
  viewToken: string
  name: string
  modelId: string
  suffix: string
  previewUrl?: string
  context?: string
}): string {
  const query = [
    `viewToken=${encodeURIComponent(params.viewToken)}`,
    `name=${encodeURIComponent(params.name)}`,
    `modelId=${encodeURIComponent(params.modelId)}`,
    `suffix=${encodeURIComponent(params.suffix)}`,
    `previewUrl=${encodeURIComponent(params.previewUrl || '')}`,
    `context=${encodeURIComponent(params.context || '')}`
  ].join('&')
  return `${resolveBimfaceViewerPage()}?${query}`
}
