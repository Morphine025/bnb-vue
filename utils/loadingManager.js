/**
 * Loading状态管理工具
 * 功能描述：统一管理应用中的Loading状态，避免冲突
 * 主要功能：Loading计数、状态管理、错误处理
 */

// 全局Loading计数器
let globalLoadingCount = 0
let isGlobalLoading = false

/**
 * 显示Loading
 * 兼容两种用法：
 * 1) showLoading('加载中...', true)
 * 2) showLoading({ title: '加载中...', mask: true })
 */
export const showLoading = (titleOrOptions = '加载中...', mask = true) => {
  // 兼容对象入参
  let title = titleOrOptions
  let finalMask = mask
  if (typeof titleOrOptions === 'object' && titleOrOptions !== null) {
    title = titleOrOptions.title || '加载中...'
    finalMask = typeof titleOrOptions.mask === 'boolean' ? titleOrOptions.mask : true
  }

  globalLoadingCount++
  
  if (!isGlobalLoading) {
    isGlobalLoading = true
    uni.showLoading({
      title,
      mask: finalMask
    })
  }
}

/**
 * 隐藏Loading
 */
export const hideLoading = () => {
  globalLoadingCount--
  
  if (globalLoadingCount <= 0) {
    globalLoadingCount = 0
    if (isGlobalLoading) {
      isGlobalLoading = false
      uni.hideLoading()
    }
  }
}

/**
 * 强制隐藏所有Loading
 */
export const forceHideLoading = () => {
  globalLoadingCount = 0
  if (isGlobalLoading) {
    isGlobalLoading = false
    uni.hideLoading()
  }
}

/**
 * 获取Loading状态
 */
export const getLoadingStatus = () => {
  return {
    count: globalLoadingCount,
    isShowing: isGlobalLoading
  }
}

/**
 * 重置Loading状态
 */
export const resetLoading = () => {
  globalLoadingCount = 0
  isGlobalLoading = false
}

export default {
  showLoading,
  hideLoading,
  forceHideLoading,
  getLoadingStatus,
  resetLoading
}
