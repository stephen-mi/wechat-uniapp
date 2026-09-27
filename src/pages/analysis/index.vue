<template>
  <view class="page">
    <SafetyPageHeader
      title="应用分析"
      :tabs="['视频监控分析', 'AI预警分析']"
      v-model="subTab"
    />
    <scroll-view scroll-y class="page-scroll" :style="{ height: scrollHeight }">
      <view class="board card">
        <text class="card__title">数据看板</text>
        <view class="board__row">
          <view class="board__col">
            <text class="board__label">{{ subTab === 0 ? '项目接入率' : '接入AI项目' }}</text>
            <text class="board__rate">{{ subTab === 0 ? videoBoard.accessRate : aiBoard.accessRate }}%</text>
            <view class="board__sub">
              <text class="link">已接入 {{ subTab === 0 ? videoBoard.connected : aiBoard.connected }}</text>
              <text class="muted">未接入 {{ subTab === 0 ? videoBoard.disconnected : aiBoard.disconnected }}</text>
            </view>
          </view>
          <view class="board__divider" />
          <view class="board__col">
            <text class="board__label">{{ subTab === 0 ? '实时在线率' : '今日预警' }}</text>
            <text class="board__rate">{{
              subTab === 0 ? videoBoard.realtimeOnlineRate + '%' : aiBoard.todayWarnings
            }}</text>
            <view class="board__sub">
              <template v-if="subTab === 0">
                <text class="link">在线 {{ videoBoard.online }}</text>
                <text class="muted">离线 {{ videoBoard.offline }}</text>
              </template>
              <template v-else>
                <text class="muted">昨日 {{ aiBoard.yesterdayWarnings }}</text>
              </template>
            </view>
          </view>
        </view>
      </view>

      <view class="card card--flat">
        <TimeRangeTabs v-model="rangeKey" :range-label="dateRangeLabel" />
      </view>

      <template v-if="subTab === 0">
        <view class="card">
          <text class="card__title">平均在线率</text>
          <DonutChart
            :center-text="String(avgOnlineDonut.centerValue)"
            :slices="[
              { color: '#5AD8A6', value: avgOnlineDonut.online },
              { color: '#5B8FF9', value: avgOnlineDonut.offline }
            ]"
            :legend="[
              { label: '在线', color: '#5AD8A6' },
              { label: '离线', color: '#5B8FF9' }
            ]"
          />
        </view>
        <view class="card">
          <text class="card__title">在线率趋势</text>
          <TrendLineChart :points="onlineTrendPoints" />
        </view>
      </template>

      <template v-else>
        <view class="card">
          <text class="card__title">预警统计</text>
          <view class="pie-wrap">
            <view class="pie" :style="{ background: pieGradient }" />
          </view>
          <view class="pie-grid">
            <view class="pie-grid__cell pie-grid__cell--total">
              <text class="pie-grid__name">总计</text>
              <text class="pie-grid__val link">{{ aiTotal }}</text>
            </view>
            <view v-for="slice in aiWarningPie.slice(0, 8)" :key="slice.name" class="pie-grid__cell">
              <text class="pie-grid__name">{{ slice.name }}</text>
              <text class="pie-grid__val">{{ slice.value }}</text>
            </view>
          </view>
        </view>
      </template>
      <view class="page-bottom-space" />
    </scroll-view>
    <ClassicTabBar current="analysis" />
  </view>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import SafetyPageHeader from '@/components/safety/SafetyPageHeader.vue'
import ClassicTabBar from '@/components/nav/ClassicTabBar.vue'
import TimeRangeTabs from '@/components/safety/TimeRangeTabs.vue'
import DonutChart from '@/components/safety/DonutChart.vue'
import TrendLineChart from '@/components/safety/TrendLineChart.vue'
import {
  aiAnalysisBoard,
  aiWarningPie,
  avgOnlineDonut,
  buildConicGradient,
  dateRangeLabel,
  onlineTrendPoints,
  pieTotal,
  videoAnalysisBoard,
  type AnalysisRangeKey
} from '@/mock/safety-analysis'
import { getLayoutMetrics, getNavLayout } from '@/utils/layout-metrics'

const subTab = ref(0)
const rangeKey = ref<AnalysisRangeKey>('7d')
const scrollHeight = ref('600px')

const videoBoard = videoAnalysisBoard
const aiBoard = aiAnalysisBoard

const pieGradient = computed(() => `conic-gradient(${buildConicGradient(aiWarningPie)})`)
const aiTotal = computed(() => pieTotal(aiWarningPie))

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

.card {
  margin: 0 24rpx 24rpx;
  padding: 24rpx;
  background: #fff;
  border-radius: 16rpx;

  &--flat {
    padding-top: 0;
  }
}

.card__title {
  display: block;
  font-size: 30rpx;
  font-weight: 600;
  color: #333;
  margin-bottom: 16rpx;
}

.board__row {
  display: flex;
  align-items: stretch;
}

.board__col {
  flex: 1;
  text-align: center;
}

.board__divider {
  width: 1rpx;
  background: #eee;
  margin: 0 16rpx;
}

.board__label {
  font-size: 26rpx;
  color: #666;
}

.board__rate {
  display: block;
  margin: 16rpx 0;
  font-size: 48rpx;
  font-weight: 600;
  color: #333;
}

.board__sub {
  display: flex;
  justify-content: center;
  gap: 24rpx;
  font-size: 24rpx;
}

.link {
  color: #2979ff;
}

.muted {
  color: #999;
}

.pie-wrap {
  display: flex;
  justify-content: center;
  padding: 16rpx 0;
}

.pie {
  width: 360rpx;
  height: 360rpx;
  border-radius: 50%;
}

.pie-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16rpx;
  margin-top: 16rpx;
  font-size: 24rpx;
}

.pie-grid__cell {
  padding: 16rpx;
  background: #fafafa;
  border-radius: 8rpx;
}

.pie-grid__cell--total {
  grid-column: span 2;
  text-align: center;
}

.pie-grid__name {
  display: block;
  color: #666;
  margin-bottom: 8rpx;
}

.pie-grid__val {
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
}

.page-bottom-space {
  height: 24rpx;
}
</style>
