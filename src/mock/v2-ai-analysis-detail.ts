export interface AiAnalysisEventTag {
  label: string
  count: number
}

export interface AiAnalysisCard {
  id: string
  badge: string
  newEvents: number
  todayTotal: number
  categories: { name: string; tags: AiAnalysisEventTag[] }[]
  mostNew?: AiAnalysisEventTag
  defaultExpanded?: boolean
}

export interface AiAnalysisTimeGroup {
  timeLabel: string
  cards: AiAnalysisCard[]
}

export const aiAnalysisDetailGroups: AiAnalysisTimeGroup[] = [
  {
    timeLabel: '9月27日 10:00',
    cards: [
      {
        id: 'c1',
        badge: '近2小时',
        newEvents: 1,
        todayTotal: 1,
        categories: [{ name: '高坠：', tags: [{ label: '某苑建筑项目', count: 1 }] }],
        mostNew: { label: '某建设项目', count: 1 },
        defaultExpanded: true
      }
    ]
  },
  {
    timeLabel: '9月26日 20:00',
    cards: [
      {
        id: 'c2',
        badge: '近2小时',
        newEvents: 0,
        todayTotal: 3,
        categories: [
          { name: '高坠：', tags: [{ label: '某迁建项目', count: 2 }] },
          { name: '未戴安全帽：', tags: [{ label: '某大桥项目', count: 1 }] }
        ],
        defaultExpanded: false
      }
    ]
  }
]
