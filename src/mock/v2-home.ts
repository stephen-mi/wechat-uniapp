export interface V2ProjectCard {
  id: string
  name: string
  cover: string
  deviceOnline: number
  deviceTotal: number
  shotTime?: string
}

export interface V2AiEventMetrics {
  hazardTotal: number
  processed: number
  pending: number
  processRate: string
}

export interface V2AiEventItem {
  id: string
  tag: string
  title: string
  desc?: string
  cover: string
  camera?: string
  time: string
  status: 'pending' | 'done'
  projectName: string
  compact?: boolean
}

export interface V2DisposalProject {
  id: string
  name: string
  cover: string
  rating: number
  ratingStars: string
  attention: '可关注' | '低关注'
  aiEventCount: number
  dayTrend: 'up' | 'down'
  weekTrend: 'up' | 'down'
}

export const v2OrgTitle = 'AI视频监控演示'

export const v2AiAnalysis = {
  timeLabel: '9月27日 18:00',
  summaryLines: [
    '近2小时新增事件 1次，今日累计 1次，需关注以下项目：',
    '1.新增事件最多:某建设项目'
  ],
  reportHint: '9月27日安全日报已生成，请点击查阅!'
}

/** 摄像头宫格视图（设计图 1.3） */
export const v2AiAnalysisCameraView = {
  timeLabel: '9月27日 18:00',
  summaryLines: [
    '近2小时新增事件 1次，今日累计 1次，需关注以下项目：1.新增事件最多:某迁建项目'
  ]
}

export interface V2CameraFeed {
  id: string
  cameraName: string
  projectName: string
  cover: string
  starred?: boolean
}

export const v2CameraFeeds: V2CameraFeed[] = [
  { id: 'cam1', cameraName: '1#楼球机', projectName: '某迁建项目', cover: '/static/images/default.jpg' },
  { id: 'cam2', cameraName: '19#楼球机', projectName: '某迁建项目', cover: '/static/images/default.jpg' },
  { id: 'cam3', cameraName: '25#楼球机', projectName: '某迁建项目', cover: '/static/images/default.jpg' },
  { id: 'cam4', cameraName: '3#楼球机', projectName: '某迁建项目', cover: '/static/images/default.jpg' },
  { id: 'cam5', cameraName: '5#楼球机', projectName: '某迁建项目', cover: '/static/images/default.jpg' },
  { id: 'cam6', cameraName: '7#楼球机', projectName: '某迁建项目', cover: '/static/images/default.jpg' }
]

const PROJECT_NAMES = [
  '某迁建项目',
  '某河通道治理项目',
  '某大桥项目',
  '某大学宿舍项目',
  '某铁路枢纽',
  '某苑建筑项目',
  '某建设项目',
  '执法记录仪演示项目',
  '某市政管网项目',
  '某物流园项目',
  '某医院改扩建项目',
  '某地铁站点项目'
] as const

function buildV2Projects(): V2ProjectCard[] {
  return PROJECT_NAMES.map((name, index) => {
    const total = 5 + (index % 4)
    const online = Math.max(1, total - (index % 3))
    return {
      id: String(index + 1),
      name,
      cover: '/static/images/default.jpg',
      deviceOnline: online,
      deviceTotal: total
    }
  })
}

export const v2Projects: V2ProjectCard[] = buildV2Projects()

export const v2EventMetrics: V2AiEventMetrics = {
  hazardTotal: 85,
  processed: 2,
  pending: 83,
  processRate: '2.35%'
}

export const v2AiEvents: V2AiEventItem[] = [
  {
    id: 'e1',
    tag: 'AI云端安全员',
    title: '未佩戴安全带(5条)',
    desc: '系统检测到多名作业人员未佩戴安全带，请立即安排现场核查与整改。',
    cover: '/static/images/default.jpg',
    camera: '3#楼球机',
    time: '2026.09.24 23:30',
    status: 'pending',
    projectName: '某迁建项目',
    compact: false
  },
  {
    id: 'e2',
    tag: 'AI云端安全员',
    title: '未佩戴安全带',
    cover: '/static/images/default.jpg',
    time: '2026.09.24 17:17:13',
    status: 'pending',
    projectName: '某迁建项目',
    compact: true
  },
  {
    id: 'e3',
    tag: 'AI云端安全员',
    title: '未穿着反光衣',
    cover: '/static/images/default.jpg',
    time: '2026.09.24 16:02:08',
    status: 'pending',
    projectName: '某建设项目',
    compact: true
  }
]

export const v2DisposalProjects: V2DisposalProject[] = [
  {
    id: 'd1',
    name: '某河通道治理项目',
    cover: '/static/images/default.jpg',
    rating: 2,
    ratingStars: '★★☆☆☆ 2.0',
    attention: '可关注',
    aiEventCount: 7,
    dayTrend: 'down',
    weekTrend: 'up'
  },
  {
    id: 'd2',
    name: '某大桥项目',
    cover: '/static/images/default.jpg',
    rating: 1.5,
    ratingStars: '★★☆☆☆ 1.5',
    attention: '低关注',
    aiEventCount: 3,
    dayTrend: 'down',
    weekTrend: 'down'
  },
  {
    id: 'd3',
    name: '某铁路枢纽',
    cover: '/static/images/default.jpg',
    rating: 3,
    ratingStars: '★★★☆☆ 3.0',
    attention: '可关注',
    aiEventCount: 12,
    dayTrend: 'up',
    weekTrend: 'up'
  }
]
