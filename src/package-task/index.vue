<template>
  <view class="page" :class="tabEnterClass">
    <V2TopHeader :title="headerTitle" :show-back="false" :title-dropdown="true" @title-click="openBuildingPicker">
      <template #right>
        <view class="header-actions">
          <view class="v2-header__btn badge-wrap" @click="goRecord">
            <u-icon name="chat" size="18" color="#1a1a1a" />
            <view v-if="unreadCount > 0" class="badge">{{ unreadCount > 99 ? '99+' : unreadCount }}</view>
          </view>
          <view class="v2-header__btn" @click="showModuleMenu = true">
            <u-icon name="grid" size="18" color="#1a1a1a" />
          </view>
        </view>
      </template>
      <template #sub>
        <view class="sub-row">
          <text class="sub-ctx">{{ contextLabel }}</text>
          <view class="perspective">
            <text
              class="perspective__item"
              :class="{ 'perspective__item--on': currentPerspective === '空间' }"
              @click="switchPerspective('空间')"
            >
              空间
            </text>
            <text
              class="perspective__item"
              :class="{ 'perspective__item--on': currentPerspective === '专业' }"
              @click="switchPerspective('专业')"
            >
              专业
            </text>
          </view>
        </view>
      </template>
    </V2TopHeader>

    <TaskDrawingStage
      :drawings="drawings"
      :index="drawingIndex"
      :height="drawingHeight"
      :folded="contentFolded"
      @prev="stepDrawing(-1)"
      @next="stepDrawing(1)"
      @toggle="toggleContentFold"
    />

    <view class="body">
      <scroll-view scroll-y class="floor-rail" :style="{ height: scrollHeight }" :show-scrollbar="false">
        <view
          v-for="floor in floors"
          :key="floor._id"
          class="floor-chip"
          :class="{ 'floor-chip--on': currentFloor?._id === floor._id }"
          @click="selectFloor(floor)"
        >
          <text>{{ floor.name }}</text>
          <view v-if="floor.tag" class="dot" />
        </view>
      </scroll-view>

      <scroll-view scroll-y class="scroll" :style="{ height: scrollHeight }">
      <!-- 空间视角：房间 -->
      <view v-if="currentPerspective === '空间'" class="section">
        <view class="section__head">
          <text class="section__title">房间</text>
          <text class="section__hint" @click="roomExpanded = !roomExpanded">
            {{ roomExpanded ? '收起' : '全部' }}
          </text>
        </view>
        <view class="room-wrap">
          <view
            v-for="room in displayRooms"
            :key="room._id"
            class="room-chip"
            :class="{ 'room-chip--on': currentRoom?._id === room._id }"
            @click="selectRoom(room)"
          >
            <text>{{ room.name }}</text>
            <view v-if="room.tag" class="dot" />
          </view>
        </view>
      </view>

      <!-- 专业视角：分项 -->
      <view v-else class="section">
        <view class="section__head">
          <text class="section__title">专业分项</text>
        </view>
        <view class="room-wrap">
          <view
            v-for="item in professionalNames"
            :key="item.label"
            class="room-chip"
            :class="{ 'room-chip--on': currentProfessionalProject === item.label }"
            @click="selectProfessional(item.label)"
          >
            <text>{{ item.label.replace('/-/', ' / ') }}</text>
          </view>
        </view>
      </view>

      <view v-show="!contentFolded">
      <!-- 分项 + 关键步骤 -->
      <view v-for="proc in procedures" :key="proc._id" class="proc-card">
        <view class="proc-card__head">
          <view>
            <text class="proc-card__name">{{ proc.name }}</text>
            <text v-if="proc.detailMethod" class="proc-card__method">{{ proc.detailMethod }}</text>
          </view>
          <view v-if="currentStage?.code === 3" class="qty" @click="editQuantity(proc)">
            <text>工程量 {{ proc.quantity ?? 0 }}</text>
            <u-icon name="edit-pen" size="14" color="#2f6b58" />
          </view>
        </view>

        <view v-for="step in proc.keySteps" :key="step._id" class="step">
          <view class="step__left" @click="toggleStep(step)">
            <view class="step__check" :class="{ 'step__check--done': step.status === 1 }">
              <u-icon v-if="step.status === 1" name="checkmark" size="14" color="#fff" />
            </view>
            <view class="step__info">
              <text class="step__name">{{ step.name }}</text>
              <text class="step__meta">
                {{ step.status === 1 ? `完成 ${step.finishDate || '-'}` : `计划 ${step.planDate || '-'}` }}
                · {{ step.percentage ?? 0 }}%
              </text>
            </view>
          </view>
          <view class="step__actions">
            <text class="link" @click.stop="editPercentage(step)">完成率</text>
            <text class="link" @click.stop="takePhoto(step)">拍照</text>
          </view>
        </view>
      </view>

      <view v-if="!loading && procedures.length === 0" class="empty">
        <u-empty mode="list" text="暂无任务数据" />
      </view>

      <!-- 现场照片 -->
      <view v-if="photos.length" class="section">
        <view class="section__head">
          <text class="section__title">现场照片</text>
          <text class="section__hint" @click="takePhoto()">继续拍</text>
        </view>
        <scroll-view scroll-x class="photo-scroll" :show-scrollbar="false">
          <view v-for="photo in photos" :key="photo._id" class="photo-item" @click="previewPhoto(photo)">
            <image class="photo-item__img" :src="photo.thumbnailUrl || photo.url" mode="aspectFill" />
            <view class="photo-item__del" @click.stop="removePhoto(photo)">
              <u-icon name="close" size="12" color="#fff" />
            </view>
          </view>
        </scroll-view>
      </view>

        <view class="scroll-bottom" />
      </view>
      </scroll-view>
    </view>

    <V2TabBar current="task" />

    <!-- 单体/阶段选择 -->
    <u-popup :show="showBuildingPicker" mode="bottom" round="16" @close="showBuildingPicker = false">
      <view class="picker">
        <text class="picker__title">选择单体 / 阶段</text>
        <view v-for="b in buildings" :key="b._id" class="picker__group">
          <text class="picker__building">{{ b.name }}</text>
          <view class="picker__stages">
            <view
              v-for="stage in b.stageList"
              :key="stage.code"
              class="stage-chip"
              :class="{
                'stage-chip--on': currentBuilding?._id === b._id && currentStage?.code === stage.code
              }"
              @click="confirmBuildingStage(b, stage)"
            >
              {{ stage.desc }}
            </view>
          </view>
        </view>
      </view>
    </u-popup>

    <!-- 模块菜单 -->
    <u-popup :show="showModuleMenu" mode="bottom" round="16" @close="showModuleMenu = false">
      <view class="module-menu">
        <text class="picker__title">现场模块</text>
        <view class="module-grid">
          <view v-for="m in modules" :key="m.path" class="module-item" @click="goModule(m.path)">
            <view class="module-item__icon">
              <u-icon :name="m.icon" size="22" color="#23c993" />
            </view>
            <text>{{ m.text }}</text>
          </view>
        </view>
      </view>
    </u-popup>
  </view>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { consumeTabTransition } from '@/utils/tab-transition'

const tabEnterClass = consumeTabTransition()
import V2TopHeader from '@/components/v2/V2TopHeader.vue'
import V2TabBar from '@/components/nav/V2TabBar.vue'
import TaskDrawingStage from './drawing-stage.vue'
import { useTaskContext } from '@/composables/useTaskContext'
import {
  deleteSinglePicture,
  getBuildings,
  getDrawingList,
  getFloors,
  getItemProcedure,
  getPictureList,
  getProfessionalProjects,
  getRooms,
  getTaskRecordUnreadCount,
  markTaskStatus,
  savePercentageOfTask,
  updateQuantity,
  uploadPictures
} from '@/api/task'
import type {
  TaskBuilding,
  TaskDrawing,
  TaskFloor,
  TaskItemProcedure,
  TaskKeyStep,
  TaskPerspective,
  TaskProfessionalName,
  TaskRoom,
  TaskStage,
  TaskStructuredPhoto
} from '@/api/task/types'
import { getLayoutMetrics, getNavLayout } from '@/utils/layout-metrics'
import { mockTaskOrgId } from '@/mock/task'

const {
  currentBuilding,
  currentStage,
  currentFloor,
  currentRoom,
  currentPerspective,
  currentProfessionalProject,
  unreadCount,
  contextLabel,
  setBuilding,
  setStage,
  setFloor,
  setRoom,
  setPerspective,
  setProfessional,
  setUnread
} = useTaskContext()

const buildings = ref<TaskBuilding[]>([])
const drawings = ref<TaskDrawing[]>([])
const drawingIndex = ref(0)
const floors = ref<TaskFloor[]>([])
const rooms = ref<TaskRoom[]>([])
const professionalNames = ref<TaskProfessionalName[]>([])
const procedures = ref<TaskItemProcedure[]>([])
const photos = ref<TaskStructuredPhoto[]>([])
const loading = ref(false)
const roomExpanded = ref(false)
const showBuildingPicker = ref(false)
const showModuleMenu = ref(false)
const scrollHeight = ref('500px')
const drawingHeight = ref(0)
const contentFolded = ref(false)
const restDrawingHeight = ref(0)
const restScrollHeight = ref(0)
const chipStripHeight = ref(0)
const expandedDrawingHeight = ref(0)

const headerTitle = computed(() => currentBuilding.value?.name || '任务现场')

const displayRooms = computed(() => (roomExpanded.value ? rooms.value : rooms.value.slice(0, 4)))

const modules = [
  { text: '形象进度', icon: 'grid', path: '/package-task/graphic-progress' },
  { text: '现场相册', icon: 'photo', path: '/package-task/photo-album' },
  { text: '作业面移交', icon: 'share', path: '/package-task/transfer' },
  { text: '任务记录', icon: 'chat', path: '/package-task/record' }
]

async function bootstrap(): Promise<void> {
  loading.value = true
  try {
    buildings.value = await getBuildings(mockTaskOrgId)
    if (!currentBuilding.value && buildings.value.length) {
      const b = buildings.value[0]
      setBuilding(b)
      setStage(b.stageList[0] || null)
    }
    await refreshCascade()
  } finally {
    loading.value = false
  }
}

async function refreshCascade(): Promise<void> {
  if (!currentBuilding.value || !currentStage.value) return
  floors.value = await getFloors({
    deptId: mockTaskOrgId,
    buildingId: currentBuilding.value._id,
    stageCode: currentStage.value.code
  })
  if (!currentFloor.value && floors.value.length) {
    setFloor(floors.value[0])
  } else if (currentFloor.value) {
    const still = floors.value.find((f) => f._id === currentFloor.value?._id)
    if (!still && floors.value.length) setFloor(floors.value[0])
  }
  if (currentPerspective.value === '空间') {
    await loadRoomsAndProcedures()
  } else {
    professionalNames.value = await getProfessionalProjects({
      orgId: mockTaskOrgId,
      buildingId: currentBuilding.value._id,
      stageCode: currentStage.value.code
    })
    if (!currentProfessionalProject.value && professionalNames.value.length) {
      setProfessional(professionalNames.value[0].label)
    }
    await loadProcedures()
  }
  await Promise.all([loadPhotos(), loadUnread(), loadDrawings()])
}

async function loadDrawings(): Promise<void> {
  if (!currentFloor.value) {
    drawings.value = []
    drawingIndex.value = 0
    return
  }
  drawings.value = await getDrawingList(currentFloor.value.drawingIds || [], currentFloor.value._id)
  drawingIndex.value = 0
}

function stepDrawing(delta: number): void {
  const next = drawingIndex.value + delta
  if (next < 0 || next >= drawings.value.length) return
  drawingIndex.value = next
}

async function loadRoomsAndProcedures(): Promise<void> {
  if (!currentFloor.value || !currentStage.value) return
  rooms.value = await getRooms({
    deptId: mockTaskOrgId,
    floorId: currentFloor.value._id,
    stageCode: currentStage.value.code
  })
  if (!currentRoom.value && rooms.value.length) {
    setRoom(rooms.value[0])
  }
  await loadProcedures()
}

async function loadProcedures(): Promise<void> {
  if (currentPerspective.value === '空间') {
    if (!currentRoom.value) {
      procedures.value = []
      return
    }
    procedures.value = await getItemProcedure({
      deptId: mockTaskOrgId,
      roomId: currentRoom.value._id
    })
  } else {
    // 专业视角复用同一套分项演示数据
    procedures.value = await getItemProcedure({
      deptId: mockTaskOrgId,
      roomId: currentRoom.value?._id || 'r1',
      source: 'professional'
    })
  }
}

async function loadPhotos(): Promise<void> {
  if (!currentFloor.value) return
  photos.value = await getPictureList({
    floorId: currentFloor.value._id,
    roomId: currentRoom.value?._id,
    perspective: currentPerspective.value === '空间' ? 'space' : 'professional'
  })
}

async function loadUnread(): Promise<void> {
  if (!currentBuilding.value || !currentStage.value || !currentFloor.value) return
  const count = await getTaskRecordUnreadCount({
    buildingId: currentBuilding.value._id,
    stageCode: currentStage.value.code,
    floorId: currentFloor.value._id,
    roomId: currentRoom.value?._id
  })
  setUnread(count)
}

function openBuildingPicker(): void {
  showBuildingPicker.value = true
}

async function confirmBuildingStage(b: TaskBuilding, stage: TaskStage): Promise<void> {
  setBuilding(b)
  setStage(stage)
  setFloor(null)
  setRoom(null)
  showBuildingPicker.value = false
  await refreshCascade()
}

async function selectFloor(floor: TaskFloor): Promise<void> {
  setFloor(floor)
  setRoom(null)
  await refreshCascade()
}

async function selectRoom(room: TaskRoom): Promise<void> {
  setRoom(room)
  await loadProcedures()
  await loadPhotos()
  await loadUnread()
}

async function selectProfessional(label: string): Promise<void> {
  setProfessional(label)
  await loadProcedures()
  await loadPhotos()
}

function switchPerspective(p: TaskPerspective): void {
  if (currentStage.value && [2, 4].includes(currentStage.value.code) && p === '空间') {
    uni.showToast({ title: '当前阶段仅支持专业视角', icon: 'none' })
    return
  }
  setPerspective(p)
  void refreshCascade()
}

async function toggleStep(step: TaskKeyStep): Promise<void> {
  const next = step.status === 1 ? 0 : 1
  await markTaskStatus({ keyTaskId: step._id, status: next as 0 | 1 })
  await loadProcedures()
  uni.showToast({ title: next === 1 ? '已完成' : '已取消', icon: 'none' })
}

function editPercentage(step: TaskKeyStep): void {
  uni.showActionSheet({
    itemList: ['0%', '30%', '60%', '80%', '100%'],
    success: async (res) => {
      const map = [0, 30, 60, 80, 100]
      await savePercentageOfTask(step._id, { percentage: map[res.tapIndex] })
      await loadProcedures()
    }
  })
}

function editQuantity(proc: TaskItemProcedure): void {
  const base = proc.quantity ?? 0
  uni.showActionSheet({
    itemList: [`保持 ${base}`, `${base + 10}`, `${base + 20}`, `${base + 50}`, '清零 0'],
    success: async (res) => {
      const map = [base, base + 10, base + 20, base + 50, 0]
      await updateQuantity({ itemProcedureId: proc._id, quantity: map[res.tapIndex] })
      await loadProcedures()
    }
  })
}

function takePhoto(_step?: TaskKeyStep): void {
  uni.chooseImage({
    count: 1,
    sizeType: ['compressed'],
    sourceType: ['camera', 'album'],
    success: async (res) => {
      const path = res.tempFilePaths[0]
      await uploadPictures({ localPath: path, roomId: currentRoom.value?._id })
      await loadPhotos()
      uni.showToast({ title: '已添加照片', icon: 'success' })
    }
  })
}

function previewPhoto(photo: TaskStructuredPhoto): void {
  const urls = photos.value.map((p) => p.url || p.thumbnailUrl || '').filter(Boolean)
  uni.previewImage({
    current: photo.url || photo.thumbnailUrl,
    urls
  })
}

async function removePhoto(photo: TaskStructuredPhoto): Promise<void> {
  await deleteSinglePicture(photo.fileId)
  await loadPhotos()
}

function goRecord(): void {
  uni.navigateTo({ url: '/package-task/record' })
}

function goModule(path: string): void {
  showModuleMenu.value = false
  uni.navigateTo({ url: path })
}

watch(
  () => currentStage.value?.code,
  (code) => {
    if (code && [2, 4].includes(code) && currentPerspective.value === '空间') {
      setPerspective('专业')
    }
  }
)

function applyFoldLayout(): void {
  if (contentFolded.value) {
    drawingHeight.value = expandedDrawingHeight.value
    scrollHeight.value = `${chipStripHeight.value}px`
    return
  }
  drawingHeight.value = restDrawingHeight.value
  scrollHeight.value = `${restScrollHeight.value}px`
}

function toggleContentFold(): void {
  contentFolded.value = !contentFolded.value
  applyFoldLayout()
}

onMounted(() => {
  const { windowHeight, safeAreaBottom } = getLayoutMetrics()
  const stage = Math.round(windowHeight * 0.4)
  const bottom = 55 + safeAreaBottom
  const headerBlock = getNavLayout().navTotalHeight + 48
  // 收起后仍露出楼层和专业分项，避免分项标签被图纸挡住
  const strip = 176
  restDrawingHeight.value = stage
  restScrollHeight.value = Math.max(windowHeight - headerBlock - stage - bottom, 0)
  chipStripHeight.value = strip
  expandedDrawingHeight.value = Math.max(windowHeight - headerBlock - bottom - strip - 8, stage)
  applyFoldLayout()
  void bootstrap()
})
</script>

<style lang="scss" scoped>
@import '@/static/scss/v2-gradient.scss';

.page {
  min-height: 100vh;
  background: $v2-page-gradient;
}

.header-actions {
  display: flex;
  gap: 12rpx;
  padding-right: 12rpx;
}

.v2-header__btn {
  width: 64rpx;
  height: 64rpx;
  border-radius: 16rpx;
  background: rgba(255, 255, 255, 0.55);
  display: flex;
  align-items: center;
  justify-content: center;
}

.badge-wrap {
  position: relative;
}

.badge {
  position: absolute;
  top: -4rpx;
  right: -8rpx;
  min-width: 28rpx;
  height: 28rpx;
  padding: 0 6rpx;
  border-radius: 28rpx;
  background: #ff5a5f;
  color: #fff;
  font-size: 18rpx;
  line-height: 28rpx;
  text-align: center;
}

.sub-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16rpx;
}

.sub-ctx {
  flex: 1;
  font-size: 24rpx;
  color: rgba(26, 26, 26, 0.75);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.perspective {
  display: flex;
  background: rgba(255, 255, 255, 0.55);
  border-radius: 999rpx;
  padding: 4rpx;
}

.perspective__item {
  padding: 8rpx 20rpx;
  font-size: 22rpx;
  color: #666;
  border-radius: 999rpx;

  &--on {
    background: #23c993;
    color: #fff;
    font-weight: 500;
  }
}

.body {
  display: flex;
  align-items: flex-start;
  padding: 12rpx 0 0 16rpx;
  box-sizing: border-box;
}

.floor-rail {
  width: 112rpx;
  flex-shrink: 0;
}

.floor-chip {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6rpx;
  margin-bottom: 16rpx;
  padding: 14rpx 8rpx;
  border-radius: 999rpx;
  background: rgba(255, 255, 255, 0.7);
  font-size: 24rpx;
  color: #555;

  &--on {
    background: #23c993;
    color: #fff;
    font-weight: 500;
  }
}

.dot {
  width: 12rpx;
  height: 12rpx;
  border-radius: 50%;
  background: #ff5a5f;
}

.scroll {
  flex: 1;
  width: 0;
  padding: 0 24rpx 0 12rpx;
  box-sizing: border-box;
}

.section {
  margin-bottom: 20rpx;
}

.section__head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12rpx;
}

.section__title {
  font-size: 28rpx;
  font-weight: 600;
  color: #1a1a1a;
}

.section__hint {
  font-size: 24rpx;
  color: #2f6b58;
}

.room-wrap {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
}

.room-chip {
  position: relative;
  padding: 12rpx 24rpx;
  border-radius: 12rpx;
  background: #fff;
  font-size: 24rpx;
  color: #444;

  &--on {
    background: rgba(35, 201, 147, 0.15);
    color: #1d7a5a;
    font-weight: 500;
    border: 1rpx solid #23c993;
  }
}

.proc-card {
  margin-bottom: 20rpx;
  padding: 24rpx;
  background: #fff;
  border-radius: 16rpx;
}

.proc-card__head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16rpx;
  gap: 16rpx;
}

.proc-card__name {
  display: block;
  font-size: 30rpx;
  font-weight: 600;
  color: #1a1a1a;
}

.proc-card__method {
  display: block;
  margin-top: 6rpx;
  font-size: 22rpx;
  color: #888;
}

.qty {
  display: flex;
  align-items: center;
  gap: 6rpx;
  font-size: 22rpx;
  color: #2f6b58;
  white-space: nowrap;
}

.step {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 18rpx 0;
  border-top: 1rpx solid #f2f2f2;
  gap: 12rpx;
}

.step__left {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 16rpx;
  min-width: 0;
}

.step__check {
  width: 40rpx;
  height: 40rpx;
  border-radius: 50%;
  border: 2rpx solid #ccc;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  &--done {
    background: #23c993;
    border-color: #23c993;
  }
}

.step__info {
  min-width: 0;
}

.step__name {
  display: block;
  font-size: 28rpx;
  color: #222;
}

.step__meta {
  display: block;
  margin-top: 4rpx;
  font-size: 22rpx;
  color: #999;
}

.step__actions {
  display: flex;
  gap: 16rpx;
  flex-shrink: 0;
}

.link {
  font-size: 22rpx;
  color: #23c993;
}

.photo-scroll {
  white-space: nowrap;
}

.photo-item {
  position: relative;
  display: inline-block;
  width: 160rpx;
  height: 160rpx;
  margin-right: 12rpx;
  border-radius: 12rpx;
  overflow: hidden;
}

.photo-item__img {
  width: 100%;
  height: 100%;
}

.photo-item__del {
  position: absolute;
  top: 6rpx;
  right: 6rpx;
  width: 32rpx;
  height: 32rpx;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
}

.empty {
  padding: 80rpx 0;
}

.scroll-bottom {
  height: 40rpx;
}

.picker,
.module-menu {
  padding: 32rpx 28rpx 48rpx;
}

.picker__title {
  display: block;
  font-size: 30rpx;
  font-weight: 600;
  margin-bottom: 24rpx;
  color: #1a1a1a;
}

.picker__group {
  margin-bottom: 28rpx;
}

.picker__building {
  display: block;
  font-size: 26rpx;
  color: #666;
  margin-bottom: 12rpx;
}

.picker__stages {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
}

.stage-chip {
  padding: 14rpx 28rpx;
  border-radius: 12rpx;
  background: #f5f5f5;
  font-size: 26rpx;
  color: #333;

  &--on {
    background: rgba(35, 201, 147, 0.15);
    color: #1d7a5a;
    border: 1rpx solid #23c993;
  }
}

.module-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24rpx;
}

.module-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12rpx;
  font-size: 22rpx;
  color: #333;
}

.module-item__icon {
  width: 88rpx;
  height: 88rpx;
  border-radius: 24rpx;
  background: rgba(35, 201, 147, 0.12);
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
