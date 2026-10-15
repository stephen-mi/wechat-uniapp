/**
 * 工长助手 TASK API
 * 路径对齐原 PMP：/pmp/api/site-compass-assistant-foreman/v1/*
 * 当前后端未接入时走 mock，USE_MOCK=false 后直连真实接口。
 */
import request from '@/utils/request'
import type { ApiEnvelope } from '@/utils/http/types'
import {
  mockAlbumDayGroups,
  mockAlbumGroups,
  mockBuildings,
  mockDrawings,
  mockFloors,
  mockGraphicProgress,
  mockItemProcedures,
  mockProfessionalNames,
  mockRooms,
  mockStructuredPhotos,
  mockTaskRecords,
  mockTransferList,
  mockTransferScopes
} from '@/mock/task'
import type {
  AlbumGroupItem,
  AlbumPhotoDayGroup,
  GraphicProgressRow,
  TaskBuilding,
  TaskDrawing,
  TaskFloor,
  TaskItemProcedure,
  TaskKeyStep,
  TaskProfessionalName,
  TaskRecordMessage,
  TaskRoom,
  TaskStructuredPhoto,
  TaskViewTokenResult,
  WorkTransferCard,
  WorkTransferScope
} from './types'

const USE_MOCK = true
const BASE = '/pmp/api/site-compass-assistant-foreman/v1'

async function unwrap<T>(promise: Promise<ApiEnvelope<T>>): Promise<T> {
  const res = await promise
  return res.data as T
}

function clone<T>(data: T): T {
  return JSON.parse(JSON.stringify(data)) as T
}

function delay<T>(data: T, ms = 180): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(clone(data)), ms))
}

/** 内存态 mock：完成/取消步骤时就地更新 */
const runtimeProcedures = clone(mockItemProcedures)
const runtimeRecords = clone(mockTaskRecords)
const runtimePhotos = clone(mockStructuredPhotos)
const runtimeTransfers = clone(mockTransferList)
const runtimeScopes = clone(mockTransferScopes)

export function getBuildings(_deptId?: string) {
  if (USE_MOCK) return delay(mockBuildings)
  return unwrap<TaskBuilding[]>(
    request({
      url: `${BASE}/Building/all`,
      method: 'GET',
      params: { 'dept._id': _deptId, sort: 'name,asc' }
    })
  )
}

export function getFloors(params: {
  deptId: string
  buildingId: string
  stageCode: number
  builtForm?: string
}) {
  if (USE_MOCK) return delay(mockFloors)
  return unwrap<TaskFloor[]>(
    request({
      url: `${BASE}/Floors/all`,
      method: 'GET',
      params: {
        'dept._id': params.deptId,
        buildingId: params.buildingId,
        sort: 'orderNo,desc',
        stageCode: params.stageCode,
        builtForm: params.builtForm
      }
    })
  )
}

export function getDrawingList(drawingIds: string[] = [], floorId?: string) {
  if (USE_MOCK) {
    const list = mockDrawings.filter((d) => {
      if (drawingIds.length) return drawingIds.includes(d._id)
      if (floorId) return d.floorIds.includes(floorId)
      return true
    })
    return delay(list)
  }
  const idSet = drawingIds.join(',')
  return unwrap<TaskDrawing[]>(
    request({
      url: `${BASE}/Drawings/all`,
      method: 'GET',
      params: { _id_set: idSet }
    })
  )
}

export function getViewToken(drawingId: string) {
  if (USE_MOCK) {
    const drawing = mockDrawings.find((d) => d._id === drawingId)
    const result: TaskViewTokenResult[] = [
      {
        viewToken: drawing?.viewToken || '',
        viewId: drawing?.viewId || '0',
        previewUrl: drawing?.previewUrl || ''
      }
    ]
    return delay(result)
  }
  return unwrap<TaskViewTokenResult[]>(
    request({
      url: `${BASE}/Drawings/getBimfaceViewtoken`,
      method: 'GET',
      params: { _id: drawingId }
    })
  )
}

export function getRooms(params: {
  deptId: string
  floorId: string
  stageCode: number
  source?: string
}) {
  if (USE_MOCK) return delay(mockRooms)
  return unwrap<TaskRoom[]>(
    request({
      url: `${BASE}/Room/all`,
      method: 'GET',
      params: {
        'dept._id': params.deptId,
        floorId: params.floorId,
        sort: 'name,asc',
        source: params.source ?? 'space',
        stageCode: params.stageCode
      }
    })
  )
}

export function getItemProcedure(params: { deptId: string; roomId: string; source?: string }) {
  if (USE_MOCK) return delay(runtimeProcedures)
  return unwrap<TaskItemProcedure[]>(
    request({
      url: `${BASE}/ItemProcedure/all`,
      method: 'GET',
      params: {
        'dept._id': params.deptId,
        roomId: params.roomId,
        source: params.source ?? 'space'
      }
    })
  )
}

export function getProfessionalProjects(params: {
  orgId: string
  buildingId: string
  stageCode: number
}) {
  if (USE_MOCK) return delay(mockProfessionalNames)
  return unwrap<TaskProfessionalName[]>(
    request({
      url: `${BASE}/ItemProcedure/queryAllNamesFloor`,
      method: 'GET',
      params: {
        'dept._id': params.orgId,
        buildingId: params.buildingId,
        stageCode: params.stageCode
      }
    })
  )
}

export function markTaskStatus(data: {
  keyTaskId: string
  status: 0 | 1
  roomId?: string
  itemProcedureId?: string
}) {
  if (USE_MOCK) {
    for (const item of runtimeProcedures) {
      const step = item.keySteps.find((s) => s._id === data.keyTaskId)
      if (step) {
        step.status = data.status
        if (data.status === 1) {
          step.percentage = 100
          step.finishDate = formatToday()
        } else {
          step.percentage = 0
          step.finishDate = undefined
        }
        break
      }
    }
    return delay({ success: true })
  }
  return unwrap(
    request({
      url: `${BASE}/ItemProcedure/markTaskStatus`,
      method: 'POST',
      data
    })
  )
}

export function batchMarkTaskStatus(data: Record<string, unknown>) {
  if (USE_MOCK) {
    for (const item of runtimeProcedures) {
      for (const step of item.keySteps) {
        step.status = 1
        step.percentage = 100
        step.finishDate = formatToday()
      }
    }
    return delay({ success: true })
  }
  return unwrap(
    request({
      url: `${BASE}/ItemProcedure/batchMarkTaskStatus`,
      method: 'POST',
      data
    })
  )
}

export function updateQuantity(data: { itemProcedureId: string; quantity: number }) {
  if (USE_MOCK) {
    const item = runtimeProcedures.find((p) => p._id === data.itemProcedureId)
    if (item) item.quantity = data.quantity
    return delay({ success: true })
  }
  return unwrap(
    request({
      url: `${BASE}/ItemProcedure/updateQuantity`,
      method: 'POST',
      data
    })
  )
}

export function savePercentageOfTask(id: string, data: { percentage: number }) {
  if (USE_MOCK) {
    for (const item of runtimeProcedures) {
      const step = item.keySteps.find((s) => s._id === id)
      if (step) {
        step.percentage = data.percentage
        if (data.percentage >= 100) {
          step.status = 1
          step.finishDate = formatToday()
        }
        break
      }
    }
    return delay({ success: true })
  }
  return unwrap(
    request({
      url: `${BASE}/KeyTask/${id}/updatePercentage`,
      method: 'POST',
      data
    })
  )
}

export function saveTimeOfTask(id: string, data: { finishDate: string }) {
  if (USE_MOCK) {
    for (const item of runtimeProcedures) {
      const step = item.keySteps.find((s) => s._id === id)
      if (step) {
        step.finishDate = data.finishDate
        break
      }
    }
    return delay({ success: true })
  }
  return unwrap(
    request({
      url: `${BASE}/KeyTask/${id}/updateTime`,
      method: 'POST',
      data
    })
  )
}

export function getPictureList(_params: Record<string, string | number | undefined>) {
  if (USE_MOCK) return delay(runtimePhotos)
  return unwrap<TaskStructuredPhoto[]>(
    request({
      url: `${BASE}/StructuredAlbum/all`,
      method: 'GET',
      params: _params
    })
  )
}

export function deleteSinglePicture(fileId: string) {
  if (USE_MOCK) {
    const idx = runtimePhotos.findIndex((p) => p.fileId === fileId)
    if (idx >= 0) runtimePhotos.splice(idx, 1)
    return delay({ success: true })
  }
  return unwrap(
    request({
      url: `${BASE}/StructuredAlbum/${fileId}/deleteByFileId`,
      method: 'DELETE'
    })
  )
}

export function uploadPictures(data: Record<string, unknown>) {
  if (USE_MOCK) {
    const photo: TaskStructuredPhoto = {
      _id: `p-${Date.now()}`,
      fileId: `f-${Date.now()}`,
      url: (data.localPath as string) || '/static/images/default.jpg',
      thumbnailUrl: (data.localPath as string) || '/static/images/default.jpg',
      createdDate: formatNow()
    }
    runtimePhotos.unshift(photo)
    return delay(photo)
  }
  return unwrap(
    request({
      url: `${BASE}/StructuredAlbum/batchSaveBySource`,
      method: 'POST',
      data
    })
  )
}

export function getTaskRecordUnreadCount(_params: Record<string, string | number | undefined>) {
  if (USE_MOCK) return delay(3)
  return unwrap<number>(
    request({
      url: `${BASE}/TaskRecord/getUnreadCount`,
      method: 'GET',
      params: _params
    })
  )
}

export function getTaskRecord(params: {
  buildingId: string
  stageCode: number
  floorId: string
  roomId?: string
  itemName?: string
  taskName?: string
  createdById?: string
}) {
  if (USE_MOCK) {
    const list = params.createdById
      ? runtimeRecords.filter((m) => m.type === 2 && m.createdByName === '张工长')
      : runtimeRecords
    return delay(list)
  }
  return unwrap<TaskRecordMessage[]>(
    request({
      url: `${BASE}/TaskRecord/all`,
      method: 'GET',
      params: {
        sort: 'createdDate,asc',
        buildingId: params.buildingId,
        stageCode: params.stageCode,
        floorId: params.floorId,
        roomId: params.roomId,
        itemName: params.itemName,
        taskName: params.taskName,
        'createdBy._id': params.createdById
      }
    })
  )
}

export function sendTaskRecord(data: {
  content: string
  type: 2
  buildingId: string
  stageCode: number
  floorId: string
  roomId?: string
}) {
  if (USE_MOCK) {
    const msg: TaskRecordMessage = {
      _id: `msg-${Date.now()}`,
      content: data.content,
      type: 2,
      createdDate: formatNow(),
      createdByName: '我'
    }
    runtimeRecords.push(msg)
    return delay(msg)
  }
  return unwrap(
    request({
      url: `${BASE}/TaskRecord/`,
      method: 'POST',
      data
    })
  )
}

export function setReadTaskRecord(data: Record<string, unknown>) {
  if (USE_MOCK) return delay({ success: true })
  return unwrap(
    request({
      url: `${BASE}/TaskRecord/readTaskRecord`,
      method: 'POST',
      data
    })
  )
}

export function getGraphicProgress(_params: Record<string, unknown>) {
  if (USE_MOCK) return delay(mockGraphicProgress)
  return unwrap<GraphicProgressRow[]>(
    request({
      url: `${BASE}/AssistantForemanFront/getTaskProgress`,
      method: 'POST',
      data: _params
    })
  )
}

export function getGraphicProgressFilter(params: Record<string, unknown>) {
  if (USE_MOCK) return delay(mockProfessionalNames)
  return unwrap(
    request({
      url: `${BASE}/ItemProcedure/queryAllNames`,
      method: 'GET',
      params
    })
  )
}

export function getWorkTransferList(params: { deptId: string; buildingId?: string }) {
  if (USE_MOCK) {
    const list = params.buildingId
      ? runtimeTransfers.filter((t) => t.buildingId === params.buildingId)
      : runtimeTransfers
    return delay(list)
  }
  return unwrap<WorkTransferCard[]>(
    request({
      url: `${BASE}/WorkTransfer/all`,
      method: 'GET',
      params: {
        'dept._id': params.deptId,
        sort: 'updatedDate,desc',
        buildingId: params.buildingId
      }
    })
  )
}

export function getTransferScopes(params: {
  transferId: string
  deptId: string
  buildingId: string
}) {
  if (USE_MOCK) return delay(runtimeScopes)
  return unwrap<WorkTransferScope[]>(
    request({
      url: `${BASE}/WorkTransferScope/getTransferScopes`,
      method: 'GET',
      params: {
        transferId: params.transferId,
        'dept._id': params.deptId,
        buildingId: params.buildingId
      }
    })
  )
}

export function finishTransfer(data: { transferId: string; scopeIds: string[] }) {
  if (USE_MOCK) {
    for (const scope of runtimeScopes) {
      if (data.scopeIds.includes(scope._id)) {
        scope.finished = true
        scope.checked = true
      }
    }
    const card = runtimeTransfers.find((t) => t._id === data.transferId)
    if (card) {
      card.finishedCount = runtimeScopes.filter((s) => s.finished).length
      if (card.finishedCount >= (card.totalCount || 0)) {
        card.status = 2
        card.statusText = '已完成'
      }
    }
    return delay({ success: true })
  }
  return unwrap(
    request({
      url: `${BASE}/WorkTransferScope/finishTransfer`,
      method: 'POST',
      data
    })
  )
}

export function fetchGroupAlbumList(_params: Record<string, unknown>) {
  if (USE_MOCK) return delay(mockAlbumGroups)
  return unwrap<AlbumGroupItem[]>(
    request({
      url: `${BASE}/StructuredAlbum/queryGroupAlbumList`,
      method: 'GET',
      params: _params
    })
  )
}

export function fetchPhotoList(_params: Record<string, unknown>) {
  if (USE_MOCK) return delay(mockAlbumDayGroups)
  return unwrap<AlbumPhotoDayGroup[]>(
    request({
      url: `${BASE}/StructuredAlbum/queryListGroupByDate`,
      method: 'GET',
      params: _params
    })
  )
}

export type { TaskKeyStep }

function formatToday(): string {
  const d = new Date()
  const m = `${d.getMonth() + 1}`.padStart(2, '0')
  const day = `${d.getDate()}`.padStart(2, '0')
  return `${d.getFullYear()}-${m}-${day}`
}

function formatNow(): string {
  const d = new Date()
  const date = formatToday()
  const h = `${d.getHours()}`.padStart(2, '0')
  const min = `${d.getMinutes()}`.padStart(2, '0')
  const s = `${d.getSeconds()}`.padStart(2, '0')
  return `${date} ${h}:${min}:${s}`
}
