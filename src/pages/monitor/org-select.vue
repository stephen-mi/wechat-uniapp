<template>
  <view class="page">
    <MonitorSubNavBar title="视频监控" />
    <view class="search-wrap">
      <view class="search">
        <u-icon name="search" size="18" color="#999" />
        <input v-model="keyword" class="search__input" placeholder="搜索项目" />
      </view>
    </view>

    <scroll-view scroll-x class="tags-scroll" show-scrollbar="false">
      <view class="tags">
        <view
          v-for="tag in projectStatusTags"
          :key="tag.key"
          class="tag"
          :class="{ 'tag--active': statusKey === tag.key }"
          @click="statusKey = tag.key"
        >
          {{ tag.label }}
        </view>
      </view>
    </scroll-view>

    <view class="tabs">
      <view class="tab" :class="{ 'tab--active': listTab === 0 }" @click="listTab = 0">项目列表</view>
      <view class="tab" :class="{ 'tab--active': listTab === 1 }" @click="listTab = 1">最近访问</view>
    </view>

    <scroll-view scroll-y class="body" :style="{ height: bodyHeight }">
      <template v-if="listTab === 0">
        <view class="tree-node tree-node--root" @click="toggleExpand">
          <u-icon :name="expanded ? 'arrow-down' : 'arrow-right'" size="14" color="#999" />
          <u-icon name="home" size="16" color="#666" />
          <text class="tree-node__name">{{ orgTree.name }}</text>
          <text class="tree-node__count">项目({{ orgTree.projectCount }})</text>
        </view>
        <view v-if="expanded" class="tree-children">
          <view
            v-for="child in filteredProjects"
            :key="child.id"
            class="tree-node tree-node--child"
            @click="selectOrg(child.name)"
          >
            <u-icon name="flag" size="14" color="#999" />
            <text class="tree-node__name">{{ child.name }}</text>
          </view>
          <view v-if="filteredProjects.length === 0" class="empty">无匹配项目</view>
        </view>
        <view class="tree-hint" @click="selectOrg(orgTree.name)">
          <text>选择组织「{{ orgTree.name }}」</text>
        </view>
      </template>
      <template v-else>
        <view
          v-for="(name, idx) in recentOrgNames"
          :key="idx"
          class="tree-node tree-node--child recent"
          @click="selectOrg(name)"
        >
          <u-icon name="clock" size="14" color="#999" />
          <text class="tree-node__name">{{ name }}</text>
        </view>
      </template>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import MonitorSubNavBar from '@/components/safety/MonitorSubNavBar.vue'
import { useMonitorContext } from '@/composables/useMonitorContext'
import { orgTree, projectStatusTags, recentOrgNames } from '@/mock/monitor-org'
import { getLayoutMetrics, getNavLayout } from '@/utils/layout-metrics'

const { setOrgName, setRegionLabel } = useMonitorContext()

const keyword = ref('')
const statusKey = ref('all')
const listTab = ref(0)
const expanded = ref(true)
const bodyHeight = ref('500px')
/** 从地图页进入时，选中后回地图并更新区域文案 */
const fromMap = ref(false)

onLoad((query) => {
  fromMap.value = query?.from === 'map'
})

const filteredProjects = computed(() => {
  const k = keyword.value.trim()
  const list = orgTree.children ?? []
  if (!k) return list
  return list.filter((p) => p.name.includes(k))
})

function toggleExpand(): void {
  expanded.value = !expanded.value
}

function selectOrg(name: string): void {
  if (fromMap.value) {
    setRegionLabel(name === orgTree.name ? '全国' : name)
  } else {
    setOrgName(name)
  }
  uni.navigateBack()
}

onMounted(() => {
  const { windowHeight } = getLayoutMetrics()
  const top = getNavLayout().navTotalHeight + 200
  bodyHeight.value = `${windowHeight - top}px`
})
</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background: #fff;
}

.search-wrap {
  padding: 24rpx;
}

.search {
  display: flex;
  align-items: center;
  gap: 12rpx;
  padding: 16rpx 24rpx;
  background: #f5f6f8;
  border-radius: 12rpx;
}

.search__input {
  flex: 1;
  font-size: 28rpx;
}

.tags-scroll {
  white-space: nowrap;
  padding: 0 24rpx 16rpx;
}

.tags {
  display: inline-flex;
  flex-wrap: wrap;
  gap: 16rpx;
  max-width: 100%;
}

.tag {
  padding: 12rpx 20rpx;
  font-size: 24rpx;
  color: #666;
  border: 1rpx solid #ddd;
  border-radius: 8rpx;

  &--active {
    color: #2979ff;
    border-color: #2979ff;
    background: #eef4ff;
  }
}

.tabs {
  display: flex;
  justify-content: center;
  gap: 80rpx;
  padding: 16rpx 0 24rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

.tab {
  font-size: 28rpx;
  color: #666;
  padding-bottom: 12rpx;
  border-bottom: 4rpx solid transparent;

  &--active {
    color: #2979ff;
    font-weight: 500;
    border-bottom-color: #2979ff;
  }
}

.body {
  padding: 16rpx 24rpx;
  box-sizing: border-box;
}

.tree-node {
  display: flex;
  align-items: center;
  gap: 12rpx;
  padding: 20rpx 0;
  font-size: 28rpx;
  color: #333;

  &--root {
    border-bottom: 1rpx solid #f5f5f5;
  }

  &--child {
    padding-left: 48rpx;
  }
}

.tree-node__name {
  flex: 1;
}

.tree-node__count {
  font-size: 24rpx;
  color: #999;
}

.tree-hint {
  margin-top: 32rpx;
  text-align: center;
  font-size: 26rpx;
  color: #2979ff;
}

.recent {
  border-bottom: 1rpx solid #f5f5f5;
}

.empty {
  padding: 32rpx;
  text-align: center;
  color: #999;
  font-size: 26rpx;
}
</style>
