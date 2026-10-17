export type TabKey = 'video' | 'ai-event' | 'disposal' | 'task' | 'mine'
export type TabEnterClass = '' | 'tab-enter tab-enter--forward' | 'tab-enter tab-enter--back'

const TAB_ORDER: TabKey[] = ['video', 'disposal', 'task', 'mine', 'ai-event']

let pending: TabEnterClass = ''

export function markTabTransition(from: TabKey, to: TabKey): void {
  if (from === to) {
    pending = ''
    return
  }
  const fromIndex = TAB_ORDER.indexOf(from)
  const toIndex = TAB_ORDER.indexOf(to)
  pending = toIndex > fromIndex ? 'tab-enter tab-enter--forward' : 'tab-enter tab-enter--back'
}

/** 在页面 setup 阶段读取，保证首帧就带上转场动画 */
export function consumeTabTransition(): TabEnterClass {
  const value = pending
  pending = ''
  return value
}
