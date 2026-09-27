<template>
	<view class="container">
		<view class="page-body uni-content-info">
			<view class='cropper-content'>
				<view v-if="isShowImg" class="uni-corpper" :style="'width:'+cropperInitW+'px;height:'+cropperInitH+'px;background:#000'">
					<view class="uni-corpper-content" :style="'width:'+cropperW+'px;height:'+cropperH+'px;left:'+cropperL+'px;top:'+cropperT+'px'">
						<image :src="imageSrc" :style="'width:'+cropperW+'px;height:'+cropperH+'px'"></image>
						<view class="uni-corpper-crop-box" @touchstart.stop="contentStartMove" @touchmove.stop="contentMoveing" @touchend.stop="contentTouchEnd"
						    :style="'left:'+cutL+'px;top:'+cutT+'px;right:'+cutR+'px;bottom:'+cutB+'px'">
							<view class="uni-cropper-view-box">
								<view class="uni-cropper-dashed-h"></view>
								<view class="uni-cropper-dashed-v"></view>
								<view class="uni-cropper-line-t" data-drag="top" @touchstart.stop="dragStart" @touchmove.stop="dragMove"></view>
								<view class="uni-cropper-line-r" data-drag="right" @touchstart.stop="dragStart" @touchmove.stop="dragMove"></view>
								<view class="uni-cropper-line-b" data-drag="bottom" @touchstart.stop="dragStart" @touchmove.stop="dragMove"></view>
								<view class="uni-cropper-line-l" data-drag="left" @touchstart.stop="dragStart" @touchmove.stop="dragMove"></view>
								<view class="uni-cropper-point point-t" data-drag="top" @touchstart.stop="dragStart" @touchmove.stop="dragMove"></view>
								<view class="uni-cropper-point point-tr" data-drag="topTight"></view>
								<view class="uni-cropper-point point-r" data-drag="right" @touchstart.stop="dragStart" @touchmove.stop="dragMove"></view>
								<view class="uni-cropper-point point-rb" data-drag="rightBottom" @touchstart.stop="dragStart" @touchmove.stop="dragMove"></view>
								<view class="uni-cropper-point point-b" data-drag="bottom" @touchstart.stop="dragStart" @touchmove.stop="dragMove" @touchend.stop="dragEnd"></view>
								<view class="uni-cropper-point point-bl" data-drag="bottomLeft"></view>
								<view class="uni-cropper-point point-l" data-drag="left" @touchstart.stop="dragStart" @touchmove.stop="dragMove"></view>
								<view class="uni-cropper-point point-lt" data-drag="leftTop"></view>
							</view>
						</view>
					</view>
				</view>
			</view>
			<view class='cropper-config'>
				<button class="primary-btn" @click="getImage" style='margin-top: 30rpx;'> 选择头像 </button>
				<button class="warn-btn" @click="getImageInfo" style='margin-top: 30rpx;'> 提交 </button>
			</view>
			<canvas canvas-id="myCanvas" :style="'position:absolute;border: 1px solid red; width:'+imageW+'px;height:'+imageH+'px;top:-9999px;left:-9999px;'"></canvas>
		</view>
	</view>
</template>

<script setup lang="ts">
import { reactive, toRefs } from 'vue'
import { onReady } from '@dcloudio/uni-app'
import { uploadAvatar } from '@/api/system/user'
import { useAppStore } from '@/composables/useAppStore'
import type { CanvasTouchEvent } from '@/types/touch'
import { getScreenMetrics } from '@/utils/layout-metrics'

const store = useAppStore()
const { screenWidth: SCREEN_WIDTH, pixelRatio: PR } = getScreenMetrics()

let PAGE_X: number
let PAGE_Y: number
let T_PAGE_X: number
let T_PAGE_Y: number
let CUT_L: number
let CUT_T: number
let CUT_R: number
let CUT_B: number
let IMG_RATIO: number
let IMG_REAL_W: number
let IMG_REAL_H: number
const DRAFG_MOVE_RATIO = 1
let INIT_DRAG_POSITION = 100
const DRAW_IMAGE_W = SCREEN_WIDTH

interface CropperViewState {
	imageSrc: string
	isShowImg: boolean
	cropperInitW: number
	cropperInitH: number
	cropperW: number
	cropperH: number
	cropperL: number
	cropperT: number
	transL: number
	transT: number
	scaleP: number
	imageW: number
	imageH: number
	cutL: number
	cutT: number
	cutB: number
	cutR: number | string
	qualityWidth: number
	innerAspectRadio: number
}

const cropperState = reactive<CropperViewState>({
	imageSrc: store.getters.avatar,
	isShowImg: false,
	cropperInitW: SCREEN_WIDTH,
	cropperInitH: SCREEN_WIDTH,
	cropperW: SCREEN_WIDTH,
	cropperH: SCREEN_WIDTH,
	cropperL: 0,
	cropperT: 0,
	transL: 0,
	transT: 0,
	scaleP: 0,
	imageW: 0,
	imageH: 0,
	cutL: 0,
	cutT: 0,
	cutB: SCREEN_WIDTH,
	cutR: '100%',
	qualityWidth: DRAW_IMAGE_W,
	innerAspectRadio: DRAFG_MOVE_RATIO
})

const {
	imageSrc,
	isShowImg,
	cropperInitW,
	cropperInitH,
	cropperW,
	cropperH,
	cropperL,
	cropperT,
	imageW,
	imageH,
	cutL,
	cutT,
	cutB,
	cutR
} = toRefs(cropperState)

function setData(obj: Partial<CropperViewState>): void {
	Object.assign(cropperState, obj)
}

function numericCutR(): number {
	return typeof cropperState.cutR === 'number' ? cropperState.cutR : 0
}

function getImage(): void {
	uni.chooseImage({
		success(res) {
			setData({
				imageSrc: res.tempFilePaths[0]
			})
			loadImage()
		}
	})
}

function loadImage(): void {
	uni.getImageInfo({
		src: cropperState.imageSrc,
		success() {
			IMG_RATIO = 1 / 1
			if (IMG_RATIO >= 1) {
				IMG_REAL_W = SCREEN_WIDTH
				IMG_REAL_H = SCREEN_WIDTH / IMG_RATIO
			} else {
				IMG_REAL_W = SCREEN_WIDTH * IMG_RATIO
				IMG_REAL_H = SCREEN_WIDTH
			}
			const minRange = IMG_REAL_W > IMG_REAL_H ? IMG_REAL_W : IMG_REAL_H
			INIT_DRAG_POSITION = minRange > INIT_DRAG_POSITION ? INIT_DRAG_POSITION : minRange
			if (IMG_RATIO >= 1) {
				const cutTVal = Math.ceil((SCREEN_WIDTH / IMG_RATIO - (SCREEN_WIDTH / IMG_RATIO - INIT_DRAG_POSITION)) / 2)
				const cutBVal = cutTVal
				const cutLVal = Math.ceil((SCREEN_WIDTH - SCREEN_WIDTH + INIT_DRAG_POSITION) / 2)
				const cutRVal = cutLVal
				setData({
					cropperW: SCREEN_WIDTH,
					cropperH: SCREEN_WIDTH / IMG_RATIO,
					cropperL: Math.ceil((SCREEN_WIDTH - SCREEN_WIDTH) / 2),
					cropperT: Math.ceil((SCREEN_WIDTH - SCREEN_WIDTH / IMG_RATIO) / 2),
					cutL: cutLVal,
					cutT: cutTVal,
					cutR: cutRVal,
					cutB: cutBVal,
					imageW: IMG_REAL_W,
					imageH: IMG_REAL_H,
					scaleP: IMG_REAL_W / SCREEN_WIDTH,
					qualityWidth: DRAW_IMAGE_W,
					innerAspectRadio: IMG_RATIO
				})
			} else {
				const cutLVal = Math.ceil((SCREEN_WIDTH * IMG_RATIO - SCREEN_WIDTH * IMG_RATIO) / 2)
				const cutRVal = cutLVal
				const cutTVal = Math.ceil((SCREEN_WIDTH - INIT_DRAG_POSITION) / 2)
				const cutBVal = cutTVal
				setData({
					cropperW: SCREEN_WIDTH * IMG_RATIO,
					cropperH: SCREEN_WIDTH,
					cropperL: Math.ceil((SCREEN_WIDTH - SCREEN_WIDTH * IMG_RATIO) / 2),
					cropperT: Math.ceil((SCREEN_WIDTH - SCREEN_WIDTH) / 2),
					cutL: cutLVal,
					cutT: cutTVal,
					cutR: cutRVal,
					cutB: cutBVal,
					imageW: IMG_REAL_W,
					imageH: IMG_REAL_H,
					scaleP: IMG_REAL_W / SCREEN_WIDTH,
					qualityWidth: DRAW_IMAGE_W,
					innerAspectRadio: IMG_RATIO
				})
			}
			setData({
				isShowImg: true
			})
			uni.hideLoading()
		}
	})
}

function contentStartMove(raw: unknown): void {
	const e = raw as CanvasTouchEvent
	PAGE_X = e.touches[0].pageX
	PAGE_Y = e.touches[0].pageY
}

function contentMoveing(raw: unknown): void {
	const e = raw as CanvasTouchEvent
	let dragLengthX = (PAGE_X - e.touches[0].pageX) * DRAFG_MOVE_RATIO
	let dragLengthY = (PAGE_Y - e.touches[0].pageY) * DRAFG_MOVE_RATIO
	const cutRNum = numericCutR()

	if (dragLengthX > 0) {
		if (cropperState.cutL - dragLengthX < 0) dragLengthX = cropperState.cutL
	} else {
		if (cutRNum + dragLengthX < 0) dragLengthX = -cutRNum
	}

	if (dragLengthY > 0) {
		if (cropperState.cutT - dragLengthY < 0) dragLengthY = cropperState.cutT
	} else {
		if (cropperState.cutB + dragLengthY < 0) dragLengthY = -cropperState.cutB
	}
	setData({
		cutL: cropperState.cutL - dragLengthX,
		cutT: cropperState.cutT - dragLengthY,
		cutR: cutRNum + dragLengthX,
		cutB: cropperState.cutB + dragLengthY
	})

	PAGE_X = e.touches[0].pageX
	PAGE_Y = e.touches[0].pageY
}

function contentTouchEnd(): void {}

function dragEnd(): void {}

function getImageInfo(): void {
	uni.showLoading({
		title: '图片生成中...'
	})
	const ctx = uni.createCanvasContext('myCanvas')
	ctx.drawImage(cropperState.imageSrc, 0, 0, IMG_REAL_W, IMG_REAL_H)
	ctx.draw(true, () => {
		const cutRNum = numericCutR()
		const canvasW = ((cropperState.cropperW - cropperState.cutL - cutRNum) / cropperState.cropperW) * IMG_REAL_W
		const canvasH =
			((cropperState.cropperH - cropperState.cutT - cropperState.cutB) / cropperState.cropperH) * IMG_REAL_H
		const canvasL = (cropperState.cutL / cropperState.cropperW) * IMG_REAL_W
		const canvasT = (cropperState.cutT / cropperState.cropperH) * IMG_REAL_H
		uni.canvasToTempFilePath({
			x: canvasL,
			y: canvasT,
			width: canvasW,
			height: canvasH,
			destWidth: canvasW,
			destHeight: canvasH,
			quality: 0.5,
			canvasId: 'myCanvas',
			success(res) {
				uni.hideLoading()
				const data = { name: 'avatarFile', filePath: res.tempFilePath }
				uploadAvatar(data).then((response) => {
					store.commit('SET_AVATAR', response.data as string)
					uni.showToast({ title: '修改成功', icon: 'success' })
					uni.navigateBack()
				})
			}
		})
	})
}

type DragHandle = 'right' | 'left' | 'top' | 'bottom' | 'rightBottom'

function dragStart(raw: unknown): void {
	const e = raw as CanvasTouchEvent
	T_PAGE_X = e.touches[0].pageX
	T_PAGE_Y = e.touches[0].pageY
	CUT_L = cropperState.cutL
	CUT_R = numericCutR()
	CUT_B = cropperState.cutB
	CUT_T = cropperState.cutT
}

function dragMove(raw: unknown): void {
	const e = raw as CanvasTouchEvent
	const target = e.target as { dataset?: { drag?: DragHandle } }
	const dragType = target.dataset?.drag
	switch (dragType) {
		case 'right': {
			let dragLength = (T_PAGE_X - e.touches[0].pageX) * DRAFG_MOVE_RATIO
			if (CUT_R + dragLength < 0) dragLength = -CUT_R
			setData({
				cutR: CUT_R + dragLength
			})
			break
		}
		case 'left': {
			let dragLength = (T_PAGE_X - e.touches[0].pageX) * DRAFG_MOVE_RATIO
			if (CUT_L - dragLength < 0) dragLength = CUT_L
			if (CUT_L - dragLength > cropperState.cropperW - numericCutR()) {
				dragLength = CUT_L - (cropperState.cropperW - numericCutR())
			}
			setData({
				cutL: CUT_L - dragLength
			})
			break
		}
		case 'top': {
			let dragLength = (T_PAGE_Y - e.touches[0].pageY) * DRAFG_MOVE_RATIO
			if (CUT_T - dragLength < 0) dragLength = CUT_T
			if (CUT_T - dragLength > cropperState.cropperH - cropperState.cutB) {
				dragLength = CUT_T - (cropperState.cropperH - cropperState.cutB)
			}
			setData({
				cutT: CUT_T - dragLength
			})
			break
		}
		case 'bottom': {
			let dragLength = (T_PAGE_Y - e.touches[0].pageY) * DRAFG_MOVE_RATIO
			if (CUT_B + dragLength < 0) dragLength = -CUT_B
			setData({
				cutB: CUT_B + dragLength
			})
			break
		}
		case 'rightBottom': {
			let dragLengthX = (T_PAGE_X - e.touches[0].pageX) * DRAFG_MOVE_RATIO
			let dragLengthY = (T_PAGE_Y - e.touches[0].pageY) * DRAFG_MOVE_RATIO
			if (CUT_B + dragLengthY < 0) dragLengthY = -CUT_B
			if (CUT_R + dragLengthX < 0) dragLengthX = -CUT_R
			setData({
				cutB: CUT_B + dragLengthY,
				cutR: CUT_R + dragLengthX
			})
			break
		}
		default:
			break
	}
}

onReady(() => {
	loadImage()
})
</script>

<style>
	/* pages/uni-cropper/index.wxss */

	.uni-content-info {
		/* position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		display: block;
		align-items: center;
		flex-direction: column; */
	}

	.cropper-config {
		padding: 20rpx 40rpx;
	}

	.cropper-content {
		min-height: 750rpx;
		width: 100%;
	}

	.uni-corpper {
		position: relative;
		overflow: hidden;
		-webkit-user-select: none;
		-moz-user-select: none;
		-ms-user-select: none;
		user-select: none;
		-webkit-tap-highlight-color: transparent;
		-webkit-touch-callout: none;
		box-sizing: border-box;
	}

	.uni-corpper-content {
		position: relative;
	}

	.uni-corpper-content image {
		display: block;
		width: 100%;
		min-width: 0 !important;
		max-width: none !important;
		height: 100%;
		min-height: 0 !important;
		max-height: none !important;
		image-orientation: 0deg !important;
		margin: 0 auto;
	}
	/* 移动图片效果 */

	.uni-cropper-drag-box {
		position: absolute;
		top: 0;
		right: 0;
		bottom: 0;
		left: 0;
		cursor: move;
		background: rgba(0, 0, 0, 0.6);
		z-index: 1;
	}
	/* 内部的信息 */

	.uni-corpper-crop-box {
		position: absolute;
		background: rgba(255, 255, 255, 0.3);
		z-index: 2;
	}

	.uni-corpper-crop-box .uni-cropper-view-box {
		position: relative;
		display: block;
		width: 100%;
		height: 100%;
		overflow: visible;
		outline: 1rpx solid #69f;
		outline-color: rgba(102, 153, 255, .75)
	}
	/* 横向虚线 */

	.uni-cropper-dashed-h {
		position: absolute;
		top: 33.33333333%;
		left: 0;
		width: 100%;
		height: 33.33333333%;
		border-top: 1rpx dashed rgba(255, 255, 255, 0.5);
		border-bottom: 1rpx dashed rgba(255, 255, 255, 0.5);
	}
	/* 纵向虚线 */

	.uni-cropper-dashed-v {
		position: absolute;
		left: 33.33333333%;
		top: 0;
		width: 33.33333333%;
		height: 100%;
		border-left: 1rpx dashed rgba(255, 255, 255, 0.5);
		border-right: 1rpx dashed rgba(255, 255, 255, 0.5);
	}
	/* 四个方向的线  为了之后的拖动事件*/

	.uni-cropper-line-t {
		position: absolute;
		display: block;
		width: 100%;
		background-color: #69f;
		top: 0;
		left: 0;
		height: 1rpx;
		opacity: 0.1;
		cursor: n-resize;
	}

	.uni-cropper-line-t::before {
		content: '';
		position: absolute;
		top: 50%;
		right: 0rpx;
		width: 100%;
		-webkit-transform: translate3d(0, -50%, 0);
		transform: translate3d(0, -50%, 0);
		bottom: 0;
		height: 41rpx;
		background: transparent;
		z-index: 11;
	}

	.uni-cropper-line-r {
		position: absolute;
		display: block;
		background-color: #69f;
		top: 0;
		right: 0rpx;
		width: 1rpx;
		opacity: 0.1;
		height: 100%;
		cursor: e-resize;
	}

	.uni-cropper-line-r::before {
		content: '';
		position: absolute;
		top: 0;
		left: 50%;
		width: 41rpx;
		-webkit-transform: translate3d(-50%, 0, 0);
		transform: translate3d(-50%, 0, 0);
		bottom: 0;
		height: 100%;
		background: transparent;
		z-index: 11;
	}

	.uni-cropper-line-b {
		position: absolute;
		display: block;
		width: 100%;
		background-color: #69f;
		bottom: 0;
		left: 0;
		height: 1rpx;
		opacity: 0.1;
		cursor: s-resize;
	}

	.uni-cropper-line-b::before {
		content: '';
		position: absolute;
		top: 50%;
		right: 0rpx;
		width: 100%;
		-webkit-transform: translate3d(0, -50%, 0);
		transform: translate3d(0, -50%, 0);
		bottom: 0;
		height: 41rpx;
		background: transparent;
		z-index: 11;
	}

	.uni-cropper-line-l {
		position: absolute;
		display: block;
		background-color: #69f;
		top: 0;
		left: 0;
		width: 1rpx;
		opacity: 0.1;
		height: 100%;
		cursor: w-resize;
	}

	.uni-cropper-line-l::before {
		content: '';
		position: absolute;
		top: 0;
		left: 50%;
		width: 41rpx;
		-webkit-transform: translate3d(-50%, 0, 0);
		transform: translate3d(-50%, 0, 0);
		bottom: 0;
		height: 100%;
		background: transparent;
		z-index: 11;
	}

	.uni-cropper-point {
		width: 5rpx;
		height: 5rpx;
		background-color: #69f;
		opacity: .75;
		position: absolute;
		z-index: 3;
	}

	.point-t {
		top: -3rpx;
		left: 50%;
		margin-left: -3rpx;
		cursor: n-resize;
	}

	.point-tr {
		top: -3rpx;
		left: 100%;
		margin-left: -3rpx;
		cursor: n-resize;
	}

	.point-r {
		top: 50%;
		left: 100%;
		margin-left: -3rpx;
		margin-top: -3rpx;
		cursor: n-resize;
	}

	.point-rb {
		left: 100%;
		top: 100%;
		-webkit-transform: translate3d(-50%, -50%, 0);
		transform: translate3d(-50%, -50%, 0);
		cursor: n-resize;
		width: 36rpx;
		height: 36rpx;
		background-color: #69f;
		position: absolute;
		z-index: 1112;
		opacity: 1;
	}

	.point-b {
		left: 50%;
		top: 100%;
		margin-left: -3rpx;
		margin-top: -3rpx;
		cursor: n-resize;
	}

	.point-bl {
		left: 0%;
		top: 100%;
		margin-left: -3rpx;
		margin-top: -3rpx;
		cursor: n-resize;
	}

	.point-l {
		left: 0%;
		top: 50%;
		margin-left: -3rpx;
		margin-top: -3rpx;
		cursor: n-resize;
	}

	.point-lt {
		left: 0%;
		top: 0%;
		margin-left: -3rpx;
		margin-top: -3rpx;
		cursor: n-resize;
	}
	/* 裁剪框预览内容 */

	.uni-cropper-viewer {
		position: relative;
		width: 100%;
		height: 100%;
		overflow: hidden;
	}

	.uni-cropper-viewer image {
		position: absolute;
		z-index: 2;
	}
</style>
