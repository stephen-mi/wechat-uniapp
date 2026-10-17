<template>
  <view class="page">
    <V2TopHeader :title="projectName" :show-back="true" :title-dropdown="false" :show-search="false" />

    <view class="toolbar">
      <view class="search">
        <u-icon name="search" size="16" color="#8aa399" />
        <input
          v-model="keyword"
          class="search__input"
          placeholder="请输入"
          confirm-type="search"
          @confirm="reload"
        />
      </view>
      <view class="filters">
        <text
          v-for="item in statusOptions"
          :key="item.value"
          class="filter"
          :class="{ 'filter--on': statusFilter === item.value }"
          @click="changeStatus(item.value)"
        >
          {{ item.label }}
        </text>
      </view>
    </view>

    <scroll-view scroll-y class="scroll" :style="{ height: scrollHeight }" @scrolltolower="loadNext">
      <view v-if="!loading && cameras.length === 0" class="empty">暂无摄像头</view>
      <view v-else class="grid">
        <view v-for="camera in cameras" :key="camera.id" class="card" @click="openLive(camera)">
          <view class="card__preview">
            <image
              v-if="cameraCoverUrl(camera)"
              class="card__cover"
              :src="cameraCoverUrl(camera)"
              mode="aspectFill"
            />
            <view v-else class="card__placeholder">
              <u-icon name="camera" size="28" color="#9aa8a2" />
            </view>
            <view v-if="camera.status === 1" class="card__play">
              <u-icon name="play-right-fill" size="18" color="#fff" />
            </view>
            <view class="card__status" :class="camera.status === 1 ? 'card__status--on' : 'card__status--off'">
              <view class="card__dot" />
              <text>{{ camera.status === 1 ? '在线' : '离线' }}</text>
            </view>
          </view>
          <view class="card__info">
            <view class="card__row">
              <text class="card__name">{{ camera.name }}</text>
              <text class="card__meta">{{ formatTime(camera.createTime).time }}</text>
            </view>
            <view class="card__row">
              <text class="card__location">位置：{{ projectName }}</text>
              <text class="card__meta">{{ formatTime(camera.createTime).date }}</text>
            </view>
          </view>
        </view>
      </view>
      <view v-if="loading" class="hint">加载中</view>
      <view class="scroll-bottom" />
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import V2TopHeader from '@/components/v2/V2TopHeader.vue'
import { getCameraPage, type CameraVO } from '@/api/video/camera'
import { cameraCoverUrl } from '@/composables/org-tree'
import { getLayoutMetrics, getNavLayout } from '@/utils/layout-metrics'

const PAGE_SIZE = 12

const projectName = ref('摄像头')
const deptId = ref(0)
const keyword = ref('')
const statusFilter = ref<'all' | 0 | 1>('all')
const cameras = ref<CameraVO[]>([])
const pageNo = ref(0)
const total = ref(0)
const loading = ref(false)
const scrollHeight = ref('500px')

const statusOptions = [
  { label: '全部', value: 'all' as const },
  { label: '在线', value: 1 as const },
  { label: '离线', value: 0 as const }
]

function formatTime(raw?: string): { time: string; date: string } {
  if (!raw) return { time: '--:--', date: '--/--/--' }
  const date = new Date(raw)
  if (Number.isNaN(date.getTime())) return { time: '--:--', date: '--/--/--' }
  const pad = (value: number) => String(value).padStart(2, '0')
  return {
    time: `${pad(date.getHours())}:${pad(date.getMinutes())}`,
    date: `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`
  }
}

async function loadNext(): Promise<void> {
  if (loading.value || !deptId.value) return
  if (pageNo.value > 0 && cameras.value.length >= total.value) return
  loading.value = true
  const next = pageNo.value + 1
  try {
    const page = await getCameraPage({
      pageNo: next,
      pageSize: PAGE_SIZE,
      deptId: deptId.value,
      name: keyword.value.trim() || undefined,
      status: statusFilter.value === 'all' ? undefined : statusFilter.value
    })
    const list = page.list || []
    cameras.value = next === 1 ? list : [...cameras.value, ...list]
    pageNo.value = next
    total.value = Number(page.total || cameras.value.length)
  } catch {
    if (next === 1) cameras.value = []
  } finally {
    loading.value = false
  }
}

function reload(): void {
  pageNo.value = 0
  total.value = 0
  cameras.value = []
  void loadNext()
}

function changeStatus(value: 'all' | 0 | 1): void {
  if (statusFilter.value === value) return
  statusFilter.value = value
  reload()
}

function openLive(camera: CameraVO): void {
  if (camera.status !== 1 || !camera.id) {
    uni.showToast({ title: camera.status === 1 ? '摄像头无效' : '设备离线', icon: 'none' })
    return
  }
  uni.navigateTo({
    url: `/package-video/live?id=${camera.id}&name=${encodeURIComponent(camera.name || '')}`
  })
}

onLoad((query) => {
  deptId.value = Number(query?.deptId || 0)
  projectName.value = decodeURIComponent((query?.name as string) || '摄像头')
  const { windowHeight } = getLayoutMetrics()
  const top = getNavLayout().navTotalHeight + 96
  scrollHeight.value = `${Math.max(windowHeight - top, 200)}px`
  reload()
})
</script>

<style lang="scss" scoped>
@import '@/static/scss/v2-gradient.scss';

.page {
  min-height: 100vh;
  background: $v2-page-gradient;
}

.toolbar {
  display: flex;
  align-items: center;
  gap: 16rpx;
  padding: 8rpx 24rpx 16rpx;
}

.search {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 8rpx;
  height: 64rpx;
  padding: 0 16rpx;
  background: rgba(255, 255, 255, 0.72);
  border-radius: 12rpx;
}

.search__input {
  flex: 1;
  font-size: 26rpx;
}

.filters {
  display: flex;
  gap: 8rpx;
}

.filter {
  padding: 8rpx 16rpx;
  border-radius: 999rpx;
  background: rgba(255, 255, 255, 0.55);
  font-size: 22rpx;
  color: #5c6b66;

  &--on {
    background: #23c993;
    color: #fff;
  }
}

.scroll {
  box-sizing: border-box;
}

.grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16rpx;
  padding: 0 24rpx;
}

.card {
  background: #fff;
  border-radius: 16rpx;
  overflow: hidden;
  box-shadow: 0 8rpx 24rpx rgba(35, 160, 120, 0.12);
}

.card__preview {
  position: relative;
  height: 200rpx;
  background: #e7f0ec;
}

.card__cover {
  width: 100%;
  height: 200rpx;
  display: block;
}

.card__placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(180deg, #f4f6f5, #e4e9e7);
}

.card__play {
  position: absolute;
  left: 50%;
  top: 50%;
  z-index: 2;
  width: 72rpx;
  height: 72rpx;
  margin-left: -36rpx;
  margin-top: -36rpx;
  border-radius: 50%;
  background: rgba(35, 201, 147, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
}

.card__status {
  position: absolute;
  top: 0;
  right: 0;
  z-index: 2;
  display: flex;
  align-items: center;
  gap: 6rpx;
  padding: 6rpx 14rpx;
  border-radius: 0 16rpx 0 12rpx;
  font-size: 20rpx;
  color: #fff;

  &--on {
    background: rgba(67, 207, 124, 0.72);
  }

  &--off {
    background: rgba(220, 68, 68, 0.72);
  }
}

.card__dot {
  width: 10rpx;
  height: 10rpx;
  border-radius: 50%;
  background: #fff;
}

.card__info {
  padding: 12rpx 14rpx 16rpx;
}

.card__row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8rpx;
}

.card__name,
.card__location {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.card__name {
  font-size: 26rpx;
  font-weight: 600;
  color: #1a1a1a;
}

.card__location {
  margin-top: 4rpx;
  font-size: 20rpx;
  color: #7d8b86;
}

.card__meta {
  flex-shrink: 0;
  font-size: 20rpx;
  color: #8a9692;
}

.empty,
.hint {
  padding: 48rpx 0;
  text-align: center;
  font-size: 26rpx;
  color: #7d8b86;
}

.scroll-bottom {
  height: 24rpx;
}
</style>
