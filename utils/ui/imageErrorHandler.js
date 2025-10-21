/**
 * 图片错误处理工具
 * 功能描述：统一处理图片加载错误，支持HTTPS降级和默认图片
 * 主要功能：错误处理、协议降级、默认图片设置
 */

/**
 * 处理图片加载错误
 * @param {Event} errorEvent - 图片错误事件
 * @param {Object} options - 处理选项
 * @param {string} options.fallbackImage - 默认图片路径
 * @param {boolean} options.enableHttpsFallback - 是否启用HTTPS降级
 * @param {Function} options.onError - 错误回调函数
 */
export const handleImageError = (errorEvent, options = {}) => {
  const {
    fallbackImage = '/static/logo.png',
    enableHttpsFallback = true,
    onError = null
  } = options

  console.log('图片加载失败:', errorEvent)

  if (!errorEvent || !errorEvent.target) {
    console.warn('图片错误事件无效')
    return
  }

  const currentSrc = errorEvent.target.src
  console.log('当前图片源:', currentSrc)

  // 如果启用HTTPS降级且是本地开发服务器
  if (enableHttpsFallback && currentSrc.includes('https://localhost:8081')) {
    const httpSrc = currentSrc.replace('https://', 'http://')
    console.log('🔄 尝试降级到HTTP协议:', httpSrc)
    console.warn('⚠️ 注意：微信小程序可能仍会显示HTTP协议警告')
    
    // 更新图片源
    errorEvent.target.src = httpSrc
    return
  }

  // 如果启用HTTPS降级且是127.0.0.1
  if (enableHttpsFallback && currentSrc.includes('https://127.0.0.1:8081')) {
    const httpSrc = currentSrc.replace('https://', 'http://')
    console.log('🔄 尝试降级到HTTP协议:', httpSrc)
    console.warn('⚠️ 注意：微信小程序可能仍会显示HTTP协议警告')
    
    // 更新图片源
    errorEvent.target.src = httpSrc
    return
  }

  // 设置默认图片
  if (fallbackImage) {
    console.log('设置默认图片:', fallbackImage)
    errorEvent.target.src = fallbackImage
  }

  // 调用错误回调
  if (onError && typeof onError === 'function') {
    onError(errorEvent, currentSrc)
  }
}

/**
 * 创建图片错误处理函数（用于Vue组件）
 * @param {Object} options - 处理选项
 * @returns {Function} 错误处理函数
 */
export const createImageErrorHandler = (options = {}) => {
  return (errorEvent) => {
    handleImageError(errorEvent, options)
  }
}

/**
 * 处理头像图片错误
 * @param {Event} errorEvent - 图片错误事件
 */
export const handleAvatarError = (errorEvent) => {
  handleImageError(errorEvent, {
    fallbackImage: '/static/logo.png',
    enableHttpsFallback: true
  })
}

/**
 * 处理民宿图片错误
 * @param {Event} errorEvent - 图片错误事件
 */
export const handleHomestayImageError = (errorEvent) => {
  handleImageError(errorEvent, {
    fallbackImage: '/static/logo.png',
    enableHttpsFallback: true
  })
}

/**
 * 处理轮播图错误
 * @param {Event} errorEvent - 图片错误事件
 */
export const handleBannerImageError = (errorEvent) => {
  handleImageError(errorEvent, {
    fallbackImage: '/static/logo.png',
    enableHttpsFallback: true
  })
}

/**
 * 检查是否为本地开发服务器图片
 * @param {string} url - 图片URL
 * @returns {boolean} 是否为本地开发服务器
 */
export const isLocalDevImage = (url) => {
  if (!url || typeof url !== 'string') {
    return false
  }
  
  return url.includes('localhost:8081') || url.includes('127.0.0.1:8081')
}

/**
 * 获取开发环境建议
 * @returns {Array<string>} 建议列表
 */
export const getDevelopmentSuggestions = () => {
  return [
    '💡 使用内网穿透工具（如ngrok）将本地服务暴露为HTTPS',
    '💡 在微信开发者工具中关闭"不校验合法域名"选项',
    '💡 配置本地服务器支持HTTPS协议',
    '💡 使用云存储服务（如阿里云OSS、腾讯云COS）存储图片'
  ]
}

export default {
  handleImageError,
  createImageErrorHandler,
  handleAvatarError,
  handleHomestayImageError,
  handleBannerImageError,
  isLocalDevImage,
  getDevelopmentSuggestions
}
