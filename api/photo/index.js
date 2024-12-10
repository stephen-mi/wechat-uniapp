import upload from '@/utils/upload'
import request from '@/utils/request'

// 上传文件
export function uploadFile(data) {
	return request({
		url: '/infra/file/uploadFile',
		method: 'POST',
		// headers: {
		// 	'Content-Type': 'form-data/file'
		// }
		data
	})
}
// 新建照片记录
export function createPhotoRecord(data) {
	return request({
		url: '/gz/photo-record/create',
		method: 'POST',
		data
	})
}
// 更新照片记录
export function updatePhotoRecord(data) {
	// const data = {
	// 	"id": 11,
	// 	"photoFileId": 1562,
	// 	"voiceFileId": 1562,
	// 	"voiceText": "语音转文字内容123"
	// }

	return request({
		url: '/gz/photo-record/update',
		method: 'PUT',
		data: data
	})
}

// 删除照片记录
export function deletePhotoRecord(id) {
	return request({
		url: `/gz/photo-record/delete?id=${id}`,
		method: 'DELETE'
	})
}

// 获取照片详情
export function getPhotoRecordDetail(id) {
	return request({
		url: `/gz/photo-record/getDetail?id=${id}`,
		method: 'GET'
	})
}

// 创建照片标签
export function createPhotoTags(data = {
	photoId: '',
	name: ''
}) {
	return request({
		url: '/gz/tags/createPhotoTags',
		method: 'POST',
		data
	})
}

// 查询照片标签列表
export function getPhotoTagsByPhotoId(photoId) {
	return request({
		url: `/gz/tags/getPhotoTagsByPhotoId?photoId=${photoId}`,
		method: 'GET'
	})
}

// 删除照片记录
export function deleteTagsByMapId(
	photoId = '',
	tagsId = ''
) {
	return request({
		url: `/gz/tags/deleteTagsByMapId?photoId=${photoId}&tagsId=${tagsId}`,
		method: 'DELETE'
	})
}

// 获取相册列表
export function getPhotoAlbum() {
	return request({
		url: `/gz/photo-record/getPhotoAlbum`,
		method: 'GET'
	})
}

// 获取相册内容
export function getPhotoRecordList(data) {
	return request({
		url: `/gz/photo-record/getPhotoRecordList`,
		method: 'POST',
		data
	})
}

// 照片按日期分组
export function getPhotoPage(params) {
	return request({
		url: `/gz/photo-record/getPhotoPage?pageNo=${params.pageNo}&pageSize=${params.pageSize}`,
		method: 'GET'
	})
}
// 根据语音文本提取标签