export interface MonitorCameraThumb {
  label: string
  cover: string
}

export interface MonitorProject {
  id: string
  name: string
  groupName: string
  online: number
  total: number
  cameras: MonitorCameraThumb[]
}

export const monitorDashboard = {
  groupName: 'AI视频监控演示',
  projectCount: 8,
  onlineRate: 75
}

export const monitorProjects: MonitorProject[] = [
  {
    id: '1',
    name: '某大学宿舍项目',
    groupName: 'AI视频监控演示',
    online: 2,
    total: 2,
    cameras: [
      { label: '球机画面@萤石云', cover: '/static/images/default.jpg' },
      { label: '1号塔吊 (1#) @萤石云', cover: '/static/images/default.jpg' }
    ]
  },
  {
    id: '2',
    name: '某苑建筑项目',
    groupName: 'AI视频监控演示',
    online: 7,
    total: 8,
    cameras: [
      { label: '球机画面@萤石云', cover: '/static/images/default.jpg' },
      { label: '1号塔吊 (1#) @萤石云', cover: '/static/images/default.jpg' },
      { label: '2号塔吊 (2#) @萤石云', cover: '/static/images/default.jpg' },
      { label: '3号塔吊 (3#) @萤石云', cover: '/static/images/default.jpg' }
    ]
  }
]
