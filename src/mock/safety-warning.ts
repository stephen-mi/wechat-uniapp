export interface WarningEventItem {
  id: string
  title: string
  time: string
  projectName: string
  location: string
  cover: string
}

export interface WarningEventGroup {
  dateLabel: string
  items: WarningEventItem[]
}

export interface HazardItem {
  id: string
  projectName: string
  title: string
  time: string
  status: 'pending' | 'done'
  cover: string
}

export const warningEventGroups: WarningEventGroup[] = [
  {
    dateLabel: '2026年09月27日 周日',
    items: [
      {
        id: 'e1',
        title: '未佩戴安全带',
        time: '2026-09-27 10:40:40',
        projectName: '某苑建筑项目',
        location: '7号塔吊 (15#, 16#)...',
        cover: '/static/images/default.jpg'
      },
      {
        id: 'e2',
        title: '未悬挂安全带',
        time: '2026-09-27 10:40:40',
        projectName: '某苑建筑项目',
        location: '7号塔吊 (15#, 16#)...',
        cover: '/static/images/default.jpg'
      }
    ]
  }
]

export const hazardList: HazardItem[] = [
  {
    id: 'h1',
    projectName: '某迁建项目',
    title: '未佩戴安全带',
    time: '2026-09-24 17:17:13',
    status: 'pending',
    cover: '/static/images/default.jpg'
  },
  {
    id: 'h2',
    projectName: '某迁建项目',
    title: '未佩戴安全带',
    time: '2026-09-24 17:17:13',
    status: 'pending',
    cover: '/static/images/default.jpg'
  },
  {
    id: 'h3',
    projectName: '某迁建项目',
    title: '未佩戴安全带',
    time: '2026-09-24 17:17:13',
    status: 'pending',
    cover: '/static/images/default.jpg'
  },
  {
    id: 'h4',
    projectName: '某迁建项目',
    title: '未佩戴安全带',
    time: '2026-09-24 17:17:13',
    status: 'pending',
    cover: '/static/images/default.jpg'
  },
  {
    id: 'h5',
    projectName: '某迁建项目',
    title: '未佩戴安全带',
    time: '2026-09-24 17:17:13',
    status: 'pending',
    cover: '/static/images/default.jpg'
  }
]
