<template>
  <view class="page">
    <view class="page__hero">
      <V2TopHeader
        :title="orgTitle"
        :show-search="false"
        @title-click="goOrgSelect"
        @chevron-click="toggleViewMode"
      >
        <template #right>
          <view class="header-actions">
            <template v-if="viewMode === 'cameras'">
              <view class="v2-header__btn" @click="toggleViewMode">
                <u-icon name="grid" size="18" color="#fff" />
              </view>
              <view class="v2-header__btn" @click="toastFilter">
                <u-icon name="list" size="18" color="#fff" />
              </view>
              <view class="v2-header__btn" @click="toastSearch">
                <u-icon name="search" size="18" color="#fff" />
              </view>
            </template>
            <template v-else>
              <view class="v2-header__btn" @click="toggleViewMode">
                <u-icon name="grid" size="18" color="#fff" />
              </view>
              <view class="v2-header__btn" @click="toastSearch">
                <u-icon name="search" size="18" color="#fff" />
              </view>
            </template>
          </view>
        </template>
      </V2TopHeader>

      <view class="analysis-card">
        <view class="analysis-card__head">
          <view class="analysis-card__label">
            <u-icon name="star-fill" size="16" color="#fff" />
            <text>AI分析</text>
          </view>
          <view class="analysis-card__link" @click.stop="goAiAnalysisDetail">
            <text>详情</text>
            <u-icon name="arrow-right" size="12" color="rgba(255,255,255,0.95)" />
          </view>
        </view>
        <text class="analysis-card__time">{{ displayAnalysis.timeLabel }}</text>
        <view class="analysis-card__summary-stream">
          <text class="analysis-card__summary">{{ summaryDisplayed }}</text>
          <text v-if="summaryTyping" class="analysis-card__cursor">▍</text>
        </view>
        <view class="analysis-card__foot">
          <view class="analysis-card__report" @click.stop="goReport">
            <u-icon name="file-text" size="16" color="#fff" />
            <text>报告</text>
          </view>
          <text
            v-if="viewMode === 'projects'"
            class="analysis-card__hint"
            @click.stop="goReport"
          >
            {{ v2AiAnalysis.reportHint }}
          </text>
        </view>
      </view>
    </view>

    <scroll-view
      scroll-y
      class="scroll"
      :style="{ height: scrollHeight }"
      :show-scrollbar="false"
      :enhanced="true"
    >
      <!-- 项目列表视图（设计图 1.3 列表态） -->
      <view v-if="viewMode === 'projects'" class="list-panel">
        <view class="section-title">
          <u-icon name="grid" size="16" color="#3d6a9e" />
          <text>项目列表</text>
        </view>
        <view class="project-grid">
          <view v-for="p in projects" :key="p.id" class="project-card" @click="toastProject(p.name)">
            <view class="project-card__cover-wrap">
              <image class="project-card__cover" :src="p.cover" mode="aspectFill" />
              <text class="project-card__devices">设备:{{ p.deviceOnline }}/{{ p.deviceTotal }}</text>
            </view>
            <view class="project-card__name-wrap">
              <text class="project-card__name">{{ p.name }}</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 摄像头宫格视图（设计图 1.3 宫格态） -->
      <view v-else class="list-panel">
        <view class="camera-grid">
          <view
            v-for="cam in cameraFeeds"
            :key="cam.id"
            class="camera-card"
            @click="toastProject(cam.cameraName)"
          >
            <view class="camera-card__cover-wrap">
              <image class="camera-card__cover" :src="cam.cover" mode="aspectFill" />
              <view class="camera-card__spark" @click.stop="openLivePlayer(cam)">
                <u-icon name="star-fill" size="14" color="#fff" />
              </view>
              <view class="camera-card__bar">
                <text class="camera-card__cam-name">{{ cam.cameraName }}</text>
                <u-icon
                  :name="cam.starred ? 'star-fill' : 'star'"
                  size="16"
                  :color="cam.starred ? '#ffb400' : '#fff'"
                  @click.stop="toggleStar(cam.id)"
                />
              </view>
            </view>
            <view class="camera-card__name-wrap">
              <text class="camera-card__project">{{ cam.projectName }}</text>
            </view>
          </view>
        </view>
      </view>
      <view class="scroll-bottom" />
    </scroll-view>
    <V2TabBar current="video" />
  </view>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import V2TopHeader from '@/components/v2/V2TopHeader.vue'
import V2TabBar from '@/components/nav/V2TabBar.vue'
import { useMonitorContext } from '@/composables/useMonitorContext'
import {
  v2AiAnalysis,
  v2AiAnalysisCameraView,
  v2CameraFeeds,
  v2Projects,
  type V2CameraFeed
} from '@/mock/v2-home'
import { getLayoutMetrics, getNavLayout } from '@/utils/layout-metrics'

type VideoViewMode = 'projects' | 'cameras'

const { monitorOrgName } = useMonitorContext()
const orgTitle = monitorOrgName
const projects = v2Projects
const cameraFeeds = ref<V2CameraFeed[]>([...v2CameraFeeds])
const viewMode = ref<VideoViewMode>('projects')
const scrollHeight = ref('600px')

const displayAnalysis = computed(() =>
  viewMode.value === 'cameras' ? v2AiAnalysisCameraView : v2AiAnalysis
)

const summaryFullText = computed(() => displayAnalysis.value.summaryLines.join('\n'))
const summaryDisplayed = ref('')
const summaryTyping = ref(false)
let summaryTimer: ReturnType<typeof setTimeout> | null = null
let summaryCharIndex = 0

function clearSummaryTimer(): void {
  if (summaryTimer !== null) {
    clearTimeout(summaryTimer)
    summaryTimer = null
  }
}

function runSummaryTypewriter(full: string): void {
  if (summaryCharIndex >= full.length) {
    summaryTyping.value = false
    return
  }
  summaryDisplayed.value += full.charAt(summaryCharIndex)
  summaryCharIndex += 1
  summaryTimer = setTimeout(() => runSummaryTypewriter(full), 45)
}

function restartSummaryTypewriter(): void {
  clearSummaryTimer()
  summaryDisplayed.value = ''
  summaryCharIndex = 0
  summaryTyping.value = false
  const full = summaryFullText.value
  if (!full) return
  summaryTyping.value = true
  summaryTimer = setTimeout(() => runSummaryTypewriter(full), 320)
}

watch(summaryFullText, restartSummaryTypewriter, { immediate: true })
onUnmounted(clearSummaryTimer)

function toggleViewMode(): void {
  viewMode.value = viewMode.value === 'projects' ? 'cameras' : 'projects'
}

function toggleStar(id: string): void {
  cameraFeeds.value = cameraFeeds.value.map((c) =>
    c.id === id ? { ...c, starred: !c.starred } : c
  )
}

function goOrgSelect(): void {
  uni.navigateTo({ url: '/pages/monitor/org-select' })
}

function goReport(): void {
  uni.navigateTo({ url: '/pages/v2/report/index' })
}

function goAiAnalysisDetail(): void {
  uni.navigateTo({ url: '/pages/v2/ai-analysis/index' })
}

function toastSearch(): void {
  uni.showToast({ title: '搜索', icon: 'none' })
}

function toastFilter(): void {
  uni.showToast({ title: '筛选', icon: 'none' })
}

function toastProject(name: string): void {
  uni.showToast({ title: name, icon: 'none' })
}

function openLivePlayer(cam: V2CameraFeed): void {
  uni.navigateTo({
    url: `/pages/v2/video/live?id=${encodeURIComponent(cam.id)}&name=${encodeURIComponent(cam.cameraName)}`
  })
}

onMounted(() => {
  const { windowHeight, safeAreaBottom } = getLayoutMetrics()
  const heroPx = getNavLayout().navTotalHeight + uni.upx2px(360)
  const bottom = uni.upx2px(110) + safeAreaBottom
  scrollHeight.value = `${Math.max(windowHeight - heroPx - bottom, 280)}px`
})
</script>

<style lang="scss" scoped>
@import '@/static/scss/v2-gradient.scss';

.page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: $v2-page-gradient;
  background-attachment: fixed;
}

.page__hero {
  flex-shrink: 0;
  padding-bottom: 8rpx;
}

:deep(.v2-header) {
  background: transparent;
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

.analysis-card {
  margin: 0 24rpx 16rpx;
  padding: 28rpx 24rpx;
  border-radius: 24rpx;
  color: #fff;
  background: rgba(255, 255, 255, 0.16);
  border: 1rpx solid rgba(255, 255, 255, 0.32);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  box-shadow: 0 8rpx 32rpx rgba(100, 150, 220, 0.12);
}

.analysis-card__head {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.analysis-card__label {
  display: flex;
  align-items: center;
  gap: 8rpx;
  font-size: 30rpx;
  font-weight: 600;
  color: #fff;
}

.analysis-card__link {
  display: flex;
  align-items: center;
  gap: 4rpx;
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.92);
}

.analysis-card__time {
  display: block;
  margin-top: 16rpx;
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.85);
}

.analysis-card__summary-stream {
  margin-top: 10rpx;
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
}

.analysis-card__summary {
  font-size: 26rpx;
  color: #fff;
  line-height: 1.55;
  white-space: pre-wrap;
  word-break: break-all;
}

.analysis-card__cursor {
  font-size: 26rpx;
  color: rgba(255, 255, 255, 0.92);
  line-height: 1.55;
  margin-left: 2rpx;
  animation: ai-cursor-blink 0.85s step-end infinite;
}

@keyframes ai-cursor-blink {
  0%,
  100% {
    opacity: 1;
  }

  50% {
    opacity: 0;
  }
}

.analysis-card__foot {
  margin-top: 24rpx;
}

.analysis-card__report {
  display: inline-flex;
  align-items: center;
  gap: 8rpx;
  padding: 10rpx 24rpx;
  border-radius: 999rpx;
  font-size: 24rpx;
  color: #fff;
  background: rgba(255, 255, 255, 0.12);
  border: 1rpx solid rgba(255, 255, 255, 0.45);
}

.analysis-card__hint {
  display: block;
  margin-top: 16rpx;
  font-size: 24rpx;
  color: #fff;
  text-decoration: underline;
  opacity: 0.95;
}

.scroll {
  flex: 1;
  box-sizing: border-box;
}

.list-panel {
  padding: 8rpx 24rpx 0;
  min-height: 100%;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 10rpx;
  margin-bottom: 20rpx;
  font-size: 30rpx;
  color: #3d6a9e;
  font-weight: 600;
}

.project-grid,
.camera-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20rpx;
}

.project-card,
.camera-card {
  background: #fff;
  border-radius: 20rpx;
  overflow: hidden;
  box-shadow: 0 8rpx 24rpx rgba(120, 160, 210, 0.14);
}

.project-card__cover-wrap,
.camera-card__cover-wrap {
  position: relative;
  height: 220rpx;
  background: #e8eef5;
}

.project-card__cover,
.camera-card__cover {
  width: 100%;
  height: 100%;
}

.project-card__devices {
  position: absolute;
  right: 10rpx;
  bottom: 10rpx;
  padding: 6rpx 12rpx;
  font-size: 20rpx;
  color: #fff;
  background: rgba(0, 0, 0, 0.52);
  border-radius: 8rpx;
}

.camera-card__spark {
  position: absolute;
  top: 10rpx;
  left: 10rpx;
  width: 44rpx;
  height: 44rpx;
  border-radius: 10rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(145deg, #6eb6ff 0%, #3a8bff 45%, #2979ff 100%);
  box-shadow: 0 4rpx 16rpx rgba(41, 121, 255, 0.45);
  animation: spark-breathe 2.2s ease-in-out infinite;
  z-index: 2;
}

@keyframes spark-breathe {
  0%,
  100% {
    opacity: 0.88;
    transform: scale(1);
    box-shadow: 0 4rpx 12rpx rgba(41, 121, 255, 0.35);
  }

  50% {
    opacity: 1;
    transform: scale(1.06);
    box-shadow: 0 6rpx 24rpx rgba(41, 121, 255, 0.75);
  }
}

.camera-card__bar {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12rpx 12rpx;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.65));
}

.camera-card__cam-name {
  font-size: 22rpx;
  color: #fff;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.project-card__name-wrap,
.camera-card__name-wrap {
  padding: 18rpx 16rpx 22rpx;
  background: #fff;
}

.project-card__name,
.camera-card__project {
  font-size: 28rpx;
  font-weight: 600;
  color: #1a1a1a;
  line-height: 1.35;
}

.scroll-bottom {
  height: 32rpx;
}
</style>
