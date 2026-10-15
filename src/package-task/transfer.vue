<template>
  <view class="page">
    <V2TopHeader title="作业面移交" :title-dropdown="false" :show-search="false" />

    <scroll-view scroll-y class="scroll" :style="{ height: scrollHeight }">
      <view
        v-for="item in list"
        :key="item._id"
        class="card"
        @click="openDetail(item)"
      >
        <view class="card__head">
          <text class="card__name">{{ item.name }}</text>
          <text class="card__status" :class="'status--' + item.status">{{ item.statusText }}</text>
        </view>
        <text class="card__meta">{{ item.buildingName }} · {{ item.fromTeam }} → {{ item.toTeam }}</text>
        <view class="card__foot">
          <text>进度 {{ item.finishedCount }}/{{ item.totalCount }}</text>
          <text>{{ item.updatedDate }}</text>
        </view>
        <view class="progress">
          <view
            class="progress__bar"
            :style="{ width: progressWidth(item) }"
          />
        </view>
      </view>
      <view v-if="!list.length" class="empty">
        <u-empty mode="list" text="暂无移交单" />
      </view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import V2TopHeader from '@/components/v2/V2TopHeader.vue'
import { getWorkTransferList } from '@/api/task'
import type { WorkTransferCard } from '@/api/task/types'
import { getLayoutMetrics, getNavLayout } from '@/utils/layout-metrics'
import { mockTaskOrgId } from '@/mock/task'
import { useTaskContext } from '@/composables/useTaskContext'

const { currentBuilding } = useTaskContext()
const list = ref<WorkTransferCard[]>([])
const scrollHeight = ref('500px')

function progressWidth(item: WorkTransferCard): string {
  const total = item.totalCount || 1
  const pct = Math.round(((item.finishedCount || 0) / total) * 100)
  return `${pct}%`
}

async function load(): Promise<void> {
  list.value = await getWorkTransferList({
    deptId: mockTaskOrgId,
    buildingId: currentBuilding.value?._id
  })
}

function openDetail(item: WorkTransferCard): void {
  uni.navigateTo({
    url: `/package-task/transfer-detail?id=${item._id}&buildingId=${item.buildingId}&name=${encodeURIComponent(item.name)}`
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

.card {
  margin-bottom: 20rpx;
  padding: 24rpx;
  background: #fff;
  border-radius: 16rpx;
}

.card__head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10rpx;
}

.card__name {
  font-size: 30rpx;
  font-weight: 600;
  color: #1a1a1a;
}

.card__status {
  font-size: 22rpx;
  padding: 4rpx 14rpx;
  border-radius: 999rpx;
  background: #f0f0f0;
  color: #666;
}

.status--0 {
  background: #f5f5f5;
  color: #888;
}

.status--1 {
  background: rgba(240, 180, 41, 0.15);
  color: #c48a00;
}

.status--2 {
  background: rgba(35, 201, 147, 0.15);
  color: #1d7a5a;
}

.card__meta {
  display: block;
  font-size: 24rpx;
  color: #666;
  margin-bottom: 16rpx;
}

.card__foot {
  display: flex;
  justify-content: space-between;
  font-size: 22rpx;
  color: #999;
  margin-bottom: 12rpx;
}

.progress {
  height: 10rpx;
  background: #f0f0f0;
  border-radius: 10rpx;
  overflow: hidden;
}

.progress__bar {
  height: 100%;
  background: linear-gradient(90deg, #5ed9b0, #23c993);
}

.empty {
  padding: 120rpx 0;
}
</style>
