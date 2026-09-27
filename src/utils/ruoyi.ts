type DateInput = string | number | Date

export function parseTime(time?: DateInput | null, pattern?: string): string | null {
  if (!time) {
    return null
  }
  const format = pattern || '{y}-{m}-{d} {h}:{i}:{s}'
  let date: Date
  if (typeof time === 'object') {
    date = time
  } else {
    let normalized: string | number = time
    if (typeof normalized === 'string' && /^[0-9]+$/.test(normalized)) {
      normalized = parseInt(normalized, 10)
    } else if (typeof normalized === 'string') {
      normalized = normalized.replace(/-/gm, '/').replace('T', ' ').replace(/\.[\d]{3}/gm, '')
    }
    if (typeof normalized === 'number' && normalized.toString().length === 10) {
      normalized = normalized * 1000
    }
    date = new Date(normalized)
  }
  const formatObj: Record<'y' | 'm' | 'd' | 'h' | 'i' | 's' | 'a', number> = {
    y: date.getFullYear(),
    m: date.getMonth() + 1,
    d: date.getDate(),
    h: date.getHours(),
    i: date.getMinutes(),
    s: date.getSeconds(),
    a: date.getDay()
  }
  return format.replace(/{(y|m|d|h|i|s|a)+}/g, (result, key: keyof typeof formatObj) => {
    let value: string | number = formatObj[key]
    if (key === 'a') {
      return ['日', '一', '二', '三', '四', '五', '六'][value]
    }
    if (result.length > 0 && Number(value) < 10) {
      value = `0${value}`
    }
    return String(value || 0)
  })
}
