<template>
  <view>
    <uni-card class="view-title" :title="title">
      <text class="uni-body view-content">{{ content }}</text>
    </uni-card>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'

const title = ref('')
const content = ref('')

onLoad((options?: Record<string, string>) => {
  const pageTitle = options?.title ?? ''
  const pageContent = options?.content ?? ''
  title.value = pageTitle
  content.value = pageContent
  uni.setNavigationBarTitle({ title: pageTitle })
})
</script>

<style scoped>
page {
  background-color: #ffffff;
}

.view-title {
  font-weight: bold;
}

.view-content {
  font-size: 26rpx;
  padding: 12px 5px 0;
  color: #333;
  line-height: 24px;
  font-weight: normal;
}
</style>
