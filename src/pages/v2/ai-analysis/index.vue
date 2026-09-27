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
        <text class="nav__title">AI分析</text>
        <view class="nav__placeholder" />
      </view>
    </view>

    <scroll-view scroll-y class="scroll" :style="{ height: scrollHeight }" :show-scrollbar="false">
      <view v-for="group in groups" :key="group.timeLabel" class="time-group">
        <text class="time-group__label">{{ group.timeLabel }}</text>
        <view v-for="card in group.cards" :key="card.id" class="event-card">
          <view class="event-card__badge">{{ card.badge }}</view>
          <view class="event-card__stats">
            <view class="stat">
              <text class="stat__label">新增事件</text>
              <text class="stat__val">{{ card.newEvents }}</text>
            </view>
            <view class="stat">
              <text class="stat__label">今日累计</text>
              <text class="stat__val">{{ card.todayTotal }}</text>
            </view>
          </view>
          <view v-show="isExpanded(card.id)" class="event-card__detail">
            <view v-for="(cat, ci) in card.categories" :key="ci" class="cat-row">
              <text class="cat-row__name">{{ cat.name }}</text>
              <view class="cat-row__tags">
                <text
                  v-for="(tag, ti) in cat.tags"
                  :key="ti"
                  class="project-tag"
                  @click="toastProject(tag.label)"
                >
                  {{ tag.label }} ({{ tag.count }})
                </text>
              </view>
            </view>
            <view v-if="card.mostNew" class="cat-row">
              <text class="cat-row__name">新增事件最多：</text>
              <text class="project-tag" @click="toastProject(card.mostNew.label)">
                {{ card.mostNew.label }} ({{ card.mostNew.count }})
              </text>
            </view>
          </view>
          <view class="event-card__toggle" @click="toggleExpand(card.id)">
            <text>{{ isExpanded(card.id) ? '收起' : '展开' }}</text>
            <u-icon :name="isExpanded(card.id) ? 'arrow-up' : 'arrow-down'" size="14" color="#666" />
          </view>
        </view>
      </view>
      <view class="scroll-bottom" />
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { aiAnalysisDetailGroups } from '@/mock/v2-ai-analysis-detail'
import { getLayoutMetrics, getNavLayout } from '@/utils/layout-metrics'
import { useNavLayout } from '@/composables/useNavLayout'

const groups = aiAnalysisDetailGroups
const nav = useNavLayout()
const scrollHeight = ref('600px')
const expandedMap = reactive<Record<string, boolean>>({})

groups.forEach((g) => {
  g.cards.forEach((c) => {
    expandedMap[c.id] = c.defaultExpanded ?? false
  })
})

function isExpanded(id: string): boolean {
  return expandedMap[id] ?? false
}

function toggleExpand(id: string): void {
  expandedMap[id] = !expandedMap[id]
}

function goBack(): void {
  uni.navigateBack()
}

function toastProject(name: string): void {
  uni.showToast({ title: name, icon: 'none' })
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
    #3d7fe8 0%,
    #5a96ef 22%,
    #8fb8f4 48%,
    #c5daf8 72%,
    #e8f0fa 100%
  );
}

.nav__bar {
  display: flex;
  align-items: center;
  box-sizing: border-box;
  padding-left: 24rpx;
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

.nav__placeholder {
  width: 64rpx;
}

.scroll {
  padding: 0 24rpx;
  box-sizing: border-box;
}

.time-group__label {
  display: block;
  margin: 24rpx 0 16rpx;
  font-size: 26rpx;
  color: rgba(255, 255, 255, 0.85);
}

.event-card {
  position: relative;
  margin-bottom: 24rpx;
  padding: 28rpx 24rpx 20rpx;
  border-radius: 24rpx;
  background: rgba(255, 255, 255, 0.72);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  box-shadow: 0 8rpx 32rpx rgba(50, 100, 180, 0.12);
  overflow: hidden;
}

.event-card__badge {
  position: absolute;
  top: 0;
  left: 0;
  padding: 6rpx 20rpx 6rpx 16rpx;
  font-size: 22rpx;
  color: #fff;
  background: linear-gradient(135deg, #4a90ff, #2979ff);
  border-bottom-right-radius: 16rpx;
}

.event-card__stats {
  display: flex;
  gap: 48rpx;
  margin-top: 36rpx;
  margin-bottom: 20rpx;
}

.stat__label {
  display: block;
  font-size: 24rpx;
  color: #888;
}

.stat__val {
  display: block;
  margin-top: 8rpx;
  font-size: 40rpx;
  font-weight: 700;
  color: #1a3a5c;
}

.cat-row {
  margin-bottom: 16rpx;
  font-size: 26rpx;
  color: #333;
}

.cat-row__name {
  color: #666;
}

.cat-row__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
  margin-top: 8rpx;
}

.project-tag {
  padding: 8rpx 16rpx;
  font-size: 24rpx;
  color: #2979ff;
  background: #eef4ff;
  border-radius: 8rpx;
}

.event-card__toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8rpx;
  margin-top: 16rpx;
  padding-top: 16rpx;
  border-top: 1rpx solid rgba(0, 0, 0, 0.06);
  font-size: 24rpx;
  color: #666;
}

.scroll-bottom {
  height: 40rpx;
}
</style>
