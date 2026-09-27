<template>
  <view class="trend">
    <canvas
      canvas-id="trendCanvas"
      id="trendCanvas"
      class="trend__canvas"
      :style="{ width: widthPx + 'px', height: heightPx + 'px' }"
    />
  </view>
</template>

<script setup lang="ts">
import { getCurrentInstance, onMounted, watch } from 'vue'

const props = defineProps<{
  points: number[]
}>()

const widthPx = 320
const heightPx = 160
const padding = 24

function draw(): void {
  const inst = getCurrentInstance()
  const ctx = uni.createCanvasContext('trendCanvas', inst?.proxy)
  const w = widthPx
  const h = heightPx
  const innerW = w - padding * 2
  const innerH = h - padding * 2
  const pts = props.points.length ? props.points : [0]
  const minY = 0.4
  const maxY = 1

  ctx.setFillStyle('#ffffff')
  ctx.fillRect(0, 0, w, h)

  ctx.setStrokeStyle('#e8e8e8')
  ctx.setLineWidth(1)
  for (let i = 0; i <= 4; i++) {
    const y = padding + (innerH * i) / 4
    ctx.beginPath()
    ctx.moveTo(padding, y)
    ctx.lineTo(w - padding, y)
    ctx.stroke()
  }

  const stepX = pts.length > 1 ? innerW / (pts.length - 1) : 0
  const coords = pts.map((v, i) => {
    const x = padding + stepX * i
    const norm = (v - minY) / (maxY - minY)
    const y = padding + innerH * (1 - norm)
    return { x, y }
  })

  ctx.setFillStyle('rgba(41, 121, 255, 0.15)')
  ctx.beginPath()
  ctx.moveTo(coords[0].x, h - padding)
  coords.forEach((c) => ctx.lineTo(c.x, c.y))
  ctx.lineTo(coords[coords.length - 1].x, h - padding)
  ctx.closePath()
  ctx.fill()

  ctx.setStrokeStyle('#2979ff')
  ctx.setLineWidth(2)
  ctx.beginPath()
  coords.forEach((c, i) => {
    if (i === 0) ctx.moveTo(c.x, c.y)
    else ctx.lineTo(c.x, c.y)
  })
  ctx.stroke()

  ctx.setFillStyle('#2979ff')
  coords.forEach((c) => {
    ctx.beginPath()
    ctx.arc(c.x, c.y, 4, 0, Math.PI * 2)
    ctx.fill()
  })

  ctx.draw()
}

onMounted(() => {
  setTimeout(draw, 50)
})

watch(
  () => props.points,
  () => setTimeout(draw, 50),
  { deep: true }
)
</script>

<style lang="scss" scoped>
.trend {
  display: flex;
  justify-content: center;
  padding: 16rpx 0;
}

.trend__canvas {
  width: 640rpx;
  height: 320rpx;
}
</style>
