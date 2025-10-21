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