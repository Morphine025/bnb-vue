/**
 * 简化错误工具函数
 * 功能描述：提供基础的错误处理工具函数
 */

import { ErrorTypes, ErrorLevels } from './errorTypes.js'

/**
 * 简化的错误工具类
 */
export class ErrorUtils {
  /**
   * 创建错误对象
   * @param {string} message - 错误消息
   * @param {string} type - 错误类型
   * @param {string} code - 错误代码
   * @returns {Error} 错误对象
   */
  static createError(message, type = ErrorTypes.UNKNOWN_ERROR, code = 'UNKNOWN') {
    const error = new Error(message)
    error.type = type
    error.code = code
    return error
  }

  /**
   * 判断是否为网络错误
   * @param {Error} error - 错误对象
   * @returns {boolean} 是否为网络错误
   */
  static isNetworkError(error) {
    return error.type === ErrorTypes.NETWORK_ERROR || 
           error.message.includes('网络') ||
           error.message.includes('Network')
  }

  /**
   * 判断是否为验证错误
   * @param {Error} error - 错误对象
   * @returns {boolean} 是否为验证错误
   */
  static isValidationError(error) {
    return error.type === ErrorTypes.VALIDATION_ERROR
  }

  /**
   * 判断是否为业务错误
   * @param {Error} error - 错误对象
   * @returns {boolean} 是否为业务错误
   */
  static isBusinessError(error) {
    return error.type === ErrorTypes.BUSINESS_ERROR
  }

  /**
   * 获取错误级别
   * @param {Error} error - 错误对象
   * @returns {string} 错误级别
   */
  static getErrorLevel(error) {
    switch (error.type) {
      case ErrorTypes.VALIDATION_ERROR:
        return ErrorLevels.LOW
      case ErrorTypes.BUSINESS_ERROR:
        return ErrorLevels.MEDIUM
      case ErrorTypes.NETWORK_ERROR:
      case ErrorTypes.API_ERROR:
        return ErrorLevels.HIGH
      default:
        return ErrorLevels.MEDIUM
    }
  }

  /**
   * 格式化错误信息
   * @param {Error} error - 错误对象
   * @returns {string} 格式化的错误信息
   */
  static formatError(error) {
    return `[${error.type}] ${error.message}`
  }
}