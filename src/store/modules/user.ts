import type { ActionContext, Module, MutationTree } from 'vuex'
import storage from '@/utils/storage'
import constant from '@/utils/constant'
import { preLogin, loginWithTenant, logout, getInfo } from '@/api/login'
import { setToken, removeToken, setTenantId, removeTenantId } from '@/utils/auth'
import type {
  LoginFormPayload,
  LoginWithTenantPayload,
  PreLoginResult,
  RootState,
  UserState
} from '@/store/types'
import type { PermissionInfoVO } from '@/types/api'

function readStringArray(key: string): string[] {
  const value: unknown = storage.get(key)
  return Array.isArray(value) ? (value as string[]) : []
}

const state = (): UserState => ({
  id: 0,
  name: String(storage.get(constant.name) ?? ''),
  avatar: String(storage.get(constant.avatar) ?? ''),
  roles: readStringArray(constant.roles),
  permissions: readStringArray(constant.permissions)
})

const mutations: MutationTree<UserState> = {
  SET_ID(state, id: number) {
    state.id = id
  },
  SET_NAME(state, name: string) {
    state.name = name
    storage.set(constant.name, name)
  },
  SET_AVATAR(state, avatar: string) {
    state.avatar = avatar
    storage.set(constant.avatar, avatar)
  },
  SET_ROLES(state, roles: string[]) {
    state.roles = roles
    storage.set(constant.roles, roles)
  },
  SET_PERMISSIONS(state, permissions: string[]) {
    state.permissions = permissions
    storage.set(constant.permissions, permissions)
  }
}

type UserActionContext = ActionContext<UserState, RootState>

const actions = {
  PreLogin(_ctx: UserActionContext, userInfo: LoginFormPayload): Promise<PreLoginResult> {
    return preLogin({
      username: userInfo.username.trim(),
      password: userInfo.password,
      captchaVerification: userInfo.captchaVerification ?? ''
    }).then((res) => res.data)
  },

  Login({ dispatch }: UserActionContext, userInfo: LoginFormPayload): Promise<void> {
    return dispatch('PreLogin', userInfo).then((pre: PreLoginResult) => {
      if (!pre?.tenants?.length) {
        return Promise.reject(new Error('未找到可用租户'))
      }
      const tenant = pre.tenants[0]
      return dispatch('LoginWithTenant', {
        userId: tenant.userId,
        tenantId: tenant.id
      })
    })
  },

  LoginWithTenant(_ctx: UserActionContext, payload: LoginWithTenantPayload): Promise<void> {
    return loginWithTenant(payload).then((res) => {
      setToken(res.data)
      setTenantId(payload.tenantId)
    })
  },

  GetInfo({ commit }: UserActionContext): Promise<PermissionInfoVO> {
    return getInfo().then((res) => {
      const data = res.data
      const profile = data.user
      const avatar =
        profile == null || profile.avatar === '' || profile.avatar == null
          ? '/static/images/profile.jpg'
          : profile.avatar
      const nickname =
        profile == null || profile.nickname === '' || profile.nickname == null ? '' : profile.nickname
      if (data.roles?.length) {
        commit('SET_ROLES', data.roles)
        commit('SET_PERMISSIONS', data.permissions)
      } else {
        commit('SET_ROLES', ['ROLE_DEFAULT'])
      }
      if (profile?.id) {
        commit('SET_ID', profile.id)
      }
      commit('SET_NAME', nickname)
      commit('SET_AVATAR', avatar)
      return data
    })
  },

  LogOut({ commit }: UserActionContext): Promise<void> {
    return logout().then(() => {
      commit('SET_ROLES', [])
      commit('SET_PERMISSIONS', [])
      removeToken()
      removeTenantId()
      storage.clean()
    })
  }
}

const user: Module<UserState, RootState> = {
  state,
  mutations,
  actions
}

export default user
