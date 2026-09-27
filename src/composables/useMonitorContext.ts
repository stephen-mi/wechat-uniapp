import { ref } from 'vue'

/** 当前选中的组织/租户展示名（视频监控顶栏） */
export const monitorOrgName = ref('AI视频监控演示')

/** 地图页区域筛选展示 */
export const monitorRegionLabel = ref('全国')

export function useMonitorContext() {
  function setOrgName(name: string): void {
    monitorOrgName.value = name
  }

  function setRegionLabel(label: string): void {
    monitorRegionLabel.value = label
  }

  return {
    monitorOrgName,
    monitorRegionLabel,
    setOrgName,
    setRegionLabel
  }
}
