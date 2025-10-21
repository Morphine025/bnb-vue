/**
 * 统一错误处理机制
 * 功能描述：提供全局错误处理、错误分类、错误上报等功能
 * 主要功能：统一错误处理逻辑，提供用户友好的错误提示
 */

/**
 * 错误类型枚举
 */
export const ErrorTypes = {
  NETWORK_ERROR: 'NETWORK_ERROR',
  AUTH_ERROR: 'AUTH_ERROR',
  PERMISSION_ERROR: 'PERMISSION_ERROR',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  SERVER_ERROR: 'SERVER_ERROR',
  TIMEOUT_ERROR: 'TIMEOUT_ERROR',
  UNKNOWN_ERROR: 'UNKNOWN_ERROR'
}

/**
 * 错误级别枚举
 */
export const ErrorLevels = {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
  CRITICAL: 'CRITICAL'
}

/**
 * 错误处理器类
 */
export class ErrorHandler {
  constructor() {
    this.errorQueue = []
    this.maxQueueSize = 100
    this.isReporting = false
  }

  /**
   * 处理错误
   * @param {Error} error - 错误对象
   * @param {object} options - 处理选项
   */
  handle(error, options = {}) {
    const {
      showToast = true,
      showModal = false,
      customMessage = null,
      level = ErrorLevels.MEDIUM,
      context = null
    } = options

    // 错误分类
    const errorInfo = this.classifyError(error)
    
    // 记录错误
    this.logError(errorInfo, context)
    
    // 添加到错误队列
    this.addToQueue(errorInfo)
    
    // 显示用户提示
    if (showToast) {
      this.showUserMessage(errorInfo, customMessage)
    }
    
    if (showModal) {
      this.showErrorModal(errorInfo, customMessage)
    }
    
    // 错误上报
    if (level === ErrorLevels.HIGH || level === ErrorLevels.CRITICAL) {
      this.reportError(errorInfo)
    }
    
    return errorInfo
  }

  /**
   * 错误分类
   * @param {Error} error - 错误对象
   * @returns {object} 分类后的错误信息
   */
  classifyError(error) {
    const errorInfo = {
      type: ErrorTypes.UNKNOWN_ERROR,
      level: ErrorLevels.MEDIUM,
      message: error.message || '未知错误',
      code: error.code || -1,
      originalError: error,
      timestamp: new Date().toISOString(),
      userAgent: this.getUserAgent(),
      url: this.getCurrentUrl()
    }

    // 网络错误
    if (error.errMsg && error.errMsg.includes('request:fail')) {
      errorInfo.type = ErrorTypes.NETWORK_ERROR
      errorInfo.message = '网络连接失败，请检查网络设置'
      errorInfo.level = ErrorLevels.HIGH
    }
    
    // 超时错误
    if (error.errMsg && error.errMsg.includes('timeout')) {
      errorInfo.type = ErrorTypes.TIMEOUT_ERROR
      errorInfo.message = '请求超时，请稍后重试'
      errorInfo.level = ErrorLevels.MEDIUM
    }
    
    // HTTP状态码错误
    if (error.statusCode) {
      switch (error.statusCode) {
        case 401:
          errorInfo.type = ErrorTypes.AUTH_ERROR
          errorInfo.message = '登录已过期，请重新登录'
          errorInfo.level = ErrorLevels.HIGH
          break
        case 403:
          errorInfo.type = ErrorTypes.PERMISSION_ERROR
          errorInfo.message = '没有权限执行此操作'
          errorInfo.level = ErrorLevels.MEDIUM
          break
        case 404:
          errorInfo.message = '请求的资源不存在'
          errorInfo.level = ErrorLevels.LOW
          break
        case 422:
          errorInfo.type = ErrorTypes.VALIDATION_ERROR
          errorInfo.message = '数据验证失败'
          errorInfo.level = ErrorLevels.MEDIUM
          break
        case 500:
          errorInfo.type = ErrorTypes.SERVER_ERROR
          errorInfo.message = '服务器错误，请稍后重试'
          errorInfo.level = ErrorLevels.HIGH
          break
        default:
          errorInfo.message = `请求失败 (${error.statusCode})`
          errorInfo.level = ErrorLevels.MEDIUM
      }
    }
    
    // 业务错误码
    if (error.code) {
      switch (error.code) {
        case 'AUTH_ERROR':
          errorInfo.type = ErrorTypes.AUTH_ERROR
          errorInfo.level = ErrorLevels.HIGH
          break
        case 'PERMISSION_ERROR':
          errorInfo.type = ErrorTypes.PERMISSION_ERROR
          errorInfo.level = ErrorLevels.MEDIUM
          break
        case 'VALIDATION_ERROR':
          errorInfo.type = ErrorTypes.VALIDATION_ERROR
          errorInfo.level = ErrorLevels.MEDIUM
          break
      }
    }

    return errorInfo
  }

  /**
   * 显示用户提示
   * @param {object} errorInfo - 错误信息
   * @param {string} customMessage - 自定义消息
   */
  showUserMessage(errorInfo, customMessage = null) {
    const message = customMessage || errorInfo.message
    
    // 根据错误类型显示不同的提示
    switch (errorInfo.type) {
      case ErrorTypes.AUTH_ERROR:
        uni.showToast({
          title: message,
          icon: 'none',
          duration: 2000
        })
        // 延迟跳转到登录页
        setTimeout(() => {
          uni.navigateTo({
            url: '/pages/login/login'
          })
        }, 2000)
        break
        
      case ErrorTypes.NETWORK_ERROR:
        uni.showToast({
          title: message,
          icon: 'none',
          duration: 3000
        })
        break
        
      case ErrorTypes.SERVER_ERROR:
        uni.showToast({
          title: message,
          icon: 'none',
          duration: 2000
        })
        break
        
      default:
        uni.showToast({
          title: message,
          icon: 'none',
          duration: 1500
        })
    }
  }

  /**
   * 显示错误弹窗
   * @param {object} errorInfo - 错误信息
   * @param {string} customMessage - 自定义消息
   */
  showErrorModal(errorInfo, customMessage = null) {
    const message = customMessage || errorInfo.message
    
    uni.showModal({
      title: '错误提示',
      content: message,
      showCancel: false,
      confirmText: '确定'
    })
  }

  /**
   * 记录错误日志
   * @param {object} errorInfo - 错误信息
   * @param {object} context - 上下文信息
   */
  logError(errorInfo, context = null) {
    const logData = {
      ...errorInfo,
      context,
      stack: errorInfo.originalError?.stack
    }
    
    console.error('🚨 错误处理:', logData)
    
    // 在开发环境下输出详细信息
    if (process.env.NODE_ENV === 'development') {
      console.group('🔍 错误详情')
      console.error('错误类型:', errorInfo.type)
      console.error('错误级别:', errorInfo.level)
      console.error('错误消息:', errorInfo.message)
      console.error('错误代码:', errorInfo.code)
      console.error('时间戳:', errorInfo.timestamp)
      if (context) {
        console.error('上下文:', context)
      }
      console.groupEnd()
    }
  }

  /**
   * 添加到错误队列
   * @param {object} errorInfo - 错误信息
   */
  addToQueue(errorInfo) {
    this.errorQueue.push(errorInfo)
    
    // 保持队列大小
    if (this.errorQueue.length > this.maxQueueSize) {
      this.errorQueue.shift()
    }
  }

  /**
   * 错误上报
   * @param {object} errorInfo - 错误信息
   */
  async reportError(errorInfo) {
    if (this.isReporting) return
    
    this.isReporting = true
    
    try {
      // 这里可以集成第三方错误监控服务
      // 如 Sentry、Bugsnag 等
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
   * @returns {object} 错误统计信息
   */
  getErrorStats() {
    const stats = {
      total: this.errorQueue.length,
      byType: {},
      byLevel: {},
      recent: this.errorQueue.slice(-10)
    }
    
    this.errorQueue.forEach(error => {
      // 按类型统计
      stats.byType[error.type] = (stats.byType[error.type] || 0) + 1
      
      // 按级别统计
      stats.byLevel[error.level] = (stats.byLevel[error.level] || 0) + 1
    })
    
    return stats
  }

  /**
   * 清空错误队列
   */
  clearErrorQueue() {
    this.errorQueue = []
  }
}

// 创建全局错误处理器实例
export const globalErrorHandler = new ErrorHandler()

// 导出便捷方法
export const handleError = (error, options) => globalErrorHandler.handle(error, options)
