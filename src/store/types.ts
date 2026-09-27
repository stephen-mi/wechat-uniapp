import type { PreLoginRespVO } from '@/types/api'

export interface UserState {
  id: number
  name: string
  avatar: string
  roles: string[]
  permissions: string[]
}

export interface PhotoState {
  id: number
}

export interface RootState {
  user: UserState
  photo: PhotoState
}

export interface LoginFormPayload {
  username: string
  password: string
  captchaVerification?: string
}

export interface LoginWithTenantPayload {
  userId: number
  tenantId: number
}

export type PreLoginResult = PreLoginRespVO

export interface CreatePhotoRecordPayload {
  photoFileIds: string
  voiceText: string
}

export interface PhotoPageParams {
  pageNo: number
  pageSize: number
}

export interface PhotoPageGroupResult {
  groupList: Record<string, AlbumPhotoItem[]>
}

export interface AlbumPhotoItem {
  id: number | string
  url: string
  voiceText?: string
  checked?: boolean
}
