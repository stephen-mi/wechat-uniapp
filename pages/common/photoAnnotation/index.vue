<template>
	<view class="photo-annotation">
		<view class="sign-name">
			<canvas class="sign-canvas" canvas-id="canvasId" @touchstart="touchstart"
				@touchmove.stop.prevent="touchmove" id="canvasId" width="300" height="200"></canvas>
		</view>

		<view class="btn-box">
			<button class="cancel" @click="clear()">清除</button>
			<button class="submit" @click="sure()">提交</button>
		</view>
	</view>
</template>

<script>
	export default {
		name: 'index',
		props: {
			photoUrl: {
				type: String,
				default: ''
			},
			showModel: {
				type: Boolean,
				default: false
			}
		},
		data() {
			return {
				drawContext: '',
				moveX: '',
				moveY: '',
				initImgWidth: '',
				initImgHeight: '',
				targetImgUrl: ''
			}
		},
		watch: {
			showModel: {
				handler(val) {
					if (val) {
						this.init(this.photoUrl)

					}
				},
				// immediate: true
			}
		},
		mounted() {
			// this.init()
		},
		// mounted() {
		// 	// let context = uni.createCanvasContext('canvasId')
		// 	// // 设置线条
		// 	// context.lineWidth = 4
		// 	// context.setLineCap('round')
		// 	// context.setLineJoin('round')
		// 	// // 赋值
		// 	// this.drawContext = context
		// },
		methods: {
			init(url) {
				this.$nextTick(() => {
					const ctx = uni.createCanvasContext('canvasId')
					console.log(ctx, 'ctx')
					this.drawContext = ctx
					let vm = this

					// const eventChannel = this.getOpenerEventChannel();
					// console.log(this.drawContext, 'eventChannel')
					// eventChannel.on('acceptDataFromOpenerPage', function(data) {

					vm.targetImgUrl = url
					// 获取图片的宽高
					uni.getImageInfo({
						src: url,
						success: function(image) {
							vm.initImgWidth = image.width;
							vm.initImgHeight = image.height;
							console.log('图片高度：', vm.initImgHeight)
							console.log('图片宽度：', vm.initImgWidth)
							console.log('图片纵横比', image.width / image.height)
							const widthHeight = image.height / image.width
							const editHeight = widthHeight * vm.initImgWidth

							console.log('照片路径', image.path)
							console.log('画布的高度', editHeight)
							console.log('画布的宽度', vm.initImgWidth)
							vm.drawContext.drawImage(image.path, 0, 0, 300, 150)
							vm.drawContext.draw()
							// 设置画笔颜色
							// vm.updateDrawContext()
						},
						error: function(err) {
							console.log(err)
						},
						complete: function(end) {
							console.log(end, 'complete')
						}
					});
					// })
				})
			},
			touchstart(e) {
				// 取出x、y的值
				let {
					x,
					y
				} = e.changedTouches[0]
				// 绘制线条起点
				this.drawContext.beginPath()
				this.drawContext.moveTo(x, y)
				// 起点与移动的连接断开
				this.moveX = ''
				this.moveY = ''
			},
			touchmove(e) {
				// 取出x, y的值
				let {
					x,
					y
				} = e.changedTouches[0]
				// 防止线条出现断点
				if (this.moveX && this.moveY) {
					this.drawContext.moveTo(this.moveX, this.moveY)
					this.drawContext.lineTo(this.moveX, this.moveY)
				}
				this.drawContext.lineTo(x, y)
				this.moveX = x
				this.moveY = y
				this.drawContext.stroke()
				// ture，保留之前的内容
				this.drawContext.draw(true)
			},
			// 清除
			clear() {
				// 清除重新绘制
				let vm = this;
				console.log('重新绘制')
				// 重新绘制图片   targetImgUrl为原先图片的url    editWidth是canvas的宽度
				vm.drawContext.drawImage(vm.targetImgUrl, 0, 0, vm.editWidth, vm.editHeight)
				vm.drawContext.draw()
				// 重新设置颜色    这是封装的一个方法，画笔颜色宽度什么的
				// vm.updateDrawContext()
			},
			sure() {
				this.$emit('close')
				uni.canvasToTempFilePath({
					canvasId: 'shareCanvas', // canvas元素的id值
					destHeight: this.initImgHeight, // initImgHeight是传入图片时获取到的图片高度
					destWidth: this.initImgWidth, // 传入图片原先的宽度
					success: function(res) {
						// eventChannel.emit('someEvent', {data: 'data from test page for someEvent'});
						vm.eventChannel.emit('getEditCompleteImg', {
							data: res.tempFilePath
						});
						// 返回页面
						uni.navigateBack()
					}
				})
			},
			// 导出图片
			signImage() {
				uni.showLoading({
					title: '签到中...',
					mask: true
				});
				let {
					windowWidth,
					windowHeight
				} = this
				uni.canvasToTempFilePath({
					x: 0,
					y: 0,
					canvasId: 'canvasId',
					fileType: 'jpg',
					success: (res) => {
						// 在H5平台下，tempFilePath 为 base64
						this.pathToBase64App(res.tempFilePath)
						// this.uploadFile(res.tempFilePath)
					},
					fail: (res) => {
						console.log(res)
					}
				})
			},
			pathToBase64App(path) {
				let that = this;
				// 通过URL参数获取目录对象或文件对象
				plus.io.resolveLocalFileSystemURL(path, function(entry) {
					entry.file(function(file) {
						let fileReader = new plus.io.FileReader()
						fileReader.onload = function(evt) {
							let base64 = evt.target.result.split(',')[1]
							that.uploadSign(base64)
						}
						fileReader.onerror = function(error) {
							console.log('failed: ', error);
						}
						fileReader.readAsDataURL(file)
					}, function(error) {
						console.log('failed: ', error);
					})
				}, function(error) {
					console.log('failed: ', error);
				})
			},
			uploadSign(base64) {
				uploadSign({
					fileBase64: base64,
					meetingId: this.meetInfo.MeetingId,
					uploadId: this.meetInfo.PersonnelId,
					uploadName: this.meetInfo.PersonnelName,
					fileName: this.meetInfo.PersonnelName + '签到'
				}).then(res => {
					uni.hideLoading()
					this.$emit('close', '')
					this.getMeeting();
					uni.showToast({
						title: '签到成功',
						icon: 'none',
						duration: 2000
					})
				})
			},
			getMeeting() {
				getMeeting({
					Mac: this.macId ? this.macId : '4'
				}).then(res => {
					if (res.success) {
						this.$store.commit('setMeetInfo', res.result)
					}
				})
			},
		}
	}
</script>

<style lang="scss">
	.photo-annotation {
		display: flex;
		flex-direction: column;

		.sign-name {
			height: 160px;

			.sign-canvas {}
		}

		.btn-box {
			display: flex;
			flex-direction: row;
			height: 20px;

			.submit,
			.cancel {
				font-size: 14px;
				height: 36px;
				line-height: 36px;
			}
		}
	}
</style>