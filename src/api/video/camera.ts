import request from '@/utils/request'
import type { ApiEnvelope } from '@/utils/http/types'

/** 与 site-flow-web `CameraVO` 对齐 */
export interface CameraVO {
  id?: number
  name: string
  deptId?: number
  deptName?: string
  type?: number
  serialNo?: string
  channelNo?: number | string
  verificationCode?: string
  videoUrl?: string
  picUrl?: string
  status?: number
  sort?: number
  remark?: string
  capabilities?: string
  supportPtz?: boolean
  supportPtz3d?: boolean
  supportTalk?: boolean
  supportDefence?: boolean
  supportPrivacy?: boolean
  ptzTopBottom?: boolean
  ptzLeftRight?: boolean
  ptzZoom?: boolean
  ptzPreset?: boolean
  createTime?: string
}

/** 回放 / 部分直播场景下后端一并返回的萤石参数（与 Web 一致） */
export interface PlaybackInfo {
  accessToken: string
  playbackUrl: string
  deviceSerial: string
  channelNo: string
}

async function unwrap<T>(promise: Promise<ApiEnvelope<T>>): Promise<T> {
  const res = await promise
  return res.data as T
}

export function getCamera(id: number) {
  return unwrap<CameraVO>(
    request({
      url: '/video/camera/get',
      method: 'GET',
      params: { id }
    })
  )
}

/** 直播流地址（Web 端 `getCameraVideoUrl`） */
export function getCameraVideoUrl(id: number) {
  return unwrap<string>(
    request({
      url: '/video/camera/video-url',
      method: 'GET',
      params: { id }
    })
  )
}

/** 含 accessToken、deviceSerial、channelNo（Web 端回放切换时使用，亦可补全 Token） */
export function getCameraPlaybackInfo(id: number, startTime = '', endTime = '') {
  return unwrap<PlaybackInfo>(
    request({
      url: '/video/camera/playback-url',
      method: 'GET',
      params: { id, startTime, endTime }
    })
  )
}

/** 云台控制：command 见萤石文档，action 与 Web 监控页一致使用 4（中等速度） */
export function ptzControl(cameraId: number, command: number, action: number) {
  return unwrap<unknown>(
    request({
      url: '/video/camera/ptz-control',
      method: 'POST',
      data: { cameraId, command, action }
    })
  )
}

/** ezopen 无法直放时，尝试后端转换的小程序可播地址 */
export function getEziotLiveUrl(deviceSerial: string, channelNo: number) {
  return unwrap<string>(
    request({
      url: '/video/eziot/live-url',
      method: 'GET',
      params: { deviceSerial, channelNo }
    })
  )
}
