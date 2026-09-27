<template>
  <view class="sub-nav" :style="{ paddingTop: nav.statusBarHeight + 'px' }">
    <view
      class="sub-nav__bar"
      :style="{ minHeight: nav.navBarHeight + 'px', paddingRight: nav.navPaddingRight + 'px' }"
    >
      <view class="sub-nav__side" @click="onBack">
        <u-icon name="arrow-left" size="20" color="#333" />
      </view>
      <text class="sub-nav__title">{{ title }}</text>
      <view class="sub-nav__side sub-nav__close" @click="onClose">
        <u-icon name="close" size="20" color="#333" />
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { useNavLayout } from '@/composables/useNavLayout'

defineProps<{ title: string }>()

const nav = useNavLayout()

function onBack(): void {
  uni.navigateBack()
}

function onClose(): void {
  const pages = getCurrentPages()
  if (pages.length > 1) {
    uni.navigateBack()
  } else {
    uni.switchTab({ url: '/pages/monitor/index' })
  }
}
</script>

<style lang="scss" scoped>
.sub-nav {
  background: #fff;
  border-bottom: 1rpx solid #eee;
}

.sub-nav__bar {
  display: flex;
  align-items: center;
  box-sizing: border-box;
  padding: 0 0 0 24rpx;
  align-items: center;
}

.sub-nav__side {
  width: 80rpx;
}

.sub-nav__close {
  display: flex;
  justify-content: flex-end;
}

.sub-nav__title {
  flex: 1;
  text-align: center;
  font-size: 34rpx;
  font-weight: 600;
  color: #333;
}
</style>
