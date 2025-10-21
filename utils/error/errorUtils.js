/**
 * 错误处理工具函数
 * 功能描述：提供统一的错误处理工具函数
 * 主要功能：错误格式化、验证、转换、处理工具
 */

import { ErrorTypes, ErrorLevels, ErrorOptions } from './errorTypes.js'
import { ErrorHandler } from './errorHandler.js'
import { ErrorLogger } from './errorLogger.js'
import { ErrorMessageManager } from './errorMessages.js'

/**
 * 错误处理工具类
 */
export class ErrorUtils {
  constructor() {
    this.errorHandler = new ErrorHandler()
    this.errorLogger = new ErrorLogger()
    this.messageManager = new ErrorMessageManager()
  }

  /**
   * 格式化错误对象
   * @param {Error|Object} error - 错误对象
   * @param {Object} options - 格式化选项
   * @returns {Object} 格式化后的错误对象
   */
  formatError(error, options = {}) {
    const {
      includeStack = true,
      includeContext = true,
      includeTimestamp = true,
      includeUserInfo = false,
      includeDeviceInfo = false,
      maskSensitiveData = true
    } = options

    const formattedError = {
      id: this.generateErrorId(),
      type: this.detectErrorType(error),
      level: this.detectErrorLevel(error),
      message: this.extractErrorMessage(error),
      code: this.extractErrorCode(error),
      timestamp: includeTimestamp ? new Date().toISOString() : undefined,
      originalError: error
    }

    // 添加堆栈信息
    if (includeStack && error.stack) {
      formattedError.stack = error.stack
    }

    // 添加上下文信息
    if (includeContext && error.context) {
      formattedError.context = this.maskSensitiveData ? this.maskData(error.context) : error.context
    }

    // 添加用户信息
    if (includeUserInfo) {
      formattedError.userInfo = this.getUserInfo()
    }

    // 添加设备信息
    if (includeDeviceInfo) {
      formattedError.deviceInfo = this.getDeviceInfo()
    }

    return formattedError
  }

  /**
   * 验证错误对象
   * @param {any} error - 要验证的对象
   * @returns {Object} 验证结果
   */
  validateError(error) {
    const result = {
      isValid: false,
      errors: [],
      warnings: []
    }

    // 检查错误对象是否存在
    if (!error) {
      result.errors.push('错误对象不能为空')
      return result
    }

    // 检查错误对象类型
    if (typeof error !== 'object') {
      result.warnings.push('错误对象应该是对象类型')
    }

    // 检查必要的错误属性
    if (!error.message && !error.errMsg) {
      result.warnings.push('错误对象缺少消息属性')
    }

    // 检查错误代码
    if (error.code && typeof error.code !== 'string' && typeof error.code !== 'number') {
      result.warnings.push('错误代码应该是字符串或数字类型')
    }

    // 检查错误类型
    if (error.type && !Object.values(ErrorTypes).includes(error.type)) {
      result.warnings.push('错误类型不在预定义的类型中')
    }

    // 检查错误级别
    if (error.level && !Object.values(ErrorLevels).includes(error.level)) {
      result.warnings.push('错误级别不在预定义的级别中')
    }

    // 如果没有严重错误，则认为验证通过
    if (result.errors.length === 0) {
      result.isValid = true
    }

    return result
  }

  /**
   * 转换错误对象
   * @param {any} error - 原始错误对象
   * @param {string} targetType - 目标错误类型
   * @returns {Object} 转换后的错误对象
   */
  convertError(error, targetType = 'standard') {
    switch (targetType) {
      case 'standard':
        return this.convertToStandardError(error)
      case 'api':
        return this.convertToApiError(error)
      case 'business':
        return this.convertToBusinessError(error)
      case 'system':
        return this.convertToSystemError(error)
      default:
        return this.convertToStandardError(error)
    }
  }

  /**
   * 转换为标准错误格式
   * @param {any} error - 原始错误对象
   * @returns {Object} 标准错误格式
   */
  convertToStandardError(error) {
    return {
      id: this.generateErrorId(),
      type: this.detectErrorType(error),
      level: this.detectErrorLevel(error),
      message: this.extractErrorMessage(error),
      code: this.extractErrorCode(error),
      timestamp: new Date().toISOString(),
      stack: error.stack || null,
      context: error.context || null,
      originalError: error
    }
  }

  /**
   * 转换为API错误格式
   * @param {any} error - 原始错误对象
   * @returns {Object} API错误格式
   */
  convertToApiError(error) {
    return {
      success: false,
      error: {
        code: this.extractErrorCode(error),
        message: this.extractErrorMessage(error),
        type: this.detectErrorType(error),
        level: this.detectErrorLevel(error),
        timestamp: new Date().toISOString()
      },
      data: null
    }
  }

  /**
   * 转换为业务错误格式
   * @param {any} error - 原始错误对象
   * @returns {Object} 业务错误格式
   */
  convertToBusinessError(error) {
    return {
      error: true,
      message: this.extractErrorMessage(error),
      code: this.extractErrorCode(error),
      type: this.detectErrorType(error),
      level: this.detectErrorLevel(error),
      timestamp: new Date().toISOString(),
      userMessage: this.getUserFriendlyMessage(error),
      action: this.getSuggestedAction(error)
    }
  }

  /**
   * 转换为系统错误格式
   * @param {any} error - 原始错误对象
   * @returns {Object} 系统错误格式
   */
  convertToSystemError(error) {
    return {
      systemError: true,
      errorId: this.generateErrorId(),
      errorType: this.detectErrorType(error),
      errorLevel: this.detectErrorLevel(error),
      errorMessage: this.extractErrorMessage(error),
      errorCode: this.extractErrorCode(error),
      timestamp: new Date().toISOString(),
      stackTrace: error.stack || null,
      systemInfo: this.getSystemInfo()
    }
  }

  /**
   * 检测错误类型
   * @param {any} error - 错误对象
   * @returns {string} 错误类型
   */
  detectErrorType(error) {
    if (!error) return ErrorTypes.UNKNOWN_ERROR

    // 网络错误检测
    if (this.isNetworkError(error)) {
      return ErrorTypes.NETWORK_ERROR
    }

    // 超时错误检测
    if (this.isTimeoutError(error)) {
      return ErrorTypes.TIMEOUT_ERROR
    }

    // 认证错误检测
    if (this.isAuthError(error)) {
      return ErrorTypes.AUTH_ERROR
    }

    // 权限错误检测
    if (this.isPermissionError(error)) {
      return ErrorTypes.PERMISSION_ERROR
    }

    // 验证错误检测
    if (this.isValidationError(error)) {
      return ErrorTypes.VALIDATION_ERROR
    }

    // 服务器错误检测
    if (this.isServerError(error)) {
      return ErrorTypes.SERVER_ERROR
    }

    // 业务错误检测
    if (this.isBusinessError(error)) {
      return ErrorTypes.BUSINESS_ERROR
    }

    // 系统错误检测
    if (this.isSystemError(error)) {
      return ErrorTypes.SYSTEM_ERROR
    }

    return ErrorTypes.UNKNOWN_ERROR
  }

  /**
   * 检测错误级别
   * @param {any} error - 错误对象
   * @returns {string} 错误级别
   */
  detectErrorLevel(error) {
    if (!error) return ErrorLevels.MEDIUM

    // 根据错误类型确定级别
    const errorType = this.detectErrorType(error)
    
    switch (errorType) {
      case ErrorTypes.NETWORK_ERROR:
      case ErrorTypes.AUTH_ERROR:
      case ErrorTypes.SERVER_ERROR:
        return ErrorLevels.HIGH
      case ErrorTypes.SYSTEM_ERROR:
        return ErrorLevels.CRITICAL
      case ErrorTypes.TIMEOUT_ERROR:
      case ErrorTypes.PERMISSION_ERROR:
      case ErrorTypes.BUSINESS_ERROR:
        return ErrorLevels.MEDIUM
      case ErrorTypes.VALIDATION_ERROR:
        return ErrorLevels.LOW
      default:
        return ErrorLevels.MEDIUM
    }
  }

  /**
   * 提取错误消息
   * @param {any} error - 错误对象
   * @returns {string} 错误消息
   */
  extractErrorMessage(error) {
    if (!error) return '未知错误'

    // 优先使用 message 属性
    if (error.message) {
      return error.message
    }

    // 使用 errMsg 属性（uni-app 常用）
    if (error.errMsg) {
      return error.errMsg
    }

    // 使用 error 属性
    if (error.error) {
      return error.error
    }

    // 使用 toString 方法
    if (typeof error.toString === 'function') {
      return error.toString()
    }

    return '未知错误'
  }

  /**
   * 提取错误代码
   * @param {any} error - 错误对象
   * @returns {string|number} 错误代码
   */
  extractErrorCode(error) {
    if (!error) return -1

    // 优先使用 code 属性
    if (error.code !== undefined) {
      return error.code
    }

    // 使用 statusCode 属性
    if (error.statusCode !== undefined) {
      return error.statusCode
    }

    // 使用 status 属性
    if (error.status !== undefined) {
      return error.status
    }

    return -1
  }

  /**
   * 检测网络错误
   * @param {any} error - 错误对象
   * @returns {boolean} 是否为网络错误
   */
  isNetworkError(error) {
    if (!error) return false

    const networkKeywords = ['network', 'connection', 'fetch', 'request:fail', '网络', '连接']
    const errorMessage = (error.message || '').toLowerCase()
    const errMsg = (error.errMsg || '').toLowerCase()

    return (
      networkKeywords.some(keyword => errorMessage.includes(keyword)) ||
      networkKeywords.some(keyword => errMsg.includes(keyword)) ||
      error.code === 'NETWORK_ERROR' ||
      error.status === 0 ||
      error.statusCode === 0
    )
  }

  /**
   * 检测超时错误
   * @param {any} error - 错误对象
   * @returns {boolean} 是否为超时错误
   */
  isTimeoutError(error) {
    if (!error) return false

    const timeoutKeywords = ['timeout', '超时', 'time out']
    const errorMessage = (error.message || '').toLowerCase()
    const errMsg = (error.errMsg || '').toLowerCase()

    return (
      timeoutKeywords.some(keyword => errorMessage.includes(keyword)) ||
      timeoutKeywords.some(keyword => errMsg.includes(keyword)) ||
      error.code === 'TIMEOUT_ERROR' ||
      error.status === 408 ||
      error.statusCode === 408
    )
  }

  /**
   * 检测认证错误
   * @param {any} error - 错误对象
   * @returns {boolean} 是否为认证错误
   */
  isAuthError(error) {
    if (!error) return false

    const authKeywords = ['auth', 'authentication', 'login', 'token', '认证', '登录']
    const errorMessage = (error.message || '').toLowerCase()
    const errMsg = (error.errMsg || '').toLowerCase()

    return (
      authKeywords.some(keyword => errorMessage.includes(keyword)) ||
      authKeywords.some(keyword => errMsg.includes(keyword)) ||
      error.code === 'AUTH_ERROR' ||
      error.status === 401 ||
      error.statusCode === 401
    )
  }

  /**
   * 检测权限错误
   * @param {any} error - 错误对象
   * @returns {boolean} 是否为权限错误
   */
  isPermissionError(error) {
    if (!error) return false

    const permissionKeywords = ['permission', 'forbidden', 'access', '权限', '禁止']
    const errorMessage = (error.message || '').toLowerCase()
    const errMsg = (error.errMsg || '').toLowerCase()

    return (
      permissionKeywords.some(keyword => errorMessage.includes(keyword)) ||
      permissionKeywords.some(keyword => errMsg.includes(keyword)) ||
      error.code === 'PERMISSION_ERROR' ||
      error.status === 403 ||
      error.statusCode === 403
    )
  }

  /**
   * 检测验证错误
   * @param {any} error - 错误对象
   * @returns {boolean} 是否为验证错误
   */
  isValidationError(error) {
    if (!error) return false

    const validationKeywords = ['validation', 'invalid', 'required', 'format', '验证', '无效']
    const errorMessage = (error.message || '').toLowerCase()
    const errMsg = (error.errMsg || '').toLowerCase()

    return (
      validationKeywords.some(keyword => errorMessage.includes(keyword)) ||
      validationKeywords.some(keyword => errMsg.includes(keyword)) ||
      error.type === 'VALIDATION_ERROR' ||
      error.code === 'VALIDATION_ERROR' ||
      error.status === 422 ||
      error.statusCode === 422
    )
  }

  /**
   * 检测服务器错误
   * @param {any} error - 错误对象
   * @returns {boolean} 是否为服务器错误
   */
  isServerError(error) {
    if (!error) return false

    const serverKeywords = ['server', 'internal', '服务器', '内部']
    const errorMessage = (error.message || '').toLowerCase()
    const errMsg = (error.errMsg || '').toLowerCase()

    return (
      serverKeywords.some(keyword => errorMessage.includes(keyword)) ||
      serverKeywords.some(keyword => errMsg.includes(keyword)) ||
      error.code === 'SERVER_ERROR' ||
      error.status === 500 ||
      error.statusCode === 500
    )
  }

  /**
   * 检测业务错误
   * @param {any} error - 错误对象
   * @returns {boolean} 是否为业务错误
   */
  isBusinessError(error) {
    if (!error) return false

    const businessKeywords = ['business', 'logic', '业务', '逻辑']
    const errorMessage = (error.message || '').toLowerCase()
    const errMsg = (error.errMsg || '').toLowerCase()

    return (
      businessKeywords.some(keyword => errorMessage.includes(keyword)) ||
      businessKeywords.some(keyword => errMsg.includes(keyword)) ||
      error.type === 'BUSINESS_ERROR' ||
      error.code === 'BUSINESS_ERROR'
    )
  }

  /**
   * 检测系统错误
   * @param {any} error - 错误对象
   * @returns {boolean} 是否为系统错误
   */
  isSystemError(error) {
    if (!error) return false

    const systemKeywords = ['system', 'fatal', 'critical', '系统', '致命', '严重']
    const errorMessage = (error.message || '').toLowerCase()
    const errMsg = (error.errMsg || '').toLowerCase()

    return (
      systemKeywords.some(keyword => errorMessage.includes(keyword)) ||
      systemKeywords.some(keyword => errMsg.includes(keyword)) ||
      error.type === 'SYSTEM_ERROR' ||
      error.code === 'SYSTEM_ERROR'
    )
  }

  /**
   * 获取用户友好的错误消息
   * @param {any} error - 错误对象
   * @returns {string} 用户友好的错误消息
   */
  getUserFriendlyMessage(error) {
    const errorType = this.detectErrorType(error)
    const message = this.messageManager.getErrorMessage(errorType)
    return message.message
  }

  /**
   * 获取建议的操作
   * @param {any} error - 错误对象
   * @returns {string} 建议的操作
   */
  getSuggestedAction(error) {
    const errorType = this.detectErrorType(error)
    const message = this.messageManager.getErrorMessage(errorType)
    return message.action
  }

  /**
   * 生成错误ID
   * @returns {string} 错误ID
   */
  generateErrorId() {
    return `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * 获取用户信息
   * @returns {Object} 用户信息
   */
  getUserInfo() {
    try {
      return {
        userId: uni.getStorageSync('user_id') || 'anonymous',
        sessionId: uni.getStorageSync('session_id') || 'unknown'
      }
    } catch (error) {
      return {
        userId: 'anonymous',
        sessionId: 'unknown'
      }
    }
  }

  /**
   * 获取设备信息
   * @returns {Object} 设备信息
   */
  getDeviceInfo() {
    try {
      const systemInfo = uni.getSystemInfoSync()
      return {
        platform: systemInfo.platform,
        system: systemInfo.system,
        version: systemInfo.version,
        model: systemInfo.model,
        brand: systemInfo.brand
      }
    } catch (error) {
      return {
        platform: 'unknown',
        system: 'unknown',
        version: 'unknown',
        model: 'unknown',
        brand: 'unknown'
      }
    }
  }

  /**
   * 获取系统信息
   * @returns {Object} 系统信息
   */
  getSystemInfo() {
    return {
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'Unknown',
      url: typeof window !== 'undefined' ? window.location.href : 'Unknown',
      timestamp: new Date().toISOString(),
      ...this.getDeviceInfo(),
      ...this.getUserInfo()
    }
  }

  /**
   * 脱敏敏感数据
   * @param {Object} data - 要脱敏的数据
   * @returns {Object} 脱敏后的数据
   */
  maskData(data) {
    if (!data || typeof data !== 'object') return data

    const sensitiveFields = ['password', 'token', 'secret', 'key', 'auth', 'credential']
    const maskedData = { ...data }

    Object.keys(maskedData).forEach(key => {
      if (sensitiveFields.some(field => key.toLowerCase().includes(field))) {
        maskedData[key] = '***'
      } else if (typeof maskedData[key] === 'object') {
        maskedData[key] = this.maskData(maskedData[key])
      }
    })

    return maskedData
  }

  /**
   * 创建错误处理包装器
   * @param {Function} fn - 要包装的函数
   * @param {Object} options - 包装选项
   * @returns {Function} 包装后的函数
   */
  createErrorWrapper(fn, options = {}) {
    return async (...args) => {
      try {
        return await fn(...args)
      } catch (error) {
        const formattedError = this.formatError(error, options)
        this.errorHandler.handle(formattedError, options)
        throw formattedError
      }
    }
  }

  /**
   * 创建错误处理中间件
   * @param {Object} options - 中间件选项
   * @returns {Function} 错误处理中间件
   */
  createErrorMiddleware(options = {}) {
    return (error, req, res, next) => {
      const formattedError = this.formatError(error, options)
      this.errorHandler.handle(formattedError, options)
      next(formattedError)
    }
  }

  /**
   * 批量处理错误
   * @param {Array} errors - 错误数组
   * @param {Object} options - 处理选项
   * @returns {Array} 处理结果数组
   */
  batchHandleErrors(errors, options = {}) {
    return errors.map(error => {
      const formattedError = this.formatError(error, options)
      return this.errorHandler.handle(formattedError, options)
    })
  }

  /**
   * 清理错误数据
   * @param {Object} error - 错误对象
   * @returns {Object} 清理后的错误对象
   */
  cleanErrorData(error) {
    const cleaned = { ...error }
    
    // 移除敏感信息
    delete cleaned.originalError
    delete cleaned.stack
    delete cleaned.context
    
    // 保留必要信息
    return {
      id: cleaned.id,
      type: cleaned.type,
      level: cleaned.level,
      message: cleaned.message,
      code: cleaned.code,
      timestamp: cleaned.timestamp
    }
  }

  /**
   * 比较错误对象
   * @param {Object} error1 - 错误对象1
   * @param {Object} error2 - 错误对象2
   * @returns {boolean} 是否相同
   */
  compareErrors(error1, error2) {
    if (!error1 || !error2) return false
    
    return (
      error1.type === error2.type &&
      error1.code === error2.code &&
      error1.message === error2.message
    )
  }

  /**
   * 合并错误对象
   * @param {Object} error1 - 错误对象1
   * @param {Object} error2 - 错误对象2
   * @returns {Object} 合并后的错误对象
   */
  mergeErrors(error1, error2) {
    return {
      ...error1,
      ...error2,
      merged: true,
      mergeTime: new Date().toISOString(),
      originalErrors: [error1, error2]
    }
  }
}

// 创建全局错误工具实例
export const globalErrorUtils = new ErrorUtils()

// 导出便捷方法
export const formatError = (error, options) => globalErrorUtils.formatError(error, options)
export const validateError = (error) => globalErrorUtils.validateError(error)
export const convertError = (error, targetType) => globalErrorUtils.convertError(error, targetType)
export const detectErrorType = (error) => globalErrorUtils.detectErrorType(error)
export const detectErrorLevel = (error) => globalErrorUtils.detectErrorLevel(error)
export const extractErrorMessage = (error) => globalErrorUtils.extractErrorMessage(error)
export const extractErrorCode = (error) => globalErrorUtils.extractErrorCode(error)
export const getUserFriendlyMessage = (error) => globalErrorUtils.getUserFriendlyMessage(error)
export const getSuggestedAction = (error) => globalErrorUtils.getSuggestedAction(error)
export const createErrorWrapper = (fn, options) => globalErrorUtils.createErrorWrapper(fn, options)
export const createErrorMiddleware = (options) => globalErrorUtils.createErrorMiddleware(options)
export const batchHandleErrors = (errors, options) => globalErrorUtils.batchHandleErrors(errors, options)
export const cleanErrorData = (error) => globalErrorUtils.cleanErrorData(error)
export const compareErrors = (error1, error2) => globalErrorUtils.compareErrors(error1, error2)
export const mergeErrors = (error1, error2) => globalErrorUtils.mergeErrors(error1, error2)
