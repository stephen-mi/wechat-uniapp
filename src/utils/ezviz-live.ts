import {
  getCamera,
  getCameraPlaybackInfo,
  getCameraVideoUrl,
  getEziotLiveUrl,
  type CameraVO
} from '@/api/video/camera'

export interface EzvizLiveSession {
  cameraId: number
  camera: CameraVO
  accessToken: string
  deviceSerial: string
  channelNo: number
  /** 原始地址（可能是 ezopen / hls / rtmp） */
  rawPlayUrl: string
  /** 小程序 `<live-player>` / `<video>` 可用的地址 */
  playUrl: string
}

const EZOPEN_PATH = /^ezopen:\/\/[^/]+\/([^/]+)\/(\d+)\./i

export function extractAccessTokenFromUrl(url: string): string {
  const match = url.match(/accessToken=([^&]+)/i)
  return match ? decodeURIComponent(match[1]) : ''
}

export function parseEzopenIdentity(url: string): { deviceSerial: string; channelNo: number } | null {
  const match = url.match(EZOPEN_PATH)
  if (!match) return null
  return { deviceSerial: match[1], channelNo: Number(match[2]) || 1 }
}

export function resolveChannelNo(camera: CameraVO, fallback = 1): number {
  if (camera.channelNo !== undefined && camera.channelNo !== null && camera.channelNo !== '') {
    const n = Number(camera.channelNo)
    return Number.isFinite(n) && n > 0 ? n : fallback
  }
  return fallback
}

export function hasPtzCapability(camera: CameraVO): boolean {
  return readPtzSupport(camera) === 'yes'
}

/** 能力集未上报时视为未知，仍允许对当前播放设备下发云台 */
export function readPtzSupport(camera: CameraVO): 'yes' | 'no' | 'unknown' {
  if (camera.supportPtz === true) return 'yes'
  if (camera.supportPtz === false) return 'no'
  if (!camera.capabilities) return 'unknown'
  try {
    const abilities = JSON.parse(camera.capabilities) as { support_ptz?: number | null }
    if (abilities.support_ptz === 0) return 'no'
    if (abilities.support_ptz !== null && abilities.support_ptz !== undefined) return 'yes'
  } catch {
    return 'unknown'
  }
  return 'unknown'
}

export type MiniprogramPlayerKind = 'live' | 'video' | 'none'

export function detectMiniprogramPlayerKind(url: string): MiniprogramPlayerKind {
  if (!url) return 'none'
  const lower = url.toLowerCase()
  if (lower.startsWith('rtmp:')) return 'live'
  if (lower.includes('.flv')) return 'live'
  if (lower.includes('.m3u8') || lower.includes('.mp4')) return 'video'
  if (lower.startsWith('http://') || lower.startsWith('https://')) return 'video'
  return 'none'
}

async function resolvePlayUrlForMiniprogram(
  rawUrl: string,
  deviceSerial: string,
  channelNo: number
): Promise<string> {
  if (detectMiniprogramPlayerKind(rawUrl) !== 'none') {
    return rawUrl
  }
  if (!rawUrl.toLowerCase().startsWith('ezopen://')) {
    return rawUrl
  }
  try {
    return await getEziotLiveUrl(deviceSerial, channelNo)
  } catch {
    return rawUrl
  }
}

/**
 * 拉取直播所需萤石字段，流程对齐 Web：
 * 1. 摄像头详情（serialNo / channelNo / 能力集）
 * 2. `/video/camera/video-url` 直播地址
 * 3. 必要时从 URL 或 `/video/camera/playback-url` 补全 accessToken
 */
export async function loadEzvizLiveSession(cameraId: number): Promise<EzvizLiveSession> {
  const camera = await getCamera(cameraId)
  const rawPlayUrl = await getCameraVideoUrl(cameraId)

  let accessToken = extractAccessTokenFromUrl(rawPlayUrl)
  let deviceSerial = camera.serialNo ?? ''
  let channelNo = resolveChannelNo(camera)

  const fromEzopen = parseEzopenIdentity(rawPlayUrl)
  if (fromEzopen) {
    if (!deviceSerial) deviceSerial = fromEzopen.deviceSerial
    if (!camera.channelNo) channelNo = fromEzopen.channelNo
  }

  if (!accessToken || !deviceSerial) {
    try {
      const playback = await getCameraPlaybackInfo(cameraId, '', '')
      if (!accessToken && playback.accessToken) {
        accessToken = playback.accessToken
      }
      if (!deviceSerial && playback.deviceSerial) {
        deviceSerial = playback.deviceSerial
      }
      if (!camera.channelNo && playback.channelNo) {
        const n = Number(playback.channelNo)
        if (Number.isFinite(n) && n > 0) channelNo = n
      }
    } catch {
      // 直播场景可能无回放信息，忽略
    }
  }

  const playUrl = await resolvePlayUrlForMiniprogram(rawPlayUrl, deviceSerial, channelNo)

  return {
    cameraId,
    camera,
    accessToken,
    deviceSerial,
    channelNo,
    rawPlayUrl,
    playUrl
  }
}

/** ezplayer 内部用 live-player，只接受 RTMP。ezopen 会在真机直接播放失败。 */
export function buildEzplayerLiveUrl(
  session: Pick<EzvizLiveSession, 'deviceSerial' | 'channelNo' | 'playUrl' | 'rawPlayUrl'>
): string {
  const candidates = [session.playUrl, session.rawPlayUrl]
  for (const item of candidates) {
    const url = (item || '').trim()
    if (url.toLowerCase().startsWith('rtmp://')) return url
  }
  if (session.deviceSerial) {
    const channel = session.channelNo > 0 ? session.channelNo : 1
    return `rtmp://open.ys7.com/${session.deviceSerial}/${channel}/live`
  }
  return ''
}

/** 同一设备的 RTMP 回放地址 */
export function buildEzplayerRecUrl(
  session: Pick<EzvizLiveSession, 'deviceSerial' | 'channelNo'>
): string {
  if (!session.deviceSerial) return ''
  const channel = session.channelNo > 0 ? session.channelNo : 1
  return `rtmp://open.ys7.com/${session.deviceSerial}/${channel}/playback`
}

/** Web 端 `ClientCameraCard` / 监控页 PTZ 命令映射 */
export const PTZ_COMMAND_MAP: Record<string, number> = {
  up: 0,
  down: 1,
  left: 2,
  right: 3,
  upLeft: 4,
  downLeft: 5,
  upRight: 6,
  downRight: 7,
  zoomIn: 8,
  zoomOut: 9
}
