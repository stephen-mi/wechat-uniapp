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
        <text class="nav__title">视频</text>
        <view class="nav__placeholder" />
      </view>
    </view>

    <view class="player-wrap">
      <live-player
        v-if="playerKind === 'live' && playUrl"
        :id="livePlayerId"
        class="player__video"
        :src="playUrl"
        mode="live"
        :autoplay="true"
        :muted="muted"
        object-fit="contain"
        @statechange="onLiveStateChange"
        @error="onLiveError"
      />
      <video
        v-else-if="playerKind === 'video' && playUrl"
        :id="videoPlayerId"
        class="player__video"
        :src="playUrl"
        :autoplay="true"
        :muted="muted"
        :controls="false"
        object-fit="contain"
        @error="onVideoError"
      />
      <image v-else class="player__video" :src="coverDisplay" mode="aspectFill" />

      <view v-if="streamLoading" class="player__state">
        <u-loading-icon mode="circle" color="#fff" />
        <text class="player__state-text">加载视频流…</text>
      </view>
      <view v-else-if="streamHint" class="player__state player__state--hint">
        <text class="player__state-text">{{ streamHint }}</text>
      </view>

      <view class="player__overlay-top">{{ overlayTime }}</view>
      <view class="player__overlay-bottom">
        <text class="player__cam-name">{{ cameraName }}</text>
        <view class="player__switch" @click="toastSwitch">
          <text>切换</text>
          <u-icon name="arrow-right" size="12" color="#fff" />
        </view>
      </view>
      <view class="player__toolbar">
        <u-icon
          :name="paused ? 'play-circle' : 'pause-circle'"
          size="22"
          color="#fff"
          @click="togglePause"
        />
        <u-icon
          :name="muted ? 'volume-off' : 'volume'"
          size="20"
          color="#fff"
          @click="toggleMute"
        />
        <u-icon name="grid" size="20" color="#fff" @click="toastCtrl('宫格')" />
        <u-icon name="scan" size="20" color="#fff" @click="toastCtrl('全屏')" />
        <view class="player__quality" @click="reloadStream">刷新</view>
      </view>
    </view>

    <view class="ptz-panel">
      <view class="ptz-side ptz-side--left">
        <view class="ptz-round-btn" @click="ptzAction('zoomIn')">
          <u-icon name="plus-circle" size="28" color="#fff" />
        </view>
      </view>
      <view class="ptz-pad">
        <view class="ptz-pad__ring">
          <view class="ptz-arrow ptz-arrow--up" @click="ptzAction('up')">
            <u-icon name="arrow-up" size="18" color="#666" />
          </view>
          <view class="ptz-arrow ptz-arrow--down" @click="ptzAction('down')">
            <u-icon name="arrow-down" size="18" color="#666" />
          </view>
          <view class="ptz-arrow ptz-arrow--left" @click="ptzAction('left')">
            <u-icon name="arrow-left" size="18" color="#666" />
          </view>
          <view class="ptz-arrow ptz-arrow--right" @click="ptzAction('right')">
            <u-icon name="arrow-right" size="18" color="#666" />
          </view>
          <view class="ptz-pad__center" @click="ptzAction('stop')" />
        </view>
      </view>
      <view class="ptz-side ptz-side--right">
        <view class="ptz-round-btn" @click="ptzAction('zoomOut')">
          <u-icon name="minus-circle" size="28" color="#fff" />
        </view>
        <view class="ptz-round-btn" @click="ptzAction('playback')">
          <u-icon name="clock" size="26" color="#fff" />
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { onLoad, onUnload } from '@dcloudio/uni-app'
import { ptzControl } from '@/api/video/camera'
import { useNavLayout } from '@/composables/useNavLayout'
import {
  PTZ_COMMAND_MAP,
  detectMiniprogramPlayerKind,
  hasPtzCapability,
  loadEzvizLiveSession,
  type EzvizLiveSession
} from '@/utils/ezviz-live'

const nav = useNavLayout()
const livePlayerId = 'ezviz-live-player'
const videoPlayerId = 'ezviz-video-player'

const cameraId = ref('')
const numericCameraId = ref(0)
const cameraName = ref('1#楼球机')
const defaultCover = '/static/images/default.jpg'
const coverDisplay = ref(defaultCover)

const streamLoading = ref(false)
const streamHint = ref('')
const session = ref<EzvizLiveSession | null>(null)
const playUrl = ref('')
const playerKind = ref<'live' | 'video' | 'none'>('none')
const muted = ref(true)
const paused = ref(false)
const ptzControlLock = ref(false)
const supportPtz = ref(false)

const overlayTime = computed(() => {
  const d = new Date()
  const week = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六']
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}年${pad(d.getMonth() + 1)}月${pad(d.getDate())}日 ${week[d.getDay()]} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
})

onLoad((query) => {
  cameraId.value = (query?.id as string) ?? ''
  if (query?.name) {
    cameraName.value = decodeURIComponent(query.name as string)
  }
  const id = Number(cameraId.value)
  if (Number.isFinite(id) && id > 0) {
    numericCameraId.value = id
    void reloadStream()
  } else {
    streamHint.value = '请从摄像头列表进入（需有效摄像头 ID）'
  }
})

onUnload(() => {
  stopPlayers()
})

function parseCameraId(raw: string): number | null {
  const id = Number(raw)
  return Number.isFinite(id) && id > 0 ? id : null
}

async function reloadStream(): Promise<void> {
  const id = numericCameraId.value || parseCameraId(cameraId.value)
  if (!id) {
    streamHint.value = '摄像头 ID 无效'
    return
  }
  numericCameraId.value = id
  streamLoading.value = true
  streamHint.value = ''
  playUrl.value = ''
  playerKind.value = 'none'
  session.value = null

  try {
    const loaded = await loadEzvizLiveSession(id)
    session.value = loaded
    if (loaded.camera.name) {
      cameraName.value = loaded.camera.name
    }
    if (loaded.camera.picUrl) {
      coverDisplay.value = loaded.camera.picUrl
    }
    supportPtz.value = hasPtzCapability(loaded.camera)

    if (loaded.camera.status === 0) {
      streamHint.value = '设备离线'
      return
    }

    const kind = detectMiniprogramPlayerKind(loaded.playUrl)
    playerKind.value = kind
    playUrl.value = loaded.playUrl

    if (kind === 'none') {
      streamHint.value =
        '当前为 Ezopen 协议，小程序需 HLS/RTMP 地址或萤石插件；已拉取 accessToken 与设备信息'
      console.info('[ezviz-live]', {
        accessToken: loaded.accessToken,
        deviceSerial: loaded.deviceSerial,
        channelNo: loaded.channelNo,
        rawPlayUrl: loaded.rawPlayUrl
      })
    } else {
      console.info('[ezviz-live]', {
        accessToken: loaded.accessToken,
        deviceSerial: loaded.deviceSerial,
        channelNo: loaded.channelNo,
        playUrl: loaded.playUrl
      })
    }
  } catch (error) {
    console.error('[ezviz-live] load failed', error)
    streamHint.value = '获取视频流失败'
  } finally {
    streamLoading.value = false
  }
}

function stopPlayers(): void {
  try {
    uni.createLivePlayerContext(livePlayerId)?.stop?.()
  } catch {
    /* ignore */
  }
  try {
    uni.createVideoContext(videoPlayerId)?.stop?.()
  } catch {
    /* ignore */
  }
}

function toggleMute(): void {
  muted.value = !muted.value
}

function togglePause(): void {
  paused.value = !paused.value
  if (playerKind.value === 'live') {
    const ctx = uni.createLivePlayerContext(livePlayerId)
    if (paused.value) ctx.pause?.()
    else ctx.resume?.()
    return
  }
  if (playerKind.value === 'video') {
    const ctx = uni.createVideoContext(videoPlayerId)
    if (paused.value) ctx.pause?.()
    else ctx.play?.()
  }
}

function onLiveStateChange(e: { detail?: { code?: number } }): void {
  const code = e.detail?.code
  if (code === 2004) {
    paused.value = false
  }
}

function onLiveError(e: unknown): void {
  console.error('[ezviz-live] live-player error', e)
  streamHint.value = '直播播放失败'
}

function onVideoError(e: unknown): void {
  console.error('[ezviz-live] video error', e)
  streamHint.value = '视频播放失败'
}

function goBack(): void {
  uni.navigateBack()
}

function toastSwitch(): void {
  uni.showToast({ title: '切换摄像机', icon: 'none' })
}

function toastCtrl(label: string): void {
  uni.showToast({ title: label, icon: 'none' })
}

async function ptzAction(action: string): Promise<void> {
  if (action === 'playback') {
    uni.showToast({ title: '录像回放开发中', icon: 'none' })
    return
  }

  const id = numericCameraId.value
  if (!id) {
    uni.showToast({ title: '无效摄像头', icon: 'none' })
    return
  }
  if (!supportPtz.value) {
    uni.showToast({ title: '该设备不支持云台', icon: 'none' })
    return
  }
  if (ptzControlLock.value) {
    uni.showToast({ title: '云台正在转动', icon: 'none' })
    return
  }

  if (action === 'stop') {
    ptzControlLock.value = true
    try {
      await ptzControl(id, 0, 1)
    } catch (error) {
      console.error('[ezviz-ptz] stop', error)
    } finally {
      setTimeout(() => {
        ptzControlLock.value = false
      }, 500)
    }
    return
  }

  const command = PTZ_COMMAND_MAP[action]
  if (command === undefined) {
    uni.showToast({ title: '未知云台指令', icon: 'none' })
    return
  }

  ptzControlLock.value = true
  try {
    await ptzControl(id, command, 4)
    console.info('[ezviz-ptz]', {
      cameraId: id,
      action,
      accessToken: session.value?.accessToken,
      deviceSerial: session.value?.deviceSerial,
      channelNo: session.value?.channelNo
    })
  } catch (error) {
    console.error('[ezviz-ptz]', error)
    uni.showToast({ title: '云台控制失败', icon: 'none' })
    ptzControlLock.value = false
    return
  }
  setTimeout(() => {
    ptzControlLock.value = false
  }, 1000)
}
</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: linear-gradient(180deg, #5a9cf0 0%, #c8ddf5 45%, #e8eef5 100%);
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

.player-wrap {
  position: relative;
  margin: 0 0 16rpx;
  background: #000;
}

.player__video {
  width: 100%;
  height: 420rpx;
  display: block;
}

.player__state {
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  bottom: 72rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16rpx;
  background: rgba(0, 0, 0, 0.35);
  pointer-events: none;

  &--hint {
    padding: 0 32rpx;
    text-align: center;
  }
}

.player__state-text {
  font-size: 24rpx;
  color: #fff;
  line-height: 1.5;
}

.player__overlay-top {
  position: absolute;
  top: 16rpx;
  left: 16rpx;
  font-size: 20rpx;
  color: #fff;
  text-shadow: 0 1rpx 4rpx rgba(0, 0, 0, 0.8);
}

.player__overlay-bottom {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 72rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 16rpx;
}

.player__cam-name {
  font-size: 26rpx;
  color: #fff;
  text-shadow: 0 1rpx 4rpx rgba(0, 0, 0, 0.8);
}

.player__switch {
  display: flex;
  align-items: center;
  gap: 4rpx;
  padding: 8rpx 16rpx;
  font-size: 22rpx;
  color: #fff;
  background: rgba(0, 0, 0, 0.45);
  border-radius: 999rpx;
}

.player__toolbar {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: space-around;
  height: 72rpx;
  background: rgba(0, 0, 0, 0.85);
}

.player__quality {
  padding: 6rpx 16rpx;
  font-size: 22rpx;
  color: #fff;
  border: 1rpx solid rgba(255, 255, 255, 0.6);
  border-radius: 8rpx;
}

.ptz-panel {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 24rpx;
  padding: 40rpx 24rpx 80rpx;
}

.ptz-side {
  display: flex;
  flex-direction: column;
  gap: 40rpx;

  &--left {
    padding-top: 80rpx;
  }
}

.ptz-round-btn {
  width: 96rpx;
  height: 96rpx;
  border-radius: 50%;
  background: #b0b8c4;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 6rpx 16rpx rgba(0, 0, 0, 0.12);
}

.ptz-pad__ring {
  position: relative;
  width: 360rpx;
  height: 360rpx;
  border-radius: 50%;
  background: #fff;
  box-shadow: 0 12rpx 40rpx rgba(80, 120, 180, 0.15);
}

.ptz-pad__center {
  position: absolute;
  left: 50%;
  top: 50%;
  width: 100rpx;
  height: 100rpx;
  margin: -50rpx 0 0 -50rpx;
  border-radius: 50%;
  background: linear-gradient(135deg, #4facfe, #2979ff);
}

.ptz-arrow {
  position: absolute;
  width: 56rpx;
  height: 56rpx;
  display: flex;
  align-items: center;
  justify-content: center;

  &--up {
    top: 24rpx;
    left: 50%;
    margin-left: -28rpx;
  }

  &--down {
    bottom: 24rpx;
    left: 50%;
    margin-left: -28rpx;
  }

  &--left {
    left: 24rpx;
    top: 50%;
    margin-top: -28rpx;
  }

  &--right {
    right: 24rpx;
    top: 50%;
    margin-top: -28rpx;
  }
}
</style>
