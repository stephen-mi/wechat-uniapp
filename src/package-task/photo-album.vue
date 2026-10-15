<template>
  <view class="page">
    <V2TopHeader title="现场相册" :title-dropdown="false" :show-search="false" />

    <scroll-view scroll-y class="scroll" :style="{ height: scrollHeight }">
      <view class="section-title">按专业分组</view>
      <view class="grid">
        <view
          v-for="group in groups"
          :key="group.key"
          class="album-card"
          @click="openGroup(group)"
        >
          <image class="album-card__cover" :src="group.cover || '/static/images/default.jpg'" mode="aspectFill" />
          <view class="album-card__meta">
            <text class="album-card__title">{{ group.title }}</text>
            <text class="album-card__count">{{ group.count }} 张</text>
          </view>
        </view>
      </view>
      <view v-if="!groups.length" class="empty">
        <u-empty mode="photo" text="暂无相册" />
      </view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import V2TopHeader from '@/components/v2/V2TopHeader.vue'
import { fetchGroupAlbumList } from '@/api/task'
import type { AlbumGroupItem } from '@/api/task/types'
import { getLayoutMetrics, getNavLayout } from '@/utils/layout-metrics'
import { mockTaskOrgId } from '@/mock/task'
import { useTaskContext } from '@/composables/useTaskContext'

const { currentBuilding, currentStage } = useTaskContext()
const groups = ref<AlbumGroupItem[]>([])
const scrollHeight = ref('500px')

async function load(): Promise<void> {
  groups.value = await fetchGroupAlbumList({
    'dept._id': mockTaskOrgId,
    buildingId: currentBuilding.value?._id,
    stageCode: currentStage.value?.code
  })
}

function openGroup(group: AlbumGroupItem): void {
  uni.navigateTo({
    url: `/package-task/photo-list?title=${encodeURIComponent(group.title)}&itemName=${encodeURIComponent(group.itemName || '')}`
  })
}

onMounted(() => {
  const { windowHeight } = getLayoutMetrics()
  scrollHeight.value = `${windowHeight - getNavLayout().navTotalHeight}px`
  void load()
})
</script>

<style lang="scss" scoped>
@import '@/static/scss/v2-gradient.scss';

.page {
  min-height: 100vh;
  background: $v2-page-gradient;
}

.scroll {
  padding: 16rpx 24rpx 40rpx;
  box-sizing: border-box;
}

.section-title {
  font-size: 28rpx;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 16rpx;
}

.grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20rpx;
}

.album-card {
  background: #fff;
  border-radius: 16rpx;
  overflow: hidden;
}

.album-card__cover {
  width: 100%;
  height: 220rpx;
}

.album-card__meta {
  padding: 16rpx 20rpx 20rpx;
}

.album-card__title {
  display: block;
  font-size: 28rpx;
  color: #222;
  font-weight: 500;
}

.album-card__count {
  display: block;
  margin-top: 6rpx;
  font-size: 22rpx;
  color: #999;
}

.empty {
  padding: 120rpx 0;
}
</style>
