export interface MapProjectMarker {
  id: string
  name: string
  orgName: string
  address: string
  latitude: number
  longitude: number
  cover: string
}

/** 北京大兴附近示例坐标 */
export const mapProjects: MapProjectMarker[] = [
  {
    id: 'p2',
    name: '某河通道治理项目',
    orgName: 'AI视频监控演示',
    address: '北京市大兴区清源街道滨河西里(盛芳茗苑东北)滨河西里(丽园路)',
    latitude: 39.7523,
    longitude: 116.3312,
    cover: '/static/images/default.jpg'
  },
  {
    id: 'p4',
    name: '某大学宿舍项目',
    orgName: 'AI视频监控演示',
    address: '北京市大兴区',
    latitude: 39.735,
    longitude: 116.35,
    cover: '/static/images/default.jpg'
  },
  {
    id: 'p6',
    name: '某苑建筑项目',
    orgName: 'AI视频监控演示',
    address: '北京市房山区',
    latitude: 39.71,
    longitude: 116.28,
    cover: '/static/images/default.jpg'
  }
]

export const defaultMapCenter = {
  latitude: 39.74,
  longitude: 116.32
}
