import config from '@/config'
// import storage from '@/utils/storage'
// import constant from '@/utils/constant'
import {
	uploadFile,
	createPhotoRecord,
	updatePhotoRecord,
	deletePhotoRecord,
	getPhotoRecordDetail,
	createPhotoTags,
	getPhotoTagsByPhotoId,
	deleteTagsByMapId,
	getPhotoAlbum,
	getPhotoRecordList,
	getPhotoPage
} from '@/api/photo/index.js'


const baseUrl = config.baseUrl

const photo = {
	state: {
		id: 0, // 用户编号

	},

	mutations: {
		SET_ID: (state, id) => {
			state.id = id
		}
	},

	actions: {
		// 上传文件
		UploadFile({
			commit
		}, fileInfo) {
			return new Promise((resolve, reject) => {
				uploadFile(fileInfo).then(res => {
					res = res.data;
					resolve()
				}).catch(error => {
					reject(error)
				})
			})
		},
		// 新建照片记录
		CreatePhotoRecord({
			commit
		}, params) {
			return new Promise((resolve, reject) => {
				createPhotoRecord(params).then(res => {
					res = res.data;
					resolve()
				}).catch(error => {
					reject(error)
				})
			})
		},
		// 删除照片记录
		DeletePhotoRecord({
			commit
		}, id) {
			return new Promise((resolve, reject) => {
				deletePhotoRecord(id).then(res => {
					resolve()
				}).catch(error => {
					reject(error)
				})
			})
		},
		// 新建照片标签
		CreatePhotoTags({
			commit
		}, data) {
			return new Promise((resolve, reject) => {
				createPhotoTags({
					photoId: data.photoId,
					name: data.text
				}).then(res => {
					res = res.data;
					resolve()
				}).catch(error => {
					reject(error)
				})
			})
		},
		// 获取照片标签
		GetPhotoTagsByPhotoId({
			commit
		}, photoId) {
			return new Promise((resolve, reject) => {
				getPhotoTagsByPhotoId(
					photoId,
				).then(res => {
					res = res.data;
					resolve()
				}).catch(error => {
					reject(error)
				})
			})
		},
		// 获取照片列表
		GetPhotoAlbum({
			commit
		}, photoId) {
			return new Promise((resolve, reject) => {
				getPhotoAlbum().then(res => {
					res = res.data;
					resolve()
				}).catch(error => {
					reject(error)
				})
			})
		},
		// 照片按日期分组
		GetPhotoPage({
			commit
		}, params) {
			return new Promise((resolve, reject) => {
				getPhotoPage(params).then(res => {
					res = res.data;
					resolve(res)
				}).catch(error => {
					reject(error)
				})
			})
		},
	}
}

export default photo