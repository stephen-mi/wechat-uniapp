<template>
  <view class="photo-annotation">
    <view class="sign-name">
      <canvas
        class="sign-canvas"
        canvas-id="canvasId"
        id="canvasId"
        width="300"
        height="200"
        @touchstart="touchstart"
        @touchmove.stop.prevent="touchmove"
      ></canvas>
    </view>

    <view class="btn-box">
      <button class="cancel" @click="clearCanvas">清除</button>
      <button class="submit" @click="sure">提交</button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { getCurrentInstance, nextTick, ref, watch } from 'vue'
import type { CanvasTouchEvent } from '@/types/touch'

const props = withDefaults(
  defineProps<{
    photoUrl?: string
    showModel?: boolean
  }>(),
  {
    photoUrl: '',
    showModel: false
  }
)

const emit = defineEmits<{
  close: []
}>()

const instance = getCurrentInstance()

const drawContext = ref<UniApp.CanvasContext | null>(null)
const moveX = ref(0)
const moveY = ref(0)
const targetImgUrl = ref('')

watch(
  () => props.showModel,
  (visible) => {
    if (visible && props.photoUrl) {
      init(props.photoUrl)
    }
  }
)

function init(url: string): void {
  void nextTick(() => {
    const ctx = uni.createCanvasContext('canvasId', instance?.proxy)
    drawContext.value = ctx
    targetImgUrl.value = url
    uni.getImageInfo({
      src: url,
      success(image) {
        ctx.drawImage(image.path, 0, 0, 300, 150)
        ctx.draw()
      }
    })
  })
}

function touchstart(raw: unknown): void {
	const e = raw as CanvasTouchEvent
  const touch = e.changedTouches[0]
  const ctx = drawContext.value
  if (!ctx || !touch) {
    return
  }
  ctx.beginPath()
  ctx.moveTo(touch.x, touch.y)
  moveX.value = 0
  moveY.value = 0
}

function touchmove(raw: unknown): void {
	const e = raw as CanvasTouchEvent
  const touch = e.changedTouches[0]
  const ctx = drawContext.value
  if (!ctx || !touch) {
    return
  }
  if (moveX.value && moveY.value) {
    ctx.moveTo(moveX.value, moveY.value)
  }
  ctx.lineTo(touch.x, touch.y)
  moveX.value = touch.x
  moveY.value = touch.y
  ctx.stroke()
  ctx.draw(true)
}

function clearCanvas(): void {
  const ctx = drawContext.value
  if (!ctx || !targetImgUrl.value) {
    return
  }
  ctx.drawImage(targetImgUrl.value, 0, 0, 300, 150)
  ctx.draw()
}

function sure(): void {
  emit('close')
}
</script>

<style lang="scss">
.photo-annotation {
  display: flex;
  flex-direction: column;

  .sign-name {
    height: 200px;
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
