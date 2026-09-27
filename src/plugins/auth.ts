import store from '@/store'

function authPermission(permission: string): boolean {
  const allPermission = '*:*:*'
  const permissions = store.getters.permissions as string[]
  if (permission && permission.length > 0) {
    return permissions.some((v: string) => allPermission === v || v === permission)
  }
  return false
}

function authRole(role: string): boolean {
  const superAdmin = 'admin'
  const roles = store.getters.roles as string[]
  if (role && role.length > 0) {
    return roles.some((v: string) => superAdmin === v || v === role)
  }
  return false
}

export default {
  hasPermi(permission: string) {
    return authPermission(permission)
  },
  hasPermiOr(permissions: string[]) {
    return permissions.some((item: string) => authPermission(item))
  },
  hasPermiAnd(permissions: string[]) {
    return permissions.every((item: string) => authPermission(item))
  },
  hasRole(role: string) {
    return authRole(role)
  },
  hasRoleOr(roles: string[]) {
    return roles.some((item: string) => authRole(item))
  },
  hasRoleAnd(roles: string[]) {
    return roles.every((item: string) => authRole(item))
  }
}
