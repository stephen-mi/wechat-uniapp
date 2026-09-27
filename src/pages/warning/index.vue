<template>
  <view class="page">
    <SafetyPageHeader
      title="AI预警中心"
      :tabs="['预警事件', '隐患管理']"
      v-model="subTab"
    />
    <scroll-view scroll-y class="page-scroll" :style="{ height: scrollHeight }">
      <!-- 预警事件 -->
      <template v-if="subTab === 0">
        <view class="filter-bar">
          <view class="filter-bar__icons">
            <u-icon v-for="n in 5" :key="n" name="grid" size="18" color="#666" />
          </view>
          <view class="filter-bar__status">
            <text class="filter-bar__label">状态:</text>
            <view class="filter-bar__tags">
              <text class="tag tag--active">未处理</text>
              <text class="tag">确认</text>
            </view>
          </view>
          <view class="filter-bar__switch">
            <text>事件精选</text>
            <u-switch v-model="featuredOnly" size="20" />
          </view>
        </view>

        <view v-for="group in warningEventGroups" :key="group.dateLabel" class="group">
          <view class="group__head">
            <text>{{ group.dateLabel }}</text>
            <u-icon name="arrow-down" size="14" color="#999" />
          </view>
          <view v-for="item in group.items" :key="item.id" class="event-item">
            <image class="event-item__cover" :src="item.cover" mode="aspectFill" />
            <view class="event-item__body">
              <text class="event-item__title">{{ item.title }}</text>
              <view class="event-item__row">
                <u-icon name="clock" size="14" color="#999" />
                <text>{{ item.time }}</text>
              </view>
              <view class="event-item__row">
                <u-icon name="flag" size="14" color="#999" />
                <text>{{ item.projectName }}</text>
              </view>
              <view class="event-item__row">
                <u-icon name="map" size="14" color="#999" />
                <text class="event-item__loc">{{ item.location }}</text>
              </view>
            </view>
          </view>
        </view>
      </template>

      <!-- 隐患管理 -->
      <template v-else>
        <view class="hazard-toolbar">
          <view class="hazard-toolbar__status">
            <text>未处理</text>
            <u-icon name="arrow-down" size="12" color="#2979ff" />
          </view>
          <view class="hazard-toolbar__date">
            <text>26-08-27 - 26-09-2</text>
            <u-icon name="calendar" size="16" color="#666" />
          </view>
        </view>
        <view v-for="item in hazardList" :key="item.id" class="hazard-card">
          <view class="hazard-card__cover-wrap">
            <image class="hazard-card__cover" :src="item.cover" mode="aspectFill" />
            <text class="hazard-card__badge">AI云端安全员</text>
          </view>
          <view class="hazard-card__body">
            <text class="hazard-card__project">{{ item.projectName }}</text>
            <text class="hazard-card__title">{{ item.title }}</text>
            <view class="hazard-card__foot">
              <text class="hazard-card__time">{{ item.time }}</text>
              <text class="hazard-card__action" @click="goProcess(item.id)">处理 &gt;</text>
            </view>
          </view>
        </view>
      </template>
      <view class="page-bottom-space" />
    </scroll-view>
    <ClassicTabBar current="warning" />
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import SafetyPageHeader from '@/components/safety/SafetyPageHeader.vue'
import ClassicTabBar from '@/components/nav/ClassicTabBar.vue'
import { hazardList, warningEventGroups } from '@/mock/safety-warning'
import { getLayoutMetrics, getNavLayout } from '@/utils/layout-metrics'

const subTab = ref(0)
const featuredOnly = ref(false)
const scrollHeight = ref('600px')

function goProcess(id: string): void {
  uni.navigateTo({ url: `/pages/warning/process?id=${id}` })
}

onMounted(() => {
  const { windowHeight, safeAreaBottom } = getLayoutMetrics()
  const top = getNavLayout().navTotalHeight + 40
  const bottom = 50 + safeAreaBottom
  scrollHeight.value = `${windowHeight - top - bottom}px`
})
</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background: #f5f6f8;
}

.filter-bar {
  padding: 16rpx 24rpx;
  background: #fff;
  margin-bottom: 16rpx;
}

.filter-bar__icons {
  display: flex;
  justify-content: space-between;
  padding-bottom: 16rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

.filter-bar__status {
  display: flex;
  align-items: center;
  gap: 16rpx;
  padding: 16rpx 0;
  font-size: 26rpx;
}

.filter-bar__tags {
  display: flex;
  gap: 12rpx;
}

.tag {
  padding: 8rpx 20rpx;
  border-radius: 8rpx;
  background: #f5f5f5;
  color: #666;

  &--active {
    background: #eef4ff;
    color: #2979ff;
  }
}

.filter-bar__switch {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 26rpx;
  color: #333;
}

.group__head {
  display: flex;
  justify-content: space-between;
  padding: 20rpx 24rpx;
  font-size: 26rpx;
  color: #666;
}

.event-item {
  display: flex;
  gap: 20rpx;
  padding: 20rpx 24rpx;
  background: #fff;
  margin-bottom: 2rpx;
}

.event-item__cover {
  width: 200rpx;
  height: 140rpx;
  border-radius: 8rpx;
  flex-shrink: 0;
}

.event-item__body {
  flex: 1;
  min-width: 0;
  font-size: 24rpx;
  color: #999;
}

.event-item__title {
  display: block;
  font-size: 30rpx;
  font-weight: 600;
  color: #333;
  margin-bottom: 12rpx;
}

.event-item__row {
  display: flex;
  align-items: center;
  gap: 8rpx;
  margin-top: 8rpx;
}

.event-item__loc {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.hazard-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20rpx 24rpx;
  background: #fff;
  margin-bottom: 16rpx;
  font-size: 26rpx;
}

.hazard-toolbar__status {
  display: flex;
  align-items: center;
  gap: 8rpx;
  color: #2979ff;
  padding: 8rpx 20rpx;
  border: 1rpx solid #2979ff;
  border-radius: 8rpx;
}

.hazard-toolbar__date {
  display: flex;
  align-items: center;
  gap: 8rpx;
  color: #666;
}

.hazard-card {
  display: flex;
  gap: 20rpx;
  margin: 0 24rpx 20rpx;
  padding: 20rpx;
  background: #fff;
  border-radius: 12rpx;
}

.hazard-card__cover-wrap {
  position: relative;
  width: 200rpx;
  height: 140rpx;
  flex-shrink: 0;
}

.hazard-card__cover {
  width: 100%;
  height: 100%;
  border-radius: 8rpx;
}

.hazard-card__badge {
  position: absolute;
  top: 0;
  left: 0;
  padding: 4rpx 8rpx;
  font-size: 18rpx;
  color: #fff;
  background: #e54d42;
  border-radius: 0 0 8rpx 0;
}

.hazard-card__body {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.hazard-card__project {
  align-self: flex-start;
  padding: 4rpx 12rpx;
  font-size: 22rpx;
  color: #2979ff;
  background: #eef4ff;
  border-radius: 6rpx;
}

.hazard-card__title {
  margin-top: 12rpx;
  font-size: 30rpx;
  font-weight: 600;
  color: #333;
}

.hazard-card__foot {
  margin-top: auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 16rpx;
  font-size: 24rpx;
}

.hazard-card__time {
  color: #999;
}

.hazard-card__action {
  color: #2979ff;
}

.page-bottom-space {
  height: 24rpx;
}
</style>
