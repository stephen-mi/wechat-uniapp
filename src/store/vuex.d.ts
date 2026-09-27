import 'vuex'
import type {
  CreatePhotoRecordPayload,
  LoginFormPayload,
  LoginWithTenantPayload,
  PhotoPageGroupResult,
  PhotoPageParams,
  PreLoginResult
} from '@/store/types'
import type { PermissionInfoVO } from '@/types/api'

declare module 'vuex' {
  interface Store<S = unknown> {
    dispatch(type: 'PreLogin', payload: LoginFormPayload): Promise<PreLoginResult>
    dispatch(type: 'Login', payload: LoginFormPayload): Promise<void>
    dispatch(type: 'LoginWithTenant', payload: LoginWithTenantPayload): Promise<void>
    dispatch(type: 'GetInfo'): Promise<PermissionInfoVO>
    dispatch(type: 'LogOut'): Promise<void>
    dispatch(type: 'CreatePhotoRecord', payload: CreatePhotoRecordPayload): Promise<void>
    dispatch(type: 'DeletePhotoRecord', id: number | string): Promise<void>
    dispatch(type: 'GetPhotoPage', params: PhotoPageParams): Promise<PhotoPageGroupResult>
  }
}

export {}
