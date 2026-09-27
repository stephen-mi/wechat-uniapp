/** 布局用窗口信息（优先新 API，避免 wx.getSystemInfoSync 弃用警告） */
export interface LayoutMetrics {
  statusBarHeight: number
  windowHeight: number
  safeAreaBottom: number
}

/** 自定义导航栏布局（避让微信胶囊） */
export interface NavLayout {
  statusBarHeight: number
  /** 导航内容行高度（与胶囊对齐并略留白） */
  navBarHeight: number
  /** 顶栏占用总高度 = 状态栏 + 导航行 */
  navTotalHeight: number
  /** 导航栏右侧留白，避免标题/按钮与胶囊重叠 */
  navPaddingRight: number
}

const NAV_EXTRA_GAP = 8

export function getNavLayout(): NavLayout {
  const { statusBarHeight } = getLayoutMetrics()
  const { screenWidth } = getScreenMetrics()
  let navBarHeight = 44 + NAV_EXTRA_GAP
  let navPaddingRight = 24

  try {
    const menu = uni.getMenuButtonBoundingClientRect()
    if (menu && menu.height > 0) {
      navBarHeight = (menu.top - statusBarHeight) * 2 + menu.height + NAV_EXTRA_GAP
      navPaddingRight = Math.max(24, screenWidth - menu.left + 10)
    }
  } catch {
    /* 非小程序环境 */
  }

  return {
    statusBarHeight,
    navBarHeight,
    navTotalHeight: statusBarHeight + navBarHeight,
    navPaddingRight
  }
}

export interface ScreenMetrics {
  screenWidth: number
  pixelRatio: number
}

export function getScreenMetrics(): ScreenMetrics {
  try {
    const win = uni.getWindowInfo()
    let pixelRatio = win.pixelRatio ?? 2
    if (typeof uni.getDeviceInfo === 'function') {
      const dev = uni.getDeviceInfo()
      if (dev.devicePixelRatio) pixelRatio = dev.devicePixelRatio
    }
    return {
      screenWidth: win.screenWidth ?? win.windowWidth ?? 375,
      pixelRatio
    }
  } catch {
    /* fallthrough */
  }
  try {
    const sys = uni.getSystemInfoSync()
    return {
      screenWidth: sys.screenWidth ?? 375,
      pixelRatio: sys.pixelRatio ?? 2
    }
  } catch {
    return { screenWidth: 375, pixelRatio: 2 }
  }
}

export function getLayoutMetrics(): LayoutMetrics {
  const fallback: LayoutMetrics = {
    statusBarHeight: 0,
    windowHeight: 667,
    safeAreaBottom: 0
  }

  try {
    if (typeof uni.getWindowInfo === 'function') {
      const win = uni.getWindowInfo()
      return {
        statusBarHeight: win.statusBarHeight ?? 0,
        windowHeight: win.windowHeight ?? fallback.windowHeight,
        safeAreaBottom: win.safeAreaInsets?.bottom ?? 0
      }
    }
  } catch {
    /* 继续回退 */
  }

  try {
    const sys = uni.getSystemInfoSync()
    return {
      statusBarHeight: sys.statusBarHeight ?? 0,
      windowHeight: sys.windowHeight ?? fallback.windowHeight,
      safeAreaBottom: sys.safeAreaInsets?.bottom ?? 0
    }
  } catch {
    return fallback
  }
}
