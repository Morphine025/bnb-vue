/**
 * 请求拦截器
 * 功能描述：统一处理所有API请求
 * 主要功能：添加认证头、请求ID、参数验证等
 */

import { generateRequestId } from '../utils/apiUtils'

/**
 * 请求拦截器
 * @param {Object} config - 请求配置
 * @returns {Object} 处理后的配置
 */
export const requestInterceptor = (config) => {
  // 添加认证头
  const token = uni.getStorageSync('token')
  if (token) {
    config.header = {
      ...config.header,
      'Authorization': `Bearer ${token}`
    }
  }
  
  // 添加请求ID用于追踪
  config.header = {
    ...config.header,
    'X-Request-ID': generateRequestId(),
    'Content-Type': 'application/json'
  }
  
  // 添加时间戳防止缓存
  if (config.method === 'GET') {
    const separator = config.url.includes('?') ? '&' : '?'
    config.url += `${separator}_t=${Date.now()}`
  }
  
  // 记录请求日志
  console.log(`🚀 API请求: ${config.method} ${config.url}`, {
    data: config.data,
    header: config.header
  })
  
  return config
}

/**
 * 请求错误拦截器
 * @param {Error} error - 请求错误
 * @returns {Promise} 错误处理
 */
export const requestErrorInterceptor = (error) => {
  console.error('❌ 请求错误:', error)
  return Promise.reject(error)
}
