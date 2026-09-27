import { useStore } from 'vuex'
import type { RootState } from '@/store/types'

export function useAppStore() {
  return useStore<RootState>()
}
