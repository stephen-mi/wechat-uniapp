import { ref } from 'vue'

/** 当前选中的组织/租户展示名（视频监控顶栏） */
export const monitorOrgName = ref('AI视频监控演示')

/** 当前选中的部门 id，空表示查看全部组织 */
export const monitorDeptId = ref<number | undefined>(undefined)

/** 地图页区域筛选展示 */
export const monitorRegionLabel = ref('全国')

export function useMonitorContext() {
  function setOrgName(name: string): void {
    monitorOrgName.value = name
  }

  function setOrg(dept: { id?: number; name: string } | null): void {
    if (!dept) {
      monitorDeptId.value = undefined
      monitorOrgName.value = '全部组织'
      return
    }
    monitorDeptId.value = dept.id
    monitorOrgName.value = dept.name
  }

  function setRegionLabel(label: string): void {
    monitorRegionLabel.value = label
  }

  return {
    monitorOrgName,
    monitorDeptId,
    monitorRegionLabel,
    setOrgName,
    setOrg,
    setRegionLabel
  }
}
