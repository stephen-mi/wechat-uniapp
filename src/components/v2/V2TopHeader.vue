<template>
  <view class="v2-header" :style="{ paddingTop: nav.statusBarHeight + 'px' }">
    <view
      class="v2-header__bar"
      :style="{ minHeight: nav.navBarHeight + 'px', paddingRight: nav.navPaddingRight + 'px' }"
    >
      <view class="v2-header__left">
        <view v-if="showBack" class="v2-header__btn" @click="onBack">
          <u-icon name="arrow-left" size="18" color="#1a1a1a" />
        </view>
        <view class="v2-header__title-area">
          <text class="v2-header__title" @click.stop="emit('titleClick')">{{ title }}</text>
          <view v-if="titleDropdown" class="v2-header__chevron" @click.stop="emit('chevronClick')">
            <u-icon name="arrow-down" size="12" color="#1a1a1a" />
          </view>
        </view>
      </view>
      <view class="v2-header__right">
        <slot name="right">
          <view v-if="showSearch" class="v2-header__btn" @click="emit('search')">
            <u-icon name="search" size="20" color="#1a1a1a" />
          </view>
        </slot>
      </view>
    </view>
    <view v-if="$slots.sub" class="v2-header__sub">
      <slot name="sub" />
    </view>
  </view>
</template>

<script lang="ts">
export default {
  options: {
    virtualHost: true
  }
}
</script>

<script setup lang="ts">
import { useNavLayout } from '@/composables/useNavLayout'

withDefaults(
  defineProps<{
    title: string
    showBack?: boolean
    titleDropdown?: boolean
    showSearch?: boolean
  }>(),
  { showBack: true, titleDropdown: true, showSearch: false }
)

const emit = defineEmits<{
  titleClick: []
  chevronClick: []
  search: []
  back: []
}>()

const nav = useNavLayout()

function onBack(): void {
  emit('back')
  const pages = getCurrentPages()
  if (pages.length > 1) uni.navigateBack()
}
</script>

<style lang="scss" scoped>
@import '@/static/scss/v2-gradient.scss';

.v2-header {
  display: block;
  width: 100%;
  box-sizing: border-box;
  background: $v2-header-gradient;
  color: #1a1a1a;
}

.v2-header__bar {
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  box-sizing: border-box;
  padding: 0 0 0 24rpx;
}

.v2-header__left {
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  align-items: center;
  flex: 1;
  min-width: 0;
}

.v2-header__btn {
  width: 64rpx;
  height: 64rpx;
  margin-right: 12rpx;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.18);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.v2-header__title-area {
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  align-items: center;
  min-width: 0;
  flex: 1;
}

.v2-header__title {
  font-size: 32rpx;
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 360rpx;
}

.v2-header__chevron {
  padding: 12rpx 16rpx 12rpx 8rpx;
  flex-shrink: 0;
}

.v2-header__right {
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  align-items: center;
  flex-shrink: 0;
}

.v2-header__sub {
  padding: 0 24rpx 20rpx;
}
</style>
