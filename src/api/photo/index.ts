import request from '@/utils/request'
import type { PhotoPageGroupResult, PhotoPageParams } from '@/store/types'
import type { CreatePhotoRecordPayload } from '@/store/types'

export function uploadFile(data: Record<string, unknown>) {
  return request({
    url: '/infra/file/uploadFile',
    method: 'POST',
    data
  })
}

export function createPhotoRecord(data: CreatePhotoRecordPayload) {
  return request({
    url: '/gz/photo-record/create',
    method: 'POST',
    data
  })
}

export function updatePhotoRecord(data: Record<string, unknown>) {
  return request({
    url: '/gz/photo-record/update',
    method: 'PUT',
    data
  })
}

export function deletePhotoRecord(id: string) {
  return request({
    url: `/gz/photo-record/delete?id=${id}`,
    method: 'DELETE'
  })
}

export function getPhotoRecordDetail(id: string | number) {
  return request({
    url: `/gz/photo-record/getDetail?id=${id}`,
    method: 'GET'
  })
}

export function createPhotoTags(data: { photoId: string; name: string }) {
  return request({
    url: '/gz/photo-tag/create',
    method: 'POST',
    data
  })
}

export function getPhotoTagsByPhotoId(photoId: string | number) {
  return request({
    url: `/gz/photo-tag/getPhotoTagsByPhotoId?photoId=${photoId}`,
    method: 'GET'
  })
}

export function deleteTagsByMapId(id: string | number) {
  return request({
    url: `/gz/photo-tag/delete?id=${id}`,
    method: 'DELETE'
  })
}

export function getPhotoAlbum() {
  return request({
    url: '/gz/photo-record/getPhotoAlbum',
    method: 'GET'
  })
}

export function getPhotoRecordList(data: Record<string, unknown>) {
  return request({
    url: '/gz/photo-record/getPhotoRecordList',
    method: 'POST',
    data
  })
}

export function getPhotoPage(params: PhotoPageParams) {
  return request<PhotoPageGroupResult>({
    url: `/gz/photo-record/getPhotoPage?pageNo=${params.pageNo}&pageSize=${params.pageSize}`,
    method: 'GET'
  })
}
