<template>
  <view class="page">
    <V2TopHeader :title="title" :title-dropdown="false" :show-search="false" />

    <scroll-view scroll-y class="scroll" :style="{ height: scrollHeight }">
      <view v-for="day in days" :key="day.date" class="day">
        <text class="day__date">{{ day.date }}</text>
        <view class="day__grid">
          <image
            v-for="photo in day.photos"
            :key="photo._id"
            class="day__img"
            :src="photo.thumbnailUrl || photo.url"
            mode="aspectFill"
            @click="preview(photo)"
          />
        </view>
      </view>
      <view v-if="!days.length" class="empty">
        <u-empty mode="photo" text="暂无照片" />
      </view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { onLoad } from '@dcloudio/uni-app'
import { onMounted, ref } from 'vue'
import V2TopHeader from '@/components/v2/V2TopHeader.vue'
import { fetchPhotoList } from '@/api/task'
import type { AlbumPhotoDayGroup, TaskStructuredPhoto } from '@/api/task/types'
import { getLayoutMetrics, getNavLayout } from '@/utils/layout-metrics'

const title = ref('照片列表')
const itemName = ref('')
const days = ref<AlbumPhotoDayGroup[]>([])
const scrollHeight = ref('500px')

onLoad((query) => {
  title.value = decodeURIComponent((query?.title as string) || '照片列表')
  itemName.value = decodeURIComponent((query?.itemName as string) || '')
})

async function load(): Promise<void> {
  days.value = await fetchPhotoList({ itemName: itemName.value })
}

function preview(photo: TaskStructuredPhoto): void {
  const urls = days.value.flatMap((d) => d.photos.map((p) => p.url || p.thumbnailUrl || '')).filter(Boolean)
  uni.previewImage({
    current: photo.url || photo.thumbnailUrl,
    urls
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

.day {
  margin-bottom: 28rpx;
}

.day__date {
  display: block;
  font-size: 26rpx;
  color: #666;
  margin-bottom: 12rpx;
}

.day__grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12rpx;
}

.day__img {
  width: 100%;
  height: 210rpx;
  border-radius: 12rpx;
  background: #eee;
}

.empty {
  padding: 120rpx 0;
}
</style>
