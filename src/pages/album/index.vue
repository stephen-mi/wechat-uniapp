<template>
  <view class="container">
    <view class="top">
      <u-search
        placeholder="请输入关键字"
        v-model="keyword"
        :clearabled="true"
        @search="search"
        @blur="blur"
        @clear="clear"
      ></u-search>
      <u-gap height="10" bgColor="#fff"></u-gap>
    </view>

    <view v-if="albums.length > 0" class="list">
      <view v-for="(group, index) in albums" :key="index">
        <u-collapse ref="collapseRef" :value="collapse">
          <u-collapse-item :title="group.date" :name="group.date">
            <u-grid :border="false" col="3">
              <u-grid-item v-for="(photoItem, photoIndex) in group.photos" :key="photoIndex">
                <image :src="photoItem.url" class="photo" @click="previewImage(photoIndex)"></image>
                <u-radio-group v-model="radiovalue" placement="row" @change="groupChange">
                  <u-radio
                    :customStyle="{ position: 'absolute', bottom: '70px', right: '4px' }"
                    :key="photoIndex"
                    :name="photoItem.id"
                    @change="radioChange"
                  ></u-radio>
                </u-radio-group>
                <text class="album-voice-text">{{ photoItem.voiceText }}</text>
              </u-grid-item>
            </u-grid>
            <u-button type="primary" @click="output">销项</u-button>
          </u-collapse-item>
        </u-collapse>
      </view>
    </view>
    <u-empty v-else mode="data" icon="http://cdn.uviewui.com/uview/empty/data.png"></u-empty>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { useAppStore } from '@/composables/useAppStore'
import type { AlbumPhotoItem } from '@/store/types'

interface AlbumGroup {
  date: string
  photos: AlbumPhotoItem[]
}

const store = useAppStore()
const keyword = ref('')
const radiovalue = ref<string | number>('')
const originAlbums = ref<AlbumGroup[]>([])
const albums = ref<AlbumGroup[]>([])
const collapse = ref<string[]>([])

function output(): void {
  const checkedIds: Array<number | string> = []
  albums.value.forEach((item) => {
    item.photos.forEach((photo) => {
      if (photo.checked) {
        checkedIds.push(photo.id)
      }
    })
  })
  console.log(checkedIds, 'checkedIds')
}

function clear(): void {
  albums.value = [...originAlbums.value]
}

function blur(e: string): void {
  albums.value = originAlbums.value.filter((item) => item.photos.some((p) => (p.voiceText ?? '').includes(e)))
}

function search(e: string): void {
  albums.value = originAlbums.value.filter((item) => item.photos.some((p) => (p.voiceText ?? '').includes(e)))
}

function getPhotoPage(): void {
  const params = { pageNo: 1, pageSize: 100 }
  void store.dispatch('GetPhotoPage', params).then((res) => {
    const grouped: AlbumGroup[] = []
    const keys: string[] = []
    Object.entries(res.groupList).forEach(([date, photos]) => {
      grouped.push({ date, photos: photos as AlbumPhotoItem[] })
      keys.push(date)
    })
    albums.value = grouped
    originAlbums.value = [...grouped]
    collapse.value = keys
  })
}

function previewImage(_index: number): void {
  // 预留预览
}

function radioChange(n: string | number): void {
  albums.value.forEach((item) => {
    item.photos.forEach((photo) => {
      if (n === photo.id) {
        photo.checked = true
      }
    })
  })
}

function groupChange(_n: string | number): void {
  // 预留分组切换
}

onLoad(() => {
  getPhotoPage()
})
</script>

<style lang="scss" scoped>
.container {
  padding: 10px;
  background-color: #fff;
  height: 100%;

  .top {
    position: fixed;
    top: 0;
    width: 95%;
    z-index: 1;
    background: #fff;
  }

  .list {
    margin-top: 44px;
    height: calc(100% - 44px);
  }

  .photo {
    width: 105px;
    height: 105px;
    object-fit: cover;
    border-radius: 6px;
    background-color: #fff;
    border: 1px solid #ddd;
  }

  .album-voice-text {
    text-align: center;
    padding: 5px;
    font-size: 12px;
    color: #333;
    width: 100px;
    max-height: 50px;
    margin-bottom: 5px;
  }
}
</style>
