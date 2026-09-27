import request from '@/utils/request'
import { setTenantId } from '@/utils/auth'
import type { ApiEnvelope } from '@/utils/http/types'
import type { PermissionInfoVO, PreLoginRespVO, TokenVO } from '@/types/api'

const noTokenHeader = { isToken: false }

export interface UserLoginVO {
  username: string
  password: string
  captchaVerification?: string
}

export interface LoginWithTenantVO {
  userId: number
  tenantId: number
}

export function preLogin(data: UserLoginVO) {
  return request<PreLoginRespVO>({
    url: '/system/auth/pre-login',
    method: 'POST',
    data,
    headers: noTokenHeader
  })
}

export function loginWithTenant(data: LoginWithTenantVO) {
  return request<TokenVO>({
    url: '/system/auth/login-with-tenant',
    method: 'POST',
    data,
    headers: noTokenHeader
  })
}

export function login(username: string, password: string, captchaVerification?: string) {
  return preLogin({
    username,
    password,
    captchaVerification: captchaVerification || ''
  }).then((res) => {
    const tenants = res.data?.tenants ?? []
    if (tenants.length === 0) {
      return Promise.reject(new Error('未找到可用租户'))
    }
    const tenant = tenants[0]
    return loginWithTenant({
      userId: tenant.userId,
      tenantId: tenant.id
    }).then((tokenRes) => {
      setTenantId(tenant.id)
      return tokenRes
    })
  })
}

export function getInfo() {
  return request<PermissionInfoVO>({
    url: '/system/auth/get-permission-info',
    method: 'GET'
  })
}

export function logout() {
  return request<null>({
    url: '/system/auth/logout',
    method: 'POST'
  })
}

export type { ApiEnvelope }
