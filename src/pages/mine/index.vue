<template>
  <view class="mine-container" :style="{ height: `${windowHeight}px` }">
    <view class="header-section">
      <view class="flex padding justify-between">
        <view class="flex align-center">
          <view v-if="!avatar" class="cu-avatar xl round bg-white">
            <view class="iconfont icon-people text-gray icon"></view>
          </view>
          <image v-if="avatar" @click="handleToAvatar" :src="avatar" class="cu-avatar xl round" mode="widthFix"></image>
          <view v-if="!name" @click="handleToLogin" class="login-tip">点击登录</view>
          <view v-if="name" @click="handleToInfo" class="user-info">
            <view class="u_title">用户名：{{ name }}</view>
          </view>
        </view>
        <view @click="handleToInfo" class="flex align-center">
          <text>个人信息</text>
          <view class="iconfont icon-right"></view>
        </view>
      </view>
    </view>

    <view class="content-section">
      <view class="mine-actions grid col-4 text-center">
        <view class="action-item" @click="handleJiaoLiuQun">
          <view class="iconfont icon-friendfill text-pink icon"></view>
          <text class="text">交流群</text>
        </view>
        <view class="action-item" @click="handleBuilding">
          <view class="iconfont icon-service text-blue icon"></view>
          <text class="text">在线客服</text>
        </view>
        <view class="action-item" @click="handleBuilding">
          <view class="iconfont icon-community text-mauve icon"></view>
          <text class="text">反馈社区</text>
        </view>
        <view class="action-item" @click="handleBuilding">
          <view class="iconfont icon-dianzan text-green icon"></view>
          <text class="text">点赞我们</text>
        </view>
      </view>

      <view class="menu-list">
        <view class="list-cell list-cell-arrow" @click="handleToEditInfo">
          <view class="menu-item-box">
            <view class="iconfont icon-user menu-icon"></view>
            <view>编辑资料</view>
          </view>
        </view>
        <view class="list-cell list-cell-arrow" @click="handleHelp">
          <view class="menu-item-box">
            <view class="iconfont icon-help menu-icon"></view>
            <view>常见问题</view>
          </view>
        </view>
        <view class="list-cell list-cell-arrow" @click="handleAbout">
          <view class="menu-item-box">
            <view class="iconfont icon-aixin menu-icon"></view>
            <view>关于我们</view>
          </view>
        </view>
        <view class="list-cell list-cell-arrow" @click="handleToSetting">
          <view class="menu-item-box">
            <view class="iconfont icon-setting menu-icon"></view>
            <view>应用设置</view>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useAppStore } from '@/composables/useAppStore'
import { useModal } from '@/composables/useModal'
import { useTab } from '@/composables/useTab'
import { getLayoutMetrics } from '@/utils/layout-metrics'

const store = useAppStore()
const modal = useModal()
const tab = useTab()

const name = computed(() => store.state.user.name)
const avatar = computed(() => store.state.user.avatar)
const windowHeight = computed(() => getLayoutMetrics().windowHeight - 50)

function handleToInfo(): void {
  tab.navigateTo('/pages/mine/info/index')
}

function handleToEditInfo(): void {
  tab.navigateTo('/pages/mine/info/edit')
}

function handleToSetting(): void {
  tab.navigateTo('/pages/mine/setting/index')
}

function handleToLogin(): void {
  tab.reLaunch('/pages/login')
}

function handleToAvatar(): void {
  tab.navigateTo('/pages/mine/avatar/index')
}

function handleHelp(): void {
  tab.navigateTo('/pages/mine/help/index')
}

function handleAbout(): void {
  tab.navigateTo('/pages/mine/about/index')
}

function handleJiaoLiuQun(): void {
  modal.showToast('微信搜索 naidaguo 后，添加好友后拉你进技术交流群')
}

function handleBuilding(): void {
  modal.showToast('模块建设中~')
}
</script>

<style lang="scss">
page {
  background-color: #f5f6f7;
}

.mine-container {
  width: 100%;
  height: 100%;

  .header-section {
    padding: 15px 15px 45px 15px;
    background-color: #3c96f3;
    color: white;

    .login-tip {
      font-size: 18px;
      margin-left: 10px;
    }

    .cu-avatar {
      border: 2px solid #eaeaea;

      .icon {
        font-size: 40px;
      }
    }

    .user-info {
      margin-left: 15px;

      .u_title {
        font-size: 18px;
        line-height: 30px;
      }
    }
  }

  .content-section {
    position: relative;
    top: -50px;

    .mine-actions {
      margin: 15px 15px;
      padding: 20px 0px;
      border-radius: 8px;
      background-color: white;

      .action-item {
        .icon {
          font-size: 28px;
        }

        .text {
          display: block;
          font-size: 13px;
          margin: 8px 0px;
        }
      }
    }
  }
}
</style>
