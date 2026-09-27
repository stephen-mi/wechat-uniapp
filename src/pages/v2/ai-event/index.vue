<template>
  <view class="page">
    <V2TopHeader :title="orgTitle" @title-click="goOrgSelect">
      <template #right>
        <view class="header-actions">
          <view class="v2-header__btn" @click="toastCalendar">
            <u-icon name="calendar" size="18" color="#fff" />
          </view>
          <view class="v2-header__btn" @click="goMap">
            <u-icon name="grid" size="18" color="#fff" />
          </view>
        </view>
      </template>
      <template #sub>
        <text class="sub-range">最近7天</text>
      </template>
    </V2TopHeader>

    <scroll-view scroll-y class="scroll" :style="{ height: scrollHeight }">
      <view class="metrics">
        <view class="metrics__item metrics__item--primary">
          <text class="metrics__num">{{ metrics.hazardTotal }}</text>
          <text class="metrics__label">隐患数量</text>
        </view>
        <view class="metrics__item">
          <text class="metrics__num">{{ metrics.processed }}</text>
          <text class="metrics__label">已处理</text>
        </view>
        <view class="metrics__item">
          <text class="metrics__num">{{ metrics.pending }}</text>
          <text class="metrics__label">未处理</text>
        </view>
        <view class="metrics__item">
          <text class="metrics__num metrics__num--sm">{{ metrics.processRate }}</text>
          <text class="metrics__label">处理率</text>
        </view>
      </view>

      <view v-for="item in events" :key="item.id" class="event-card" :class="{ 'event-card--compact': item.compact }">
        <template v-if="!item.compact">
          <text class="event-card__tag">{{ item.tag }}</text>
          <text class="event-card__title">{{ item.title }}</text>
          <text v-if="item.desc" class="event-card__desc">{{ item.desc }}</text>
          <image class="event-card__cover" :src="item.cover" mode="aspectFill" />
          <view class="event-card__foot">
            <text v-if="item.camera">{{ item.camera }}</text>
            <text>{{ item.time }}</text>
            <text class="status status--pending">未处理</text>
          </view>
        </template>
        <template v-else>
          <image class="event-card__thumb" :src="item.cover" mode="aspectFill" />
          <view class="event-card__compact-body">
            <text class="event-card__title">{{ item.title }}</text>
            <text class="status status--pending">未处理</text>
            <text class="event-card__project">{{ item.projectName }}</text>
            <text class="event-card__time">{{ item.time }}</text>
          </view>
        </template>
      </view>
      <view class="scroll-bottom" />
    </scroll-view>
    <V2TabBar current="ai-event" />
  </view>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import V2TopHeader from '@/components/v2/V2TopHeader.vue'
import V2TabBar from '@/components/nav/V2TabBar.vue'
import { useMonitorContext } from '@/composables/useMonitorContext'
import { v2AiEvents, v2EventMetrics } from '@/mock/v2-home'
import { getLayoutMetrics, getNavLayout } from '@/utils/layout-metrics'

const { monitorOrgName } = useMonitorContext()
const orgTitle = monitorOrgName
const metrics = v2EventMetrics
const events = v2AiEvents
const scrollHeight = ref('600px')

function goOrgSelect(): void {
  uni.navigateTo({ url: '/pages/monitor/org-select' })
}

function goMap(): void {
  uni.navigateTo({ url: '/pages/monitor/map' })
}

function toastCalendar(): void {
  uni.showToast({ title: '日期筛选', icon: 'none' })
}

onMounted(() => {
  const { windowHeight, safeAreaBottom } = getLayoutMetrics()
  const top = getNavLayout().navTotalHeight + 48
  const bottom = 55 + safeAreaBottom
  scrollHeight.value = `${windowHeight - top - bottom}px`
})
</script>

<style lang="scss" scoped>
@import '@/static/scss/v2-gradient.scss';

.page {
  min-height: 100vh;
  background: $v2-page-gradient;
}

.header-actions {
  display: flex;
  gap: 12rpx;
}

:deep(.v2-header__btn) {
  width: 64rpx;
  height: 64rpx;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.18);
  display: flex;
  align-items: center;
  justify-content: center;
}

.sub-range {
  font-size: 26rpx;
  color: rgba(255, 255, 255, 0.95);
}

.scroll {
  padding: 0 24rpx;
  box-sizing: border-box;
}

.metrics {
  display: flex;
  gap: 12rpx;
  margin: 16rpx 0 24rpx;
}

.metrics__item {
  flex: 1;
  padding: 20rpx 8rpx;
  text-align: center;
  background: #fff;
  border-radius: 12rpx;

  &--primary {
    background: linear-gradient(135deg, #3a8bff, #2979ff);
    color: #fff;

    .metrics__label {
      color: rgba(255, 255, 255, 0.9);
    }
  }
}

.metrics__num {
  display: block;
  font-size: 40rpx;
  font-weight: 700;
  color: #333;

  &--sm {
    font-size: 32rpx;
  }
}

.metrics__item--primary .metrics__num {
  color: #fff;
}

.metrics__label {
  display: block;
  margin-top: 8rpx;
  font-size: 22rpx;
  color: #888;
}

.event-card {
  margin-bottom: 20rpx;
  padding: 24rpx;
  background: #fff;
  border-radius: 16rpx;

  &--compact {
    display: flex;
    gap: 20rpx;
    padding: 20rpx;
  }
}

.event-card__tag {
  display: inline-block;
  padding: 4rpx 12rpx;
  font-size: 20rpx;
  color: #7c5cff;
  background: #f0ebff;
  border-radius: 6rpx;
}

.event-card__title {
  display: block;
  margin-top: 12rpx;
  font-size: 30rpx;
  font-weight: 600;
  color: #333;
}

.event-card__desc {
  display: block;
  margin-top: 8rpx;
  font-size: 24rpx;
  color: #666;
  line-height: 1.5;
}

.event-card__cover {
  width: 100%;
  height: 320rpx;
  margin-top: 16rpx;
  border-radius: 12rpx;
}

.event-card__foot {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 16rpx;
  margin-top: 16rpx;
  font-size: 24rpx;
  color: #999;
}

.event-card__thumb {
  width: 160rpx;
  height: 120rpx;
  border-radius: 8rpx;
  flex-shrink: 0;
}

.event-card__compact-body {
  flex: 1;
  min-width: 0;
}

.event-card__project {
  display: block;
  margin-top: 8rpx;
  font-size: 24rpx;
  color: #666;
}

.event-card__time {
  display: block;
  margin-top: 8rpx;
  font-size: 22rpx;
  color: #999;
}

.status {
  font-size: 22rpx;
  padding: 4rpx 12rpx;
  border-radius: 999rpx;

  &--pending {
    color: #ff8f1f;
    background: #fff3e6;
  }
}

.scroll-bottom {
  height: 24rpx;
}
</style>
