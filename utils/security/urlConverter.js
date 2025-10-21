/**
 * URL转换工具
 * 功能描述：处理HTTP到HTTPS的转换，确保图片链接安全
 * 主要功能：URL协议转换、图片URL处理、安全验证
 */

// 导入环境检测工具
import { isLocalDevelopment, getRecommendedProtocol, getDevelopmentSuggestions } from './environmentDetector'

/**
 * 将HTTP URL转换为HTTPS（仅在生产环境）
 * @param {string} url - 原始URL
 * @returns {string} 转换后的URL
 */
export const convertToHttps = (url) => {
  if (!url || typeof url !== 'string') {
    return url
  }
  
  // 如果已经是HTTPS，直接返回
  if (url.startsWith('https://')) {
    return url
  }
  
  // 如果是相对路径，保持原样
  if (url.startsWith('/') || url.startsWith('./') || url.startsWith('../')) {
    return url
  }
  
  // 使用智能环境检测
  const recommendedProtocol = getRecommendedProtocol(url)
  
  // 如果推荐使用HTTP，保持HTTP协议
  if (recommendedProtocol === 'http') {
    console.log('🔧 本地开发环境保持HTTP协议:', url)
    return url
  }
  
  // 如果是HTTP，转换为HTTPS（仅在生产环境或非本地服务器）
  if (url.startsWith('http://')) {
    const httpsUrl = url.replace('http://', 'https://')
    console.log('🔒 转换为HTTPS协议:', httpsUrl)
    return httpsUrl
  }
  
  // 如果是其他协议，保持原样
  return url
}

/**
 * 处理用户头像URL，智能处理协议
 * @param {string} avatarUrl - 头像URL
 * @returns {string} 处理后的头像URL
 */
export const processAvatarUrl = (avatarUrl) => {
  if (!avatarUrl) {
    return ''
  }
  
  // 使用智能转换逻辑
  const processedUrl = convertToHttps(avatarUrl)
  
  // 如果是本地开发环境的localhost，提供开发建议
  if (processedUrl.includes('localhost:8081') && process.env.NODE_ENV === 'development') {
    console.warn('⚠️ 开发环境检测到本地服务器图片URL')
    console.warn('💡 建议：使用内网穿透工具（如ngrok）将本地服务暴露为HTTPS，以消除微信小程序警告')
  }
  
  return processedUrl
}

/**
 * 处理图片URL数组，批量转换HTTPS
 * @param {Array<string>} urls - 图片URL数组
 * @returns {Array<string>} 处理后的URL数组
 */
export const processImageUrls = (urls) => {
  if (!Array.isArray(urls)) {
    return urls
  }
  
  return urls.map(url => convertToHttps(url))
}

/**
 * 处理用户信息中的图片URL
 * @param {Object} userInfo - 用户信息对象
 * @returns {Object} 处理后的用户信息
 */
export const processUserInfoImages = (userInfo) => {
  if (!userInfo || typeof userInfo !== 'object') {
    return userInfo
  }
  
  const processed = { ...userInfo }
  
  // 处理头像URL
  if (processed.avatarUrl) {
    processed.avatarUrl = processAvatarUrl(processed.avatarUrl)
  }
  
  // 处理其他可能的图片字段
  if (processed.avatar) {
    processed.avatar = processAvatarUrl(processed.avatar)
  }
  
  return processed
}

/**
 * 处理民宿信息中的图片URL
 * @param {Object} homestayInfo - 民宿信息对象
 * @returns {Object} 处理后的民宿信息
 */
export const processHomestayImages = (homestayInfo) => {
  if (!homestayInfo || typeof homestayInfo !== 'object') {
    return homestayInfo
  }
  
  const processed = { ...homestayInfo }
  
  // 处理主图片
  if (processed.mainImage) {
    processed.mainImage = convertToHttps(processed.mainImage)
  }
  
  // 处理图片列表
  if (Array.isArray(processed.images)) {
    processed.images = processImageUrls(processed.images)
  }
  
  // 处理封面图片
  if (processed.coverImage) {
    processed.coverImage = convertToHttps(processed.coverImage)
  }
  
  return processed
}

/**
 * 检查URL是否为安全的HTTPS链接
 * @param {string} url - 要检查的URL
 * @returns {boolean} 是否为安全的HTTPS链接
 */
export const isSecureUrl = (url) => {
  if (!url || typeof url !== 'string') {
    return false
  }
  
  try {
    const urlObj = new URL(url)
    return urlObj.protocol === 'https:'
  } catch {
    // 如果不是完整URL，检查是否为相对路径
    return url.startsWith('/') || url.startsWith('./') || url.startsWith('../')
  }
}

/**
 * 获取安全的图片URL，智能处理协议
 * @param {string} url - 原始URL
 * @param {string} fallback - 备用URL
 * @returns {string} 安全的图片URL
 */
export const getSecureImageUrl = (url, fallback = '') => {
  if (!url) {
    return fallback
  }
  
  // 如果是相对路径，直接返回
  if (url.startsWith('/') || url.startsWith('./') || url.startsWith('../')) {
    return url
  }
  
  // 使用智能转换逻辑
  const secureUrl = convertToHttps(url)
  
  // 如果转换失败，使用备用URL
  if (!secureUrl) {
    return fallback
  }
  
  return secureUrl
}

/**
 * 创建图片错误处理函数，支持HTTP降级
 * @param {string} originalUrl - 原始图片URL
 * @returns {Function} 错误处理函数
 */
export const createImageErrorHandler = (originalUrl) => {
  return (error) => {
    console.warn('图片加载失败，尝试降级处理:', error)
    
    // 如果是HTTPS失败，尝试降级到HTTP（仅限本地开发环境）
    if (originalUrl && originalUrl.includes('localhost:8081')) {
      const httpUrl = originalUrl.replace('https://', 'http://')
      console.log('尝试使用HTTP协议:', httpUrl)
      return httpUrl
    }
    
    return null
  }
}

/**
 * 智能图片URL处理，支持错误降级
 * @param {string} url - 原始URL
 * @param {Function} onError - 错误处理回调
 * @returns {Object} 包含URL和错误处理的对象
 */
export const createSmartImageUrl = (url, onError) => {
  const processedUrl = getSecureImageUrl(url)
  const errorHandler = createImageErrorHandler(url)
  
  return {
    url: processedUrl,
    onError: (error) => {
      const fallbackUrl = errorHandler(error)
      if (fallbackUrl && onError) {
        onError(fallbackUrl)
      }
    }
  }
}

