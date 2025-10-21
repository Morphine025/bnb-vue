/**
 * 环境检测工具
 * 功能描述：检测当前运行环境，提供环境相关的配置
 * 主要功能：环境判断、协议选择、开发建议
 */

/**
 * 检测是否为本地开发环境
 * @returns {boolean} 是否为本地开发环境
 */
export const isLocalDevelopment = () => {
  // 检查Node环境
  const isNodeDev = process.env.NODE_ENV === 'development'
  
  // 检查是否为微信小程序开发工具
  const isWechatDevTools = typeof wx !== 'undefined' && (wx.getWindowInfo || wx.getSystemInfoSync)
  
  // 检查是否为H5开发环境
  const isH5Dev = typeof window !== 'undefined' && window.location.hostname === 'localhost'
  
  return isNodeDev || isWechatDevTools || isH5Dev
}

/**
 * 检测是否为生产环境
 * @returns {boolean} 是否为生产环境
 */
export const isProduction = () => {
  return process.env.NODE_ENV === 'production'
}

/**
 * 检测当前环境是否支持HTTPS
 * @returns {boolean} 是否支持HTTPS
 */
export const supportsHttps = () => {
  // 在生产环境中，假设支持HTTPS
  if (isProduction()) {
    return true
  }
  
  // 在开发环境中，检查是否为本地服务器
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname
    return !hostname.includes('localhost') && !hostname.includes('127.0.0.1')
  }
  
  // 微信小程序环境，默认支持HTTPS
  if (typeof wx !== 'undefined') {
    return true
  }
  
  return false
}

/**
 * 获取推荐的图片协议
 * @param {string} url - 图片URL
 * @returns {string} 推荐的协议
 */
export const getRecommendedProtocol = (url) => {
  if (!url || typeof url !== 'string') {
    return 'https'
  }
  
  // 如果是本地开发服务器，使用HTTP
  if (url.includes('localhost:8081') || url.includes('127.0.0.1:8081')) {
    return 'http'
  }
  
  // 如果是生产环境，使用HTTPS
  if (isProduction()) {
    return 'https'
  }
  
  // 默认使用HTTPS
  return 'https'
}

/**
 * 获取环境配置信息
 * @returns {Object} 环境配置
 */
export const getEnvironmentConfig = () => {
  return {
    isLocalDev: isLocalDevelopment(),
    isProduction: isProduction(),
    supportsHttps: supportsHttps(),
    nodeEnv: process.env.NODE_ENV,
    platform: typeof wx !== 'undefined' ? 'wechat' : 'h5'
  }
}

/**
 * 获取开发建议
 * @returns {Array<string>} 开发建议列表
 */
export const getDevelopmentSuggestions = () => {
  const suggestions = []
  
  if (isLocalDevelopment()) {
    suggestions.push('💡 使用内网穿透工具（如ngrok）将本地服务暴露为HTTPS')
    suggestions.push('💡 配置微信小程序开发工具的"不校验合法域名"选项')
    suggestions.push('💡 在生产环境中使用HTTPS协议')
  }
  
  return suggestions
}
