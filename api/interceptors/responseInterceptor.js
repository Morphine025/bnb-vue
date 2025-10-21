/**
 * 响应拦截器
 * 功能描述：统一处理所有API响应
 * 主要功能：响应格式统一、错误处理、日志记录等
 */

import { handleError } from '@/utils/error/errorHandler.js'
import { ErrorTypes, ErrorOptions } from '@/utils/error/errorTypes.js'

/**
 * 响应拦截器
 * @param {Object} response - 响应对象
 * @returns {Object} 处理后的响应
 */
export const responseInterceptor = (response) => {
  try {
    // 记录响应日志
    console.log(`✅ API响应: ${response.statusCode}`, {
      data: response.data,
      header: response.header
    })
    
    // 统一处理响应格式
    if (response.data && typeof response.data === 'object') {
      // 如果响应格式正确
      if (response.data.code === 1) {
        return response.data
      } else {
        // 业务错误 - 修复字段名从msg改为message
        const error = new Error(response.data.message || response.data.msg || '请求失败')
        error.code = response.data.code
        error.data = response.data.data
        error.statusCode = response.statusCode
        
        const interceptorContext = {
          module: 'ResponseInterceptor',
          layer: 'Interceptor',
          statusCode: response.statusCode,
          responseData: response.data
        }
        
        const errorOptions = {
          [ErrorOptions.SHOW_TOAST]: true,
          [ErrorOptions.LOG_ERROR]: true,
          [ErrorOptions.REPORT_ERROR]: true,
          [ErrorOptions.RETRY_ENABLED]: false,
          customMessage: error.message
        }
        
        handleError(error, interceptorContext, errorOptions)
        throw error
      }
    } else {
      // 响应格式错误
      const error = new Error('响应格式错误')
      error.code = -1
      error.data = response.data
      error.statusCode = response.statusCode
      
      const interceptorContext = {
        module: 'ResponseInterceptor',
        layer: 'Interceptor',
        statusCode: response.statusCode,
        responseData: response.data
      }
      
      const errorOptions = {
        [ErrorOptions.SHOW_TOAST]: true,
        [ErrorOptions.LOG_ERROR]: true,
        [ErrorOptions.REPORT_ERROR]: true,
        [ErrorOptions.RETRY_ENABLED]: false,
        customMessage: '响应格式错误'
      }
      
      handleError(error, interceptorContext, errorOptions)
      throw error
    }
  } catch (error) {
    // 如果已经是处理过的错误，直接抛出
    if (error.code !== undefined) {
      throw error
    }
    
    // 处理拦截器内部错误
    const interceptorContext = {
      module: 'ResponseInterceptor',
      layer: 'Interceptor',
      statusCode: response.statusCode,
      responseData: response.data
    }
    
    const errorOptions = {
      [ErrorOptions.SHOW_TOAST]: false,
      [ErrorOptions.LOG_ERROR]: true,
      [ErrorOptions.REPORT_ERROR]: true,
      [ErrorOptions.RETRY_ENABLED]: false,
      customMessage: '响应处理错误'
    }
    
    handleError(error, interceptorContext, errorOptions)
    throw error
  }
}

/**
 * 响应错误拦截器
 * @param {Error} error - 响应错误
 * @returns {Promise} 错误处理
 */
export const responseErrorInterceptor = (error) => {
  const interceptorContext = {
    module: 'ResponseErrorInterceptor',
    layer: 'Interceptor',
    statusCode: error.statusCode,
    errMsg: error.errMsg
  }
  
  let processedError = error
  
  // 网络错误
  if (error.errMsg && error.errMsg.includes('request:fail')) {
    processedError = new Error('网络连接失败，请检查网络设置')
    processedError.code = 'NETWORK_ERROR'
    processedError.type = ErrorTypes.NETWORK_ERROR
  }
  // 超时错误
  else if (error.errMsg && error.errMsg.includes('timeout')) {
    processedError = new Error('请求超时，请稍后重试')
    processedError.code = 'TIMEOUT_ERROR'
    processedError.type = ErrorTypes.TIMEOUT_ERROR
  }
  // HTTP状态码错误
  else if (error.statusCode) {
    switch (error.statusCode) {
      case 401:
        processedError = new Error('登录已过期，请重新登录')
        processedError.code = 'AUTH_ERROR'
        processedError.type = ErrorTypes.AUTH_ERROR
        break
      case 403:
        processedError = new Error('没有权限执行此操作')
        processedError.code = 'PERMISSION_ERROR'
        processedError.type = ErrorTypes.PERMISSION_ERROR
        break
      case 404:
        processedError = new Error('请求的资源不存在')
        processedError.code = 'NOT_FOUND_ERROR'
        processedError.type = ErrorTypes.BUSINESS_ERROR
        break
      case 500:
        processedError = new Error('服务器错误，请稍后重试')
        processedError.code = 'SERVER_ERROR'
        processedError.type = ErrorTypes.SERVER_ERROR
        break
      default:
        processedError = new Error(`请求失败 (${error.statusCode})`)
        processedError.code = 'UNKNOWN_ERROR'
        processedError.type = ErrorTypes.UNKNOWN_ERROR
    }
  }
  
  const errorOptions = {
    [ErrorOptions.SHOW_TOAST]: true,
    [ErrorOptions.LOG_ERROR]: true,
    [ErrorOptions.REPORT_ERROR]: true,
    [ErrorOptions.RETRY_ENABLED]: processedError.type === ErrorTypes.NETWORK_ERROR || processedError.type === ErrorTypes.TIMEOUT_ERROR,
    customMessage: processedError.message
  }
  
  handleError(processedError, interceptorContext, errorOptions)
  return Promise.reject(processedError)
}

