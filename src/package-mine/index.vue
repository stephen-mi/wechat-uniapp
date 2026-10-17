<template>
  <view class="page" :class="tabEnterClass">
    <V2TopHeader title="我的" :show-back="false" :title-dropdown="false" :show-search="false" />

    <scroll-view scroll-y class="scroll" :show-scrollbar="false">
      <view class="profile">
        <image
          v-if="avatarUrl"
          class="profile__avatar"
          :src="avatarUrl"
          mode="aspectFill"
          @error="avatarUrl = ''"
        />
        <view v-else class="profile__avatar profile__avatar--fallback">
          <u-icon name="account-fill" size="40" color="#fff" />
        </view>
        <view class="profile__meta">
          <text class="profile__name">{{ nickname || '未命名用户' }}</text>
          <text class="profile__role">{{ roleText }}</text>
        </view>
      </view>

      <view class="card">
        <view class="cell">
          <text class="cell__label">当前组织</text>
          <text class="cell__value">{{ orgName }}</text>
        </view>
        <view class="cell">
          <text class="cell__label">手机号</text>
          <text class="cell__value">{{ mobileText }}</text>
        </view>
        <view class="cell">
          <text class="cell__label">邮箱</text>
          <text class="cell__value">{{ emailText }}</text>
        </view>
      </view>

      <view class="card">
        <view class="cell cell--link" @click="clearCache">
          <text class="cell__label">清除缓存</text>
          <u-icon name="arrow-right" size="14" color="#9aa8a2" />
        </view>
        <view class="cell cell--link" @click="showAbout">
          <text class="cell__label">关于</text>
          <view class="cell__tail">
            <text class="cell__value">v{{ version }}</text>
            <u-icon name="arrow-right" size="14" color="#9aa8a2" />
          </view>
        </view>
      </view>

      <view class="logout" @click="confirmLogout">退出登录</view>
      <view class="scroll-bottom" />
    </scroll-view>

    <V2TabBar current="mine" />
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import V2TopHeader from '@/components/v2/V2TopHeader.vue'
import V2TabBar from '@/components/nav/V2TabBar.vue'
import { consumeTabTransition } from '@/utils/tab-transition'
import { useAppStore } from '@/composables/useAppStore'
import { useMonitorContext } from '@/composables/useMonitorContext'
import appConfig from '@/config'
import { removeTenantId, removeToken } from '@/utils/auth'
import type { PermissionInfoVO } from '@/types/api'

const tabEnterClass = consumeTabTransition()
const store = useAppStore()
const { monitorOrgName } = useMonitorContext()

const nickname = ref(String(store.getters.name || ''))
const avatarUrl = ref(resolveAvatar(String(store.getters.avatar || '')))
const roleText = ref('普通用户')
const mobileText = ref('未绑定')
const emailText = ref('未绑定')
const orgName = monitorOrgName
const version = appConfig.appInfo.version
const loggingOut = ref(false)

const KEEP_STORAGE_KEYS = new Set(['ACCESS_TOKEN', 'REFRESH_TOKEN', 'TENANT_ID', 'app_ui_version'])

function resolveAvatar(raw?: string): string {
  const url = (raw || '').trim()
  if (!url || url === '/static/images/profile.jpg') return ''
  if (/^https?:\/\//i.test(url) || url.startsWith('/static/')) return url
  if (url.startsWith('/')) return `${appConfig.apiBase}${url}`
  return url
}

function maskMobile(mobile?: string): string {
  const value = (mobile || '').trim()
  if (!value) return '未绑定'
  if (value.length < 7) return value
  return `${value.slice(0, 3)}****${value.slice(-4)}`
}

function applyProfile(data: PermissionInfoVO): void {
  const profile = data.user
  nickname.value = profile?.nickname || String(store.getters.name || '') || '未命名用户'
  avatarUrl.value = resolveAvatar(profile?.avatar || String(store.getters.avatar || ''))
  const names = (profile?.roles || []).map((role) => role.name).filter(Boolean)
  roleText.value = names.length ? names.join('、') : '普通用户'
  mobileText.value = maskMobile(profile?.mobile)
  emailText.value = profile?.email?.trim() || '未绑定'
}

async function loadProfile(): Promise<void> {
  try {
    const data = (await store.dispatch('GetInfo')) as PermissionInfoVO
    applyProfile(data)
  } catch {
    if (!nickname.value) nickname.value = '未命名用户'
  }
}

function clearCache(): void {
  uni.showModal({
    title: '清除缓存',
    content: '将清除本地缓存，当前登录状态会保留。',
    success: (result) => {
      if (!result.confirm) return
      const info = uni.getStorageInfoSync()
      info.keys.forEach((key) => {
        if (!KEEP_STORAGE_KEYS.has(key)) uni.removeStorageSync(key)
      })
      uni.showToast({ title: '缓存已清除', icon: 'none' })
      void loadProfile()
    }
  })
}

function showAbout(): void {
  uni.showModal({
    title: '关于',
    content: `${appConfig.appInfo.name}\n版本 ${version}`,
    showCancel: false
  })
}

function confirmLogout(): void {
  if (loggingOut.value) return
  uni.showModal({
    title: '退出登录',
    content: '确定退出当前账号？',
    success: (result) => {
      if (!result.confirm) return
      void logout()
    }
  })
}

async function logout(): Promise<void> {
  loggingOut.value = true
  try {
    await store.dispatch('LogOut')
  } catch {
    removeToken()
    removeTenantId()
  } finally {
    loggingOut.value = false
    uni.reLaunch({ url: '/pages/login' })
  }
}

onShow(() => {
  void loadProfile()
})
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
}

.scroll {
  flex: 1;
  height: 0;
  min-height: 0;
  width: 100%;
}

.profile {
  display: flex;
  flex-direction: row;
  align-items: center;
  margin: 8rpx 24rpx 24rpx;
  padding: 36rpx 28rpx;
  border-radius: 24rpx;
  background: rgba(255, 255, 255, 0.72);
}

.profile__avatar {
  width: 120rpx;
  height: 120rpx;
  border-radius: 60rpx;
  flex-shrink: 0;
  background: #d7f6ec;
}

.profile__avatar--fallback {
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #5ed9b0, #23c993);
}

.profile__meta {
  display: flex;
  flex-direction: column;
  min-width: 0;
  margin-left: 24rpx;
}

.profile__name {
  font-size: 36rpx;
  font-weight: 600;
  color: #1a1a1a;
}

.profile__role {
  margin-top: 8rpx;
  font-size: 24rpx;
  color: #5d736b;
}

.card {
  margin: 0 24rpx 24rpx;
  border-radius: 24rpx;
  background: rgba(255, 255, 255, 0.92);
  overflow: hidden;
}

.cell {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  min-height: 96rpx;
  margin: 0 28rpx;
  border-bottom: 1rpx solid #eef3f1;
}

.cell:last-child {
  border-bottom: 0;
}

.cell__label {
  font-size: 28rpx;
  color: #1a1a1a;
}

.cell__value {
  max-width: 420rpx;
  font-size: 26rpx;
  color: #7d8f88;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.cell__tail {
  display: flex;
  flex-direction: row;
  align-items: center;
}

.cell__tail .cell__value {
  margin-right: 8rpx;
}

.logout {
  margin: 12rpx 24rpx 0;
  height: 88rpx;
  border-radius: 24rpx;
  background: #fff;
  color: #e85454;
  font-size: 30rpx;
  line-height: 88rpx;
  text-align: center;
}

.scroll-bottom {
  height: 32rpx;
}
</style>
