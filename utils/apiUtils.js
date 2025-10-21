/**
 * API工具函数
 * 功能描述：提供API相关的工具函数
 * 主要功能：错误处理、请求ID生成、数据验证等
 */

// 导入错误处理器
import { globalErrorHandler } from '../api/core/ErrorHandler'

/**
 * 生成请求ID
 * @returns {string} 请求ID
 */
export const generateRequestId = () => {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

/**
 * 处理API错误 - 兼容新的错误处理机制
 * @param {Error} error - 错误对象
 * @param {string} defaultMessage - 默认错误消息
 * @returns {Error} 处理后的错误
 */
export const handleApiError = (error, defaultMessage = '请求失败') => {
  // 使用新的错误处理机制
  const errorInfo = globalErrorHandler.classifyError(error)
  
  // 返回处理后的错误
  const processedError = new Error(errorInfo.message || defaultMessage)
  processedError.code = errorInfo.code
  processedError.type = errorInfo.type
  processedError.level = errorInfo.level
  
  return processedError
}

/**
 * 验证API响应
 * @param {Object} response - API响应
 * @param {string} operation - 操作名称
 * @returns {boolean} 验证结果
 */
// export const validateApiResponse = (response, operation = '操作') => {
//   if (!response) {
//     throw new Error(`${operation}失败：无响应数据`)
//   }
  
//   if (response.code !== 1) {
//     throw new Error(response.msg || `${operation}失败`)
//   }
  
//   return true
// }

/**
 * 格式化API参数
 * @param {Object} params - 原始参数
 * @returns {Object} 格式化后的参数
 */
// export const formatApiParams = (params = {}) => {
//   const formatted = { ...params }
  
//   // 移除空值
//   Object.keys(formatted).forEach(key => {
//     if (formatted[key] === null || formatted[key] === undefined || formatted[key] === '') {
//       delete formatted[key]
//     }
//   })
  
//   return formatted
// }

/**
 * 构建查询字符串
 * @param {Object} params - 参数对象
 * @returns {string} 查询字符串
 */
// export const buildQueryString = (params = {}) => {
//   const queryParams = new URLSearchParams()
  
//   Object.keys(params).forEach(key => {
//     if (params[key] !== null && params[key] !== undefined && params[key] !== '') {
//       queryParams.append(key, params[key])
//     }
//   })
  
//   return queryParams.toString()
// }

/**
 * 重试机制
 * @param {Function} fn - 要重试的函数
 * @param {number} maxRetries - 最大重试次数
 * @param {number} delay - 重试延迟(ms)
 * @returns {Promise} 重试结果
 */
// export const retry = async (fn, maxRetries = 3, delay = 1000) => {
//   let lastError
  
//   for (let i = 0; i <= maxRetries; i++) {
//     try {
//       return await fn()
//     } catch (error) {
//       lastError = error
      
//       // 如果是最后一次重试，直接抛出错误
//       if (i === maxRetries) {
//         throw error
//       }
      
//       // 等待后重试
//       await new Promise(resolve => setTimeout(resolve, delay * (i + 1)))
//     }
//   }
  
//   throw lastError
// }

/**
 * 防抖函数
 * @param {Function} fn - 要防抖的函数
 * @param {number} delay - 延迟时间(ms)
 * @returns {Function} 防抖后的函数
 */
// export const debounce = (fn, delay = 300) => {
//   let timeoutId
//   return (...args) => {
//     clearTimeout(timeoutId)
//     timeoutId = setTimeout(() => fn.apply(this, args), delay)
//   }
// }

/**
 * 节流函数
 * @param {Function} fn - 要节流的函数
 * @param {number} delay - 延迟时间(ms)
 * @returns {Function} 节流后的函数
 */
// export const throttle = (fn, delay = 300) => {
//   let lastCall = 0
//   return (...args) => {
//     const now = Date.now()
//     if (now - lastCall >= delay) {
//       lastCall = now
//       return fn.apply(this, args)
//     }
//   }
// }
