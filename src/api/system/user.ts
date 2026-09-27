import upload from '@/utils/upload'
import request from '@/utils/request'
import type { UserProfileVO } from '@/types/api'

export function updateUserPwd(oldPassword: string, newPassword: string) {
  const data = { oldPassword, newPassword }
  return request({
    url: '/system/user/profile/update-password',
    method: 'PUT',
    params: data
  })
}

export function getUserProfile() {
  return request<UserProfileVO>({
    url: '/system/user/profile/get',
    method: 'GET'
  })
}

export function updateUserProfile(data: UserProfileVO) {
  return request({
    url: '/system/user/profile/update',
    method: 'PUT',
    data
  })
}

export function uploadAvatar(data: { name: string; filePath: string }) {
  return upload({
    url: '/system/user/profile/update-avatar',
    method: 'PUT',
    name: data.name,
    filePath: data.filePath
  })
}
