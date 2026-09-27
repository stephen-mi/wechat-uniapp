import { onMounted, ref } from 'vue'
import { getNavLayout, type NavLayout } from '@/utils/layout-metrics'

export function useNavLayout() {
  const nav = ref<NavLayout>(getNavLayout())

  onMounted(() => {
    nav.value = getNavLayout()
  })

  return nav
}
