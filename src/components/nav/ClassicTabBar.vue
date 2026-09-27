<template>
  <view class="tabbar" :style="{ paddingBottom: safeBottom + 'px' }">
    <view
      v-for="item in tabs"
      :key="item.key"
      class="tabbar__item"
      @click="switchTo(item.path)"
    >
      <image
        class="tabbar__icon"
        :src="current === item.key ? item.iconActive : item.icon"
        mode="aspectFit"
      />
      <text class="tabbar__text" :class="{ 'tabbar__text--active': current === item.key }">
        {{ item.text }}
      </text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { getLayoutMetrics } from '@/utils/layout-metrics'

defineProps<{
  current: 'monitor' | 'warning' | 'analysis'
}>()

const safeBottom = ref(0)

const tabs = [
  {
    key: 'monitor' as const,
    text: '视频监控',
    path: '/pages/monitor/index',
    icon: '/static/images/tabbar/monitor.png',
    iconActive: '/static/images/tabbar/monitor_.png'
  },
  {
    key: 'warning' as const,
    text: 'AI预警中心',
    path: '/pages/warning/index',
    icon: '/static/images/tabbar/warning.png',
    iconActive: '/static/images/tabbar/warning_.png'
  },
  {
    key: 'analysis' as const,
    text: '应用分析',
    path: '/pages/analysis/index',
    icon: '/static/images/tabbar/analysis.png',
    iconActive: '/static/images/tabbar/analysis_.png'
  }
]

function switchTo(path: string): void {
  uni.reLaunch({ url: path })
}

onMounted(() => {
  safeBottom.value = getLayoutMetrics().safeAreaBottom
})
</script>

<style lang="scss" scoped>
.tabbar {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 99;
  display: flex;
  height: 100rpx;
  background: #fff;
  border-top: 1rpx solid #eee;
}

.tabbar__item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4rpx;
}

.tabbar__icon {
  width: 44rpx;
  height: 44rpx;
}

.tabbar__text {
  font-size: 22rpx;
  color: #999;

  &--active {
    color: #2979ff;
  }
}
</style>
