/**
 * 统一错误处理工具
 * 功能描述：提供统一的错误处理和用户提示
 * 主要功能：错误分类、用户提示、日志记录
 */

import { ERROR_MESSAGES } from './constants.js'

// 错误类型枚举
export const ERROR_TYPES = {
  NETWORK: 'NETWORK_ERROR',
  VALIDATION: 'VALIDATION_ERROR',
  API: 'API_ERROR',
  UNKNOWN: 'UNKNOWN_ERROR'
}

// 错误级别
export const ERROR_LEVELS = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical'
}

/**
 * 错误处理类
 */
class ErrorHandler {
  constructor() {
    this.errorLog = []
  }
  
  /**
   * 处理错误
   * @param {Error|Object} error - 错误对象
   * @param {Object} options - 处理选项
   * @returns {Object} 处理结果
   */
  handle(error, options = {}) {
    const errorInfo = this.analyzeError(error)
    const result = {
      type: errorInfo.type,
      level: errorInfo.level,
      message: errorInfo.message,
      showToast: options.showToast !== false,
      logError: options.logError !== false
    }
    
    // 记录错误日志
    if (result.logError) {
      this.logError(errorInfo)
    }
    
    // 显示用户提示
    if (result.showToast) {
      this.showErrorToast(result.message)
    }
    
    return result
  }
  
  /**
   * 分析错误类型和级别
   * @param {Error|Object} error - 错误对象
   * @returns {Object} 错误信息
   */
  analyzeError(error) {
    // 网络错误
    if (this.isNetworkError(error)) {
      return {
        type: ERROR_TYPES.NETWORK,
        level: ERROR_LEVELS.MEDIUM,
        message: ERROR_MESSAGES.NETWORK_ERROR
      }
    }
    
    // API错误
    if (this.isApiError(error)) {
      return {
        type: ERROR_TYPES.API,
        level: ERROR_LEVELS.MEDIUM,
        message: error.message || ERROR_MESSAGES.SAVE_FAILED
      }
    }
    
    // 验证错误
    if (this.isValidationError(error)) {
      return {
        type: ERROR_TYPES.VALIDATION,
        level: ERROR_LEVELS.LOW,
        message: error.message || '输入信息有误'
      }
    }
    
    // 未知错误
    return {
      type: ERROR_TYPES.UNKNOWN,
      level: ERROR_LEVELS.HIGH,
      message: error.message || '操作失败，请重试'
    }
  }
  
  /**
   * 判断是否为网络错误
   * @param {Error|Object} error - 错误对象
   * @returns {boolean} 是否为网络错误
   */
  isNetworkError(error) {
    if (!error) return false
    
    const networkKeywords = ['network', 'timeout', 'connection', 'fetch']
    const errorMessage = (error.message || '').toLowerCase()
    
    return networkKeywords.some(keyword => errorMessage.includes(keyword)) ||
           error.code === 'NETWORK_ERROR' ||
           error.status === 0
  }
  
  /**
   * 判断是否为API错误
   * @param {Error|Object} error - 错误对象
   * @returns {boolean} 是否为API错误
   */
  isApiError(error) {
    if (!error) return false
    
    return error.code !== undefined ||
           error.status !== undefined ||
           error.response !== undefined
  }
  
  /**
   * 判断是否为验证错误
   * @param {Error|Object} error - 错误对象
   * @returns {boolean} 是否为验证错误
   */
  isValidationError(error) {
    if (!error) return false
    
    const validationKeywords = ['validation', 'invalid', 'required', 'format']
    const errorMessage = (error.message || '').toLowerCase()
    
    return validationKeywords.some(keyword => errorMessage.includes(keyword)) ||
           error.type === 'VALIDATION_ERROR'
  }
  
  /**
   * 记录错误日志
   * @param {Object} errorInfo - 错误信息
   */
  logError(errorInfo) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      type: errorInfo.type,
      level: errorInfo.level,
      message: errorInfo.message,
      stack: errorInfo.stack
    }
    
    this.errorLog.push(logEntry)
    console.error('Error logged:', logEntry)
  }
  
  /**
   * 显示错误提示
   * @param {string} message - 错误消息
   */
  showErrorToast(message) {
    uni.showToast({
      title: message,
      icon: 'none',
      duration: 2000
    })
  }
  
  /**
   * 显示成功提示
   * @param {string} message - 成功消息
   */
  showSuccessToast(message) {
    uni.showToast({
      title: message,
      icon: 'success',
      duration: 1500
    })
  }
  
  /**
   * 获取错误日志
   * @returns {Array} 错误日志数组
   */
  getErrorLog() {
    return [...this.errorLog]
  }
  
  /**
   * 清除错误日志
   */
  clearErrorLog() {
    this.errorLog = []
  }
}

// 创建全局错误处理实例
const errorHandler = new ErrorHandler()

/**
 * 统一错误处理函数
 * @param {Error|Object} error - 错误对象
 * @param {Object} options - 处理选项
 * @returns {Object} 处理结果
 */
export const handleError = (error, options = {}) => {
  return errorHandler.handle(error, options)
}

/**
 * 显示成功提示
 * @param {string} message - 成功消息
 */
export const showSuccess = (message) => {
  errorHandler.showSuccessToast(message)
}

/**
 * 显示错误提示
 * @param {string} message - 错误消息
 */
export const showError = (message) => {
  errorHandler.showErrorToast(message)
}

export default errorHandler