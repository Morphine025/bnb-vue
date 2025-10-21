/**
 * 开发环境辅助工具
 * 功能描述：为微信小程序开发环境提供辅助功能
 * 主要功能：开发环境检测、调试信息、开发建议
 */

/**
 * 检测当前是否为微信小程序开发环境
 * @returns {boolean} 是否为微信小程序开发环境
 */
export const isWechatMiniProgramDev = () => {
  return typeof wx !== 'undefined' && (wx.getWindowInfo || wx.getSystemInfoSync)
}

/**
 * 检测是否为本地开发服务器
 * @param {string} url - 要检测的URL
 * @returns {boolean} 是否为本地开发服务器
 */
export const isLocalDevServer = (url) => {
  if (!url || typeof url !== 'string') return false
  return url.includes('localhost:8081') || url.includes('127.0.0.1:8081')
}

/**
 * 获取开发环境建议
 * @returns {Array<string>} 开发建议列表
 */
export const getDevelopmentTips = () => {
  const tips = []
  
  if (isWechatMiniProgramDev()) {
    tips.push('💡 微信小程序开发环境检测')
    tips.push('💡 建议：在微信开发者工具中关闭"不校验合法域名"选项')
    tips.push('💡 建议：使用内网穿透工具（如ngrok）将本地服务暴露为HTTPS')
    tips.push('💡 建议：在生产环境中使用HTTPS协议')
  }
  
  return tips
}

/**
 * 打印开发环境信息
 */
export const logDevelopmentInfo = () => {
  console.log('🔧 开发环境信息:')
  console.log('  - 微信小程序环境:', isWechatMiniProgramDev())
  console.log('  - 开发建议:')
  getDevelopmentTips().forEach(tip => console.log('    ' + tip))
}

/**
 * 智能图片URL处理（开发环境优化）
 * @param {string} url - 原始URL
 * @returns {string} 处理后的URL
 */
export const getDevOptimizedImageUrl = (url) => {
  if (!url || typeof url !== 'string') {
    return '/static/logo.png'
  }
  
  // 如果是相对路径，直接返回
  if (url.startsWith('/') || url.startsWith('./') || url.startsWith('../')) {
    return url
  }
  
  // 如果是微信小程序开发环境且是本地服务器
  if (isWechatMiniProgramDev() && isLocalDevServer(url)) {
    // 在开发环境中，保持HTTP协议以便调试
    if (url.startsWith('http://')) {
      console.log('🔧 开发环境保持HTTP协议:', url)
      return url
    }
  }
  
  // 其他情况保持原样
  return url
}

/**
 * 创建开发环境图片错误处理函数
 * @param {string} originalUrl - 原始图片URL
 * @returns {Function} 错误处理函数
 */
export const createDevImageErrorHandler = (originalUrl) => {
  return (error) => {
    console.warn('图片加载失败，开发环境降级处理:', error)
    
    // 如果是本地开发服务器
    if (isLocalDevServer(originalUrl)) {
      if (originalUrl.startsWith('https://')) {
        // HTTPS失败，降级到HTTP
        const httpUrl = originalUrl.replace('https://', 'http://')
        console.log('🔄 开发环境降级到HTTP:', httpUrl)
        return httpUrl
      } else if (originalUrl.startsWith('http://')) {
        // HTTP也失败，使用默认图片
        console.log('🔄 使用默认图片作为降级方案')
        return '/static/logo.png'
      }
    }
    
    // 其他情况返回默认图片
    return '/static/logo.png'
  }
}
