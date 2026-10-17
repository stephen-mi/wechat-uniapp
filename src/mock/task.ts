import config from '@/config'
import type {
  AlbumGroupItem,
  AlbumPhotoDayGroup,
  GraphicProgressRow,
  TaskBuilding,
  TaskDrawing,
  TaskFloor,
  TaskItemProcedure,
  TaskProfessionalName,
  TaskRecordMessage,
  TaskRoom,
  TaskStructuredPhoto,
  WorkTransferCard,
  WorkTransferScope
} from '@/api/task/types'

export const mockTaskOrgId = 'demo-org'

export const mockBuildings: TaskBuilding[] = [
  {
    _id: 'b1',
    name: '1#楼',
    stageList: [
      { code: 1, desc: '主体结构' },
      { code: 3, desc: '装饰装修' }
    ]
  },
  {
    _id: 'b2',
    name: '2#楼',
    stageList: [
      { code: 1, desc: '主体结构' },
      { code: 2, desc: '机电安装' }
    ]
  }
]

export const mockFloors: TaskFloor[] = [
  {
    _id: 'f3',
    name: '3F',
    orderNo: 3,
    type: 'upper',
    tag: true,
    drawingIds: ['d-f3-pdf', 'd-f3', 'd-f3s']
  },
  { _id: 'f2', name: '2F', orderNo: 2, type: 'upper', tag: false, drawingIds: ['d-f2'] },
  { _id: 'f1', name: '1F', orderNo: 1, type: 'upper', tag: false, drawingIds: ['d-f1'] },
  { _id: 'fb1', name: 'B1', orderNo: -1, type: 'lower', tag: false, drawingIds: ['d-fb1'] }
]

const demoToken = config.bimfaceDemoViewToken

export const mockDrawings: TaskDrawing[] = [
  {
    _id: 'd-f3-pdf',
    name: '3-LM-01',
    suffix: 'pdf',
    viewToken: '',
    viewId: '0',
    previewUrl: '/static/drawings/3-LM-01.png',
    fileUrl: '/static/drawings/3-LM-01.pdf',
    floorIds: ['f3']
  },
  {
    _id: 'd-f3',
    name: '3F 建筑平面图',
    suffix: 'dwg',
    viewToken: demoToken,
    viewId: '0',
    floorIds: ['f3']
  },
  {
    _id: 'd-f3s',
    name: '3F 结构平面图',
    suffix: 'dwg',
    viewToken: demoToken,
    viewId: '0',
    floorIds: ['f3']
  },
  {
    _id: 'd-f2',
    name: '2F 建筑平面图',
    suffix: 'dwg',
    viewToken: demoToken,
    viewId: '0',
    floorIds: ['f2']
  },
  {
    _id: 'd-f1',
    name: '1F 建筑平面图',
    suffix: 'dwg',
    viewToken: demoToken,
    viewId: '0',
    floorIds: ['f1']
  },
  {
    _id: 'd-fb1',
    name: 'B1 建筑平面图',
    suffix: 'dwg',
    viewToken: demoToken,
    viewId: '0',
    floorIds: ['fb1']
  }
]

export const mockRooms: TaskRoom[] = [
  { _id: 'r1', name: '客厅', tag: true },
  { _id: 'r2', name: '主卧', tag: false },
  { _id: 'r3', name: '次卧', tag: false },
  { _id: 'r4', name: '厨房', tag: true },
  { _id: 'r5', name: '卫生间', tag: false },
  { _id: 'r6', name: '阳台', tag: false }
]

export const mockItemProcedures: TaskItemProcedure[] = [
  {
    _id: 'ip1',
    name: '墙面抹灰',
    stageCode: 3,
    quantity: 120,
    detailMethod: '水泥砂浆抹灰，厚度 20mm',
    keySteps: [
      {
        _id: 'ks1',
        name: '基层处理',
        status: 1,
        percentage: 100,
        finishDate: '2026-10-10',
        planDate: '2026-10-10'
      },
      {
        _id: 'ks2',
        name: '冲筋贴饼',
        status: 1,
        percentage: 100,
        finishDate: '2026-10-12',
        planDate: '2026-10-12'
      },
      {
        _id: 'ks3',
        name: '抹灰找平',
        status: 0,
        percentage: 60,
        planDate: '2026-10-16'
      },
      {
        _id: 'ks4',
        name: '验收移交',
        status: 0,
        percentage: 0,
        planDate: '2026-10-18',
        isWorkTransfer: true,
        workTransferStatus: 0
      }
    ]
  },
  {
    _id: 'ip2',
    name: '地面找平',
    stageCode: 3,
    quantity: 85,
    detailMethod: '细石混凝土找平',
    keySteps: [
      {
        _id: 'ks5',
        name: '清理基层',
        status: 1,
        percentage: 100,
        finishDate: '2026-10-11',
        planDate: '2026-10-11'
      },
      {
        _id: 'ks6',
        name: '浇筑找平',
        status: 0,
        percentage: 30,
        planDate: '2026-10-15'
      },
      {
        _id: 'ks7',
        name: '养护验收',
        status: 0,
        percentage: 0,
        planDate: '2026-10-17'
      }
    ]
  }
]

export const mockProfessionalNames: TaskProfessionalName[] = [
  { itemName: '墙面抹灰', label: '墙面抹灰' },
  { itemName: '地面找平', label: '地面找平' },
  { itemName: '水电预埋', taskName: '给水', label: '水电预埋/-/给水' },
  { itemName: '水电预埋', taskName: '强电', label: '水电预埋/-/强电' }
]

export const mockTaskRecords: TaskRecordMessage[] = [
  {
    _id: 'msg1',
    content: '系统：关键步骤「基层处理」已完成',
    type: 1,
    createdDate: '2026-10-10 09:20:00',
    createdByName: '系统'
  },
  {
    _id: 'msg2',
    content: '客厅墙面抹灰冲筋已完成，请下午复核厚度。',
    type: 2,
    createdDate: '2026-10-12 14:08:00',
    createdByName: '张工长'
  },
  {
    _id: 'msg3',
    content: '收到，下午 3 点到场确认。',
    type: 2,
    createdDate: '2026-10-12 14:32:00',
    createdByName: '李监理'
  },
  {
    _id: 'msg4',
    content: '系统：关键步骤「冲筋贴饼」已完成',
    type: 1,
    createdDate: '2026-10-12 16:00:00',
    createdByName: '系统'
  }
]

export const mockStructuredPhotos: TaskStructuredPhoto[] = [
  {
    _id: 'p1',
    fileId: 'f-p1',
    url: '/static/images/default.jpg',
    thumbnailUrl: '/static/images/default.jpg',
    createdDate: '2026-10-12 15:20:00'
  },
  {
    _id: 'p2',
    fileId: 'f-p2',
    url: '/static/images/default.jpg',
    thumbnailUrl: '/static/images/default.jpg',
    createdDate: '2026-10-12 15:22:00'
  },
  {
    _id: 'p3',
    fileId: 'f-p3',
    url: '/static/images/default.jpg',
    thumbnailUrl: '/static/images/default.jpg',
    createdDate: '2026-10-13 10:05:00'
  }
]

export const mockGraphicProgress: GraphicProgressRow[] = mockFloors.map((floor) => ({
  floorId: floor._id,
  floorName: floor.name,
  cells: [
    {
      floorId: floor._id,
      floorName: floor.name,
      stepId: 'ks1',
      stepName: '基层处理',
      status: 1,
      percentage: 100
    },
    {
      floorId: floor._id,
      floorName: floor.name,
      stepId: 'ks2',
      stepName: '冲筋贴饼',
      status: floor._id === 'f3' ? 2 : 1,
      percentage: floor._id === 'f3' ? 60 : 100
    },
    {
      floorId: floor._id,
      floorName: floor.name,
      stepId: 'ks3',
      stepName: '抹灰找平',
      status: floor._id === 'f1' ? 1 : 0,
      percentage: floor._id === 'f1' ? 100 : 0
    },
    {
      floorId: floor._id,
      floorName: floor.name,
      stepId: 'ks4',
      stepName: '验收移交',
      status: 0,
      percentage: 0
    }
  ]
}))

export const mockTransferList: WorkTransferCard[] = [
  {
    _id: 't1',
    name: '墙面抹灰作业面移交',
    buildingId: 'b1',
    buildingName: '1#楼',
    status: 1,
    statusText: '进行中',
    fromTeam: '抹灰班组',
    toTeam: '涂料班组',
    updatedDate: '2026-10-14',
    finishedCount: 2,
    totalCount: 5
  },
  {
    _id: 't2',
    name: '地面找平作业面移交',
    buildingId: 'b1',
    buildingName: '1#楼',
    status: 0,
    statusText: '待发起',
    fromTeam: '地面班组',
    toTeam: '木作班组',
    updatedDate: '2026-10-13',
    finishedCount: 0,
    totalCount: 4
  }
]

export const mockTransferScopes: WorkTransferScope[] = [
  { _id: 'ts1', name: '3F-客厅', floorId: 'f3', floorName: '3F', finished: true, checked: true },
  { _id: 'ts2', name: '3F-主卧', floorId: 'f3', floorName: '3F', finished: true, checked: true },
  { _id: 'ts3', name: '2F-客厅', floorId: 'f2', floorName: '2F', finished: false, checked: false },
  { _id: 'ts4', name: '2F-主卧', floorId: 'f2', floorName: '2F', finished: false, checked: false },
  { _id: 'ts5', name: '1F-客厅', floorId: 'f1', floorName: '1F', finished: false, checked: false }
]

export const mockAlbumGroups: AlbumGroupItem[] = [
  {
    key: 'g1',
    title: '墙面抹灰',
    count: 12,
    cover: '/static/images/default.jpg',
    itemName: '墙面抹灰',
    buildingId: 'b1',
    stageCode: 3
  },
  {
    key: 'g2',
    title: '地面找平',
    count: 8,
    cover: '/static/images/default.jpg',
    itemName: '地面找平',
    buildingId: 'b1',
    stageCode: 3
  },
  {
    key: 'g3',
    title: '水电预埋',
    count: 15,
    cover: '/static/images/default.jpg',
    itemName: '水电预埋',
    buildingId: 'b1',
    stageCode: 1
  }
]

export const mockAlbumDayGroups: AlbumPhotoDayGroup[] = [
  {
    date: '2026-10-13',
    photos: mockStructuredPhotos.slice(2)
  },
  {
    date: '2026-10-12',
    photos: mockStructuredPhotos.slice(0, 2)
  }
]
