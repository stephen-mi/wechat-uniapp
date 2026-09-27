export type UnauthorizedHandler = () => Promise<void> | void

let unauthorizedHandler: UnauthorizedHandler | null = null

export function setUnauthorizedHandler(handler: UnauthorizedHandler): void {
  unauthorizedHandler = handler
}

export async function handleUnauthorized(): Promise<void> {
  if (!unauthorizedHandler) {
    return
  }
  await unauthorizedHandler()
}
