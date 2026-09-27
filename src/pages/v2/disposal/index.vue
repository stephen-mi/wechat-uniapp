<template>
  <view class="page">
    <V2TopHeader :title="orgTitle" @title-click="goOrgSelect">
      <template #sub>
        <view class="sub-row">
          <text class="sub-range">最近7天</text>
          <view class="sub-row__icons">
            <u-icon name="calendar" size="18" color="#fff" @click="toastCalendar" />
            <u-icon name="grid" size="18" color="#fff" @click="goMap" />
          </view>
        </view>
      </template>
    </V2TopHeader>

    <scroll-view scroll-y class="scroll" :style="{ height: scrollHeight }">
      <view v-for="p in projects" :key="p.id" class="rate-card" @click="toastProject(p.name)">
        <view class="rate-card__cover-wrap">
          <image class="rate-card__cover" :src="p.cover" mode="aspectFill" />
          <text class="rate-card__stars">{{ p.ratingStars }}</text>
          <text class="rate-card__attention">{{ p.attention }}</text>
        </view>
        <text class="rate-card__name">{{ p.name }}</text>
        <view class="rate-card__meta">
          <view class="rate-card__events">
            <u-icon name="star-fill" size="14" color="#2979ff" />
            <text>AI事件数量: {{ p.aiEventCount }}</text>
          </view>
          <view class="rate-card__trends">
            <text>评分较昨日</text>
            <text :class="p.dayTrend === 'down' ? 'trend--down' : 'trend--up'">
              {{ p.dayTrend === 'down' ? '↓' : '↑' }}
            </text>
            <text class="trend-gap">近一周</text>
            <text :class="p.weekTrend === 'down' ? 'trend--down' : 'trend--up'">
              {{ p.weekTrend === 'down' ? '↓' : '↑' }}
            </text>
          </view>
        </view>
      </view>
      <view class="scroll-bottom" />
    </scroll-view>
    <V2TabBar current="disposal" />
  </view>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import V2TopHeader from '@/components/v2/V2TopHeader.vue'
import V2TabBar from '@/components/nav/V2TabBar.vue'
import { useMonitorContext } from '@/composables/useMonitorContext'
import { v2DisposalProjects } from '@/mock/v2-home'
import { getLayoutMetrics, getNavLayout } from '@/utils/layout-metrics'

const { monitorOrgName } = useMonitorContext()
const orgTitle = monitorOrgName
const projects = v2DisposalProjects
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

function toastProject(name: string): void {
  uni.showToast({ title: name, icon: 'none' })
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

.sub-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.sub-range {
  font-size: 26rpx;
  color: rgba(255, 255, 255, 0.95);
}

.sub-row__icons {
  display: flex;
  gap: 20rpx;
}

.scroll {
  padding: 16rpx 24rpx;
  box-sizing: border-box;
}

.rate-card {
  margin-bottom: 24rpx;
  padding: 0 0 20rpx;
  background: #fff;
  border-radius: 16rpx;
  overflow: hidden;
}

.rate-card__cover-wrap {
  position: relative;
  height: 280rpx;
}

.rate-card__cover {
  width: 100%;
  height: 100%;
}

.rate-card__stars {
  position: absolute;
  top: 12rpx;
  left: 12rpx;
  padding: 6rpx 12rpx;
  font-size: 22rpx;
  color: #fff;
  background: rgba(0, 0, 0, 0.55);
  border-radius: 8rpx;
}

.rate-card__attention {
  position: absolute;
  top: 12rpx;
  right: 12rpx;
  padding: 6rpx 16rpx;
  font-size: 22rpx;
  color: #fff;
  background: rgba(0, 0, 0, 0.55);
  border-radius: 999rpx;
}

.rate-card__name {
  display: block;
  padding: 16rpx 20rpx 8rpx;
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
}

.rate-card__meta {
  padding: 0 20rpx;
  display: flex;
  flex-direction: column;
  gap: 12rpx;
  font-size: 24rpx;
  color: #666;
}

.rate-card__events {
  display: flex;
  align-items: center;
  gap: 8rpx;
}

.rate-card__trends {
  display: flex;
  align-items: center;
  gap: 8rpx;
  flex-wrap: wrap;
}

.trend-gap {
  margin-left: 16rpx;
}

.trend--down {
  color: #19be6b;
}

.trend--up {
  color: #fa3534;
}

.scroll-bottom {
  height: 24rpx;
}
</style>
