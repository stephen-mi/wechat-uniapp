<template>
  <web-view v-if="src" :src="src" />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'

const src = ref('')

onLoad((query) => {
  src.value = decodeURIComponent((query?.src as string) || '')
  const title = decodeURIComponent((query?.title as string) || 'Bimface图纸')
  uni.setNavigationBarTitle({ title })
})
</script>
