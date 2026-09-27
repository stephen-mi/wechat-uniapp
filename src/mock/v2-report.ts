export interface SecurityReportItem {
  id: string
  orgName: string
  alertTotal: number
  rating: number
  dayTrend: 'flat' | 'up' | 'down'
  weekTrend: 'flat' | 'up' | 'down'
}

export interface SecurityReportGroup {
  dayLabel: string
  items: SecurityReportItem[]
}

function trendText(trend: 'flat' | 'up' | 'down', prefix: string): string {
  if (trend === 'up') return `${prefix} 上升▲`
  if (trend === 'down') return `${prefix} 下降▼`
  return `${prefix} 持平`
}

export function formatDayTrend(item: SecurityReportItem): string {
  return trendText(item.dayTrend, '较上日')
}

export function formatWeekTrend(item: SecurityReportItem): string {
  return trendText(item.weekTrend, '近一周')
}

export function ratingStars(rating: number): string {
  const full = Math.min(5, Math.max(0, Math.round(rating)))
  return '★'.repeat(full) + '☆'.repeat(5 - full)
}

export const securityReportGroups: SecurityReportGroup[] = [
  {
    dayLabel: '星期六',
    items: [
      {
        id: 'sat-1',
        orgName: 'AI视频监控演示',
        alertTotal: 7,
        rating: 1.3,
        dayTrend: 'flat',
        weekTrend: 'flat'
      }
    ]
  },
  {
    dayLabel: '星期五',
    items: [
      {
        id: 'fri-1',
        orgName: 'AI视频监控演示',
        alertTotal: 7,
        rating: 1.3,
        dayTrend: 'flat',
        weekTrend: 'flat'
      }
    ]
  },
  {
    dayLabel: '星期四',
    items: [
      {
        id: 'thu-1',
        orgName: 'AI视频监控演示',
        alertTotal: 7,
        rating: 1.3,
        dayTrend: 'flat',
        weekTrend: 'up'
      }
    ]
  }
]
