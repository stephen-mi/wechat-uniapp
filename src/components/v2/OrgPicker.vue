<template>
  <view v-if="show" class="mask" @click="close">
    <view class="panel" :style="{ marginTop: panelTop + 'px' }" @click.stop>
      <view class="head">
        <text class="head__title">选择组织</text>
        <view class="head__reset" @click="resetAll">
          <u-icon name="reload" size="16" color="#666" />
        </view>
      </view>
      <view class="search">
        <u-icon name="search" size="16" color="#999" />
        <input v-model="keyword" class="search__input" placeholder="搜索组织" confirm-type="search" />
      </view>
      <scroll-view scroll-y class="tree">
        <view
          v-for="row in visibleRows"
          :key="row.id"
          class="row"
          :class="{ 'row--on': row.id === monitorDeptId }"
          :style="{ paddingLeft: 12 + row.depth * 28 + 'rpx' }"
          @click="selectRow(row)"
        >
          <view class="row__arrow" @click.stop="toggle(row)">
            <u-icon
              v-if="row.hasChildren"
              :name="row.expanded ? 'arrow-down' : 'arrow-right'"
              size="12"
              color="#888"
            />
          </view>
          <u-icon :name="row.depth === 0 ? 'home' : 'folder'" size="16" color="#666" />
          <text class="row__name">{{ row.name }}</text>
          <text class="row__count">({{ row.online }}/{{ row.total }})</text>
        </view>
        <view v-if="!loading && visibleRows.length === 0" class="empty">无匹配组织</view>
      </scroll-view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { loadOrgTree, type OrgTreeNode } from '@/composables/org-tree'
import { useMonitorContext } from '@/composables/useMonitorContext'
import { useNavLayout } from '@/composables/useNavLayout'

const props = defineProps<{
  show: boolean
}>()

const emit = defineEmits<{
  'update:show': [value: boolean]
}>()

const { monitorDeptId, monitorOrgName, setOrg } = useMonitorContext()
const nav = useNavLayout()
const panelTop = computed(() => nav.value.statusBarHeight + nav.value.navBarHeight)

const keyword = ref('')
const loading = ref(false)
const roots = ref<OrgTreeNode[]>([])
const expanded = ref<Record<number, boolean>>({})

interface VisibleRow {
  id: number
  name: string
  depth: number
  online: number
  total: number
  hasChildren: boolean
  expanded: boolean
  node: OrgTreeNode
}

function expandAll(nodes: OrgTreeNode[], map: Record<number, boolean>): void {
  nodes.forEach((node) => {
    map[node.id] = true
    expandAll(node.children, map)
  })
}

function matches(node: OrgTreeNode, text: string): boolean {
  if (node.name.toLowerCase().includes(text)) return true
  return node.children.some((child) => matches(child, text))
}

function flatten(nodes: OrgTreeNode[], depth: number, text: string, rows: VisibleRow[]): void {
  nodes.forEach((node) => {
    if (text && !matches(node, text)) return
    const hasChildren = node.children.length > 0
    const isExpanded = text ? true : expanded.value[node.id] !== false
    rows.push({
      id: node.id,
      name: node.name,
      depth,
      online: node.online,
      total: node.total,
      hasChildren,
      expanded: isExpanded,
      node
    })
    if (hasChildren && isExpanded) flatten(node.children, depth + 1, text, rows)
  })
}

const visibleRows = computed(() => {
  const rows: VisibleRow[] = []
  flatten(roots.value, 0, keyword.value.trim().toLowerCase(), rows)
  return rows
})

async function ensureTree(): Promise<void> {
  if (roots.value.length) return
  loading.value = true
  try {
    const tree = await loadOrgTree()
    roots.value = tree
    const map: Record<number, boolean> = {}
    expandAll(tree, map)
    expanded.value = map
    if (monitorOrgName.value === 'AI视频监控演示' && tree[0]) {
      setOrg({ id: tree[0].id, name: tree[0].name })
    }
  } finally {
    loading.value = false
  }
}

watch(
  () => props.show,
  (visible) => {
    if (visible) {
      keyword.value = ''
      void ensureTree()
    }
  }
)

onMounted(() => {
  void ensureTree()
})

function close(): void {
  emit('update:show', false)
}

function toggle(row: VisibleRow): void {
  if (!row.hasChildren) return
  expanded.value = { ...expanded.value, [row.id]: !row.expanded }
}

function selectRow(row: VisibleRow): void {
  setOrg({ id: row.id, name: row.name })
  close()
}

function resetAll(): void {
  setOrg(null)
  close()
}
</script>

<style lang="scss" scoped>
.mask {
  position: fixed;
  inset: 0;
  z-index: 120;
  background: rgba(0, 0, 0, 0.08);
}

.panel {
  margin: 12rpx 24rpx 0;
  padding: 24rpx 20rpx 12rpx;
  background: #fff;
  border-radius: 16rpx;
  box-shadow: 0 12rpx 40rpx rgba(0, 0, 0, 0.12);
}

.head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16rpx;
}

.head__title {
  font-size: 30rpx;
  font-weight: 600;
  color: #1a1a1a;
}

.head__reset {
  width: 48rpx;
  height: 48rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.search {
  display: flex;
  align-items: center;
  gap: 12rpx;
  margin-bottom: 12rpx;
  padding: 12rpx 16rpx;
  border: 1rpx solid #e6e6e6;
  border-radius: 8rpx;
}

.search__input {
  flex: 1;
  font-size: 26rpx;
}

.tree {
  max-height: 520rpx;
}

.row {
  display: flex;
  align-items: center;
  gap: 10rpx;
  min-height: 72rpx;
  padding-right: 8rpx;
  border-radius: 8rpx;

  &--on {
    background: #e8f7ff;
  }
}

.row__arrow {
  width: 28rpx;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.row__name {
  flex: 1;
  min-width: 0;
  font-size: 28rpx;
  color: #222;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.row__count {
  flex-shrink: 0;
  font-size: 24rpx;
  color: #8a8a8a;
}

.empty {
  padding: 32rpx 0;
  text-align: center;
  color: #999;
  font-size: 26rpx;
}
</style>
