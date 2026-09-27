import { computed, ref } from 'vue'

export type UiVersion = 'v1' | 'v2'

const STORAGE_KEY = 'app_ui_version'

const V1_HOME = '/pages/monitor/index'
const V2_HOME = '/pages/v2/video/index'

export function getUiVersion(): UiVersion {
  try {
    const v = uni.getStorageSync(STORAGE_KEY) as UiVersion
    if (v === 'v1' || v === 'v2') return v
  } catch {
    /* ignore */
  }
  return 'v2'
}

export function setUiVersionStorage(version: UiVersion): void {
  uni.setStorageSync(STORAGE_KEY, version)
}

export function goHomeAfterLogin(): void {
  const url = getUiVersion() === 'v2' ? V2_HOME : V1_HOME
  uni.reLaunch({ url })
}

export function useUiVersion() {
  const version = ref<UiVersion>(getUiVersion())

  const isV2 = computed(() => version.value === 'v2')

  function setVersion(next: UiVersion): void {
    version.value = next
    setUiVersionStorage(next)
  }

  function toggleNewVersion(enabled: boolean): void {
    setVersion(enabled ? 'v2' : 'v1')
  }

  return {
    version,
    isV2,
    setVersion,
    toggleNewVersion,
    goHomeAfterLogin
  }
}
