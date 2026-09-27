<template>
  <view class="time-range">
    <view class="time-range__tabs">
      <view
        v-for="item in options"
        :key="item.key"
        class="time-range__tab"
        :class="{ 'time-range__tab--active': modelValue === item.key }"
        @click="emit('update:modelValue', item.key)"
      >
        {{ item.label }}
      </view>
    </view>
    <text class="time-range__label">{{ rangeLabel }}</text>
  </view>
</template>

<script setup lang="ts">
import type { AnalysisRangeKey } from '@/mock/safety-analysis'

defineProps<{
  modelValue: AnalysisRangeKey
  rangeLabel: string
}>()

const emit = defineEmits<{
  'update:modelValue': [key: AnalysisRangeKey]
}>()

const options: { key: AnalysisRangeKey; label: string }[] = [
  { key: '7d', label: '过去7天' },
  { key: '30d', label: '过去30天' },
  { key: 'custom', label: '自定义' }
]
</script>

<style lang="scss" scoped>
.time-range {
  padding: 24rpx 0 8rpx;
}

.time-range__tabs {
  display: flex;
  justify-content: center;
  gap: 40rpx;
}

.time-range__tab {
  font-size: 26rpx;
  color: #666;
  padding-bottom: 8rpx;
  border-bottom: 4rpx solid transparent;

  &--active {
    color: #2979ff;
    border-bottom-color: #2979ff;
  }
}

.time-range__label {
  display: block;
  text-align: center;
  margin-top: 16rpx;
  font-size: 24rpx;
  color: #999;
}
</style>
