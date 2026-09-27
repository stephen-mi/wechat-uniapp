<template>
	<view class="normal-login-container">
		<view class="logo-content align-center justify-center flex">
			<image class="login-logo" src="/static/images/siteflow-logo.png" mode="aspectFit" />
			<text class="title">登录</text>
		</view>
		<view class="login-form-content">
			<template v-if="!preLoginResult">
				<view class="input-item flex align-center">
					<view class="iconfont icon-user icon"></view>
					<input v-model="loginForm.username" class="input" type="text" placeholder="请输入账号" maxlength="30" />
				</view>
				<view class="input-item flex align-center">
					<view class="iconfont icon-password icon"></view>
					<input v-model="loginForm.password" type="password" class="input" placeholder="请输入密码" maxlength="20" />
				</view>
				<view class="version-row">
					<text class="version-row__label">新版首页（视频 / AI事件 / 处置闭环）</text>
					<u-switch v-model="useNewVersion" size="20" @change="onVersionSwitch" />
				</view>
				<view class="action-btn">
					<button @click="handlePreLogin" class="login-btn cu-btn block bg-blue lg round" :loading="loginLoading">登录</button>
				</view>
			</template>
			<template v-else>
				<view class="tenant-header">
					<text class="tenant-greeting">欢迎，{{ preLoginResult.nickname }}</text>
					<text class="tenant-hint">请选择要登录的租户</text>
				</view>
				<view class="input-item flex align-center">
					<input v-model="tenantSearchKeyword" class="input" type="text" placeholder="搜索租户..." />
				</view>
				<scroll-view scroll-y class="tenant-list">
					<view
						v-for="tenant in filteredTenants"
						:key="tenant.id"
						class="tenant-item"
						:class="{ 'tenant-item-active': selectedTenantId === tenant.id }"
						@click="selectedTenantId = tenant.id"
					>
						<text>{{ tenant.name }}（{{ tenant.id }}）</text>
					</view>
					<view v-if="filteredTenants.length === 0" class="tenant-empty">未找到匹配的租户</view>
				</scroll-view>
				<view class="action-btn tenant-actions">
					<button @click="backToPreLogin" class="login-btn cu-btn block lg round">返回</button>
					<button @click="handleTenantLogin" class="login-btn cu-btn block bg-blue lg round" :loading="loginLoading">确认登录</button>
				</view>
			</template>
		</view>
	</view>
</template>

<script setup lang="ts">
import { computed, reactive, ref, onMounted } from 'vue'
import { goHomeAfterLogin, useUiVersion } from '@/composables/useUiVersion'
import type { PreLoginRespVO } from '@/types/api'
import type { LoginFormPayload } from '@/store/types'
import { useAppStore } from '@/composables/useAppStore'
import { useModal } from '@/composables/useModal'
const store = useAppStore()
const modal = useModal()
const { isV2, toggleNewVersion } = useUiVersion()
const useNewVersion = ref(true)

const loginLoading = ref(false)
const preLoginResult = ref<PreLoginRespVO | null>(null)
const selectedTenantId = ref<number | null>(null)
const tenantSearchKeyword = ref('')

const loginForm = reactive<LoginFormPayload>({
  username: 'admin',
  password: 'admin123456',
  captchaVerification: ''
})

const filteredTenants = computed(() => {
  if (!preLoginResult.value?.tenants?.length) {
    return []
  }
  const keyword = tenantSearchKeyword.value.trim().toLowerCase()
  if (!keyword) {
    return preLoginResult.value.tenants
  }
  return preLoginResult.value.tenants.filter(
    (t) => t.name.toLowerCase().includes(keyword) || String(t.id).includes(keyword)
  )
})

async function handlePreLogin(): Promise<void> {
  if (loginForm.username === '') {
    modal.msgError('请输入您的账号')
    return
  }
  if (loginForm.password === '') {
    modal.msgError('请输入您的密码')
    return
  }
  loginLoading.value = true
  modal.loading('登录中，请耐心等待...')
  try {
    const res = await store.dispatch('PreLogin', loginForm)
    if (!res?.tenants?.length) {
      modal.msgError('未找到可用租户，请联系管理员')
      return
    }
    preLoginResult.value = res
    selectedTenantId.value = res.tenants[0].id
    if (res.tenants.length === 1) {
      await handleTenantLogin()
    }
  } catch {
    // 错误提示已在 request 拦截器中处理
  } finally {
    loginLoading.value = false
    modal.closeLoading()
  }
}

function backToPreLogin(): void {
  preLoginResult.value = null
  selectedTenantId.value = null
  tenantSearchKeyword.value = ''
}

async function handleTenantLogin(): Promise<void> {
  if (!preLoginResult.value || selectedTenantId.value == null) {
    return
  }
  const selectedTenant = preLoginResult.value.tenants.find((t) => t.id === selectedTenantId.value)
  if (!selectedTenant) {
    modal.msgError('请选择有效的租户')
    return
  }
  loginLoading.value = true
  modal.loading('登录中，请耐心等待...')
  try {
    await store.dispatch('LoginWithTenant', {
      userId: selectedTenant.userId,
      tenantId: selectedTenant.id
    })
    await loginSuccess()
  } catch {
    // 错误提示已在 request 拦截器中处理
  } finally {
    loginLoading.value = false
    modal.closeLoading()
  }
}

function onVersionSwitch(val: boolean): void {
  toggleNewVersion(val)
}

onMounted(() => {
  useNewVersion.value = isV2.value
})

async function loginSuccess(): Promise<void> {
  toggleNewVersion(useNewVersion.value)
  await store.dispatch('GetInfo')
  goHomeAfterLogin()
}
</script>

<style lang="scss">
	page {
		background-color: #ffffff;
	}

	.normal-login-container {
		width: 100%;

		.logo-content {
			width: 100%;
			font-size: 21px;
			text-align: center;
			padding-top: 15%;

			.login-logo {
				width: 100rpx;
				height: 100rpx;
			}

			.title {
				margin-left: 10px;
			}
		}

		.login-form-content {
			text-align: center;
			margin: 20px auto;
			margin-top: 15%;
			width: 80%;

			.version-row {
				display: flex;
				align-items: center;
				justify-content: space-between;
				margin: 24rpx 0 8rpx;
				padding: 0 8rpx;
				font-size: 26rpx;
				color: #666;
			}

			.version-row__label {
				flex: 1;
				text-align: left;
				padding-right: 16rpx;
			}

			.input-item {
				margin: 20px auto;
				background-color: #f5f6f7;
				height: 45px;
				border-radius: 20px;

				.icon {
					font-size: 38rpx;
					margin-left: 10px;
					color: #999;
				}

				.input {
					width: 100%;
					font-size: 14px;
					line-height: 20px;
					text-align: left;
					padding-left: 15px;
				}

			}

			.login-btn {
				margin-top: 40px;
				height: 45px;
			}

			.tenant-header {
				text-align: left;
				margin-bottom: 16px;

				.tenant-greeting {
					display: block;
					font-size: 18px;
					font-weight: 600;
					color: #333;
				}

				.tenant-hint {
					display: block;
					margin-top: 8px;
					font-size: 14px;
					color: #666;
				}
			}

			.tenant-list {
				max-height: 320px;
				text-align: left;
			}

			.tenant-item {
				padding: 14px 16px;
				margin-bottom: 10px;
				background-color: #f5f6f7;
				border-radius: 12px;
				border: 2px solid transparent;
			}

			.tenant-item-active {
				border-color: #0081ff;
				background-color: #eef5ff;
			}

			.tenant-empty {
				padding: 24px 0;
				text-align: center;
				color: #999;
				font-size: 14px;
			}

			.tenant-actions {
				display: flex;
				gap: 12px;

				.login-btn {
					flex: 1;
					margin-top: 20px;
				}
			}
		}
	}
</style>
