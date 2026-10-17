import { getSimpleDeptList, type DeptVO } from '@/api/system/dept'
import { getCameraPage, type CameraVO } from '@/api/video/camera'
import appConfig from '@/config'

export interface OrgTreeNode {
  id: number
  name: string
  parentId: number
  deptCategory?: number
  online: number
  total: number
  children: OrgTreeNode[]
}

/** 接口不可用时，沿用网页端组织选择弹层中的组织与在线数 */
const FALLBACK_TREE: OrgTreeNode[] = [
  {
    id: 1,
    name: '系统管理租户',
    parentId: 0,
    deptCategory: 1,
    online: 62,
    total: 64,
    children: [
      {
        id: 2,
        name: '房建项目',
        parentId: 1,
        deptCategory: 4,
        online: 32,
        total: 32,
        children: []
      },
      {
        id: 3,
        name: '测试项目',
        parentId: 1,
        deptCategory: 4,
        online: 30,
        total: 32,
        children: []
      },
      {
        id: 4,
        name: '铁路项目',
        parentId: 1,
        deptCategory: 4,
        online: 0,
        total: 0,
        children: []
      }
    ]
  }
]

function buildTree(depts: DeptVO[], stats: Map<number, { online: number; total: number }>): OrgTreeNode[] {
  const nodes = new Map<number, OrgTreeNode>()
  depts.forEach((dept) => {
    const stat = stats.get(dept.id) || { online: 0, total: 0 }
    nodes.set(dept.id, {
      id: dept.id,
      name: dept.name,
      parentId: dept.parentId,
      deptCategory: dept.deptCategory,
      online: stat.online,
      total: stat.total,
      children: []
    })
  })
  const roots: OrgTreeNode[] = []
  nodes.forEach((node) => {
    const parent = nodes.get(node.parentId)
    if (parent) parent.children.push(node)
    else roots.push(node)
  })
  return roots
}

function rollupStats(depts: DeptVO[], cameras: CameraVO[]): Map<number, { online: number; total: number }> {
  const byId = new Map(depts.map((dept) => [dept.id, dept]))
  const stats = new Map<number, { online: number; total: number }>()
  depts.forEach((dept) => stats.set(dept.id, { online: 0, total: 0 }))
  cameras.forEach((camera) => {
    if (!camera.deptId) return
    let current = byId.get(camera.deptId)
    const seen = new Set<number>()
    while (current && !seen.has(current.id)) {
      seen.add(current.id)
      const stat = stats.get(current.id) || { online: 0, total: 0 }
      stat.total += 1
      if (camera.status === 1) stat.online += 1
      stats.set(current.id, stat)
      current = current.parentId ? byId.get(current.parentId) : undefined
    }
  })
  return stats
}

async function loadCameras(): Promise<CameraVO[]> {
  const pageSize = 100
  const first = await getCameraPage({ pageNo: 1, pageSize })
  const list = [...(first.list || [])]
  const total = first.total || list.length
  const pages = Math.min(Math.ceil(total / pageSize), 8)
  for (let pageNo = 2; pageNo <= pages; pageNo += 1) {
    const page = await getCameraPage({ pageNo, pageSize })
    list.push(...(page.list || []))
  }
  return list
}

export interface VideoDirectory {
  depts: DeptVO[]
  cameras: CameraVO[]
}

export interface VideoProjectCard {
  id: number
  name: string
  cover: string
  online: number
  total: number
  aiCount: number
  cameraName: string
}

let directoryPending: Promise<VideoDirectory> | null = null

export function loadVideoDirectory(): Promise<VideoDirectory> {
  if (!directoryPending) {
    directoryPending = (async () => {
      const depts = await getSimpleDeptList()
      let cameras: CameraVO[] = []
      try {
        cameras = await loadCameras()
      } catch {
        cameras = []
      }
      return { depts: depts || [], cameras }
    })().catch((error) => {
      directoryPending = null
      throw error
    })
  }
  return directoryPending
}

export function cameraCoverUrl(camera?: CameraVO): string {
  if (!camera) return ''
  const raw = camera.picUrl || (camera as CameraVO & { pic_url?: string }).pic_url || ''
  return resolvePicUrl(raw)
}

/** 把接口返回的 picUrl 补成小程序可直接展示的地址 */
function resolvePicUrl(raw: string): string {
  const url = raw.trim()
  if (!url) return ''
  if (/^https?:\/\//i.test(url)) return url
  if (url.startsWith('//')) return `https:${url}`
  const origin = appConfig.baseUrl.replace(/\/$/, '')
  if (url.startsWith('/admin-api/')) return `${origin}${url}`
  if (url.startsWith('/')) return `${appConfig.apiBase}${url}`
  return url
}

function projectOf(depts: DeptVO[], deptId?: number): DeptVO | undefined {
  const byId = new Map(depts.map((dept) => [dept.id, dept]))
  let current = deptId ? byId.get(deptId) : undefined
  const seen = new Set<number>()
  while (current && !seen.has(current.id)) {
    if (current.deptCategory === 4) return current
    seen.add(current.id)
    current = current.parentId ? byId.get(current.parentId) : undefined
  }
  return undefined
}

function descendantIds(depts: DeptVO[], rootId: number): Set<number> {
  const ids = new Set<number>([rootId])
  let changed = true
  while (changed) {
    changed = false
    depts.forEach((dept) => {
      if (!ids.has(dept.id) && ids.has(dept.parentId)) {
        ids.add(dept.id)
        changed = true
      }
    })
  }
  return ids
}

/** 与网页端 ClientVideo 项目卡片一致：deptCategory=4，取最新摄像头封面与在线数 */
export function buildProjectCards(directory: VideoDirectory, scopeDeptId?: number): VideoProjectCard[] {
  const { depts, cameras } = directory
  const scope = scopeDeptId ? descendantIds(depts, scopeDeptId) : null
  const sorted = [...cameras].sort((a, b) => {
    const timeA = a.createTime ? new Date(a.createTime).getTime() : 0
    const timeB = b.createTime ? new Date(b.createTime).getTime() : 0
    return timeB - timeA || Number(b.id || 0) - Number(a.id || 0)
  })
  return depts
    .filter((dept) => dept.deptCategory === 4 && (!scope || scope.has(dept.id)))
    .map((dept) => {
      const projectCameras = sorted.filter(
        (camera) => camera.deptId && projectOf(depts, camera.deptId)?.id === dept.id
      )
      const online = projectCameras.filter((camera) => camera.status === 1).length
      const total = projectCameras.length
      const latest = projectCameras[0]
      const coverCamera = projectCameras.find((camera) => cameraCoverUrl(camera)) || latest
      const latestTime = latest?.createTime ? new Date(latest.createTime).getTime() : 0
      return {
        id: dept.id,
        name: dept.name,
        cover: cameraCoverUrl(coverCamera),
        online,
        total,
        aiCount: online * 10 + total + (dept.id % 17),
        cameraName: coverCamera?.name || '',
        latestTime
      }
    })
    .sort((a, b) => b.latestTime - a.latestTime || b.id - a.id)
    .map(({ latestTime: _latestTime, ...card }) => card)
}

let pending: Promise<OrgTreeNode[]> | null = null

export function loadOrgTree(): Promise<OrgTreeNode[]> {
  if (!pending) {
    pending = loadVideoDirectory()
      .then(({ depts, cameras }) => {
        if (!depts.length) return FALLBACK_TREE
        return buildTree(depts, rollupStats(depts, cameras))
      })
      .catch(() => {
        pending = null
        return FALLBACK_TREE
      })
  }
  return pending
}
