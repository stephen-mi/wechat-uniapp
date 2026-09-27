<template>
  <view class="page">
    <view class="nav" :style="{ paddingTop: nav.statusBarHeight + 'px' }">
      <view
        class="nav__bar"
        :style="{ minHeight: nav.navBarHeight + 'px', paddingRight: nav.navPaddingRight + 'px' }"
      >
        <view class="nav__btn" @click="goBack">
          <u-icon name="arrow-left" size="20" color="#fff" />
        </view>
        <text class="nav__title">公司安全日报</text>
        <view class="nav__share" @click="onShare">
          <u-icon name="share" size="16" color="#fff" />
          <text>转发分享</text>
        </view>
      </view>
    </view>

    <scroll-view scroll-y class="scroll" :style="{ height: scrollHeight }" :show-scrollbar="false">
      <!-- 图1：预警总览 + 总结 -->
      <view class="glass-card">
        <view class="overview-head">
          <text class="overview-head__label">AI预警总数</text>
          <view class="overview-head__right">
            <text class="badge badge--up">较近1日 {{ meta.dayAlertDelta }}</text>
            <text class="badge badge--down">近1周 {{ meta.weekAlertDelta }}</text>
          </view>
        </view>
        <view class="overview-total">
          <text class="overview-total__num">{{ meta.alertTotal }}</text>
          <text class="overview-total__unit">次</text>
        </view>
        <view class="mini-stats">
          <view class="mini-stats__item">
            <text class="mini-stats__label">需处理隐患数</text>
            <text class="mini-stats__val">{{ meta.needHandle }}个</text>
          </view>
          <view class="mini-stats__item">
            <text class="mini-stats__label">已处理隐患数</text>
            <text class="mini-stats__val">{{ meta.handled }}个</text>
          </view>
          <view class="mini-stats__item">
            <text class="mini-stats__label">未处理隐患数</text>
            <text class="mini-stats__val">{{ meta.unhandled }}个</text>
          </view>
        </view>
        <view class="rate-row">
          <view>
            <text class="rate-row__label">隐患处理率 </text>
            <text class="rate-row__val">{{ meta.handleRate }}</text>
          </view>
          <view class="rate-row__tags">
            <text class="pill">较近1日 无数据</text>
            <text class="pill">近1周 持平</text>
          </view>
        </view>
      </view>

      <view class="summary-card">
        <text class="summary-card__p">
          <text class="em">AI巡检项目数1个</text>，<text class="em">AI预警总数7次</text>，隐患处理率
          <text class="em">0%</text>，AI预警评分 <text class="em">1.3分</text>。
        </text>
        <text class="summary-card__p">
          需重点关注评分最高的3个项目为：<text class="em">某苑建筑项目 (1.7分)</text>
        </text>
      </view>

      <!-- 图2：态势总览 + 项目列表 -->
      <view class="glass-card glass-card--section">
        <text class="section-date">{{ meta.dateTitle }}</text>
        <view class="rating-block">
          <view>
            <text class="rating-block__label">AI预警评分（近7天）</text>
            <view class="rating-block__row">
              <text class="rating-block__stars">{{ ratingStarsDisplay(meta.aiRating) }}</text>
              <text class="rating-block__score">{{ meta.aiRating }}分</text>
            </view>
          </view>
          <view class="rating-block__side">
            <text class="pill pill--soft">AI巡检项目数：{{ meta.aiProjectCount }}个</text>
            <text class="pill pill--soft">较近1日 持平</text>
            <text class="pill pill--soft">近1周 持平</text>
          </view>
        </view>
        <view class="divider" />
        <view class="overview-head overview-head--compact">
          <text class="overview-head__label">AI预警总数</text>
          <view class="overview-head__right">
            <text class="badge badge--up">较近1日 {{ meta.dayAlertDelta }}</text>
            <text class="badge badge--down">近1周 {{ meta.weekAlertDelta }}</text>
          </view>
        </view>
        <view class="overview-total overview-total--sm">
          <text class="overview-total__num">{{ meta.alertTotal }}</text>
          <text class="overview-total__unit">次</text>
        </view>
        <view class="mini-stats">
          <view class="mini-stats__item">
            <text class="mini-stats__label">需处理隐患数</text>
            <text class="mini-stats__val">{{ meta.needHandle }}个</text>
          </view>
          <view class="mini-stats__item">
            <text class="mini-stats__label">已处理隐患数</text>
            <text class="mini-stats__val">{{ meta.handled }}个</text>
          </view>
          <view class="mini-stats__item">
            <text class="mini-stats__label">未处理隐患数</text>
            <text class="mini-stats__val">{{ meta.unhandled }}个</text>
          </view>
        </view>
        <view class="rate-row">
          <view>
            <text class="rate-row__label">隐患处理率 </text>
            <text class="rate-row__val">{{ meta.handleRate }}</text>
          </view>
          <view class="rate-row__tags">
            <text class="pill">较近1日 无数据</text>
            <text class="pill">近1周 持平</text>
          </view>
        </view>
      </view>

      <view class="summary-box">
        <text class="summary-box__title">总结：</text>
        <text class="summary-box__text">{{ meta.summaryHighlight }}</text>
        <text class="summary-box__text">{{ meta.summaryFocus }}</text>
      </view>

      <view class="list-head">
        <text class="list-head__title">详细项目报告如下</text>
        <view class="sort-pill" @click="sortVisible = true">
          <text>{{ currentSortLabel }}</text>
        </view>
      </view>

      <view v-for="p in sortedProjects" :key="p.id" class="project-card">
        <view class="project-card__rank">{{ p.rank }}</view>
        <view class="project-card__body">
          <text class="project-card__name">{{ p.name }}</text>
          <text class="project-card__line">AI预警次数：{{ p.alertCount }}次</text>
          <text class="project-card__line">隐患处理率：{{ p.handleRate }}</text>
          <view class="project-card__rating">
            <text class="stars">{{ ratingStarsDisplay(p.rating) }}</text>
            <text class="score">{{ p.rating }}</text>
          </view>
        </view>
        <view class="project-card__shield">
          <u-icon name="checkmark-circle-fill" size="36" color="#5b9cff" />
        </view>
      </view>

      <text class="list-end">没有了</text>
      <view class="scroll-bottom" />
    </scroll-view>

    <u-popup :show="sortVisible" mode="bottom" round="16" @close="sortVisible = false">
      <view class="sort-sheet">
        <view
          v-for="opt in sortOptions"
          :key="opt.key"
          class="sort-sheet__item"
          :class="{ 'sort-sheet__item--active': sortKey === opt.key }"
          @click="pickSort(opt.key)"
        >
          {{ opt.label }}
        </view>
        <view class="sort-sheet__gap" />
        <view class="sort-sheet__item sort-sheet__item--cancel" @click="sortVisible = false">取消</view>
      </view>
    </u-popup>
  </view>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import {
  buildDailyProjects,
  dailyReportMeta,
  dailySortOptions,
  ratingStarsDisplay,
  sortDailyProjects,
  type DailySortKey
} from '@/mock/v2-daily-report'
import { getLayoutMetrics, getNavLayout } from '@/utils/layout-metrics'
import { useNavLayout } from '@/composables/useNavLayout'

const meta = dailyReportMeta
const sortOptions = dailySortOptions
const sortVisible = ref(false)
const sortKey = ref<DailySortKey>('ratingDesc')
const reportId = ref('')
const nav = useNavLayout()
const scrollHeight = ref('600px')

const allProjects = buildDailyProjects()

const currentSortLabel = computed(
  () => sortOptions.find((o) => o.key === sortKey.value)?.label ?? '按评分从高到低'
)

const sortedProjects = computed(() => sortDailyProjects(allProjects, sortKey.value))

onLoad((query) => {
  reportId.value = (query?.id as string) ?? ''
})

function goBack(): void {
  uni.navigateBack()
}

function onShare(): void {
  uni.showToast({ title: '转发分享', icon: 'none' })
}

function pickSort(key: DailySortKey): void {
  sortKey.value = key
  sortVisible.value = false
}

onMounted(() => {
  const { windowHeight, safeAreaBottom } = getLayoutMetrics()
  scrollHeight.value = `${windowHeight - getNavLayout().navTotalHeight - safeAreaBottom}px`
})
</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background: linear-gradient(
    180deg,
    #4a8fe8 0%,
    #7eb0f0 18%,
    #b8d4f5 42%,
    #e4eef8 70%,
    #f2f5f9 100%
  );
}

.nav__bar {
  display: flex;
  align-items: center;
  box-sizing: border-box;
  padding-left: 20rpx;
}

.nav__btn {
  width: 64rpx;
  height: 64rpx;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
}

.nav__title {
  flex: 1;
  text-align: center;
  font-size: 34rpx;
  font-weight: 600;
  color: #fff;
}

.nav__share {
  display: flex;
  align-items: center;
  gap: 6rpx;
  padding: 12rpx 20rpx;
  border-radius: 999rpx;
  background: rgba(255, 255, 255, 0.22);
  font-size: 22rpx;
  color: #fff;
  flex-shrink: 0;
}

.scroll {
  padding: 0 24rpx;
  box-sizing: border-box;
}

.glass-card {
  margin-top: 16rpx;
  padding: 28rpx 24rpx;
  border-radius: 24rpx;
  background: rgba(255, 255, 255, 0.72);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  box-shadow: 0 8rpx 32rpx rgba(60, 110, 180, 0.1);

  &--section {
    margin-top: 24rpx;
  }
}

.section-date {
  display: block;
  font-size: 30rpx;
  font-weight: 700;
  color: #1a3a5c;
  margin-bottom: 20rpx;
}

.overview-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12rpx;

  &--compact {
    margin-top: 8rpx;
  }
}

.overview-head__label {
  font-size: 26rpx;
  color: #4a6078;
}

.overview-head__right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 8rpx;
}

.badge {
  font-size: 20rpx;
  padding: 4rpx 12rpx;
  border-radius: 8rpx;

  &--up {
    color: #fa3534;
    background: #fff0ef;
  }

  &--down {
    color: #19be6b;
    background: #e8faf0;
  }
}

.overview-total {
  margin: 16rpx 0 24rpx;

  &--sm {
    margin-bottom: 16rpx;
  }
}

.overview-total__num {
  font-size: 56rpx;
  font-weight: 700;
  color: #1a3a5c;
}

.overview-total__unit {
  font-size: 28rpx;
  color: #666;
  margin-left: 8rpx;
}

.mini-stats {
  display: flex;
  gap: 12rpx;
  margin-bottom: 20rpx;
}

.mini-stats__item {
  flex: 1;
  padding: 16rpx 8rpx;
  background: rgba(255, 255, 255, 0.85);
  border-radius: 12rpx;
  text-align: center;
}

.mini-stats__label {
  display: block;
  font-size: 20rpx;
  color: #888;
  line-height: 1.3;
}

.mini-stats__val {
  display: block;
  margin-top: 8rpx;
  font-size: 26rpx;
  font-weight: 600;
  color: #333;
}

.rate-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12rpx;
  font-size: 24rpx;
  color: #4a6078;
}

.rate-row__val {
  font-size: 32rpx;
  font-weight: 700;
  color: #1a3a5c;
}

.rate-row__tags {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 8rpx;
}

.pill {
  font-size: 20rpx;
  color: #666;
  padding: 4rpx 10rpx;
  background: #f0f2f5;
  border-radius: 6rpx;

  &--soft {
    background: rgba(255, 255, 255, 0.8);
  }
}

.rating-block {
  display: flex;
  justify-content: space-between;
  gap: 16rpx;
}

.rating-block__label {
  font-size: 24rpx;
  color: #666;
}

.rating-block__row {
  display: flex;
  align-items: center;
  gap: 12rpx;
  margin-top: 8rpx;
}

.rating-block__stars {
  color: #ff9500;
  font-size: 24rpx;
}

.rating-block__score {
  font-size: 36rpx;
  font-weight: 700;
  color: #1a3a5c;
}

.rating-block__side {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 8rpx;
}

.divider {
  height: 1rpx;
  background: rgba(0, 0, 0, 0.06);
  margin: 24rpx 0;
}

.summary-card {
  margin-top: 20rpx;
  padding: 24rpx;
  border-radius: 20rpx;
  background: rgba(255, 255, 255, 0.65);
  backdrop-filter: blur(12px);
  font-size: 26rpx;
  line-height: 1.6;
  color: #444;
}

.summary-card__p {
  display: block;
  margin-bottom: 12rpx;
}

.em {
  color: #fa3534;
}

.summary-box {
  margin-top: 24rpx;
  padding: 24rpx;
  border-radius: 16rpx;
  background: #eef1f5;
  font-size: 26rpx;
  line-height: 1.6;
  color: #333;
}

.summary-box__title {
  font-weight: 700;
}

.summary-box__text {
  display: block;
  margin-top: 8rpx;
}

.list-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 32rpx 0 20rpx;
}

.list-head__title {
  font-size: 28rpx;
  font-weight: 600;
  color: #fff;
  text-shadow: 0 1rpx 4rpx rgba(0, 0, 0, 0.08);
}

.sort-pill {
  padding: 10rpx 20rpx;
  border-radius: 999rpx;
  background: rgba(255, 255, 255, 0.75);
  font-size: 22rpx;
  color: #666;
}

.project-card {
  display: flex;
  align-items: center;
  gap: 16rpx;
  margin-bottom: 20rpx;
  padding: 24rpx;
  border-radius: 20rpx;
  background: linear-gradient(135deg, #f8fbff 0%, #ffffff 100%);
  box-shadow: 0 6rpx 24rpx rgba(80, 120, 180, 0.1);
}

.project-card__rank {
  width: 44rpx;
  height: 44rpx;
  line-height: 44rpx;
  text-align: center;
  border-radius: 50%;
  background: #ffecef;
  color: #fa3534;
  font-size: 24rpx;
  font-weight: 600;
  flex-shrink: 0;
}

.project-card__body {
  flex: 1;
  min-width: 0;
}

.project-card__name {
  display: block;
  font-size: 30rpx;
  font-weight: 700;
  color: #1a1a1a;
}

.project-card__line {
  display: block;
  margin-top: 8rpx;
  font-size: 24rpx;
  color: #666;
}

.project-card__rating {
  display: flex;
  align-items: center;
  gap: 8rpx;
  margin-top: 8rpx;
}

.stars {
  color: #ff9500;
  font-size: 22rpx;
}

.score {
  font-size: 26rpx;
  font-weight: 600;
  color: #333;
}

.project-card__shield {
  flex-shrink: 0;
  opacity: 0.85;
}

.list-end {
  display: block;
  text-align: center;
  padding: 24rpx 0 8rpx;
  font-size: 24rpx;
  color: #999;
}

.scroll-bottom {
  height: 40rpx;
}

.sort-sheet {
  padding: 16rpx 0 calc(16rpx + env(safe-area-inset-bottom));
  background: #fff;
}

.sort-sheet__item {
  padding: 28rpx 32rpx;
  text-align: center;
  font-size: 30rpx;
  color: #333;

  &--active {
    color: #5b9cff;
  }

  &--cancel {
    font-weight: 500;
  }
}

.sort-sheet__gap {
  height: 16rpx;
  background: #f5f5f5;
}
</style>
