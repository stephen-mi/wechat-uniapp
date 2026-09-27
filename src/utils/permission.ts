import store from '@/store'

export function checkPermi(value: string[]): boolean {
  if (value && value instanceof Array && value.length > 0) {
    const permissions = store.getters.permissions as string[]
    const permissionDatas = value
    const allPermission = '*:*:*'

    const hasPermission = permissions.some((permission: string) => {
      return allPermission === permission || permissionDatas.includes(permission)
    })

    return hasPermission
  }
  console.error(`need roles! Like checkPermi="['system:user:add','system:user:edit']"`)
  return false
}

export function checkRole(value: string[]): boolean {
  if (value && value instanceof Array && value.length > 0) {
    const roles = store.getters.roles as string[]
    const permissionRoles = value
    const superAdmin = 'admin'

    const hasRole = roles.some((role: string) => {
      return superAdmin === role || permissionRoles.includes(role)
    })

    return hasRole
  }
  console.error(`need roles! Like checkRole="['admin','editor']"`)
  return false
}
