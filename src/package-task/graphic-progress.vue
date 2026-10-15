<template>
  <view class="page">
    <V2TopHeader title="形象进度" :title-dropdown="false" :show-search="false" />

    <view class="filter-bar">
      <text class="ctx">{{ currentBuilding?.name || '-' }} · {{ currentStage?.desc || '-' }}</text>
      <text class="filter-link" @click="pickFilter">筛选</text>
    </view>

    <scroll-view scroll-x class="legend-scroll" :show-scrollbar="false">
      <view class="legend">
        <view class="legend__item"><view class="cell cell--done mini" /><text>已完成</text></view>
        <view class="legend__item"><view class="cell cell--doing mini" /><text>进行中</text></view>
        <view class="legend__item"><view class="cell cell--todo mini" /><text>未开始</text></view>
      </view>
    </scroll-view>

    <scroll-view scroll-y class="scroll" :style="{ height: scrollHeight }">
      <scroll-view scroll-x :show-scrollbar="false">
        <view class="matrix">
          <view class="matrix__head">
            <view class="matrix__corner">楼层</view>
            <view v-for="col in columns" :key="col" class="matrix__col">{{ col }}</view>
          </view>
          <view v-for="row in rows" :key="row.floorId" class="matrix__row">
            <view class="matrix__floor">{{ row.floorName }}</view>
            <view
              v-for="cell in row.cells"
              :key="cell.stepId"
              class="cell"
              :class="cellClass(cell.status)"
              @click="drillDown(cell)"
            >
              <text>{{ cell.percentage ?? 0 }}%</text>
            </view>
          </view>
        </view>
      </scroll-view>
      <view class="hint">点击单元格可下钻到任务现场</view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import V2TopHeader from '@/components/v2/V2TopHeader.vue'
import { useTaskContext } from '@/composables/useTaskContext'
import { getGraphicProgress, getGraphicProgressFilter } from '@/api/task'
import type { GraphicProgressCell, GraphicProgressRow, TaskProfessionalName } from '@/api/task/types'
import { getLayoutMetrics, getNavLayout } from '@/utils/layout-metrics'
import { mockTaskOrgId } from '@/mock/task'

const { currentBuilding, currentStage, setFloor, setPerspective } = useTaskContext()

const rows = ref<GraphicProgressRow[]>([])
const filters = ref<TaskProfessionalName[]>([])
const activeFilter = ref('')
const scrollHeight = ref('500px')

const columns = computed(() => {
  if (!rows.value.length) return [] as string[]
  return rows.value[0].cells.map((c) => c.stepName)
})

function cellClass(status: 0 | 1 | 2): string {
  if (status === 1) return 'cell--done'
  if (status === 2) return 'cell--doing'
  return 'cell--todo'
}

async function load(): Promise<void> {
  rows.value = await getGraphicProgress({
    deptId: mockTaskOrgId,
    buildingId: currentBuilding.value?._id,
    stageCode: currentStage.value?.code,
    itemName: activeFilter.value || undefined
  })
  filters.value = (await getGraphicProgressFilter({
    'dept._id': mockTaskOrgId,
    buildingId: currentBuilding.value?._id
  })) as TaskProfessionalName[]
}

function pickFilter(): void {
  const list = ['全部分项', ...filters.value.map((f) => f.label.replace('/-/', ' / '))]
  uni.showActionSheet({
    itemList: list,
    success: (res) => {
      activeFilter.value = res.tapIndex === 0 ? '' : filters.value[res.tapIndex - 1]?.itemName || ''
      void load()
    }
  })
}

function drillDown(cell: GraphicProgressCell): void {
  setFloor({ _id: cell.floorId, name: cell.floorName })
  setPerspective('空间')
  uni.reLaunch({
    url: `/package-task/index?from=graphic&floorId=${cell.floorId}&stepId=${cell.stepId}`
  })
}

onMounted(() => {
  const { windowHeight } = getLayoutMetrics()
  const top = getNavLayout().navTotalHeight + 96
  scrollHeight.value = `${windowHeight - top}px`
  void load()
})
</script>

<style lang="scss" scoped>
@import '@/static/scss/v2-gradient.scss';

.page {
  min-height: 100vh;
  background: $v2-page-gradient;
}

.filter-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12rpx 24rpx;
}

.ctx {
  font-size: 24rpx;
  color: #555;
}

.filter-link {
  font-size: 24rpx;
  color: #2f6b58;
}

.legend-scroll {
  padding: 0 24rpx 8rpx;
}

.legend {
  display: flex;
  gap: 24rpx;
}

.legend__item {
  display: flex;
  align-items: center;
  gap: 8rpx;
  font-size: 22rpx;
  color: #666;
}

.scroll {
  padding: 8rpx 24rpx 40rpx;
  box-sizing: border-box;
}

.matrix {
  min-width: 100%;
  background: #fff;
  border-radius: 16rpx;
  padding: 16rpx;
}

.matrix__head,
.matrix__row {
  display: flex;
  align-items: center;
}

.matrix__corner,
.matrix__floor {
  width: 100rpx;
  flex-shrink: 0;
  font-size: 22rpx;
  color: #666;
  text-align: center;
}

.matrix__col {
  width: 140rpx;
  flex-shrink: 0;
  font-size: 20rpx;
  color: #888;
  text-align: center;
  padding: 8rpx 4rpx;
}

.cell {
  width: 140rpx;
  height: 72rpx;
  margin: 6rpx 0;
  flex-shrink: 0;
  border-radius: 10rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22rpx;
  color: #fff;

  &.mini {
    width: 28rpx;
    height: 28rpx;
  }

  &--done {
    background: #23c993;
  }

  &--doing {
    background: #f0b429;
  }

  &--todo {
    background: #d9d9d9;
    color: #666;
  }
}

.hint {
  margin-top: 20rpx;
  text-align: center;
  font-size: 22rpx;
  color: #999;
}
</style>
