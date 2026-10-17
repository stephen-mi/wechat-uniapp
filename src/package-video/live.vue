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
      <ezplayer
        v-if="accessToken && ezUrl"
        id="ezplayer"
        class="player__video"
        :accessToken="accessToken"
        :url="ezUrl"
        @handleError="onEzplayerError"
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
        <!-- 宫格切换暂不使用
        <u-icon name="grid" size="20" color="#fff" @click="toastCtrl('宫格')" />
        -->
        <u-icon name="scan" size="20" color="#fff" @click="toggleFullscreen" />
        <view class="player__quality" @click="reloadStream">刷新</view>
      </view>
    </view>

    <view class="ptz-panel">
      <view class="ptz-side ptz-side--left">
        <view
          class="ptz-round-btn"
          :class="{ 'ptz-round-btn--active': holding === 'zoomIn' }"
          @touchstart.stop="ptzStart('zoomIn')"
          @touchend.stop="ptzStop"
          @touchcancel.stop="ptzStop"
        >
          <u-icon name="plus" size="22" color="#fff" />
        </view>
      </view>
      <view class="ptz-pad">
        <view class="ptz-pad__ring">
          <view
            class="ptz-arrow ptz-arrow--up"
            :class="{ 'ptz-arrow--active': holding === 'up' }"
            @touchstart.stop="ptzStart('up')"
            @touchend.stop="ptzStop"
            @touchcancel.stop="ptzStop"
          >
            <u-icon name="arrow-up" size="18" :color="holding === 'up' ? '#23c993' : '#666'" />
          </view>
          <view
            class="ptz-arrow ptz-arrow--down"
            :class="{ 'ptz-arrow--active': holding === 'down' }"
            @touchstart.stop="ptzStart('down')"
            @touchend.stop="ptzStop"
            @touchcancel.stop="ptzStop"
          >
            <u-icon name="arrow-down" size="18" :color="holding === 'down' ? '#23c993' : '#666'" />
          </view>
          <view
            class="ptz-arrow ptz-arrow--left"
            :class="{ 'ptz-arrow--active': holding === 'left' }"
            @touchstart.stop="ptzStart('left')"
            @touchend.stop="ptzStop"
            @touchcancel.stop="ptzStop"
          >
            <u-icon name="arrow-left" size="18" :color="holding === 'left' ? '#23c993' : '#666'" />
          </view>
          <view
            class="ptz-arrow ptz-arrow--right"
            :class="{ 'ptz-arrow--active': holding === 'right' }"
            @touchstart.stop="ptzStart('right')"
            @touchend.stop="ptzStop"
            @touchcancel.stop="ptzStop"
          >
            <u-icon name="arrow-right" size="18" :color="holding === 'right' ? '#23c993' : '#666'" />
          </view>
          <view class="ptz-pad__center" @touchend.stop="ptzStop" />
        </view>
      </view>
      <view class="ptz-side ptz-side--right">
        <view
          class="ptz-round-btn"
          :class="{ 'ptz-round-btn--active': holding === 'zoomOut' }"
          @touchstart.stop="ptzStart('zoomOut')"
          @touchend.stop="ptzStop"
          @touchcancel.stop="ptzStop"
        >
          <u-icon name="minus" size="22" color="#fff" />
        </view>
        <view
          class="ptz-round-btn"
          :class="{ 'ptz-round-btn--active': playbackMode }"
          @click="togglePlayback"
        >
          <u-icon name="clock" size="26" color="#fff" />
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, getCurrentInstance, ref } from 'vue'
import { onLoad, onUnload } from '@dcloudio/uni-app'
import { ptzControl, getEncodeType, setEncodeType } from '@/api/video/camera'
import { useNavLayout } from '@/composables/useNavLayout'
import {
  PTZ_COMMAND_MAP,
  buildEzplayerLiveUrl,
  buildEzplayerRecUrl,
  loadEzvizLiveSession,
  readPtzSupport,
  type EzvizLiveSession
} from '@/utils/ezviz-live'

const nav = useNavLayout()

const cameraId = ref('')
const numericCameraId = ref(0)
const cameraName = ref('1#楼球机')
const defaultCover = '/static/images/default.jpg'
const coverDisplay = ref(defaultCover)

const streamLoading = ref(false)
const streamHint = ref('')
const session = ref<EzvizLiveSession | null>(null)
const accessToken = ref('')
const ezUrl = ref('')
const muted = ref(true)
const paused = ref(false)
const fullscreen = ref(false)
const playbackMode = ref(false)
const ptzSupport = ref<'yes' | 'no' | 'unknown'>('unknown')
const holding = ref('')
let encodeSwitched = false
let retryTimer: ReturnType<typeof setTimeout> | null = null
let ptzRepeat: ReturnType<typeof setInterval> | null = null
let ptzBusy = false

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
  clearRetry()
  ptzStop()
  ezUrl.value = ''
})

function clearRetry(): void {
  if (retryTimer) {
    clearTimeout(retryTimer)
    retryTimer = null
  }
}

function readEncodeType(raw: unknown): number | null {
  if (typeof raw === 'number' && Number.isFinite(raw)) return raw
  if (typeof raw === 'string' && raw !== '' && Number.isFinite(Number(raw))) return Number(raw)
  if (raw && typeof raw === 'object' && 'encodeType' in raw) {
    return readEncodeType((raw as { encodeType?: unknown }).encodeType)
  }
  return null
}

function isNonH264Error(error: unknown): boolean {
  const text = typeof error === 'string' ? error : JSON.stringify(error ?? '')
  return /H\.?264|H\.?265|编码|2101|2102/.test(text)
}

async function switchEncodeAndWait(id: number): Promise<boolean> {
  if (!id || encodeSwitched) return false
  encodeSwitched = true
  ezUrl.value = ''
  streamHint.value = '当前编码不是 H.264，正在切换…'
  try {
    await setEncodeType(id, 0)
  } catch (error) {
    console.error('[ezviz-live] set encode', error)
    streamHint.value = '切换 H.264 失败，请在设备上改为 H.264 后点刷新'
    return true
  }
  streamHint.value = '已切换为 H.264，设备重启约 40 秒后自动重试'
  clearRetry()
  retryTimer = setTimeout(() => {
    void reloadStream()
  }, 40000)
  return true
}

function parseCameraId(raw: string): number | null {
  const id = Number(raw)
  return Number.isFinite(id) && id > 0 ? id : null
}

async function reloadStream(): Promise<void> {
  clearRetry()
  const id = numericCameraId.value || parseCameraId(cameraId.value)
  if (!id) {
    streamHint.value = '摄像头 ID 无效'
    return
  }
  numericCameraId.value = id
  streamLoading.value = true
  streamHint.value = ''
  accessToken.value = ''
  ezUrl.value = ''
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
    ptzSupport.value = readPtzSupport(loaded.camera)
    playbackMode.value = false

    if (loaded.camera.status === 0) {
      streamHint.value = '设备离线'
      return
    }

    if (!loaded.accessToken || !loaded.deviceSerial) {
      streamHint.value = '未获取到萤石设备信息'
      return
    }

    accessToken.value = loaded.accessToken
    ezUrl.value = buildEzplayerLiveUrl(playerSource(loaded))
    console.info('[ezplayer]', {
      deviceSerial: loaded.deviceSerial,
      channelNo: loaded.channelNo,
      url: ezUrl.value
    })
  } catch (error) {
    console.error('[ezviz-live] load failed', error)
    streamHint.value = '获取视频流失败'
  } finally {
    streamLoading.value = false
  }
}

interface EzPlayerHandle {
  fullScreen?: (options?: { direction?: number }) => void
  cancelFullScreen?: () => void
  exitFullScreen?: () => void
  requestFullScreen?: (options?: { direction?: number }) => void
  openSound?: () => void
  closeSound?: () => void
}

const pageProxy = getCurrentInstance()?.proxy as
  | { $scope?: { selectComponent?: (selector: string) => EzPlayerHandle | null } }
  | undefined

function getEzplayer(): EzPlayerHandle | null {
  const fromScope = pageProxy?.$scope?.selectComponent?.('#ezplayer')
  if (fromScope) return fromScope
  const pages = getCurrentPages() as Array<{
    selectComponent?: (selector: string) => EzPlayerHandle | null
  }>
  const page = pages[pages.length - 1]
  return page?.selectComponent?.('#ezplayer') ?? null
}

function callPlayer(names: string[], arg?: unknown): boolean {
  const player = getEzplayer() as Record<string, unknown> | null
  if (!player) return false
  for (const name of names) {
    const fn = player[name]
    if (typeof fn !== 'function') continue
    try {
      fn.call(player, arg)
      return true
    } catch (error) {
      console.error('[ezplayer]', name, error)
    }
  }
  return false
}

function playerSource(loaded: EzvizLiveSession) {
  return {
    deviceSerial: loaded.deviceSerial,
    channelNo: loaded.channelNo,
    playUrl: loaded.playUrl,
    rawPlayUrl: loaded.rawPlayUrl
  }
}

function showLive(): void {
  const loaded = session.value
  if (!loaded) return
  playbackMode.value = false
  paused.value = false
  streamHint.value = ''
  ezUrl.value = buildEzplayerLiveUrl(playerSource(loaded))
}

function toggleMute(): void {
  if (!ezUrl.value) {
    uni.showToast({ title: '请先播放视频', icon: 'none' })
    return
  }
  muted.value = !muted.value
  const opened = muted.value
    ? callPlayer(['closeSound'])
    : callPlayer(['openSound'])
  if (!opened) {
    muted.value = !muted.value
    uni.showToast({ title: '播放器声音控制失败', icon: 'none' })
  }
}

function toggleFullscreen(): void {
  if (!ezUrl.value) {
    uni.showToast({ title: '请先播放视频', icon: 'none' })
    return
  }
  if (fullscreen.value) {
    const closed = callPlayer(['cancelFullScreen', 'exitFullScreen'])
    if (closed) fullscreen.value = false
    return
  }
  const opened = callPlayer(['fullScreen', 'requestFullScreen'], { direction: 90 })
  if (!opened) {
    uni.showToast({ title: '当前播放器暂不支持全屏', icon: 'none' })
    return
  }
  fullscreen.value = true
}

function togglePause(): void {
  if (!session.value || !accessToken.value) {
    uni.showToast({ title: '请先播放视频', icon: 'none' })
    return
  }
  paused.value = !paused.value
  if (paused.value) {
    ezUrl.value = ''
    return
  }
  if (playbackMode.value) {
    const recUrl = buildEzplayerRecUrl(playerSource(session.value))
    streamHint.value = ''
    ezUrl.value = recUrl
    return
  }
  showLive()
}

function togglePlayback(): void {
  const loaded = session.value
  if (!loaded?.deviceSerial || !accessToken.value) {
    uni.showToast({ title: '请先播放视频', icon: 'none' })
    return
  }
  if (playbackMode.value) {
    showLive()
    uni.showToast({ title: '已回到直播', icon: 'none' })
    return
  }
  const recUrl = buildEzplayerRecUrl(playerSource(loaded))
  if (!recUrl) return
  playbackMode.value = true
  paused.value = false
  streamHint.value = ''
  ezUrl.value = recUrl
  uni.showToast({ title: '正在回放今日录像', icon: 'none' })
}

async function onPlayerCodecError(error: unknown, fallback: string): Promise<void> {
  ezUrl.value = ''
  if (encodeSwitched) {
    streamHint.value = isNonH264Error(error) ? '设备仍在重启，请稍候再点刷新' : fallback
    return
  }
  if (!isNonH264Error(error)) {
    try {
      const encodeType = readEncodeType(await getEncodeType(numericCameraId.value))
      if (encodeType !== 1) {
        streamHint.value = fallback
        return
      }
    } catch {
      streamHint.value = fallback
      return
    }
  }
  await switchEncodeAndWait(numericCameraId.value)
}

function onEzplayerError(error: unknown): void {
  console.error('[ezplayer]', error)
  const text = typeof error === 'string' ? error : JSON.stringify(error ?? '')
  if (/no permission/i.test(text)) {
    ezUrl.value = ''
    streamHint.value = '开发者工具无法播放该流，请用真机预览'
    return
  }
  void onPlayerCodecError(error, '直播播放失败')
}

function goBack(): void {
  uni.navigateBack()
}

function toastSwitch(): void {
  uni.showToast({ title: '切换摄像机', icon: 'none' })
}

function ptzStop(): void {
  holding.value = ''
  if (ptzRepeat) {
    clearInterval(ptzRepeat)
    ptzRepeat = null
  }
}

async function sendPtz(action: string): Promise<void> {
  const command = PTZ_COMMAND_MAP[action]
  const id = numericCameraId.value
  if (command === undefined || !id || ptzBusy || holding.value !== action) return
  ptzBusy = true
  try {
    await ptzControl(id, command, 4)
  } catch (error) {
    console.error('[ezviz-ptz]', error)
    uni.showToast({ title: '云台控制失败', icon: 'none' })
    ptzStop()
  } finally {
    ptzBusy = false
  }
}

function ptzStart(action: string): void {
  if (holding.value) return
  if (!session.value || !accessToken.value) {
    uni.showToast({ title: '请先播放视频', icon: 'none' })
    return
  }
  if (ptzSupport.value === 'no') {
    uni.showToast({ title: '该设备不支持云台', icon: 'none' })
    return
  }
  if (PTZ_COMMAND_MAP[action] === undefined) return
  if (playbackMode.value || paused.value || !ezUrl.value) {
    showLive()
  }
  holding.value = action
  void sendPtz(action)
  ptzRepeat = setInterval(() => {
    if (holding.value === action) void sendPtz(action)
  }, 900)
}
</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: linear-gradient(180deg, #3dcf9e 0%, #c8f0e2 45%, #e7f6f0 100%);
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

  &--active {
    background: #23c993;
  }
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
  background: linear-gradient(135deg, #5ed9b0, #23c993);
}

.ptz-arrow {
  position: absolute;
  width: 56rpx;
  height: 56rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;

  &--active {
    background: rgba(35, 201, 147, 0.16);
  }

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
