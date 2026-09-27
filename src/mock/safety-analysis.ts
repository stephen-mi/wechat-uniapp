export type AnalysisRangeKey = '7d' | '30d' | 'custom'

export interface PieSlice {
  name: string
  value: number
  color: string
}

export const videoAnalysisBoard = {
  accessRate: 100,
  connected: 8,
  disconnected: 0,
  realtimeOnlineRate: 75,
  online: 18,
  offline: 6
}

export const aiAnalysisBoard = {
  accessRate: 12,
  connected: 1,
  disconnected: 7,
  todayWarnings: 2,
  yesterdayWarnings: 7
}

export const dateRangeLabel = '2026/09/20 - 2026/09/26'

export const avgOnlineDonut = {
  centerValue: 93,
  online: 93,
  offline: 7
}

/** 0–1 在线率趋势（过去 7 天） */
export const onlineTrendPoints = [1, 1, 1, 1, 1, 0.95, 0.82]

export const aiWarningPie: PieSlice[] = [
  { name: '未穿着反光衣', value: 106, color: '#5B8FF9' },
  { name: '未佩戴安全带', value: 47, color: '#5AD8A6' },
  { name: '作业平台不规范', value: 22, color: '#5D7092' },
  { name: '未佩戴安全帽', value: 14, color: '#F6BD16' },
  { name: '洞口防护缺失', value: 10, color: '#E8684A' },
  { name: '未悬挂安全带', value: 8, color: '#6DC8EC' },
  { name: '人员躺卧/摔倒(提示)', value: 5, color: '#9270CA' },
  { name: '吊篮人数超限', value: 1, color: '#FF9D4D' },
  { name: '外架与结构间隙水平防护缺失', value: 2, color: '#269A99' }
]

export function pieTotal(slices: PieSlice[]): number {
  return slices.reduce((sum, s) => sum + s.value, 0)
}

export function buildConicGradient(slices: PieSlice[]): string {
  const total = pieTotal(slices)
  if (total <= 0) return '#eee 0 100%'
  let acc = 0
  const parts = slices.map((s) => {
    const start = (acc / total) * 100
    acc += s.value
    const end = (acc / total) * 100
    return `${s.color} ${start}% ${end}%`
  })
  return parts.join(', ')
}
