<template>
  <view class="page" :class="tabEnterClass">
    <view class="page__hero">
      <V2TopHeader
        :title="orgTitle"
        :show-search="false"
        @title-click="openOrgPicker"
        @chevron-click="openOrgPicker"
      >
        <template #sub>
          <view class="header-actions">
            <view v-if="searchOpen" class="header-search">
              <input
                v-model="deviceKeyword"
                class="header-search__input"
                placeholder="请输入"
                confirm-type="search"
                :focus="searchFocused"
                @input="onKeywordInput"
                @confirm="onKeywordConfirm"
              />
              <u-icon name="search" size="16" color="#8aa399" />
            </view>
            <view class="header-actions__icons">
              <view class="v2-header__btn" @click="toggleViewMode">
                <u-icon name="grid" size="18" color="#1a1a1a" />
              </view>
              <view
                v-if="viewMode === 'cameras'"
                class="v2-header__btn"
                :class="{ 'v2-header__btn--on': statusMenuOpen || deviceStatus !== 'all' }"
                @click="toggleStatusMenu"
              >
                <u-icon name="list" size="18" color="#1a1a1a" />
              </view>
              <view
                class="v2-header__btn"
                :class="{ 'v2-header__btn--on': searchOpen || deviceKeyword.trim() }"
                @click="toggleDeviceSearch"
              >
                <u-icon name="search" size="18" color="#1a1a1a" />
              </view>
            </view>
          </view>
        </template>
      </V2TopHeader>

      <view v-if="viewMode === 'cameras' && statusMenuOpen" class="device-filter">
        <view v-if="statusMenuOpen" class="device-filter__menu">
          <view
            v-for="item in deviceStatusOptions"
            :key="item.label"
            class="device-filter__option"
            :class="{ 'device-filter__option--on': deviceStatus === item.value }"
            @click="changeDeviceStatus(item.value)"
          >
            <text>{{ item.label }}</text>
          </view>
        </view>
      </view>

    <OrgPicker v-model:show="orgPickerVisible" />

      <view class="analysis-card">
        <view class="analysis-card__head">
          <view class="analysis-card__label">
            <u-icon name="star-fill" size="16" color="#1a1a1a" />
            <text>AI分析</text>
          </view>
          <view class="analysis-card__link" @click.stop="goAiAnalysisDetail">
            <text>详情</text>
            <u-icon name="arrow-right" size="12" color="#2f6b58" />
          </view>
        </view>
        <view v-show="analysisExpanded" class="analysis-card__body">
          <text class="analysis-card__time">{{ displayAnalysis.timeLabel }}</text>
          <view class="analysis-card__summary-stream">
            <text class="analysis-card__summary">{{ summaryDisplayed }}</text>
            <text v-if="summaryTyping" class="analysis-card__cursor">▍</text>
          </view>
          <view class="analysis-card__foot">
            <view class="analysis-card__report" @click.stop="goReport">
              <u-icon name="file-text" size="16" color="#1a1a1a" />
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
        <view class="analysis-card__toggle" @click="toggleAnalysis">
          <text>{{ analysisExpanded ? '收起' : '展开' }}</text>
          <u-icon :name="analysisExpanded ? 'arrow-up' : 'arrow-down'" size="12" color="#2f6b58" />
        </view>
      </view>
    </view>

    <view v-if="viewMode === 'projects'" class="section-title">
      <u-icon name="grid" size="16" color="#2f6b58" />
      <text>项目列表</text>
    </view>
    <view v-else class="section-title">
      <u-icon name="grid" size="16" color="#2f6b58" />
      <text>设备列表</text>
    </view>

    <scroll-view
      scroll-y
      class="scroll"
      :show-scrollbar="false"
      :enhanced="true"
      @scrolltolower="onScrollToLower"
    >
      <!-- 项目列表视图（设计图 1.3 列表态） -->
      <view v-if="viewMode === 'projects'" class="list-panel">
          <view v-if="projectsLoading" class="list-empty">项目加载中</view>
          <view v-else-if="projects.length === 0" class="list-empty">{{ projectEmptyText }}</view>
          <view v-else class="project-grid">
          <view v-for="p in projects" :key="p.id" class="project-card" @click="openProject(p)">
            <view class="project-card__cover-wrap">
              <image v-if="p.cover" class="project-card__cover" :src="p.cover" mode="aspectFill" />
              <view v-else class="project-card__empty">
                <u-icon name="camera" size="28" color="#9aa8a2" />
              </view>
              <text class="project-card__ai">AI : {{ p.aiCount }}</text>
              <text class="project-card__devices">设备：{{ p.online }}/{{ p.total }}</text>
              <view v-if="p.cameraName" class="project-card__caption">
                <u-icon name="map" size="12" color="#fff" />
                <text class="project-card__caption-text">{{ p.cameraName }}</text>
              </view>
            </view>
            <view class="project-card__name-wrap">
              <text class="project-card__name">{{ p.name }}</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 设备列表，对齐 site-flow-web 按设备视图 -->
      <view v-else class="list-panel">
        <view v-if="devicesLoading && devices.length === 0" class="list-empty">设备加载中</view>
        <view v-else-if="devices.length === 0" class="list-empty">{{ deviceEmptyText }}</view>
        <view v-else class="device-grid">
          <view v-for="camera in devices" :key="camera.id" class="device-card" @click="openDevice(camera)">
            <view class="device-card__preview">
              <image
                v-if="cameraCoverUrl(camera)"
                class="device-card__cover"
                :src="cameraCoverUrl(camera)"
                mode="aspectFill"
              />
              <view v-else class="device-card__placeholder">
                <u-icon name="camera" size="28" color="#9aa8a2" />
              </view>
              <view v-if="camera.status === 1" class="device-card__play">
                <u-icon name="play-right-fill" size="16" color="#fff" />
              </view>
              <view
                class="device-card__status"
                :class="camera.status === 1 ? 'device-card__status--on' : 'device-card__status--off'"
              >
                <view class="device-card__dot" />
                <text>{{ camera.status === 1 ? '在线' : '离线' }}</text>
              </view>
            </view>
            <view class="device-card__info">
              <view class="device-card__row">
                <text class="device-card__name">{{ camera.name }}</text>
                <text class="device-card__meta">{{ formatDeviceTime(camera.createTime).time }}</text>
              </view>
              <view class="device-card__row">
                <text class="device-card__location">位置：{{ camera.deptName || '未分组' }}</text>
                <text class="device-card__meta">{{ formatDeviceTime(camera.createTime).date }}</text>
              </view>
            </view>
          </view>
        </view>
        <view v-if="devicesLoading && devices.length > 0" class="list-empty">加载中</view>
      </view>
      <view class="scroll-bottom" />
    </scroll-view>
    <V2TabBar current="video" />
  </view>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { consumeTabTransition } from '@/utils/tab-transition'

const tabEnterClass = consumeTabTransition()
import V2TopHeader from '@/components/v2/V2TopHeader.vue'
import V2TabBar from '@/components/nav/V2TabBar.vue'
import OrgPicker from '@/components/v2/OrgPicker.vue'
import { useMonitorContext } from '@/composables/useMonitorContext'
import {
  buildProjectCards,
  cameraCoverUrl,
  loadVideoDirectory,
  type VideoDirectory,
  type VideoProjectCard
} from '@/composables/org-tree'
import type { DeptVO } from '@/api/system/dept'
import { getCameraPage, type CameraVO } from '@/api/video/camera'
import { v2AiAnalysis, v2AiAnalysisCameraView } from '@/mock/v2-home'
type VideoViewMode = 'projects' | 'cameras'

const { monitorOrgName, monitorDeptId } = useMonitorContext()
const orgTitle = monitorOrgName
const orgPickerVisible = ref(false)
const directory = ref<VideoDirectory | null>(null)
const projectsLoading = ref(true)
const projects = computed(() => {
  if (!directory.value) return []
  const cards = buildProjectCards(directory.value, monitorDeptId.value)
  const text = deviceKeyword.value.trim().toLowerCase()
  if (!text) return cards
  const { depts, cameras } = directory.value
  return cards.filter((card) => matchesProjectKeyword(card, text, depts, cameras))
})
const DEVICE_PAGE_SIZE = 12
const devices = ref<CameraVO[]>([])
const devicePage = ref(0)
const deviceTotal = ref(0)
const devicesLoading = ref(false)
const deviceKeyword = ref('')
const deviceStatus = ref<'all' | 0 | 1>('all')
const searchOpen = ref(false)
const searchFocused = ref(false)
const statusMenuOpen = ref(false)
const deviceStatusOptions = [
  { label: '全部', value: 'all' as const },
  { label: '在线', value: 1 as const },
  { label: '离线', value: 0 as const }
]
const viewMode = ref<VideoViewMode>('projects')
const analysisExpanded = ref(true)

const displayAnalysis = computed(() =>
  viewMode.value === 'cameras' ? v2AiAnalysisCameraView : v2AiAnalysis
)

const deviceEmptyText = computed(() =>
  deviceKeyword.value.trim() || deviceStatus.value !== 'all' ? '没有符合条件的设备' : '暂无设备'
)
const projectEmptyText = computed(() =>
  deviceKeyword.value.trim() ? '没有符合条件的项目' : '暂无项目'
)
const summaryFullText = computed(() => displayAnalysis.value.summaryLines.join('\n'))
const summaryDisplayed = ref('')
const summaryTyping = ref(false)
let summaryTimer: ReturnType<typeof setTimeout> | null = null
let keywordTimer: ReturnType<typeof setTimeout> | null = null
let summaryCharIndex = 0

function clearSummaryTimer(): void {
  if (summaryTimer !== null) {
    clearTimeout(summaryTimer)
    summaryTimer = null
  }
}

function clearKeywordTimer(): void {
  if (keywordTimer !== null) {
    clearTimeout(keywordTimer)
    keywordTimer = null
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
watch(monitorDeptId, () => {
  if (viewMode.value === 'cameras') reloadDevices()
})
onMounted(() => {
  void loadVideoDirectory()
    .then((data) => {
      directory.value = data
    })
    .finally(() => {
      projectsLoading.value = false
    })
})

onUnmounted(() => {
  clearSummaryTimer()
  clearKeywordTimer()
})

function toggleAnalysis(): void {
  analysisExpanded.value = !analysisExpanded.value
}

function belongsToProject(depts: DeptVO[], deptId: number | undefined, projectId: number): boolean {
  const byId = new Map(depts.map((dept) => [dept.id, dept]))
  let current = deptId ? byId.get(deptId) : undefined
  const seen = new Set<number>()
  while (current && !seen.has(current.id)) {
    if (current.deptCategory === 4) return current.id === projectId
    seen.add(current.id)
    current = current.parentId ? byId.get(current.parentId) : undefined
  }
  return current?.id === projectId
}

function matchesProjectKeyword(
  card: VideoProjectCard,
  text: string,
  depts: DeptVO[],
  cameras: CameraVO[]
): boolean {
  if (card.name.toLowerCase().includes(text)) return true
  const dept = depts.find((item) => item.id === card.id)
  const parentName = dept ? depts.find((item) => item.id === dept.parentId)?.name : ''
  if (parentName?.toLowerCase().includes(text)) return true
  return cameras.some((camera) => {
    if (!belongsToProject(depts, camera.deptId, card.id)) return false
    return `${camera.name || ''} ${camera.deptName || ''}`.toLowerCase().includes(text)
  })
}

function toggleViewMode(): void {
  viewMode.value = viewMode.value === 'projects' ? 'cameras' : 'projects'
  statusMenuOpen.value = false
  if (viewMode.value === 'cameras') reloadDevices()
}

function toggleDeviceSearch(): void {
  searchOpen.value = !searchOpen.value
  searchFocused.value = searchOpen.value
}

function toggleStatusMenu(): void {
  statusMenuOpen.value = !statusMenuOpen.value
}

function onKeywordInput(): void {
  if (viewMode.value !== 'cameras') return
  clearKeywordTimer()
  keywordTimer = setTimeout(() => reloadDevices(), 250)
}

function onKeywordConfirm(): void {
  if (viewMode.value === 'cameras') reloadDevices()
}

function changeDeviceStatus(value: 'all' | 0 | 1): void {
  statusMenuOpen.value = false
  if (deviceStatus.value === value) return
  deviceStatus.value = value
  reloadDevices()
}

function formatDeviceTime(raw?: string): { time: string; date: string } {
  if (!raw) return { time: '--:--', date: '--/--/--' }
  const date = new Date(raw)
  if (Number.isNaN(date.getTime())) return { time: '--:--', date: '--/--/--' }
  const pad = (value: number) => String(value).padStart(2, '0')
  return {
    time: `${pad(date.getHours())}:${pad(date.getMinutes())}`,
    date: `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`
  }
}

let deviceLoadId = 0

function reloadDevices(): void {
  deviceLoadId += 1
  devicePage.value = 0
  deviceTotal.value = 0
  devices.value = []
  devicesLoading.value = false
  void loadDevices(deviceLoadId)
}

async function loadDevices(generation = deviceLoadId): Promise<void> {
  if (generation !== deviceLoadId || devicesLoading.value) return
  if (devicePage.value > 0 && devices.value.length >= deviceTotal.value) return
  devicesLoading.value = true
  const next = devicePage.value + 1
  try {
    const page = await getCameraPage({
      pageNo: next,
      pageSize: DEVICE_PAGE_SIZE,
      deptId: monitorDeptId.value,
      name: deviceKeyword.value.trim() || undefined,
      status: deviceStatus.value === 'all' ? undefined : deviceStatus.value
    })
    if (generation !== deviceLoadId) return
    const list = page.list || []
    devices.value = next === 1 ? list : [...devices.value, ...list]
    devicePage.value = next
    deviceTotal.value = Number(page.total || devices.value.length)
  } catch {
    if (generation === deviceLoadId && next === 1) devices.value = []
  } finally {
    if (generation === deviceLoadId) devicesLoading.value = false
  }
}

function onScrollToLower(): void {
  if (viewMode.value === 'cameras') void loadDevices()
}

function openDevice(camera: CameraVO): void {
  if (camera.status !== 1 || !camera.id) {
    uni.showToast({ title: camera.status === 1 ? '摄像头无效' : '设备离线', icon: 'none' })
    return
  }
  uni.navigateTo({
    url: `/package-video/live?id=${camera.id}&name=${encodeURIComponent(camera.name || '')}`
  })
}

function openOrgPicker(): void {
  orgPickerVisible.value = true
}

function goReport(): void {
  uni.navigateTo({ url: '/package-video/report' })
}

function goAiAnalysisDetail(): void {
  uni.navigateTo({ url: '/package-video/ai-analysis' })
}

function openProject(project: { id: number; name: string }): void {
  uni.navigateTo({
    url: `/package-video/project?deptId=${project.id}&name=${encodeURIComponent(project.name)}`
  })
}

</script>

<style lang="scss" scoped>
@import '@/static/scss/v2-gradient.scss';

.page {
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-sizing: border-box;
  padding-bottom: calc(100rpx + constant(safe-area-inset-bottom));
  padding-bottom: calc(100rpx + env(safe-area-inset-bottom));
  background: $v2-page-gradient;
  background-attachment: fixed;
}

.page__hero {
  position: relative;
  z-index: 5;
  flex-shrink: 0;
  width: 100%;
  padding-bottom: 8rpx;
}

:deep(.v2-header) {
  background: transparent;
}

.header-actions {
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  align-items: center;
  justify-content: flex-end;
  width: 100%;
}

.header-search {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: row;
  align-items: center;
  height: 64rpx;
  margin-right: 16rpx;
  padding: 0 20rpx;
  border-radius: 12rpx;
  background: rgba(255, 255, 255, 0.92);
}

.header-search__input {
  flex: 1;
  min-width: 0;
  height: 64rpx;
  margin-right: 12rpx;
  font-size: 26rpx;
  color: #1a1a1a;
}

.header-actions__icons {
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  align-items: center;
  flex-shrink: 0;
}

.header-actions :deep(.v2-header__btn) {
  margin-right: 0;
  margin-left: 12rpx;
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

:deep(.v2-header__btn--on) {
  background: rgba(255, 255, 255, 0.72);
}

.device-filter {
  position: relative;
  z-index: 6;
  margin: 0 24rpx;
}

.device-filter__menu {
  position: absolute;
  top: 0;
  right: 0;
  z-index: 7;
  width: 220rpx;
  padding: 8rpx 0;
  border-radius: 16rpx;
  background: rgba(255, 255, 255, 0.96);
  box-shadow: 0 8rpx 24rpx rgba(20, 60, 48, 0.12);
}

.device-filter__option {
  padding: 18rpx 28rpx;
  font-size: 28rpx;
  color: #1a1a1a;
}

.device-filter__option--on {
  color: #1a73e8;
}

.analysis-card {
  margin: 0 24rpx 16rpx;
  padding: 28rpx 24rpx;
  border-radius: 24rpx;
  color: #1a1a1a;
  background: rgba(255, 255, 255, 0.16);
  border: 1rpx solid rgba(255, 255, 255, 0.32);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  box-shadow: 0 8rpx 32rpx rgba(35, 160, 120, 0.12);
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
  color: #1a1a1a;
}

.analysis-card__link {
  display: flex;
  align-items: center;
  gap: 4rpx;
  font-size: 24rpx;
  color: #2f6b58;
}

.analysis-card__time {
  display: block;
  margin-top: 16rpx;
  font-size: 24rpx;
  color: #4a6b60;
}

.analysis-card__summary-stream {
  margin-top: 10rpx;
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
}

.analysis-card__summary {
  font-size: 26rpx;
  color: #1a1a1a;
  line-height: 1.55;
  white-space: pre-wrap;
  word-break: break-all;
}

.analysis-card__cursor {
  font-size: 26rpx;
  color: #2f6b58;
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
  color: #1a1a1a;
  background: rgba(255, 255, 255, 0.55);
  border: 1rpx solid rgba(47, 107, 88, 0.28);
}

.analysis-card__hint {
  display: block;
  margin-top: 16rpx;
  font-size: 24rpx;
  color: #2f6b58;
  text-decoration: underline;
  opacity: 0.95;
}

.analysis-card__toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6rpx;
  margin-top: 16rpx;
  font-size: 24rpx;
  color: #2f6b58;
}

.scroll {
  flex: 1;
  height: 0;
  min-height: 0;
  width: 100%;
  box-sizing: border-box;
}

.list-panel {
  padding: 0 24rpx;
}

.section-title {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 10rpx;
  padding: 8rpx 24rpx 20rpx;
  font-size: 30rpx;
  color: #2f6b58;
  font-weight: 600;
}

.project-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20rpx;
}

.device-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16rpx;
}

.device-card {
  background: #fff;
  border-radius: 16rpx;
  overflow: hidden;
  box-shadow: 0 8rpx 24rpx rgba(35, 160, 120, 0.12);
}

.device-card__preview {
  position: relative;
  height: 200rpx;
  background: #1d2a44;
}

.device-card__cover,
.device-card__placeholder {
  width: 100%;
  height: 200rpx;
  display: block;
}

.device-card__placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(180deg, #24324f, #1b2438);
}

.device-card__play {
  position: absolute;
  left: 50%;
  top: 50%;
  z-index: 2;
  width: 64rpx;
  height: 64rpx;
  margin: -32rpx 0 0 -32rpx;
  border-radius: 50%;
  background: rgba(35, 201, 147, 0.92);
  display: flex;
  align-items: center;
  justify-content: center;
}

.device-card__status {
  position: absolute;
  top: 12rpx;
  right: 12rpx;
  z-index: 2;
  display: flex;
  align-items: center;
  gap: 6rpx;
  padding: 4rpx 12rpx;
  border-radius: 999rpx;
  font-size: 20rpx;
  color: #fff;

  &--on {
    background: rgba(35, 201, 147, 0.92);
  }

  &--off {
    background: rgba(232, 84, 84, 0.92);
  }
}

.device-card__dot {
  width: 10rpx;
  height: 10rpx;
  border-radius: 50%;
  background: #fff;
}

.device-card__info {
  padding: 12rpx 14rpx 16rpx;
}

.device-card__row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8rpx;
}

.device-card__name,
.device-card__location {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.device-card__name {
  font-size: 26rpx;
  font-weight: 600;
  color: #1a1a1a;
}

.device-card__location,
.device-card__meta {
  font-size: 20rpx;
  color: #7d8b86;
}

.project-card,
.camera-card {
  background: #fff;
  border-radius: 20rpx;
  overflow: hidden;
  box-shadow: 0 8rpx 24rpx rgba(35, 160, 120, 0.14);
}

.project-card__cover-wrap,
.camera-card__cover-wrap {
  position: relative;
  height: 220rpx;
  background: #e7f6f0;
}

.project-card__cover,
.camera-card__cover {
  width: 100%;
  height: 220rpx;
  display: block;
}

.project-card__devices {
  position: absolute;
  top: 0;
  right: 0;
  z-index: 2;
  padding: 8rpx 16rpx;
  font-size: 20rpx;
  line-height: 28rpx;
  color: #fff;
  background: rgba(0, 0, 0, 0.45);
  border-radius: 0 20rpx 0 12rpx;
}

.project-card__ai {
  position: absolute;
  top: 0;
  left: 0;
  z-index: 2;
  padding: 8rpx 16rpx;
  font-size: 20rpx;
  line-height: 28rpx;
  font-weight: 600;
  color: #fff;
  background: #23c993;
  border-radius: 20rpx 0 12rpx 0;
}

.project-card__caption {
  position: absolute;
  left: 12rpx;
  right: 12rpx;
  bottom: 10rpx;
  z-index: 2;
  display: flex;
  align-items: center;
  gap: 6rpx;
}

.project-card__caption-text {
  flex: 1;
  min-width: 0;
  font-size: 22rpx;
  color: #fff;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.project-card__empty {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(180deg, #f3f5f4, #e3e8e6);
}

.list-empty {
  padding: 80rpx 0;
  text-align: center;
  font-size: 26rpx;
  color: #7d8b86;
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
  background: linear-gradient(145deg, #7ee4c0 0%, #1bbf8a 45%, #23c993 100%);
  box-shadow: 0 4rpx 16rpx rgba(35, 201, 147, 0.45);
  animation: spark-breathe 2.2s ease-in-out infinite;
  z-index: 2;
}

@keyframes spark-breathe {
  0%,
  100% {
    opacity: 0.88;
    transform: scale(1);
    box-shadow: 0 4rpx 12rpx rgba(35, 201, 147, 0.35);
  }

  50% {
    opacity: 1;
    transform: scale(1.06);
    box-shadow: 0 6rpx 24rpx rgba(35, 201, 147, 0.75);
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
