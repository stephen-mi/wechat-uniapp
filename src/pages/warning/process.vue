<template>
  <view class="page">
    <view class="nav">
      <u-icon name="arrow-left" size="20" @click="goBack" />
      <text class="nav__title">隐患处理</text>
      <view class="nav__placeholder" />
    </view>
    <view class="content">
      <text class="hint">记录编号：{{ recordId || '—' }}</text>
      <text class="desc">此处可对接隐患确认、整改与闭环流程，当前为演示占位页。</text>
      <u-button type="primary" text="标记为已处理" @click="submit" />
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'

const recordId = ref('')

onLoad((query) => {
  recordId.value = (query?.id as string) ?? ''
})

function goBack(): void {
  uni.navigateBack()
}

function submit(): void {
  uni.showToast({ title: '已提交', icon: 'success' })
  setTimeout(() => uni.navigateBack(), 800)
}
</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background: #f5f6f8;
}

.nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24rpx;
  background: #fff;
}

.nav__title {
  font-size: 32rpx;
  font-weight: 600;
}

.nav__placeholder {
  width: 40rpx;
}

.content {
  margin: 24rpx;
  padding: 32rpx;
  background: #fff;
  border-radius: 16rpx;
}

.hint {
  display: block;
  font-size: 28rpx;
  color: #333;
  margin-bottom: 16rpx;
}

.desc {
  display: block;
  font-size: 26rpx;
  color: #666;
  line-height: 1.6;
  margin-bottom: 32rpx;
}
</style>
