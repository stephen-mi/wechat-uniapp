<template>
  <view class="container">
    <uni-list>
      <uni-list-item
        showExtraIcon="true"
        :extraIcon="{ type: 'person-filled' }"
        title="昵称"
        :rightText="user.nickname"
      />
      <uni-list-item
        showExtraIcon="true"
        :extraIcon="{ type: 'phone-filled' }"
        title="手机号码"
        :rightText="user.mobile"
      />
      <uni-list-item showExtraIcon="true" :extraIcon="{ type: 'email-filled' }" title="邮箱" :rightText="user.email" />
      <uni-list-item
        showExtraIcon="true"
        :extraIcon="{ type: 'auth-filled' }"
        title="岗位"
        :rightText="postNames"
      />
      <uni-list-item
        showExtraIcon="true"
        :extraIcon="{ type: 'staff-filled' }"
        title="角色"
        :rightText="roleNames"
      />
      <uni-list-item
        showExtraIcon="true"
        :extraIcon="{ type: 'calendar-filled' }"
        title="创建日期"
        :rightText="createTimeText"
      />
    </uni-list>
  </view>
</template>

<script setup lang="ts">
import { computed, reactive } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { getUserProfile } from '@/api/system/user'
import { parseTime } from '@/utils/ruoyi'
import type { UserProfileVO } from '@/types/api'

const user = reactive<UserProfileVO>({
  nickname: '',
  mobile: '',
  email: '',
  sex: ''
})

const postNames = computed(() => (user.posts ?? []).map((post) => post.name).join(','))
const roleNames = computed(() => (user.roles ?? []).map((role) => role.name).join(','))
const createTimeText = computed(() => (user.createTime ? parseTime(user.createTime) : ''))

function loadUser(): void {
  void getUserProfile().then((response) => {
    Object.assign(user, response.data)
  })
}

onLoad(() => {
  loadUser()
})
</script>

<style lang="scss">
page {
  background-color: #ffffff;
}
</style>
