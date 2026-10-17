/** 工长助手 / TASK 现场领域类型（对齐原 PMP 工长助手） */

export type TaskPerspective = '空间' | '专业'

export interface TaskStage {
  code: number
  desc: string
}

export interface TaskBuilding {
  _id: string
  name: string
  stageList: TaskStage[]
}

export interface TaskFloor {
  _id: string
  name: string
  orderNo?: number
  builtForm?: string
  type?: 'upper' | 'lower'
  tag?: boolean
  drawingIds?: string[]
}

export interface TaskDrawing {
  _id: string
  name: string
  suffix: 'dwg' | 'pdf' | 'rvt'
  viewToken: string
  viewId: string
  /** 图纸预览图（PDF/DWG 缩略图），用于任务页内嵌展示 */
  previewUrl?: string
  /** 原文件地址（本地 static 或远程 URL），PDF 可直接打开 */
  fileUrl?: string
  floorIds: string[]
}

export interface TaskViewTokenResult {
  viewToken: string
  viewId?: string
  previewUrl?: string
}

export interface TaskRoom {
  _id: string
  name: string
  tag?: boolean
  attachImages?: string[]
}

export interface TaskKeyStep {
  _id: string
  name: string
  status: 0 | 1
  percentage?: number
  finishDate?: string
  planDate?: string
  isWorkTransfer?: boolean
  workTransferStatus?: number
}

export interface TaskItemProcedure {
  _id: string
  name: string
  keySteps: TaskKeyStep[]
  quantity?: number
  detailMethod?: string
  stageCode?: number
}

export interface TaskProfessionalName {
  itemName: string
  taskName?: string
  label: string
}

export interface TaskRecordMessage {
  _id: string
  content: string
  type: 1 | 2
  createdDate: string
  createdByName?: string
  attachments?: Array<{ fileId: string; url?: string }>
}

export interface TaskStructuredPhoto {
  _id: string
  fileId: string
  url?: string
  thumbnailUrl?: string
  createdDate?: string
}

export interface GraphicProgressCell {
  floorId: string
  floorName: string
  stepId: string
  stepName: string
  status: 0 | 1 | 2
  percentage?: number
}

export interface GraphicProgressRow {
  floorId: string
  floorName: string
  cells: GraphicProgressCell[]
}

export interface WorkTransferCard {
  _id: string
  name: string
  buildingId: string
  buildingName: string
  status: number
  statusText: string
  fromTeam?: string
  toTeam?: string
  updatedDate?: string
  finishedCount?: number
  totalCount?: number
}

export interface WorkTransferScope {
  _id: string
  name: string
  floorId: string
  floorName: string
  finished: boolean
  checked?: boolean
}

export interface AlbumGroupItem {
  key: string
  title: string
  count: number
  cover?: string
  itemName?: string
  buildingId?: string
  stageCode?: number
}

export interface AlbumPhotoDayGroup {
  date: string
  photos: TaskStructuredPhoto[]
}
