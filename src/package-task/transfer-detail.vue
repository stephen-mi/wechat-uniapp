<template>
  <view class="page">
    <V2TopHeader :title="title" :title-dropdown="false" :show-search="false" />

    <scroll-view scroll-y class="scroll" :style="{ height: scrollHeight }">
      <view class="tip">勾选移交范围后确认完成移交</view>
      <view v-for="scope in scopes" :key="scope._id" class="scope" @click="toggle(scope)">
        <view class="scope__check" :class="{ 'scope__check--on': scope.checked || scope.finished }">
          <u-icon
            v-if="scope.checked || scope.finished"
            name="checkmark"
            size="14"
            color="#fff"
          />
        </view>
        <view class="scope__info">
          <text class="scope__name">{{ scope.name }}</text>
          <text class="scope__floor">{{ scope.floorName }}</text>
        </view>
        <text class="scope__tag">{{ scope.finished ? '已完成' : '待移交' }}</text>
      </view>
      <view v-if="!scopes.length" class="empty">
        <u-empty mode="list" text="暂无移交范围" />
      </view>
    </scroll-view>

    <view class="footer" :style="{ paddingBottom: safeBottom + 12 + 'px' }">
      <view class="footer__btn footer__btn--ghost" @click="selectAll">全选未完成</view>
      <view class="footer__btn" @click="confirm">确认移交</view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { onLoad } from '@dcloudio/uni-app'
import { onMounted, ref } from 'vue'
import V2TopHeader from '@/components/v2/V2TopHeader.vue'
import { finishTransfer, getTransferScopes } from '@/api/task'
import type { WorkTransferScope } from '@/api/task/types'
import { getLayoutMetrics, getNavLayout } from '@/utils/layout-metrics'
import { mockTaskOrgId } from '@/mock/task'

const title = ref('移交详情')
const transferId = ref('')
const buildingId = ref('')
const scopes = ref<WorkTransferScope[]>([])
const scrollHeight = ref('500px')
const safeBottom = ref(0)

onLoad((query) => {
  transferId.value = (query?.id as string) || ''
  buildingId.value = (query?.buildingId as string) || ''
  title.value = decodeURIComponent((query?.name as string) || '移交详情')
})

async function load(): Promise<void> {
  scopes.value = await getTransferScopes({
    transferId: transferId.value,
    deptId: mockTaskOrgId,
    buildingId: buildingId.value
  })
}

function toggle(scope: WorkTransferScope): void {
  if (scope.finished) return
  scope.checked = !scope.checked
}

function selectAll(): void {
  for (const s of scopes.value) {
    if (!s.finished) s.checked = true
  }
}

async function confirm(): Promise<void> {
  const ids = scopes.value.filter((s) => s.checked && !s.finished).map((s) => s._id)
  if (!ids.length) {
    uni.showToast({ title: '请选择移交范围', icon: 'none' })
    return
  }
  await finishTransfer({ transferId: transferId.value, scopeIds: ids })
  uni.showToast({ title: '移交成功', icon: 'success' })
  await load()
}

onMounted(() => {
  const metrics = getLayoutMetrics()
  safeBottom.value = metrics.safeAreaBottom
  const top = getNavLayout().navTotalHeight
  const bottom = 64 + metrics.safeAreaBottom
  scrollHeight.value = `${metrics.windowHeight - top - bottom}px`
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
  padding: 16rpx 24rpx;
  box-sizing: border-box;
}

.tip {
  font-size: 24rpx;
  color: #666;
  margin-bottom: 16rpx;
}

.scope {
  display: flex;
  align-items: center;
  gap: 16rpx;
  padding: 24rpx;
  margin-bottom: 16rpx;
  background: #fff;
  border-radius: 16rpx;
}

.scope__check {
  width: 40rpx;
  height: 40rpx;
  border-radius: 50%;
  border: 2rpx solid #ccc;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  &--on {
    background: #23c993;
    border-color: #23c993;
  }
}

.scope__info {
  flex: 1;
  min-width: 0;
}

.scope__name {
  display: block;
  font-size: 28rpx;
  color: #222;
}

.scope__floor {
  display: block;
  margin-top: 4rpx;
  font-size: 22rpx;
  color: #999;
}

.scope__tag {
  font-size: 22rpx;
  color: #888;
}

.empty {
  padding: 120rpx 0;
}

.footer {
  display: flex;
  gap: 16rpx;
  padding: 16rpx 24rpx;
  background: #fff;
  border-top: 1rpx solid #eee;
}

.footer__btn {
  flex: 1;
  height: 80rpx;
  line-height: 80rpx;
  text-align: center;
  border-radius: 40rpx;
  background: #23c993;
  color: #fff;
  font-size: 28rpx;

  &--ghost {
    background: #eefaf5;
    color: #1d7a5a;
  }
}
</style>
