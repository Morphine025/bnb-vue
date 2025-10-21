/**
 * 请求拦截器
 * 功能描述：统一处理所有API请求
 * 主要功能：添加认证头、请求ID、参数验证等
 */

import { generateRequestId } from '@/utils'
import { handleError } from '@/utils/error/errorHandler.js'
import { ErrorTypes, ErrorOptions } from '@/utils/error/errorTypes.js'

/**
 * 请求拦截器
 * @param {Object} config - 请求配置
 * @returns {Object} 处理后的配置
 */
export const requestInterceptor = (config) => {
  try {
    // 参数验证
    if (!config.url) {
      throw new Error('请求URL不能为空')
    }
    
    if (!config.method) {
      throw new Error('请求方法不能为空')
    }
    
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
  } catch (error) {
    const interceptorContext = {
      module: 'RequestInterceptor',
      layer: 'Interceptor',
      method: config.method,
      url: config.url,
      data: config.data
    }
    
    const errorOptions = {
      [ErrorOptions.SHOW_TOAST]: false, // 拦截器错误不显示Toast
      [ErrorOptions.LOG_ERROR]: true,
      [ErrorOptions.REPORT_ERROR]: true,
      [ErrorOptions.RETRY_ENABLED]: false,
      customMessage: '请求配置错误'
    }
    
    handleError(error, interceptorContext, errorOptions)
    throw error
  }
}

/**
 * 请求错误拦截器
 * @param {Error} error - 请求错误
 * @returns {Promise} 错误处理
 */
export const requestErrorInterceptor = (error) => {
  const interceptorContext = {
    module: 'RequestErrorInterceptor',
    layer: 'Interceptor',
    errorType: 'REQUEST_ERROR'
  }
  
  const errorOptions = {
    [ErrorOptions.SHOW_TOAST]: false, // 拦截器错误不显示Toast
    [ErrorOptions.LOG_ERROR]: true,
    [ErrorOptions.REPORT_ERROR]: true,
    [ErrorOptions.RETRY_ENABLED]: false,
    customMessage: '请求配置错误'
  }
  
  handleError(error, interceptorContext, errorOptions)
  return Promise.reject(error)
}
