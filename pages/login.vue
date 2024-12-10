<template>
	<view class="normal-login-container">
		<view class="logo-content align-center justify-center flex">
			<image style="width: 100rpx;height: 100rpx;" :src="globalConfig.appInfo.logo" mode="widthFix">
			</image>
			<text class="title">黑米云小程序登录</text>
		</view>
		<view class="login-form-content">
			<view class="input-item flex align-center">
				<view class="iconfont icon-user icon"></view>
				<input v-model="loginForm.username" class="input" type="text" placeholder="请输入账号" maxlength="30" />
			</view>
			<view class="input-item flex align-center">
				<view class="iconfont icon-password icon"></view>
				<input v-model="loginForm.password" type="password" class="input" placeholder="请输入密码" maxlength="20" />
			</view>
			<!-- <Verify @success="pwdLogin" :mode="'pop'" :captchaType="'blockPuzzle'" -->
			<!-- :imgSize="{ width: '330px', height: '155px' }" ref="verify"></Verify> -->
			<view class="action-btn">
				<button @click="handleLogin" class="login-btn cu-btn block bg-blue lg round">登录</button>
			</view>
		</view>

		<!-- <view class="xieyi text-center">
			<u-checkbox-group v-model="checkboxValue" @change="checkboxChange">
				<u-checkbox name="1"></u-checkbox>
				<view class="agreement">
					<text class="agreement-text">
						<text>我已阅读并同意</text>
						<text class="textLink" @click="handleUserAgrement">《用户服务协议》</text>
						<text>和</text>
						<text class="textLink" @click="handlePrivacy">《隐私政策》</text>
					</text>
				</view>
			</u-checkbox-group>
		</view>
		<agreement-modal :show="showAgree" @confirm="handleAgree" @cancel="showAgree = false"></agreement-modal> -->
	</view>
</template>

<script>
	import Verify from "@/components/verifition/Verify"
	import AgreementModal from "@/components/agreement-modal/index"

	export default {
		name: 'Login',
		components: {
			Verify,
			AgreementModal
		},
		data() {
			return {
				checkboxValue: [],
				showAgree: false,
				captchaEnabled: true, // 验证码开关 TODO 芋艿：需要抽到配置里
				globalConfig: getApp().globalData.config,
				loginForm: {
					username: "admin",
					password: "123qwe!@#",
					captchaVerification: ""
				}
			}
		},
		onLoad() {
			this.handleLogin()
		},
		methods: {
			// // 隐私协议
			// handlePrivacy() {
			// 	// let site = this.globalConfig.appInfo.agreements[0]
			// 	// this.$tab.navigateTo(`/pages/common/textview/index?title=${site.title}&url=${site.url}`)
			// 	wx.navigateTo({
			// 		url: '/pages/common/agreement/index'
			// 	})
			// },
			// // 用户协议
			// handleUserAgrement() {
			// 	// let site = this.globalConfig.appInfo.agreements[1]
			// 	// this.$tab.navigateTo(`/pages/common/webview/index?title=${site.title}&url=${site.url}`)
			// 	wx.navigateTo({
			// 		url: '/pages/common/agreement/index'
			// 	})
			// },
			// handleAgree() {
			// 	this.showAgree = false
			// 	this.checkboxValue = ['1']
			// 	this.handleLogin()
			// },
			checkboxChange(e) {
				this.checkboxValue = e
			},
			// 登录方法
			async handleLogin(params) {
				if (this.loginForm.username === "") {
					this.$modal.msgError("请输入您的账号")
				} else if (this.loginForm.password === "") {
					this.$modal.msgError("请输入您的密码")
				} else {
					// if (this.checkboxValue.length == 0) {
					// 	this.showAgree = true
					// 	return
					// }
					// 显示验证码
					// if (this.captchaEnabled) {
					//   this.$refs.verify.show()
					// } else { // 直接登录
					await this.pwdLogin({})
					// }
				}
			},
			// 密码登录
			async pwdLogin(captchaParams) {
				this.$modal.loading("登录中，请耐心等待...")
				// 执行登录
				this.loginForm.captchaVerification = captchaParams.captchaVerification
				this.$store.dispatch('Login', this.loginForm).then(() => {
					this.$modal.closeLoading()
					this.loginSuccess()
				})
			},
			// 登录成功后，处理函数
			loginSuccess(result) {
				// 设置用户信息
				this.$store.dispatch('GetInfo').then(res => {
					this.$tab.reLaunch('/pages/index')
				})
			}
		}
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

			image {
				border-radius: 4px;
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


		}

		.easyinput {
			width: 100%;
		}

		.xieyi {
			color: #333;
			margin-top: 20px;
			display: flex;
			justify-content: center;
		}

		.agreement {
			width: 100%;
			float: left;

			.agreement-text {
				font-size: 16px;
				color: #666;

				.textLink {
					display: inline;
					color: #488DFF;
				}
			}
		}
	}

	.login-code-img {
		height: 45px;
	}
</style>