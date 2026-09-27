export interface DailyProjectItem {
  id: string
  rank: number
  name: string
  alertCount: number
  handleRate: string
  rating: number
}

export type DailySortKey =
  | 'ratingDesc'
  | 'alertDesc'
  | 'rateDesc'
  | 'ratingAsc'
  | 'alertAsc'
  | 'rateAsc'

export const dailySortOptions: { key: DailySortKey; label: string }[] = [
  { key: 'ratingDesc', label: '按评分从高到低' },
  { key: 'alertDesc', label: '按预警总数从高到低' },
  { key: 'rateDesc', label: '按隐患处理率从高到低' },
  { key: 'ratingAsc', label: '按评分从低到高' },
  { key: 'alertAsc', label: '按预警总数从低到高' },
  { key: 'rateAsc', label: '按隐患处理率从低到高' }
]

export const dailyReportMeta = {
  dateTitle: '9月26日 安全态势总览',
  aiRating: 1.3,
  aiProjectCount: 1,
  alertTotal: 7,
  dayAlertDelta: '+1次',
  weekAlertDelta: '-34次',
  needHandle: 0,
  handled: 0,
  unhandled: 0,
  handleRate: '0%',
  summaryHighlight:
    '总结：AI巡检项目数1个，AI预警总数7次，隐患处理率0%，AI预警评分1.3分。',
  summaryFocus: '需重点关注评分最高的3个项目为：某苑建筑项目 (1.7分)'
}

const PROJECT_NAMES = [
  '某苑建筑项目',
  '某迁建项目',
  '某河通道治理项目',
  '某大桥项目',
  '某大学宿舍项目',
  '某铁路枢纽',
  '某建设项目',
  '执法记录仪演示项目',
  '某市政管网项目',
  '某物流园项目',
  '某医院改扩建项目',
  '某地铁站点项目'
]

export function buildDailyProjects(): DailyProjectItem[] {
  return PROJECT_NAMES.map((name, index) => ({
    id: `dp-${index + 1}`,
    rank: index + 1,
    name,
    alertCount: index === 0 ? 7 : Math.max(1, 7 - index),
    handleRate: index === 0 ? '-' : '0%',
    rating: index === 0 ? 1.7 : Math.max(1, 1.7 - index * 0.1)
  }))
}

export function sortDailyProjects(
  list: DailyProjectItem[],
  key: DailySortKey
): DailyProjectItem[] {
  const copy = [...list]
  const numRate = (s: string) => (s === '-' ? -1 : parseFloat(s) || 0)
  switch (key) {
    case 'ratingDesc':
      copy.sort((a, b) => b.rating - a.rating)
      break
    case 'ratingAsc':
      copy.sort((a, b) => a.rating - b.rating)
      break
    case 'alertDesc':
      copy.sort((a, b) => b.alertCount - a.alertCount)
      break
    case 'alertAsc':
      copy.sort((a, b) => a.alertCount - b.alertCount)
      break
    case 'rateDesc':
      copy.sort((a, b) => numRate(b.handleRate) - numRate(a.handleRate))
      break
    case 'rateAsc':
      copy.sort((a, b) => numRate(a.handleRate) - numRate(b.handleRate))
      break
  }
  return copy.map((p, i) => ({ ...p, rank: i + 1 }))
}

export function ratingStarsDisplay(rating: number): string {
  const full = Math.min(5, Math.max(0, Math.floor(rating)))
  return '★'.repeat(full) + '☆'.repeat(5 - full)
}
