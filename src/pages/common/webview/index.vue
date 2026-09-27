<template>
  <view v-if="params.url">
    <web-view :webview-styles="webviewStyles" :src="params.url"></web-view>
  </view>
</template>

<script setup lang="ts">
import { reactive } from 'vue'
import { onLoad } from '@dcloudio/uni-app'

interface WebviewPageParams {
  url?: string
  title?: string
}

const params = reactive<{ url: string }>({ url: '' })

const webviewStyles = {
  progress: {
    color: '#FF3333'
  }
}

onLoad((event?: WebviewPageParams) => {
  if (event?.url) {
    params.url = event.url
  }
  if (event?.title) {
    uni.setNavigationBarTitle({ title: event.title })
  }
})
</script>
