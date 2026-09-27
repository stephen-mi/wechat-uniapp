<template>
  <view class="page">
    <SafetyPageHeader title="视频监控" />
    <scroll-view scroll-y class="page-scroll" :style="{ height: scrollHeight }">
      <view class="hero">
        <view class="hero__row">
          <view class="hero__select" @click="goOrgSelect">
            <text>{{ monitorOrgName }}</text>
            <u-icon name="arrow-down" size="14" color="#fff" />
          </view>
          <view class="hero__map" @click="goMap">
            <u-icon name="map" size="20" color="#fff" />
          </view>
        </view>
        <view class="hero__stats">
          <view class="hero__stat">
            <text class="hero__num">{{ dashboard.projectCount }}</text>
            <text class="hero__label">接入项目数</text>
          </view>
          <view class="hero__stat">
            <text class="hero__num">{{ dashboard.onlineRate }}%</text>
            <text class="hero__label">摄像机在线率</text>
          </view>
        </view>
      </view>

      <view class="toolbar">
        <view class="toolbar__filter">
          <text>项目状态</text>
          <u-icon name="arrow-down" size="12" color="#666" />
        </view>
        <view class="toolbar__filter">
          <text>项目排序</text>
          <u-icon name="arrow-down" size="12" color="#666" />
        </view>
        <view class="toolbar__search">
          <u-icon name="search" size="16" color="#999" />
          <input v-model="keyword" class="toolbar__input" placeholder="搜索" />
        </view>
      </view>

      <view v-for="project in filteredProjects" :key="project.id" class="card">
        <view class="card__head" @click="toastProject(project.name)">
          <view>
            <text class="card__title">{{ project.name }}</text>
            <text class="card__sub">{{ project.groupName }}</text>
          </view>
          <view class="card__meta">
            <text>{{ project.online }}/{{ project.total }}</text>
            <u-icon name="arrow-right" size="14" color="#999" />
          </view>
        </view>
        <view class="thumb-grid" :class="'thumb-grid--' + gridClass(project.cameras.length)">
          <view
            v-for="(cam, idx) in project.cameras"
            :key="idx"
            class="thumb"
            @click="toastProject(cam.label)"
          >
            <image class="thumb__img" :src="cam.cover" mode="aspectFill" />
            <view class="thumb__label">{{ cam.label }}</view>
          </view>
        </view>
      </view>
      <view class="page-bottom-space" />
    </scroll-view>
    <ClassicTabBar current="monitor" />
  </view>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import SafetyPageHeader from '@/components/safety/SafetyPageHeader.vue'
import ClassicTabBar from '@/components/nav/ClassicTabBar.vue'
import { useMonitorContext } from '@/composables/useMonitorContext'
import { monitorDashboard, monitorProjects } from '@/mock/safety-monitor'
import { getLayoutMetrics, getNavLayout } from '@/utils/layout-metrics'

const { monitorOrgName } = useMonitorContext()
const dashboard = monitorDashboard
const keyword = ref('')
const scrollHeight = ref('600px')

const filteredProjects = computed(() => {
  const k = keyword.value.trim()
  if (!k) return monitorProjects
  return monitorProjects.filter((p) => p.name.includes(k))
})

function gridClass(count: number): string {
  if (count <= 2) return '2'
  return '4'
}

function goOrgSelect(): void {
  uni.navigateTo({ url: '/pages/monitor/org-select' })
}

function goMap(): void {
  uni.navigateTo({ url: '/pages/monitor/map' })
}

function toastProject(name: string): void {
  uni.showToast({ title: name, icon: 'none' })
}

onMounted(() => {
  const { windowHeight, safeAreaBottom } = getLayoutMetrics()
  const top = getNavLayout().navTotalHeight
  const bottom = 50 + safeAreaBottom
  scrollHeight.value = `${windowHeight - top - bottom}px`
})
</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background: #f5f6f8;
}

.page-scroll {
  box-sizing: border-box;
}

.hero {
  margin: 24rpx;
  padding: 32rpx;
  border-radius: 16rpx;
  background: linear-gradient(135deg, #3a8bff, #2979ff);
  color: #fff;
}

.hero__row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32rpx;
}

.hero__select {
  display: flex;
  align-items: center;
  gap: 8rpx;
  font-size: 28rpx;
  padding: 8rpx 0;
}

.hero__map {
  padding: 8rpx;
}

.hero__stats {
  display: flex;
}

.hero__stat {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.hero__num {
  font-size: 56rpx;
  font-weight: 600;
}

.hero__label {
  margin-top: 8rpx;
  font-size: 24rpx;
  opacity: 0.9;
}

.toolbar {
  display: flex;
  align-items: center;
  gap: 16rpx;
  padding: 0 24rpx 16rpx;
  font-size: 26rpx;
  color: #666;
}

.toolbar__filter {
  display: flex;
  align-items: center;
  gap: 4rpx;
  padding: 12rpx 16rpx;
  background: #fff;
  border-radius: 8rpx;
}

.toolbar__search {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 8rpx;
  padding: 12rpx 20rpx;
  background: #fff;
  border-radius: 8rpx;
}

.toolbar__input {
  flex: 1;
  font-size: 26rpx;
}

.card {
  margin: 0 24rpx 24rpx;
  padding: 24rpx;
  background: #fff;
  border-radius: 16rpx;
}

.card__head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20rpx;
}

.card__title {
  display: block;
  font-size: 30rpx;
  font-weight: 600;
  color: #333;
}

.card__sub {
  display: block;
  margin-top: 8rpx;
  font-size: 24rpx;
  color: #999;
}

.card__meta {
  display: flex;
  align-items: center;
  gap: 8rpx;
  font-size: 26rpx;
  color: #666;
}

.thumb-grid {
  display: grid;
  gap: 12rpx;

  &--2 {
    grid-template-columns: 1fr 1fr;
  }

  &--4 {
    grid-template-columns: 1fr 1fr;
  }
}

.thumb {
  position: relative;
  border-radius: 8rpx;
  overflow: hidden;
  height: 200rpx;
}

.thumb__img {
  width: 100%;
  height: 100%;
}

.thumb__label {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  padding: 8rpx 12rpx;
  font-size: 20rpx;
  color: #fff;
  background: rgba(0, 0, 0, 0.55);
}

.page-bottom-space {
  height: 24rpx;
}
</style>
