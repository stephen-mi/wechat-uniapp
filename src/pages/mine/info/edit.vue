<template>
  <view class="container">
    <view class="example">
      <uni-forms ref="formRef" :model="user" labelWidth="80px">
        <uni-forms-item label="用户昵称" name="nickname">
          <uni-easyinput v-model="user.nickname" placeholder="请输入昵称" />
        </uni-forms-item>
        <uni-forms-item label="手机号码" name="mobile">
          <uni-easyinput v-model="user.mobile" placeholder="请输入手机号码" />
        </uni-forms-item>
        <uni-forms-item label="邮箱" name="email">
          <uni-easyinput v-model="user.email" placeholder="请输入邮箱" />
        </uni-forms-item>
        <uni-forms-item label="性别" name="sex" required></uni-forms-item>
      </uni-forms>
      <button class="primary-btn" @click="submit">提交</button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { onLoad, onReady } from '@dcloudio/uni-app'
import { reactive, ref } from 'vue'
import { getUserProfile, updateUserProfile } from '@/api/system/user'
import { useModal } from '@/composables/useModal'
import type { UserProfileVO } from '@/types/api'

const modal = useModal()
const formRef = ref<{ validate: () => Promise<unknown>; setRules: (rules: unknown) => void } | null>(null)

const user = reactive<UserProfileVO>({
  nickname: '',
  mobile: '',
  email: '',
  sex: ''
})

const rules = {
  nickname: {
    rules: [{ required: true, errorMessage: '用户昵称不能为空' }]
  },
  mobile: {
    rules: [
      { required: true, errorMessage: '手机号码不能为空' },
      {
        pattern: /^1[3|4|5|6|7|8|9][0-9]\d{8}$/,
        errorMessage: '请输入正确的手机号码'
      }
    ]
  },
  email: {
    rules: [
      { required: true, errorMessage: '邮箱地址不能为空' },
      { format: 'email', errorMessage: '请输入正确的邮箱地址' }
    ]
  }
}

function loadUser(): void {
  void getUserProfile().then((response) => {
    Object.assign(user, response.data)
  })
}

function submit(): void {
  void formRef.value?.validate().then(() => {
    void updateUserProfile(user).then(() => {
      modal.msgSuccess('修改成功')
    })
  })
}

onLoad(() => {
  loadUser()
})

onReady(() => {
  formRef.value?.setRules(rules)
})
</script>

<style lang="scss">
page {
  background-color: #ffffff;
}

.example {
  padding: 15px;
  background-color: #fff;
}
</style>
