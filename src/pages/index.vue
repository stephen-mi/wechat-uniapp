<template>
	<view class="content" :style="pageStyle">
		<!-- 顶部 -->
		<view class="image-preview">
			<!-- 相机预览区域 -->
			<camera device-position="back" flash="off" @error="handleError" style="width: 100%; height: 260px;">
			</camera>
		</view>
		<!-- 中部 -->
		<view class="image-recording-content">
			<view class="image-list">
				<view class="first-image-wrap">
					<image v-if="fileList.length > 0" @click="handleClickImg(fileList[0].url, 0)"
						class="first-image" :src="fileList[0].url"></image>
				</view>
				<view class="other-image-wrap">
					<view class="other-image-item" v-for="(file, index) in fileList" :key="file.url">
						<image :src="file.url" @click="handleClickImg(file.url, index)"></image>
						<icon type="clear" size="16" color="#ff0000" @click="removePicture(index)" />
					</view>
				</view>

			</view>
			<view class="recording-result">
				<textarea class="result-input" v-model="voiceText" placeholder="请语音描述" />
			</view>
		</view>
		<!-- 底部 -->
		<view class="bottom-btn">
			<!-- <button @click="toggleCamera"><van-icon name="switch"></van-icon>切换摄像头</button> -->
			<view class="album-btn-container">
				<u-button @click="jumpToAlbum" icon="photo-fill" text="相册"></u-button>
			</view>
			<view class="camera-btn-container">
				<view class="camera-btn" @click="takePhoto">拍</view>
			</view>
			<view class="recording-btn-container">
				<view class="recording-btn" @touchstart="touchStart" @touchend="touchEnd">
					<text>说</text>
				</view>
				<view class="center" style="background-color: #555555; color: #fff" v-if="isShow">
					正在录音...
				</view>
			</view>
			<view class="save-btn-container">
				<u-button @click="createPhotoRecord" :disabled="fileList.length === 0 || !voiceText"
					icon="checkbox-mark" text="保存"></u-button>
			</view>
			<!-- <movable-area class="fixed-box">
				<movable-view class="fixed-button" :x="x" :y="y" direction="all">

					<view class="menuBox">
						<u-icon name="grid-fill" size="29" color="#4888f4" @click="declick"></u-icon>

						<view class="posi" :animation="animationData">
							<button class="menu-btn" hover-class="hClass" open-type="contact" @click="gzwFile()">
								相册
							</button>
							<button class="menu-btn" hover-class="hClass" open-type="contact" @click="sjFile()">
								
								保存
							</button>
						</view>
					</view>
				</movable-view>
			</movable-area> -->
		</view>
		<u-modal :show="showModel" :showConfirmButton="false" :closeOnClickOverlay="true" @confirm="confirm"
			ref="uModal">
			<photo-annotation :photo-url="photoUrl" :show-model="showModel"
				@close="showModel = false"></photo-annotation>
		</u-modal>
		<!-- <u-modal v-model="showModel">
			<photo-annotation :photo-url="photoUrl"></photo-annotation>
		</u-modal> -->

	</view>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { onUnload } from '@dcloudio/uni-app'
import config from '@/config'
import { getAccessToken, getTenantId } from '@/utils/auth'
import PhotoAnnotation from './common/photoAnnotation/index.vue'
import { useAppStore } from '@/composables/useAppStore'
import { useModal } from '@/composables/useModal'
import { useTab } from '@/composables/useTab'
import type { ApiEnvelope } from '@/utils/http/types'
import type { WechatRecordManager } from '@/pages/index.types'
import { getNavLayout } from '@/utils/layout-metrics'

interface UploadedFileItem {
  id: number | string
  url: string
}

const store = useAppStore()
const modal = useModal()
const tab = useTab()

const plugin = requirePlugin('WechatSI') as { getRecordRecognitionManager: () => WechatRecordManager }
const manager = plugin.getRecordRecognitionManager()

const pageStyle = ref<Record<string, string>>({})

const voiceText = ref('')
const fileList = ref<UploadedFileItem[]>([])
const isShow = ref(false)
const showModel = ref(false)
const photoUrl = ref('')

function confirm(): void {
  setTimeout(() => {
    showModel.value = false
  }, 3000)
}

function handleClickImg(url: string, _index: number): void {
  showModel.value = true
  photoUrl.value = url
}

function touchStart(): void {
  isShow.value = true
  manager.start({ duration: 60000, lang: 'zh_CN' })
}

function touchEnd(): void {
  uni.showToast({ title: '录音完成', icon: 'none' })
  isShow.value = false
  manager.stop()
  manager.onStop = (res) => {
    voiceText.value = res.result
  }
}

function initRecord(): void {
  manager.onRecognize = () => undefined
  manager.onStop = (res) => {
    voiceText.value = res.result
  }
  manager.onError = () => undefined
}

function handleError(e: { detail: unknown }): void {
  console.error('相机错误：', e.detail)
}

function jumpToAlbum(): void {
  tab.navigateTo('/pages/album/index')
}

function takePhoto(): void {
  if (fileList.value.length >= 4) {
    modal.showToast('已经拍摄四张照片')
    return
  }
  const ctx = uni.createCameraContext()
  ctx.takePhoto({
    quality: 'high',
    success: (res) => {
      uploadFile(res.tempImagePath)
    },
    fail: (err) => {
      console.error('拍照失败：', err)
    }
  })
}

function uploadFile(filePath: string): void {
  const apiBase = config.apiBase || config.baseUrl + config.baseApi
  const header: Record<string, string> = {
    Authorization: `Bearer ${getAccessToken()}`,
    'content-type': 'multipart/form-data'
  }
  const tenantId = getTenantId()
  if (tenantId) {
    header['tenant-id'] = tenantId
  }
  const uploadTask = uni.uploadFile({
    url: `${apiBase}/infra/file/uploadFile`,
    header,
    filePath,
    name: 'file',
    formData: { file: filePath },
    success: (res) => {
      const payload = JSON.parse(res.data) as ApiEnvelope<UploadedFileItem>
      fileList.value.unshift(payload.data)
    },
    fail: (err) => {
      console.log('上传失败', err)
    }
  })
  uploadTask.onProgressUpdate((res) => {
    console.log('上传进度', res.progress)
  })
}

function createPhotoRecord(): void {
  modal.loading('存储中')
  const photoFileIds = fileList.value.map((item) => item.id)
  const params = {
    photoFileIds: photoFileIds.join(','),
    voiceText: voiceText.value
  }
  void store.dispatch('CreatePhotoRecord', params).then(() => {
    modal.closeLoading()
    fileList.value = []
    voiceText.value = ''
  })
}

function removePicture(index: number): void {
  const id = fileList.value[index]?.id
  if (id == null) {
    return
  }
  void store.dispatch('DeletePhotoRecord', id).then(() => {
    fileList.value.splice(index, 1)
  })
}

onMounted(() => {
  pageStyle.value = { paddingTop: `${getNavLayout().navTotalHeight}px` }
  initRecord()
})

onUnload(() => {
  manager.stop()
})
</script>

<style lang="scss">
	.content {
		display: flex;
		flex-direction: column;
		align-items: center;
		height: 100vh;
		margin-top: 48px;

		.image-preview {
			width: 100%;
			display: flex;
			flex-direction: row;
			align-items: center;
			justify-content: center;
			height: 260px;
			margin: 10px;
			box-sizing: border-box;
		}

		.image-recording-content {
			display: flex;
			justify-content: space-between;
			height: 235px;
			margin: 0 10px;
			width: calc(100% - 20px);

			.image-list {
				height: 100%;
				display: flex;
				flex-direction: column;
				justify-content: flex-start;
				width: 50%;
				border: 1px solid #ddd;
				padding: 10px 5px;
				border-radius: 5px;
				margin-right: 5px;

				.first-image-wrap {
					width: 100%;
					height: 150px;

					.first-image {
						width: 100%;
						height: 100%;
					}
				}

				.other-image-wrap {
					display: flex;
					flex-direction: row;
					justify-content: flex-start;
					// overflow-x: scroll;
					padding: 10px 0;

					.other-image-item {
						height: 50px;
						width: 50px;
						margin: 0 3px;
						position: relative;

						image {
							height: 50px;
							width: 50px;
						}

						icon {
							position: absolute;
							right: -5px;
							top: -5px;
							color: #ff0000;
						}

						:nth-child(1) {
							margin-left: 0;
						}
					}
				}
			}

			.recording-result {
				width: 50%;
				height: 100%;
				display: flex;
				align-items: center;

				.result-input {
					padding: 10px;
					width: 100%;
					display: inline-block;
					height: 100%;
					border: 1px solid #ddd;
					border-radius: 5px;
				}
			}

		}

		.bottom-btn {
			width: 100%;
			display: flex;
			flex-direction: row;
			position: absolute;
			bottom: 15px;
			justify-content: space-around;

			.album-btn-container {
				margin-top: 6px;
			}

			.camera-btn-container {
				background-color: #ddd;
				width: 64px;
				height: 64px;
				border-radius: 50%;
				padding: 7px;

				.camera-btn {
					width: 50px;
					height: 50px;
					border-radius: 50%;
					background-color: #fff;
					line-height: 50px;
					text-align: center;
					font-weight: 600;
					font-size: 20px;
				}
			}

			.recording-btn-container {
				background-color: rgb(213, 246, 145);
				width: 64px;
				height: 64px;
				border-radius: 50%;
				padding: 7px;

				.recording-btn {
					width: 50px;
					height: 50px;
					border-radius: 25px;
					background-color: #fff;
					line-height: 50px;
					text-align: center;
					font-weight: 600;
					font-size: 20px;
					display: flex;
					flex-direction: row;
					justify-content: center;

					// text {
					// 	margin-right: 10px;
					// }
				}
			}

			.save-btn-container {
				margin-top: 6px;
			}

			button {
				margin: 5px;
			}
		}

		// $all_width: 56rpx;
		// $all_height: 56rpx;

		// .movable-area {
		// 	height: 100vh;
		// 	width: 750rpx;
		// 	top: 0;
		// 	position: fixed;
		// 	z-index: 100;
		// 	pointer-events: none; //此处要加，鼠标事件可以渗透

		// 	.movable-view {
		// 		width: $all_width;
		// 		height: $all_height;
		// 		pointer-events: auto; //恢复鼠标事件
		// 		border: 2px solid #4888f4;
		// 		border-radius: 50%;
		// 	}
		// }
	}

	.center {
		text-align: center;
		align-items: center;
		width: 200rpx;
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		padding: 20rpx;
		border-radius: 20rpx;
		opacity: 0.8;
	}

	// 移动按钮
	.menuBox {
		width: 140rpx;
		height: 100%;
		z-index: 1;
		position: relative;
		right: -2rpx;
		bottom: 0px;
		overflow: hidden;
		border-radius: 45rpx;
		display: flex;
		justify-content: center;
		align-items: center;
		flex-direction: row;
	}

	.fixed-box {
		pointer-events: none;
		width: 100vw;
		height: 100vh;
		position: fixed;
		left: 4rpx;
		bottom: 0;
		z-index: 100000;
	}

	.fixed-button {
		pointer-events: auto;
		width: 200rpx;
		height: 340rpx;
		right: 200rpx;
		left: auto;
		top: 80vh;
		display: flex;
		justify-content: center;
		align-items: center;
		border-radius: 55rpx;
	}

	::v-deep .menu-btn {
		height: 30px;
		width: 100rpx;
		background-color: transparent;
		display: inline-block;
		padding-left: 0px !important;
		margin-left: 0px !important;
		font-size: 14px !important;
		color: white;
		text-align: center;
		line-height: 30px;

		&:first-child {
			margin-top: 30rpx;
		}

		// margin-top: 16rpx;
	}

	.posi {
		width: 120rpx;
		height: 160rpx !important;
		position: absolute;
		left: 0rpx;
		bottom: -160rpx;
		z-index: -1;
		display: flex;
		align-items: center;
		flex-direction: column;
		background-color: #3c9cff;
		border-radius: 10rpx;
	}

	.posi>image {
		width: 50rpx;
		height: 50rpx;
		margin-top: 30rpx;
	}

	.hClass {
		background-color: red !important;
	}
</style>