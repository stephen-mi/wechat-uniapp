<template>
  <view class="page">
    <view class="nav" :style="{ paddingTop: nav.statusBarHeight + 'px' }">
      <view
        class="nav__bar"
        :style="{ minHeight: nav.navBarHeight + 'px', paddingRight: nav.navPaddingRight + 'px' }"
      >
        <view class="nav__btn" @click="goBack">
          <u-icon name="arrow-left" size="20" color="#fff" />
        </view>
        <text class="nav__title">安全报告</text>
        <view class="nav__push">
          <text class="nav__push-label">自动推送</text>
          <u-switch v-model="autoPush" size="20" active-color="#19be6b" />
        </view>
      </view>
    </view>

    <scroll-view scroll-y class="scroll" :style="{ height: scrollHeight }" :show-scrollbar="false">
      <view v-for="group in groups" :key="group.dayLabel" class="group">
        <view class="group__divider">
          <view class="group__line" />
          <text class="group__day">{{ group.dayLabel }}</text>
          <view class="group__line" />
        </view>
        <view
          v-for="item in group.items"
          :key="item.id"
          class="report-card"
          @click="openReport(item.id)"
        >
          <view class="report-card__body">
            <text class="report-card__title">{{ item.orgName }}</text>
            <view class="report-card__row">
              <text class="report-card__label">预警总数：</text>
              <text class="report-card__value">{{ item.alertTotal }}</text>
              <text class="report-card__unit">次</text>
            </view>
            <view class="report-card__row report-card__row--rating">
              <text class="report-card__label">AI预警评分：</text>
              <text class="report-card__stars">{{ ratingStars(item.rating) }}</text>
              <text class="report-card__score">{{ item.rating }} 分</text>
            </view>
            <view class="report-card__tags">
              <text class="tag">{{ formatDayTrend(item) }}</text>
              <text class="tag" :class="{ 'tag--up': item.weekTrend === 'up' }">
                {{ formatWeekTrend(item) }}
              </text>
            </view>
          </view>
          <view class="report-card__illus">
            <view class="illus-doc">
              <view class="illus-pie" />
              <view class="illus-pen" />
            </view>
          </view>
        </view>
      </view>
      <view class="scroll-bottom" />
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import {
  formatDayTrend,
  formatWeekTrend,
  ratingStars,
  securityReportGroups
} from '@/mock/v2-report'
import { getLayoutMetrics, getNavLayout } from '@/utils/layout-metrics'
import { useNavLayout } from '@/composables/useNavLayout'

const groups = securityReportGroups
const autoPush = ref(true)
const nav = useNavLayout()
const scrollHeight = ref('600px')

function goBack(): void {
  uni.navigateBack()
}

function openReport(id: string): void {
  uni.navigateTo({ url: `/pages/v2/report/daily?id=${encodeURIComponent(id)}` })
}

onMounted(() => {
  const { windowHeight, safeAreaBottom } = getLayoutMetrics()
  const top = getNavLayout().navTotalHeight
  scrollHeight.value = `${windowHeight - top - safeAreaBottom}px`
})
</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background: linear-gradient(
    180deg,
    #3a7bd8 0%,
    #5a94e8 12%,
    #8fb8f0 28%,
    #c5daf5 48%,
    #e8f0f8 72%,
    #f0f3f7 100%
  );
}

.nav__bar {
  display: flex;
  align-items: center;
  box-sizing: border-box;
  padding-left: 24rpx;
}

.nav__btn {
  width: 64rpx;
  height: 64rpx;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.nav__title {
  flex: 1;
  text-align: center;
  font-size: 34rpx;
  font-weight: 600;
  color: #fff;
}

.nav__push {
  display: flex;
  align-items: center;
  gap: 8rpx;
  flex-shrink: 0;
  min-width: 180rpx;
  justify-content: flex-end;
}

.nav__push-label {
  font-size: 22rpx;
  color: rgba(255, 255, 255, 0.95);
}

.scroll {
  box-sizing: border-box;
  padding: 0 24rpx;
}

.group__divider {
  display: flex;
  align-items: center;
  gap: 20rpx;
  margin: 32rpx 0 24rpx;
}

.group__line {
  flex: 1;
  height: 1rpx;
  background: rgba(255, 255, 255, 0.45);
}

.group__day {
  font-size: 26rpx;
  color: rgba(255, 255, 255, 0.9);
  flex-shrink: 0;
}

.report-card {
  display: flex;
  align-items: stretch;
  margin-bottom: 24rpx;
  padding: 28rpx 24rpx;
  border-radius: 24rpx;
  background: rgba(255, 255, 255, 0.92);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  box-shadow: 0 12rpx 40rpx rgba(40, 90, 160, 0.12);
}

.report-card__body {
  flex: 1;
  min-width: 0;
}

.report-card__title {
  display: block;
  font-size: 32rpx;
  font-weight: 700;
  color: #1a3a5c;
  margin-bottom: 20rpx;
}

.report-card__row {
  display: flex;
  align-items: baseline;
  flex-wrap: wrap;
  margin-bottom: 12rpx;
  font-size: 26rpx;
  color: #4a6078;
}

.report-card__value {
  font-size: 36rpx;
  font-weight: 700;
  color: #1a3a5c;
  margin: 0 4rpx;
}

.report-card__unit {
  font-size: 24rpx;
  color: #666;
}

.report-card__row--rating {
  align-items: center;
}

.report-card__stars {
  color: #ff9500;
  font-size: 24rpx;
  letter-spacing: 2rpx;
  margin-right: 8rpx;
}

.report-card__score {
  font-size: 26rpx;
  color: #1a3a5c;
  font-weight: 600;
}

.report-card__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
  margin-top: 16rpx;
}

.tag {
  padding: 8rpx 16rpx;
  font-size: 22rpx;
  color: #666;
  background: #f0f2f5;
  border-radius: 8rpx;

  &--up {
    color: #fa3534;
    background: #fff0ef;
  }
}

.report-card__illus {
  width: 160rpx;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: 12rpx;
}

.illus-doc {
  position: relative;
  width: 120rpx;
  height: 140rpx;
  background: linear-gradient(145deg, #fff 0%, #e8eef8 100%);
  border-radius: 12rpx;
  box-shadow: 0 8rpx 20rpx rgba(80, 120, 180, 0.2);
  transform: rotate(-6deg);
}

.illus-pie {
  position: absolute;
  top: 24rpx;
  left: 50%;
  transform: translateX(-50%);
  width: 56rpx;
  height: 56rpx;
  border-radius: 50%;
  background: conic-gradient(#5b8ff9 0 120deg, #5ad8a6 120deg 220deg, #f6bd16 220deg 360deg);
}

.illus-pen {
  position: absolute;
  bottom: 20rpx;
  right: 8rpx;
  width: 48rpx;
  height: 8rpx;
  background: #2979ff;
  border-radius: 4rpx;
  transform: rotate(-35deg);
}

.scroll-bottom {
  height: 40rpx;
}
</style>
