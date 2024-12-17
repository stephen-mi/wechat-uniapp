<template>
	<view class="content">
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
					<image v-if="fileList.length > 0" @click="handleClickImg(fileList[0].url, index)"
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
		<u-modal :show="showModel" @confirm="confirm" :showConfirmButton="false" :closeOnClickOverlay="true"
			ref="uModal">
			<photo-annotation :photo-url="photoUrl" :show-model="showModel"
				@close="showModel = false"></photo-annotation>
		</u-modal>
		<!-- <u-modal v-model="showModel">
			<photo-annotation :photo-url="photoUrl"></photo-annotation>
		</u-modal> -->

	</view>
</template>

<script>
	import {
		getAccessToken
	} from '@/utils/auth'
	import photoAnnotation from './common/photoAnnotation/index'
	const plugin = requirePlugin('WechatSI')
	const manager = plugin.getRecordRecognitionManager()
	export default {
		components: {
			photoAnnotation
		},
		data() {
			return {
				animationData: {},
				off: true,
				x: 320, //x坐标
				y: 420, //y坐标

				cameraPosition: 'back', // 默认使用后置摄像头
				isRecording: false,
				voiceText: '',
				fileList: [],
				recordingBtnText: '说',
				isShow: false,
				showModel: false,
				photoUrl: ''
			};
		},
		mounted() {
			this.initRecord()
		},
		methods: {
			confirm() {
				setTimeout(() => {
					// 3秒后自动关闭
					this.show = false;
					// 如果不想关闭，而单是清除loading状态，需要通过ref手动调用方法
					// this.$refs.uModal.clearLoading();
				}, 3000)
			},
			handleClickImg(url) {
				this.showModel = true
				this.photoUrl = url
				const vm = this
				// uni.navigateTo({
				// 	url: '/pages/common/photoAnnotation/index',
				// 	events: {
				// 		acceptDataFromOpenedPage: function(data) {
				// 			console.log(data, 'data')
				// 		},
				// 		getEditCompleteImg: function(imgData) {
				// 			console.log(imgData, 'imgData')
				// 			// 和之前一样的处理逻辑
				// 		}
				// 	},
				// 	success: function(res) {
				// 		console.log('res', res)
				// 		res.eventChannel.emit('acceptDataFromOpenerPage', {
				// 			data: url
				// 		})
				// 	}
				// })
			},
			// 悬浮按钮
			declick() {
				if (this.off) {
					//使用动画
					this.rotateAndScale()
				} else {
					this.norotateAndScale()
				}
				this.off = !this.off
			},
			//定义动画内容
			rotateAndScale() {
				var animation = uni.createAnimation({
					duration: 500,
					trmingFunction: 'ease'
				})
				this.animation = animation
				this.animation.rotate(0).translateY(-167).step();
				//导出动画数据传递给data层
				this.animationData = this.animation.export();
			},
			//当!off的时候动画回到原始位置
			norotateAndScale() {
				this.animation.rotate(0).translateY(0).step();
				this.animationData = this.animation.export();
			},
			touchStart() {
				this.isShow = true
				this.recordingBtnText = '正在录音...'
				manager.start({
					//指定录音的时长，单位ms，最大为60000
					duration: 60000,
					//识别的语言，目前支持zh_CN en_US zh_HK
					lang: 'zh_CN'
				})

			},
			touchEnd() {
				uni.showToast({
					title: "录音完成",
					icon: "none",
				});
				this.isShow = false

				this.recordingBtnText = '说'
				manager.stop()
				manager.onStop = (res) => {
					console.log("record file path", res.tempFilePath)
					console.log("result", res.result)
					this.voiceText = res.result
				}
				manager.onStart = function(res) {
					console.log("成功开始录音识别", res)
				}
				manager.onError = function(res) {
					console.error("error msg", res.msg)
				}
			},
			/**
			 * 初始化语音识别回调
			 * 绑定语音播放开始事件
			 */
			initRecord() {
				manager.onStop = (res) => {
					console.log('语音初始话开始')
				}
				//有新的识别内容返回，则会调用此事件
				manager.onRecognize = (res) => {}
				// 识别结束事件
				manager.onStop = (res) => {
					console.log('语音初始化结束', res.result)
				}
				// 识别错误事件
				manager.onError = (res) => {}
			},
			handleError(e) {
				console.error('相机错误：', e.detail);
			},
			toggleCamera() {
				this.cameraPosition = this.cameraPosition === 'back' ? 'front' : 'back';
			},
			jumpToAlbum() {
				this.$tab.navigateTo('/pages/album/index')
			},
			takePhoto() {
				if (this.fileList.length >= 4) {
					this.$modal.showToast('已经拍摄四张照片')
					return
				}
				const ctx = uni.createCameraContext();
				ctx.takePhoto({
					quality: 'high',
					success: (res) => {
						// this.fileList.unshift({
						// 	url: res.tempImagePath
						// })
						this.uploadFile(res.tempImagePath)
					},
					fail: (err) => {
						console.error('拍照失败：', err);
					}
				});

				// const that = this;
				// uni.chooseImage({
				//   count: 1, // 默认9
				//   sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
				//   sourceType: ['camera'], // 从相机选择
				//   success(res) {
				//     // tempFilePath可以作为img标签的src属性显示图片
				//     const tempFilePaths = res.tempFilePaths;
				//     that.photoPath = tempFilePaths[0];
				//   }
				// });
			},
			uploadFile(filePath) {
				const uploadTask = uni.uploadFile({
					url: 'https://www.heimi.site/gz-api/v1/admin-api/infra/file/uploadFile',
					header: {
						'Authorization': 'Bearer ' + getAccessToken(),
						'tenant-id': '1',
						'content-type': 'multipart/form-data'
					},
					filePath,
					name: 'file',
					formData: {
						"file": filePath
					},
					success: (res) => {
						console.log('上传成功', res)
						const data = JSON.parse(res.data).data
						this.fileList.unshift(data)
					},
					fail(err) {
						console.log('上传失败', err)
					}
				})
				uploadTask.onProgressUpdate((res) => {
					console.log('上传进度', res.progress)
				})
			},
			createPhotoRecord() {
				this.$modal.loading("存储中")
				const photoFileIds = this.fileList.map(item => item.id)
				const params = {
					photoFileIds: photoFileIds.join(','),
					voiceText: this.voiceText
				}
				this.$store.dispatch('CreatePhotoRecord', params).then((res) => {
					this.$modal.closeLoading()
					console.log(res, 'CreatePhotoRecord')
					this.fileList = []
					this.voiceText = ''
				})

			},
			removePicture(index) {
				const id = this.fileList[index].id
				this.$store.dispatch('DeletePhotoRecord', id).then(res => {
					if (res) {
						this.fileList.splice(index, 1)
					}
				})

			},
		},
		onUnload() {
			// 页面卸载时确保停止语音识别，避免后台持续录音
			if (this.isRecording) {
				this.stopRecognition();
			}
		}
	};
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