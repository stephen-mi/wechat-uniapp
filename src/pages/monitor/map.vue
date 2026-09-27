<template>
  <view class="page">
    <MonitorSubNavBar title="项目分布情况" />
    <view class="map-toolbar">
      <view class="map-toolbar__region" @click="goOrgSelect">
        <text>{{ monitorRegionLabel }}</text>
        <u-icon name="arrow-down" size="12" color="#333" />
      </view>
      <view class="map-toolbar__search">
        <u-icon name="search" size="16" color="#999" />
        <input v-model="keyword" class="map-toolbar__input" placeholder="搜索项目" />
      </view>
      <u-icon name="star" size="22" color="#ccc" @click="toastFavorite" />
    </view>

    <map
      id="projectMap"
      class="map"
      :latitude="center.latitude"
      :longitude="center.longitude"
      :scale="11"
      :markers="markers"
      show-location
      @markertap="onMarkerTap"
    />

    <view v-if="activeProject" class="sheet">
      <view class="sheet__head">
        <text class="sheet__title">{{ activeProject.name }}</text>
        <u-icon name="close" size="16" color="#999" @click="activeId = ''" />
      </view>
      <view class="sheet__body">
        <image class="sheet__cover" :src="activeProject.cover" mode="aspectFill" />
        <view class="sheet__info">
          <view class="sheet__row">
            <u-icon name="home" size="14" color="#999" />
            <text>{{ activeProject.orgName }}</text>
          </view>
          <view class="sheet__row sheet__row--addr">
            <u-icon name="map" size="14" color="#999" />
            <text>{{ activeProject.address }}</text>
          </view>
        </view>
      </view>
      <view class="sheet__actions">
        <view class="sheet__btn" @click="toastDetail">
          <u-icon name="list" size="20" color="#333" />
          <text>项目详情</text>
        </view>
        <view class="sheet__btn sheet__btn--primary" @click="goMonitor">
          <u-icon name="play-circle" size="20" color="#2979ff" />
          <text>查看视频</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import MonitorSubNavBar from '@/components/safety/MonitorSubNavBar.vue'
import { useMonitorContext } from '@/composables/useMonitorContext'
import { goHomeAfterLogin } from '@/composables/useUiVersion'
import { defaultMapCenter, mapProjects, type MapProjectMarker } from '@/mock/monitor-map'

const { monitorRegionLabel, setOrgName } = useMonitorContext()

const keyword = ref('')
const activeId = ref('p2')
const center = defaultMapCenter

const filtered = computed(() => {
  const k = keyword.value.trim()
  if (!k) return mapProjects
  return mapProjects.filter((p) => p.name.includes(k) || p.address.includes(k))
})

const markers = computed(() =>
  filtered.value.map((p, index) => ({
    id: index,
    latitude: p.latitude,
    longitude: p.longitude,
    width: 32,
    height: 32,
    iconPath: '/static/images/default.jpg',
    callout: {
      content: p.name,
      display: activeId.value === p.id ? 'ALWAYS' : 'BYCLICK',
      padding: 6,
      borderRadius: 4,
      fontSize: 12
    }
  }))
)

const activeProject = computed<MapProjectMarker | null>(() => {
  if (!activeId.value) return null
  return mapProjects.find((p) => p.id === activeId.value) ?? null
})

function onMarkerTap(e: { detail: { markerId: number } }): void {
  const idx = e.detail.markerId
  const p = filtered.value[idx]
  if (p) activeId.value = p.id
}

function goOrgSelect(): void {
  uni.navigateTo({ url: '/pages/monitor/org-select?from=map' })
}

function goMonitor(): void {
  const p = activeProject.value
  if (p) setOrgName(p.orgName)
  goHomeAfterLogin()
}

function toastDetail(): void {
  uni.showToast({ title: '项目详情开发中', icon: 'none' })
}

function toastFavorite(): void {
  uni.showToast({ title: '收藏', icon: 'none' })
}
</script>

<style lang="scss" scoped>
.page {
  position: relative;
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f5f6f8;
}

.map-toolbar {
  display: flex;
  align-items: center;
  gap: 16rpx;
  padding: 16rpx 24rpx;
  background: #fff;
  z-index: 2;
}

.map-toolbar__region {
  display: flex;
  align-items: center;
  gap: 4rpx;
  font-size: 28rpx;
  color: #333;
  flex-shrink: 0;
}

.map-toolbar__search {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 8rpx;
  padding: 12rpx 20rpx;
  background: #f5f6f8;
  border-radius: 8rpx;
}

.map-toolbar__input {
  flex: 1;
  font-size: 26rpx;
}

.map {
  flex: 1;
  width: 100%;
}

.sheet {
  position: absolute;
  left: 24rpx;
  right: 24rpx;
  bottom: calc(24rpx + env(safe-area-inset-bottom));
  padding: 24rpx;
  background: #fff;
  border-radius: 16rpx;
  box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.12);
  z-index: 3;
}

.sheet__head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20rpx;
}

.sheet__title {
  flex: 1;
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
  padding-right: 16rpx;
}

.sheet__body {
  display: flex;
  gap: 20rpx;
}

.sheet__cover {
  width: 160rpx;
  height: 120rpx;
  border-radius: 8rpx;
  flex-shrink: 0;
}

.sheet__info {
  flex: 1;
  font-size: 24rpx;
  color: #666;
}

.sheet__row {
  display: flex;
  align-items: flex-start;
  gap: 8rpx;
  margin-bottom: 12rpx;

  &--addr {
    line-height: 1.5;
  }
}

.sheet__actions {
  display: flex;
  gap: 24rpx;
  margin-top: 24rpx;
}

.sheet__btn {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8rpx;
  padding: 20rpx;
  background: #f5f6f8;
  border-radius: 12rpx;
  font-size: 26rpx;
  color: #333;

  &--primary {
    color: #2979ff;
    background: #eef4ff;
  }
}
</style>
