const AccessTokenKey = 'ACCESS_TOKEN'
const RefreshTokenKey = 'REFRESH_TOKEN'
const TenantIdKey = 'TENANT_ID'

// ========== Token 相关 ==========

export function getAccessToken() {
  return uni.getStorageSync(AccessTokenKey)
}

export function getRefreshToken() {
  return uni.getStorageSync(RefreshTokenKey)
}

export function setToken(token: { accessToken: string; refreshToken: string }) {
  uni.setStorageSync(AccessTokenKey, token.accessToken)
  uni.setStorageSync(RefreshTokenKey, token.refreshToken)
}

export function removeToken() {
  uni.removeStorageSync(AccessTokenKey)
  uni.removeStorageSync(RefreshTokenKey)
}

// ========== 租户相关 ==========

export function getTenantId() {
  return uni.getStorageSync(TenantIdKey)
}

export function setTenantId(tenantId: string | number) {
  if (tenantId === undefined || tenantId === null || tenantId === '') {
    return
  }
  uni.setStorageSync(TenantIdKey, String(tenantId))
}

export function removeTenantId() {
  uni.removeStorageSync(TenantIdKey)
}
