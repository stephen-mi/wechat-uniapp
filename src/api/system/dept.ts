import request from '@/utils/request'
import type { ApiEnvelope } from '@/utils/http/types'

/** 对齐 site-flow-web：/system/dept/simple-list */
export interface DeptVO {
  id: number
  name: string
  parentId: number
  status?: number
  sort?: number
  deptCategory?: number
}

async function unwrap<T>(promise: Promise<ApiEnvelope<T>>): Promise<T> {
  const res = await promise
  return res.data as T
}

export function getSimpleDeptList(): Promise<DeptVO[]> {
  return unwrap(
    request<DeptVO[]>({
      url: '/system/dept/simple-list',
      method: 'GET'
    })
  )
}
