<template>
  <view class="donut-wrap">
    <view class="donut" :style="{ background: gradient }">
      <view class="donut__hole">
        <text class="donut__value">{{ centerText }}</text>
      </view>
    </view>
    <view v-if="legend.length" class="donut-legend">
      <view v-for="item in legend" :key="item.label" class="donut-legend__item">
        <view class="donut-legend__dot" :style="{ background: item.color }" />
        <text>{{ item.label }}</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    centerText: string
    slices: { color: string; value: number }[]
    legend?: { label: string; color: string }[]
  }>(),
  { legend: () => [] }
)

const gradient = computed(() => {
  const total = props.slices.reduce((s, x) => s + x.value, 0)
  if (total <= 0) return 'conic-gradient(#eee 0 100%)'
  let acc = 0
  const parts = props.slices.map((s) => {
    const start = (acc / total) * 100
    acc += s.value
    const end = (acc / total) * 100
    return `${s.color} ${start}% ${end}%`
  })
  return `conic-gradient(${parts.join(', ')})`
})
</script>

<style lang="scss" scoped>
.donut-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 24rpx 0;
}

.donut {
  width: 320rpx;
  height: 320rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.donut__hole {
  width: 200rpx;
  height: 200rpx;
  border-radius: 50%;
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
}

.donut__value {
  font-size: 48rpx;
  font-weight: 600;
  color: #333;
}

.donut-legend {
  display: flex;
  gap: 32rpx;
  margin-top: 24rpx;
  font-size: 24rpx;
  color: #666;
}

.donut-legend__item {
  display: flex;
  align-items: center;
  gap: 8rpx;
}

.donut-legend__dot {
  width: 16rpx;
  height: 16rpx;
  border-radius: 50%;
}
</style>
