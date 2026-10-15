import { computed } from 'vue'
import { useStore } from 'vuex'
import type { TaskState } from '@/store/modules/task'
import type {
  TaskBuilding,
  TaskFloor,
  TaskPerspective,
  TaskRoom,
  TaskStage
} from '@/api/task/types'

export function useTaskContext() {
  const store = useStore()

  const taskState = computed(() => store.state.task as TaskState)
  const currentBuilding = computed(() => taskState.value.currentBuilding)
  const currentStage = computed(() => taskState.value.currentStage)
  const currentFloor = computed(() => taskState.value.currentFloor)
  const currentRoom = computed(() => taskState.value.currentRoom)
  const currentPerspective = computed(() => taskState.value.currentPerspective)
  const currentProfessionalProject = computed(() => taskState.value.currentProfessionalProject)
  const unreadCount = computed(() => taskState.value.unreadCount)

  const contextLabel = computed(() => {
    const parts = [
      currentBuilding.value?.name,
      currentStage.value?.desc,
      currentFloor.value?.name,
      currentPerspective.value === '空间'
        ? currentRoom.value?.name
        : currentProfessionalProject.value || '专业'
    ].filter(Boolean)
    return parts.join(' · ') || '未选择位置'
  })

  function setBuilding(building: TaskBuilding | null): void {
    store.commit('task/SET_BUILDING', building)
  }

  function setStage(stage: TaskStage | null): void {
    store.commit('task/SET_STAGE', stage)
  }

  function setFloor(floor: TaskFloor | null): void {
    store.commit('task/SET_FLOOR', floor)
  }

  function setRoom(room: TaskRoom | null): void {
    store.commit('task/SET_ROOM', room)
  }

  function setPerspective(perspective: TaskPerspective): void {
    store.commit('task/SET_PERSPECTIVE', perspective)
  }

  function setProfessional(value: string): void {
    store.commit('task/SET_PROFESSIONAL', value)
  }

  function setUnread(count: number): void {
    store.commit('task/SET_UNREAD', count)
  }

  return {
    currentBuilding,
    currentStage,
    currentFloor,
    currentRoom,
    currentPerspective,
    currentProfessionalProject,
    unreadCount,
    contextLabel,
    setBuilding,
    setStage,
    setFloor,
    setRoom,
    setPerspective,
    setProfessional,
    setUnread
  }
}
