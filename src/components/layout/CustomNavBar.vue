<template>
  <view class="custom-nav" :style="{ paddingTop: nav.statusBarHeight + 'px' }">
    <view
      class="custom-nav__bar"
      :style="{ minHeight: nav.navBarHeight + 'px', paddingRight: nav.navPaddingRight + 'px' }"
    >
      <view class="custom-nav__side" @click="emit('back')">
        <slot name="left">
          <u-icon name="arrow-left" size="20" color="#fff" />
        </slot>
      </view>
      <text class="custom-nav__title">{{ title }}</text>
      <view class="custom-nav__side custom-nav__side--right">
        <slot name="right">
          <view v-if="placeholderRight" />
        </slot>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { useNavLayout } from '@/composables/useNavLayout'

withDefaults(
  defineProps<{
    title: string
    placeholderRight?: boolean
  }>(),
  { placeholderRight: true }
)

const emit = defineEmits<{ back: [] }>()
const nav = useNavLayout()
</script>

<style lang="scss" scoped>
.custom-nav__bar {
  display: flex;
  align-items: center;
  box-sizing: border-box;
  padding-left: 24rpx;
}

.custom-nav__side {
  width: 80rpx;
  flex-shrink: 0;

  &--right {
    display: flex;
    justify-content: flex-end;
  }
}

.custom-nav__title {
  flex: 1;
  text-align: center;
  font-size: 34rpx;
  font-weight: 600;
  color: #fff;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
