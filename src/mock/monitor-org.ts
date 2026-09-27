export interface MonitorOrgNode {
  id: string
  name: string
  projectCount?: number
  children?: MonitorOrgNode[]
}

export const projectStatusTags = [
  { key: 'all', label: '全部状态' },
  { key: 'approved', label: '立项未进场' },
  { key: 'building', label: '在建/在施' },
  { key: 'stop', label: '停工' },
  { key: 'done', label: '完工/竣工' },
  { key: 'accept', label: '验收' },
  { key: 'unsettled', label: '已竣未结' },
  { key: 'not_start', label: '未开工' },
  { key: 'unfinished', label: '已完未竣' },
  { key: 'settled', label: '已竣已结' }
]

export const orgTree: MonitorOrgNode = {
  id: 'org-demo',
  name: 'AI视频监控演示',
  projectCount: 8,
  children: [
    { id: 'p1', name: '某迁建项目' },
    { id: 'p2', name: '某河通道治理项目' },
    { id: 'p3', name: '某大桥项目' },
    { id: 'p4', name: '某大学宿舍项目' },
    { id: 'p5', name: '某铁路枢纽' },
    { id: 'p6', name: '某苑建筑项目' },
    { id: 'p7', name: '某建设项目' },
    { id: 'p8', name: '执法记录仪演示项目' }
  ]
}

export const recentOrgNames = ['某大学宿舍项目', '某苑建筑项目', '某河通道治理项目']
