import type { Module, MutationTree } from 'vuex'
import type { RootState } from '@/store/types'
import type {
  TaskBuilding,
  TaskFloor,
  TaskPerspective,
  TaskRoom,
  TaskStage
} from '@/api/task/types'

export interface TaskState {
  currentBuilding: TaskBuilding | null
  currentStage: TaskStage | null
  currentFloor: TaskFloor | null
  currentRoom: TaskRoom | null
  currentPerspective: TaskPerspective
  currentProfessionalProject: string
  unreadCount: number
}

const STORAGE_KEY = 'siteflow_task_context'

function loadPersisted(): Partial<TaskState> {
  try {
    const raw = uni.getStorageSync(STORAGE_KEY)
    if (!raw) return {}
    return typeof raw === 'string' ? JSON.parse(raw) : raw
  } catch {
    return {}
  }
}

function persist(state: TaskState): void {
  try {
    uni.setStorageSync(STORAGE_KEY, {
      currentBuilding: state.currentBuilding,
      currentStage: state.currentStage,
      currentFloor: state.currentFloor,
      currentRoom: state.currentRoom,
      currentPerspective: state.currentPerspective,
      currentProfessionalProject: state.currentProfessionalProject
    })
  } catch {
    /* ignore */
  }
}

const persisted = loadPersisted()

const state = (): TaskState => ({
  currentBuilding: (persisted.currentBuilding as TaskBuilding) || null,
  currentStage: (persisted.currentStage as TaskStage) || null,
  currentFloor: (persisted.currentFloor as TaskFloor) || null,
  currentRoom: (persisted.currentRoom as TaskRoom) || null,
  currentPerspective: (persisted.currentPerspective as TaskPerspective) || '空间',
  currentProfessionalProject: (persisted.currentProfessionalProject as string) || '',
  unreadCount: 0
})

const mutations: MutationTree<TaskState> = {
  SET_BUILDING(s, building: TaskBuilding | null) {
    s.currentBuilding = building
    persist(s)
  },
  SET_STAGE(s, stage: TaskStage | null) {
    s.currentStage = stage
    persist(s)
  },
  SET_FLOOR(s, floor: TaskFloor | null) {
    s.currentFloor = floor
    persist(s)
  },
  SET_ROOM(s, room: TaskRoom | null) {
    s.currentRoom = room
    persist(s)
  },
  SET_PERSPECTIVE(s, perspective: TaskPerspective) {
    s.currentPerspective = perspective
    persist(s)
  },
  SET_PROFESSIONAL(s, value: string) {
    s.currentProfessionalProject = value
    persist(s)
  },
  SET_UNREAD(s, count: number) {
    s.unreadCount = count
  }
}

const taskModule: Module<TaskState, RootState> = {
  namespaced: true,
  state,
  mutations
}

export default taskModule
