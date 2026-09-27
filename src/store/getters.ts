import type { GetterTree } from 'vuex'
import type { RootState } from '@/store/types'

const getters: GetterTree<RootState, RootState> = {
  token: () => '',
  avatar: (state) => state.user.avatar,
  name: (state) => state.user.name,
  roles: (state) => state.user.roles,
  permissions: (state) => state.user.permissions
}

export default getters
