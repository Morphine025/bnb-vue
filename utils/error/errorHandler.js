/**
 * 统一错误处理器
 * 功能描述：提供统一的错误处理机制
 * 主要功能：错误分类、记录、提示、上报、重试
 */

import { ErrorTypes, ErrorLevels, ErrorOptions, ErrorMessages, ErrorConfig, ErrorStatsConfig, ErrorRetryConfig, ErrorReportConfig } from './errorTypes.js'
import { ErrorLogger } from './errorLogger.js'

/**
 * 统一错误处理器类
 */
export class ErrorHandler {
  constructor(options = {}) {
    this.options = { ...ErrorConfig.defaultOptions, ...options }
    this.errorQueue = []
    this.errorStats = {
      total: 0,
      byType: {},
      byLevel: {},
      recent: []
    }
    this.isReporting = false
    this.retryQueue = []
    
    // 初始化错误日志记录器
    this.logger = new ErrorLogger()
    
    // 初始化错误上报
    this.initErrorReporting()
  }

  /**
   * 处理错误
   * @param {Error|Object} error - 错误对象
   * @param {Object} options - 处理选项
   * @param {Object} context - 上下文信息
   * @returns {Object} 处理结果
   */
  handle(error, options = {}, context = null) {
    try {
      // 错误分类
      const errorInfo = this.classifyError(error, context)
      
      // 合并处理选项
      const mergedOptions = this.mergeOptions(options, errorInfo)
      
      // 记录错误
      if (mergedOptions[ErrorOptions.LOG_ERROR]) {
        this.logError(errorInfo, context)
      }
      
      // 添加到错误队列
      this.addToQueue(errorInfo)
      
      // 更新错误统计
      this.updateErrorStats(errorInfo)
      
      // 显示用户提示
      this.showUserMessage(errorInfo, mergedOptions)
      
      // 错误上报
      if (mergedOptions[ErrorOptions.REPORT_ERROR]) {
        this.reportError(errorInfo)
      }
      
      // 错误重试
      if (mergedOptions[ErrorOptions.RETRY_ENABLED]) {
        this.handleRetry(errorInfo, mergedOptions)
      }
      
      return {
        success: true,
        errorInfo,
        handled: true
      }
    } catch (handleError) {
      console.error('错误处理失败:', handleError)
      return {
        success: false,
        error: handleError,
        handled: false
      }
    }
  }

  /**
   * 错误分类
   * @param {Error|Object} error - 错误对象
   * @param {Object} context - 上下文信息
   * @returns {Object} 分类后的错误信息
   */
  classifyError(error, context = null) {
    const errorInfo = {
      id: this.generateErrorId(),
      type: ErrorTypes.UNKNOWN_ERROR,
      level: ErrorLevels.MEDIUM,
      message: error.message || '未知错误',
      code: error.code || -1,
      originalError: error,
      timestamp: new Date().toISOString(),
      context,
      userAgent: this.getUserAgent(),
      url: this.getCurrentUrl(),
      stack: error.stack || null
    }

    // 网络错误检测
    if (this.isNetworkError(error)) {
      errorInfo.type = ErrorTypes.NETWORK_ERROR
      errorInfo.message = ErrorMessages[ErrorTypes.NETWORK_ERROR].message
      errorInfo.level = ErrorConfig.typeConfig[ErrorTypes.NETWORK_ERROR].level
    }
    // 超时错误检测
    else if (this.isTimeoutError(error)) {
      errorInfo.type = ErrorTypes.TIMEOUT_ERROR
      errorInfo.message = ErrorMessages[ErrorTypes.TIMEOUT_ERROR].message
      errorInfo.level = ErrorConfig.typeConfig[ErrorTypes.TIMEOUT_ERROR].level
    }
    // HTTP状态码错误检测
    else if (error.statusCode) {
      this.classifyHttpError(error, errorInfo)
    }
    // 业务错误码检测
    else if (error.code) {
      this.classifyBusinessError(error, errorInfo)
    }
    // 验证错误检测
    else if (this.isValidationError(error)) {
      errorInfo.type = ErrorTypes.VALIDATION_ERROR
      errorInfo.message = ErrorMessages[ErrorTypes.VALIDATION_ERROR].message
      errorInfo.level = ErrorConfig.typeConfig[ErrorTypes.VALIDATION_ERROR].level
    }

    return errorInfo
  }

  /**
   * 检测网络错误
   * @param {Error|Object} error - 错误对象
   * @returns {boolean} 是否为网络错误
   */
  isNetworkError(error) {
    if (!error) return false

    const networkKeywords = ['network', 'connection', 'fetch', 'request:fail']
    const errorMessage = (error.message || '').toLowerCase()
    const errMsg = (error.errMsg || '').toLowerCase()

    return (
      networkKeywords.some(keyword => errorMessage.includes(keyword)) ||
      networkKeywords.some(keyword => errMsg.includes(keyword)) ||
      error.code === 'NETWORK_ERROR' ||
      error.status === 0
    )
  }

  /**
   * 检测超时错误
   * @param {Error|Object} error - 错误对象
   * @returns {boolean} 是否为超时错误
   */
  isTimeoutError(error) {
    if (!error) return false

    const timeoutKeywords = ['timeout', '超时']
    const errorMessage = (error.message || '').toLowerCase()
    const errMsg = (error.errMsg || '').toLowerCase()

    return (
      timeoutKeywords.some(keyword => errorMessage.includes(keyword)) ||
      timeoutKeywords.some(keyword => errMsg.includes(keyword)) ||
      error.code === 'TIMEOUT_ERROR'
    )
  }

  /**
   * 检测验证错误
   * @param {Error|Object} error - 错误对象
   * @returns {boolean} 是否为验证错误
   */
  isValidationError(error) {
    if (!error) return false

    const validationKeywords = ['validation', 'invalid', 'required', 'format', '验证']
    const errorMessage = (error.message || '').toLowerCase()

    return (
      validationKeywords.some(keyword => errorMessage.includes(keyword)) ||
      error.type === 'VALIDATION_ERROR' ||
      error.code === 'VALIDATION_ERROR'
    )
  }

  /**
   * 分类HTTP错误
   * @param {Object} error - 错误对象
   * @param {Object} errorInfo - 错误信息对象
   */
  classifyHttpError(error, errorInfo) {
    switch (error.statusCode) {
      case 401:
        errorInfo.type = ErrorTypes.AUTH_ERROR
        errorInfo.message = ErrorMessages[ErrorTypes.AUTH_ERROR].message
        errorInfo.level = ErrorConfig.typeConfig[ErrorTypes.AUTH_ERROR].level
        break
      case 403:
        errorInfo.type = ErrorTypes.PERMISSION_ERROR
        errorInfo.message = ErrorMessages[ErrorTypes.PERMISSION_ERROR].message
        errorInfo.level = ErrorConfig.typeConfig[ErrorTypes.PERMISSION_ERROR].level
        break
      case 404:
        errorInfo.message = '请求的资源不存在'
        errorInfo.level = ErrorLevels.LOW
        break
      case 422:
        errorInfo.type = ErrorTypes.VALIDATION_ERROR
        errorInfo.message = ErrorMessages[ErrorTypes.VALIDATION_ERROR].message
        errorInfo.level = ErrorConfig.typeConfig[ErrorTypes.VALIDATION_ERROR].level
        break
      case 500:
        errorInfo.type = ErrorTypes.SERVER_ERROR
        errorInfo.message = ErrorMessages[ErrorTypes.SERVER_ERROR].message
        errorInfo.level = ErrorConfig.typeConfig[ErrorTypes.SERVER_ERROR].level
        break
      default:
        errorInfo.message = `请求失败 (${error.statusCode})`
        errorInfo.level = ErrorLevels.MEDIUM
    }
  }

  /**
   * 分类业务错误
   * @param {Object} error - 错误对象
   * @param {Object} errorInfo - 错误信息对象
   */
  classifyBusinessError(error, errorInfo) {
    switch (error.code) {
      case 'AUTH_ERROR':
        errorInfo.type = ErrorTypes.AUTH_ERROR
        errorInfo.message = ErrorMessages[ErrorTypes.AUTH_ERROR].message
        errorInfo.level = ErrorConfig.typeConfig[ErrorTypes.AUTH_ERROR].level
        break
      case 'PERMISSION_ERROR':
        errorInfo.type = ErrorTypes.PERMISSION_ERROR
        errorInfo.message = ErrorMessages[ErrorTypes.PERMISSION_ERROR].message
        errorInfo.level = ErrorConfig.typeConfig[ErrorTypes.PERMISSION_ERROR].level
        break
      case 'VALIDATION_ERROR':
        errorInfo.type = ErrorTypes.VALIDATION_ERROR
        errorInfo.message = ErrorMessages[ErrorTypes.VALIDATION_ERROR].message
        errorInfo.level = ErrorConfig.typeConfig[ErrorTypes.VALIDATION_ERROR].level
        break
      case 'BUSINESS_ERROR':
        errorInfo.type = ErrorTypes.BUSINESS_ERROR
        errorInfo.message = ErrorMessages[ErrorTypes.BUSINESS_ERROR].message
        errorInfo.level = ErrorConfig.typeConfig[ErrorTypes.BUSINESS_ERROR].level
        break
      default:
        errorInfo.type = ErrorTypes.BUSINESS_ERROR
        errorInfo.message = error.message || ErrorMessages[ErrorTypes.BUSINESS_ERROR].message
        errorInfo.level = ErrorLevels.MEDIUM
    }
  }

  /**
   * 合并处理选项
   * @param {Object} options - 用户选项
   * @param {Object} errorInfo - 错误信息
   * @returns {Object} 合并后的选项
   */
  mergeOptions(options, errorInfo) {
    const typeConfig = ErrorConfig.typeConfig[errorInfo.type] || {}
    const levelConfig = ErrorConfig.levelConfig[errorInfo.level] || {}
    
    return {
      ...ErrorConfig.defaultOptions,
      ...levelConfig,
      ...typeConfig,
      ...options
    }
  }

  /**
   * 记录错误日志
   * @param {Object} errorInfo - 错误信息
   * @param {Object} context - 上下文信息
   */
  logError(errorInfo, context) {
    this.logger.logError(errorInfo, context)
  }

  /**
   * 添加到错误队列
   * @param {Object} errorInfo - 错误信息
   */
  addToQueue(errorInfo) {
    this.errorQueue.push(errorInfo)
    
    // 保持队列大小
    if (this.errorQueue.length > ErrorStatsConfig.maxQueueSize) {
      this.errorQueue.shift()
    }
  }

  /**
   * 更新错误统计
   * @param {Object} errorInfo - 错误信息
   */
  updateErrorStats(errorInfo) {
    this.errorStats.total++
    this.errorStats.byType[errorInfo.type] = (this.errorStats.byType[errorInfo.type] || 0) + 1
    this.errorStats.byLevel[errorInfo.level] = (this.errorStats.byLevel[errorInfo.level] || 0) + 1
    
    // 更新最近错误
    this.errorStats.recent.unshift(errorInfo)
    if (this.errorStats.recent.length > 10) {
      this.errorStats.recent.pop()
    }
  }

  /**
   * 显示用户提示
   * @param {Object} errorInfo - 错误信息
   * @param {Object} options - 处理选项
   */
  showUserMessage(errorInfo, options) {
    const message = ErrorMessages[errorInfo.type] || ErrorMessages[ErrorTypes.UNKNOWN_ERROR]
    
    if (options[ErrorOptions.SHOW_TOAST]) {
      this.showToast(message.message)
    }
    
    if (options[ErrorOptions.SHOW_MODAL]) {
      this.showModal(message.title, message.message, message.action)
    }
  }

  /**
   * 显示Toast提示
   * @param {string} message - 提示消息
   */
  showToast(message) {
    uni.showToast({
      title: message,
      icon: 'none',
      duration: 2000
    })
  }

  /**
   * 显示Modal弹窗
   * @param {string} title - 标题
   * @param {string} content - 内容
   * @param {string} action - 操作提示
   */
  showModal(title, content, action) {
    uni.showModal({
      title: title,
      content: content,
      showCancel: false,
      confirmText: '确定'
    })
  }

  /**
   * 错误上报
   * @param {Object} errorInfo - 错误信息
   */
  async reportError(errorInfo) {
    if (this.isReporting || !ErrorReportConfig.enabled) return
    
    this.isReporting = true
    
    try {
      // 这里可以集成第三方错误监控服务
      console.log('📤 错误上报:', errorInfo)
      
      // 模拟上报
      await new Promise(resolve => setTimeout(resolve, 100))
      
    } catch (reportError) {
      console.error('错误上报失败:', reportError)
    } finally {
      this.isReporting = false
    }
  }

  /**
   * 处理错误重试
   * @param {Object} errorInfo - 错误信息
   * @param {Object} options - 处理选项
   */
  handleRetry(errorInfo, options) {
    if (!options[ErrorOptions.RETRY_ENABLED]) return
    
    const retryConfig = {
      errorInfo,
      retryCount: 0,
      maxRetries: options[ErrorOptions.RETRY_COUNT] || ErrorRetryConfig.maxRetries,
      retryDelay: options[ErrorOptions.RETRY_DELAY] || ErrorRetryConfig.baseDelay
    }
    
    this.retryQueue.push(retryConfig)
    this.processRetryQueue()
  }

  /**
   * 处理重试队列
   */
  async processRetryQueue() {
    if (this.retryQueue.length === 0) return
    
    const retryConfig = this.retryQueue.shift()
    
    if (retryConfig.retryCount < retryConfig.maxRetries) {
      retryConfig.retryCount++
      
      // 延迟重试
      setTimeout(() => {
        this.retryQueue.push(retryConfig)
        this.processRetryQueue()
      }, retryConfig.retryDelay)
    }
  }

  /**
   * 生成错误ID
   * @returns {string} 错误ID
   */
  generateErrorId() {
    return `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * 获取用户代理信息
   * @returns {string} 用户代理字符串
   */
  getUserAgent() {
    return typeof navigator !== 'undefined' ? navigator.userAgent : 'Unknown'
  }

  /**
   * 获取当前URL
   * @returns {string} 当前页面URL
   */
  getCurrentUrl() {
    return typeof window !== 'undefined' ? window.location.href : 'Unknown'
  }

  /**
   * 获取错误统计
   * @returns {Object} 错误统计信息
   */
  getErrorStats() {
    return { ...this.errorStats }
  }

  /**
   * 清空错误队列
   */
  clearErrorQueue() {
    this.errorQueue = []
    this.errorStats = {
      total: 0,
      byType: {},
      byLevel: {},
      recent: []
    }
  }

  /**
   * 初始化错误上报
   */
  initErrorReporting() {
    if (!ErrorReportConfig.enabled) return
    
    // 定期上报错误
    setInterval(() => {
      this.flushErrorReports()
    }, ErrorReportConfig.flushInterval)
  }

  /**
   * 刷新错误上报
   */
  async flushErrorReports() {
    if (this.errorQueue.length === 0) return
    
    try {
      // 批量上报错误
      const errorsToReport = this.errorQueue.splice(0, ErrorReportConfig.batchSize)
      console.log('📤 批量上报错误:', errorsToReport)
      
      // 模拟上报
      await new Promise(resolve => setTimeout(resolve, 100))
      
    } catch (error) {
      console.error('批量错误上报失败:', error)
    }
  }
}

// 创建全局错误处理器实例
export const globalErrorHandler = new ErrorHandler()

// 导出便捷方法
export const handleError = (error, options, context) => globalErrorHandler.handle(error, options, context)
