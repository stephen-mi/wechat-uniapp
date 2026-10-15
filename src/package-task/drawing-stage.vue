<template>
  <view class="stage">
    <view class="stage__bar">
      <text class="stage__badge">Bimface</text>
      <text class="stage__name">{{ currentName }}</text>
      <view class="stage__nav">
        <text class="stage__btn" :class="{ 'stage__btn--off': !canPrev }" @click.stop="emit('prev')">上一张</text>
        <text class="stage__btn" :class="{ 'stage__btn--off': !canNext }" @click.stop="emit('next')">下一张</text>
      </view>
    </view>
    <view class="stage__sheet" @click="emit('open')">
      <view class="stage__grid" />
      <view class="stage__center">
        <text class="stage__open">查看图纸</text>
        <text class="stage__hint">{{ hint }}</text>
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
}>()

const emit = defineEmits<{
  prev: []
  next: []
  open: []
}>()

const current = computed(() => props.drawings[props.index])
const currentName = computed(() => current.value?.name || '当前楼层暂无图纸')
const canPrev = computed(() => props.index > 0)
const canNext = computed(() => props.index < props.drawings.length - 1)
const hint = computed(() => {
  if (!current.value) return '切换楼层后加载绑定图纸'
  if (!current.value.viewToken) return '点击全屏打开 · 待配置 viewToken'
  return `${props.index + 1}/${props.drawings.length} · 点击全屏浏览`
})
</script>

<style lang="scss" scoped>
.stage {
  margin: 12rpx 24rpx 0;
  border-radius: 16rpx;
  overflow: hidden;
  background: #1c1f24;
}

.stage__bar {
  display: flex;
  align-items: center;
  gap: 12rpx;
  padding: 12rpx 16rpx;
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
  height: 220rpx;
}

.stage__grid {
  position: absolute;
  inset: 0;
  background:
    linear-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px);
  background-size: 24rpx 24rpx;
}

.stage__center {
  position: relative;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8rpx;
}

.stage__open {
  font-size: 28rpx;
  color: #fff;
  font-weight: 600;
}

.stage__hint {
  font-size: 22rpx;
  color: #9aa0a6;
}
</style>
