<template>
  <view class="tabbar" :style="{ paddingBottom: safeBottom + 'px' }">
    <view
      v-for="item in tabs"
      :key="item.key"
      class="tabbar__item"
      @click="switchTo(item.path)"
    >
      <view class="tabbar__icon-wrap" :class="{ 'tabbar__icon-wrap--active': current === item.key }">
        <u-icon :name="item.icon" :size="22" :color="current === item.key ? '#fff' : '#999'" />
      </view>
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
  current: 'video' | 'ai-event' | 'disposal'
}>()

const safeBottom = ref(0)

const tabs = [
  { key: 'video' as const, text: '视频', path: '/pages/v2/video/index', icon: 'play-circle' },
  {
    key: 'disposal' as const,
    text: 'AI事件',
    path: '/pages/v2/disposal/index',
    icon: 'checkmark-circle'
  },
  { key: 'ai-event' as const, text: '处置闭环', path: '/pages/v2/ai-event/index', icon: 'star-fill' }
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
  height: 110rpx;
  background: #fff;
  border-top: 1rpx solid #eee;
}

.tabbar__item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6rpx;
}

.tabbar__icon-wrap {
  width: 56rpx;
  height: 56rpx;
  border-radius: 16rpx;
  display: flex;
  align-items: center;
  justify-content: center;

  &--active {
    background: linear-gradient(135deg, #4facfe, #2979ff);
  }
}

.tabbar__text {
  font-size: 22rpx;
  color: #999;

  &--active {
    color: #2979ff;
    font-weight: 500;
  }
}
</style>
