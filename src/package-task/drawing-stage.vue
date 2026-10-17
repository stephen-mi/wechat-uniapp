<template>
  <view class="stage" :style="stageStyle">
    <view class="stage__bar">
      <text class="stage__badge">{{ formatBadge }}</text>
      <text class="stage__name">{{ currentName }}</text>
      <view class="stage__nav">
        <text class="stage__btn" :class="{ 'stage__btn--off': !canPrev }" @click.stop="emit('prev')">上一张</text>
        <text class="stage__btn" :class="{ 'stage__btn--off': !canNext }" @click.stop="emit('next')">下一张</text>
      </view>
    </view>
    <view class="stage__sheet">
      <image
        v-if="previewSrc"
        class="stage__preview"
        :src="previewSrc"
        mode="aspectFit"
      />
      <template v-else>
        <view class="stage__grid" />
        <view class="stage__empty">
          <text class="stage__empty-title">{{ emptyTitle }}</text>
          <text class="stage__empty-hint">{{ emptyHint }}</text>
        </view>
      </template>
      <view class="stage__toggle" @click.stop="emit('toggle')">
        <text class="stage__toggle-text">{{ folded ? '展开' : '收起' }}</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { TaskDrawing } from '@/api/task/types'

const props = defineProps<{
  drawings: TaskDrawing[]
  index: number
  /** 图纸区域高度（px），按整页高度的比例由页面传入 */
  height?: number
  /** 下半部已收起 */
  folded?: boolean
}>()

const stageStyle = computed(() => (props.height ? { height: `${props.height}px` } : undefined))

const emit = defineEmits<{
  prev: []
  next: []
  toggle: []
}>()

const current = computed(() => props.drawings[props.index])
const currentName = computed(() => current.value?.name || '当前楼层暂无图纸')
const canPrev = computed(() => props.index > 0)
const canNext = computed(() => props.index < props.drawings.length - 1)

const formatBadge = computed(() => {
  const suffix = (current.value?.suffix || '').toUpperCase()
  if (suffix === 'PDF' || suffix === 'DWG') return suffix
  return suffix || '图纸'
})

const previewSrc = computed(() => {
  const drawing = current.value
  if (!drawing) return ''
  if (drawing.previewUrl) return drawing.previewUrl
  // PDF 原文件在小程序内无法直接当作 image 源，需预览图
  return ''
})

const emptyTitle = computed(() => {
  if (!current.value) return '暂无图纸'
  if (current.value.suffix === 'pdf') return 'PDF 待配置预览'
  if (current.value.suffix === 'dwg') return 'DWG 待配置预览'
  return '图纸待配置'
})

const emptyHint = computed(() => {
  if (!current.value) return '切换楼层后加载绑定图纸'
  if (current.value.suffix === 'pdf') return '请提供 PDF 预览图或 fileUrl'
  if (current.value.suffix === 'dwg') return '接入 Bimface viewToken 或预览图后可展示'
  return '支持 PDF / DWG 图纸展示'
})
</script>

<style lang="scss" scoped>
.stage {
  height: 40vh;
  margin: 12rpx 24rpx 0;
  border-radius: 16rpx;
  overflow: hidden;
  background: #1c1f24;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
}

.stage__bar {
  display: flex;
  align-items: center;
  gap: 12rpx;
  padding: 12rpx 16rpx;
  flex-shrink: 0;
}

.stage__badge {
  flex-shrink: 0;
  padding: 2rpx 10rpx;
  border-radius: 999rpx;
  background: rgba(35, 201, 147, 0.2);
  color: #5ed9b0;
  font-size: 20rpx;
}

.stage__name {
  flex: 1;
  min-width: 0;
  font-size: 24rpx;
  color: #f2f2f2;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.stage__nav {
  display: flex;
  gap: 12rpx;
  flex-shrink: 0;
}

.stage__btn {
  font-size: 22rpx;
  color: #5ed9b0;

  &--off {
    color: #666;
  }
}

.stage__sheet {
  position: relative;
  flex: 1;
  min-height: 0;
  background: #111418;
}

.stage__preview {
  width: 100%;
  height: 100%;
  background: #fff;
}

.stage__grid {
  position: absolute;
  inset: 0;
  background:
    linear-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px);
  background-size: 24rpx 24rpx;
}

.stage__empty {
  position: relative;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8rpx;
  padding: 0 32rpx;
}

.stage__empty-title {
  font-size: 28rpx;
  color: #fff;
  font-weight: 600;
}

.stage__empty-hint {
  font-size: 22rpx;
  color: #9aa0a6;
  text-align: center;
}

.stage__toggle {
  position: absolute;
  left: 50%;
  bottom: 16rpx;
  z-index: 2;
  transform: translateX(-50%);
  min-width: 128rpx;
  padding: 6rpx 28rpx;
  border-radius: 8rpx;
  background: rgba(255, 255, 255, 0.95);
  display: flex;
  align-items: center;
  justify-content: center;
}

.stage__toggle-text {
  font-size: 22rpx;
  line-height: 32rpx;
  color: #1a1a1a;
}
</style>
