<template>
  <view class="safety-header" :style="{ paddingTop: nav.statusBarHeight + 'px' }">
    <view
      class="safety-header__bar"
      :style="{ minHeight: nav.navBarHeight + 'px', paddingRight: nav.navPaddingRight + 'px' }"
    >
      <view class="safety-header__side" />
      <text class="safety-header__title">{{ title }}</text>
      <view class="safety-header__side safety-header__close" @click="onClose">
        <u-icon name="close" size="20" color="#333" />
      </view>
    </view>
    <view v-if="tabs.length" class="safety-header__tabs">
      <view
        v-for="(tab, index) in tabs"
        :key="tab"
        class="safety-header__tab"
        :class="{ 'safety-header__tab--active': modelValue === index }"
        @click="emit('update:modelValue', index)"
      >
        <text>{{ tab }}</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { useNavLayout } from '@/composables/useNavLayout'

withDefaults(
  defineProps<{
    title: string
    tabs?: string[]
    modelValue?: number
  }>(),
  { tabs: () => [], modelValue: 0 }
)

const emit = defineEmits<{
  'update:modelValue': [index: number]
  close: []
}>()

const nav = useNavLayout()

function onClose(): void {
  emit('close')
  const pages = getCurrentPages()
  if (pages.length > 1) {
    uni.navigateBack()
  } else {
    uni.reLaunch({ url: '/pages/work/index' })
  }
}
</script>

<style lang="scss" scoped>
.safety-header {
  background: #fff;
  border-bottom: 1rpx solid #eee;
}

.safety-header__bar {
  display: flex;
  align-items: center;
  box-sizing: border-box;
  padding: 0 0 0 24rpx;
  align-items: center;
}

.safety-header__side {
  width: 80rpx;
}

.safety-header__close {
  display: flex;
  justify-content: flex-end;
}

.safety-header__title {
  flex: 1;
  text-align: center;
  font-size: 34rpx;
  font-weight: 600;
  color: #333;
}

.safety-header__tabs {
  display: flex;
  justify-content: center;
  gap: 48rpx;
  padding-bottom: 16rpx;
}

.safety-header__tab {
  font-size: 28rpx;
  color: #666;
  padding-bottom: 12rpx;
  border-bottom: 4rpx solid transparent;

  &--active {
    color: #2979ff;
    font-weight: 500;
    border-bottom-color: #2979ff;
  }
}
</style>
