export interface TenantVO {
  id: number
  name: string
  userId: number
}

export interface PreLoginRespVO {
  userId: number
  nickname: string
  tenants: TenantVO[]
}

export interface TokenVO {
  accessToken: string
  refreshToken: string
  userId?: number
  expiresTime?: number
}

export interface ApiResult<T = unknown> {
  code: number
  data: T
  msg: string
}

export interface PermissionUserVO {
  id: number
  nickname: string
  avatar: string
  mobile?: string
  email?: string
  createTime?: string | number
  posts?: Array<{ name: string }>
  roles?: Array<{ name: string }>
}

export interface PermissionInfoVO {
  user: PermissionUserVO | null
  roles: string[]
  permissions: string[]
}

export interface UserProfileVO {
  nickname: string
  mobile: string
  email: string
  sex: string | number
  createTime?: string | number
  posts?: Array<{ name: string }>
  roles?: Array<{ name: string }>
}
