<template>
  <view class="page">
    <V2TopHeader title="任务记录" :title-dropdown="false" :show-search="false" />

    <view class="filter-bar">
      <text class="ctx">{{ contextLabel }}</text>
      <view class="switch">
        <text
          class="switch__item"
          :class="{ 'switch__item--on': mode === 'all' }"
          @click="mode = 'all'"
        >
          全部
        </text>
        <text
          class="switch__item"
          :class="{ 'switch__item--on': mode === 'mine' }"
          @click="mode = 'mine'"
        >
          仅本人
        </text>
      </view>
    </view>

    <scroll-view scroll-y class="scroll" :style="{ height: scrollHeight }">
      <view v-for="group in grouped" :key="group.date" class="day-group">
        <text class="day-group__date">{{ group.date }}</text>
        <view v-for="msg in group.list" :key="msg._id" class="msg" :class="{ 'msg--sys': msg.type === 1 }">
          <view class="msg__head">
            <text class="msg__name">{{ msg.createdByName || '系统' }}</text>
            <text class="msg__time">{{ msg.createdDate.slice(11, 16) }}</text>
          </view>
          <text class="msg__content">{{ msg.content }}</text>
        </view>
      </view>
      <view v-if="!messages.length" class="empty">
        <u-empty mode="message" text="暂无任务记录" />
      </view>
      <view class="scroll-bottom" />
    </scroll-view>

    <view class="composer" :style="{ paddingBottom: safeBottom + 12 + 'px' }">
      <input
        v-model="draft"
        class="composer__input"
        type="text"
        confirm-type="send"
        placeholder="输入协作消息…"
        @confirm="send"
      />
      <view class="composer__btn" @click="send">
        <text>发送</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import V2TopHeader from '@/components/v2/V2TopHeader.vue'
import { useTaskContext } from '@/composables/useTaskContext'
import { getTaskRecord, sendTaskRecord, setReadTaskRecord } from '@/api/task'
import type { TaskRecordMessage } from '@/api/task/types'
import { getLayoutMetrics, getNavLayout } from '@/utils/layout-metrics'

const { currentBuilding, currentStage, currentFloor, currentRoom, contextLabel, setUnread } =
  useTaskContext()

const mode = ref<'all' | 'mine'>('all')
const messages = ref<TaskRecordMessage[]>([])
const draft = ref('')
const scrollHeight = ref('500px')
const safeBottom = ref(0)

const grouped = computed(() => {
  const map = new Map<string, TaskRecordMessage[]>()
  for (const msg of messages.value) {
    const date = msg.createdDate.slice(0, 10)
    if (!map.has(date)) map.set(date, [])
    map.get(date)!.push(msg)
  }
  return Array.from(map.entries()).map(([date, list]) => ({ date, list }))
})

async function load(): Promise<void> {
  if (!currentBuilding.value || !currentStage.value || !currentFloor.value) return
  messages.value = await getTaskRecord({
    buildingId: currentBuilding.value._id,
    stageCode: currentStage.value.code,
    floorId: currentFloor.value._id,
    roomId: currentRoom.value?._id,
    createdById: mode.value === 'mine' ? 'self' : undefined
  })
  await setReadTaskRecord({
    buildingId: currentBuilding.value._id,
    floorId: currentFloor.value._id,
    roomId: currentRoom.value?._id
  })
  setUnread(0)
}

async function send(): Promise<void> {
  const content = draft.value.trim()
  if (!content) return
  if (!currentBuilding.value || !currentStage.value || !currentFloor.value) {
    uni.showToast({ title: '请先选择位置', icon: 'none' })
    return
  }
  await sendTaskRecord({
    content,
    type: 2,
    buildingId: currentBuilding.value._id,
    stageCode: currentStage.value.code,
    floorId: currentFloor.value._id,
    roomId: currentRoom.value?._id
  })
  draft.value = ''
  await load()
}

watch(mode, () => {
  void load()
})

onMounted(() => {
  const metrics = getLayoutMetrics()
  safeBottom.value = metrics.safeAreaBottom
  const top = getNavLayout().navTotalHeight + 52
  const bottom = 56 + metrics.safeAreaBottom
  scrollHeight.value = `${metrics.windowHeight - top - bottom}px`
  void load()
})
</script>

<style lang="scss" scoped>
@import '@/static/scss/v2-gradient.scss';

.page {
  min-height: 100vh;
  background: $v2-page-gradient;
  display: flex;
  flex-direction: column;
}

.filter-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12rpx 24rpx 8rpx;
  gap: 16rpx;
}

.ctx {
  flex: 1;
  font-size: 22rpx;
  color: #666;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.switch {
  display: flex;
  background: rgba(255, 255, 255, 0.7);
  border-radius: 999rpx;
  padding: 4rpx;
}

.switch__item {
  padding: 8rpx 20rpx;
  font-size: 22rpx;
  color: #666;
  border-radius: 999rpx;

  &--on {
    background: #23c993;
    color: #fff;
  }
}

.scroll {
  padding: 8rpx 24rpx;
  box-sizing: border-box;
}

.day-group {
  margin-bottom: 24rpx;
}

.day-group__date {
  display: block;
  text-align: center;
  font-size: 22rpx;
  color: #999;
  margin: 16rpx 0;
}

.msg {
  margin-bottom: 16rpx;
  padding: 20rpx 24rpx;
  background: #fff;
  border-radius: 16rpx;

  &--sys {
    background: rgba(255, 255, 255, 0.65);
  }
}

.msg__head {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8rpx;
}

.msg__name {
  font-size: 24rpx;
  color: #2f6b58;
  font-weight: 500;
}

.msg__time {
  font-size: 22rpx;
  color: #aaa;
}

.msg__content {
  font-size: 28rpx;
  color: #222;
  line-height: 1.5;
}

.empty {
  padding: 120rpx 0;
}

.scroll-bottom {
  height: 24rpx;
}

.composer {
  display: flex;
  align-items: center;
  gap: 16rpx;
  padding: 16rpx 24rpx;
  background: #fff;
  border-top: 1rpx solid #eee;
}

.composer__input {
  flex: 1;
  height: 72rpx;
  padding: 0 24rpx;
  background: #f5f7f6;
  border-radius: 36rpx;
  font-size: 28rpx;
}

.composer__btn {
  padding: 0 28rpx;
  height: 72rpx;
  line-height: 72rpx;
  background: #23c993;
  color: #fff;
  border-radius: 36rpx;
  font-size: 26rpx;
}
</style>
