/**
 * 统一错误处理工具
 * 功能描述：提供统一的错误处理功能
 * 主要功能：错误分类、用户提示、日志记录
 */

// 导入统一错误处理模块
import { handleError as globalHandleError } from '../error/errorHandler.js'
import { ErrorTypes, ErrorLevels } from '../error/errorTypes.js'

/**
 * 生成请求ID
 * @returns {string} 请求ID
 */
export const generateRequestId = () => {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

/**
 * 统一错误处理
 * @param {Error|Object} error - 错误对象
 * @param {string} context - 错误上下文
 * @param {Object} options - 处理选项
 * @returns {Object} 处理结果
 */
export const handleError = (error, context = '', options = {}) => {
  const utilsContext = {
    module: 'Utils',
    layer: 'Utils',
    context: context
  }
  
  return globalHandleError(error, options, utilsContext)
}

/**
 * 处理网络错误
 * @param {Error|Object} error - 错误对象
 * @param {string} context - 错误上下文
 * @param {Object} options - 处理选项
 * @returns {Object} 处理结果
 */
export const handleNetworkError = (error, context = '', options = {}) => {
  const utilsContext = {
    module: 'Utils',
    layer: 'Utils',
    context: context,
    errorType: 'NETWORK_ERROR'
  }
  
  return globalHandleError(error, options, utilsContext)
}

/**
 * 处理API错误
 * @param {Error|Object} error - 错误对象
 * @param {string} context - 错误上下文
 * @param {Object} options - 处理选项
 * @returns {Object} 处理结果
 */
export const handleAPIError = (error, context = '', options = {}) => {
  const utilsContext = {
    module: 'Utils',
    layer: 'Utils',
    context: context,
    errorType: 'API_ERROR'
  }
  
  return globalHandleError(error, options, utilsContext)
}

/**
 * 处理验证错误
 * @param {Error|Object} error - 错误对象
 * @param {string} context - 错误上下文
 * @param {Object} options - 处理选项
 * @returns {Object} 处理结果
 */
export const handleValidationError = (error, context = '', options = {}) => {
  const utilsContext = {
    module: 'Utils',
    layer: 'Utils',
    context: context,
    errorType: 'VALIDATION_ERROR'
  }
  
  return globalHandleError(error, options, utilsContext)
}

/**
 * 处理业务错误
 * @param {Error|Object} error - 错误对象
 * @param {string} context - 错误上下文
 * @param {Object} options - 处理选项
 * @returns {Object} 处理结果
 */
export const handleBusinessError = (error, context = '', options = {}) => {
  const utilsContext = {
    module: 'Utils',
    layer: 'Utils',
    context: context,
    errorType: 'BUSINESS_ERROR'
  }
  
  return globalHandleError(error, options, utilsContext)
}

/**
 * 处理系统错误
 * @param {Error|Object} error - 错误对象
 * @param {string} context - 错误上下文
 * @param {Object} options - 处理选项
 * @returns {Object} 处理结果
 */
export const handleSystemError = (error, context = '', options = {}) => {
  const utilsContext = {
    module: 'Utils',
    layer: 'Utils',
    context: context,
    errorType: 'SYSTEM_ERROR'
  }
  
  return globalHandleError(error, options, utilsContext)
}

/**
 * 显示成功提示
 * @param {string} message - 成功消息
 */
export const showSuccess = (message) => {
  uni.showToast({
    title: message,
    icon: 'success',
    duration: 1500
  })
}

/**
 * 显示错误提示
 * @param {string} message - 错误消息
 */
export const showError = (message) => {
  uni.showToast({
    title: message,
    icon: 'none',
    duration: 2000
  })
}
