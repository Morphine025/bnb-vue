/**
 * 错误日志记录器
 * 功能描述：提供统一的错误日志记录功能
 * 主要功能：错误日志记录、格式化、存储、清理
 */

import { ErrorTypes, ErrorLevels, ErrorStatsConfig } from './errorTypes.js'

/**
 * 错误日志记录器类
 */
export class ErrorLogger {
  constructor(options = {}) {
    this.options = {
      enableConsole: true,
      enableStorage: true,
      enableRemote: false,
      maxLogSize: ErrorStatsConfig.maxLogSize,
      retentionDays: ErrorStatsConfig.logRetentionDays,
      ...options
    }
    
    this.logs = []
    this.storageKey = 'error_logs'
    
    // 初始化日志存储
    this.initLogStorage()
  }

  /**
   * 记录错误日志
   * @param {Object} errorInfo - 错误信息
   * @param {Object} context - 上下文信息
   */
  logError(errorInfo, context = null) {
    const logEntry = this.createLogEntry(errorInfo, context)
    
    // 添加到内存日志
    this.logs.push(logEntry)
    
    // 控制台输出
    if (this.options.enableConsole) {
      this.logToConsole(logEntry)
    }
    
    // 本地存储
    if (this.options.enableStorage) {
      this.logToStorage(logEntry)
    }
    
    // 远程上报
    if (this.options.enableRemote) {
      this.logToRemote(logEntry)
    }
    
    // 清理过期日志
    this.cleanupExpiredLogs()
  }

  /**
   * 创建日志条目
   * @param {Object} errorInfo - 错误信息
   * @param {Object} context - 上下文信息
   * @returns {Object} 日志条目
   */
  createLogEntry(errorInfo, context) {
    return {
      id: errorInfo.id,
      timestamp: errorInfo.timestamp,
      type: errorInfo.type,
      level: errorInfo.level,
      message: errorInfo.message,
      code: errorInfo.code,
      stack: errorInfo.stack,
      context: context,
      userAgent: errorInfo.userAgent,
      url: errorInfo.url,
      sessionId: this.getSessionId(),
      userId: this.getUserId(),
      deviceInfo: this.getDeviceInfo(),
      appVersion: this.getAppVersion()
    }
  }

  /**
   * 控制台输出日志
   * @param {Object} logEntry - 日志条目
   */
  logToConsole(logEntry) {
    const { type, level, message, stack, context } = logEntry
    
    // 根据错误级别选择不同的控制台方法
    const consoleMethod = this.getConsoleMethod(level)
    
    consoleMethod(`🚨 [${type}] ${message}`, {
      level,
      context,
      stack,
      timestamp: logEntry.timestamp
    })
    
    // 开发环境下输出详细信息
    if (process.env.NODE_ENV === 'development') {
      console.group('🔍 错误详情')
      console.error('错误类型:', type)
      console.error('错误级别:', level)
      console.error('错误消息:', message)
      console.error('错误代码:', logEntry.code)
      console.error('时间戳:', logEntry.timestamp)
      if (context) {
        console.error('上下文:', context)
      }
      if (stack) {
        console.error('堆栈信息:', stack)
      }
      console.groupEnd()
    }
  }

  /**
   * 获取控制台方法
   * @param {string} level - 错误级别
   * @returns {Function} 控制台方法
   */
  getConsoleMethod(level) {
    switch (level) {
      case ErrorLevels.CRITICAL:
        return console.error
      case ErrorLevels.HIGH:
        return console.error
      case ErrorLevels.MEDIUM:
        return console.warn
      case ErrorLevels.LOW:
        return console.info
      default:
        return console.log
    }
  }

  /**
   * 本地存储日志
   * @param {Object} logEntry - 日志条目
   */
  logToStorage(logEntry) {
    try {
      // 获取现有日志
      const existingLogs = this.getStoredLogs()
      
      // 添加新日志
      existingLogs.push(logEntry)
      
      // 限制日志数量
      if (existingLogs.length > this.options.maxLogSize) {
        existingLogs.splice(0, existingLogs.length - this.options.maxLogSize)
      }
      
      // 保存到本地存储
      uni.setStorageSync(this.storageKey, JSON.stringify(existingLogs))
      
    } catch (error) {
      console.error('保存错误日志失败:', error)
    }
  }

  /**
   * 获取存储的日志
   * @returns {Array} 存储的日志数组
   */
  getStoredLogs() {
    try {
      const logs = uni.getStorageSync(this.storageKey)
      return logs ? JSON.parse(logs) : []
    } catch (error) {
      console.error('获取存储日志失败:', error)
      return []
    }
  }

  /**
   * 远程上报日志
   * @param {Object} logEntry - 日志条目
   */
  async logToRemote(logEntry) {
    try {
      // 这里可以集成第三方日志服务
      // 如 Sentry、Bugsnag、LogRocket 等
      console.log('📤 远程上报日志:', logEntry)
      
      // 模拟远程上报
      await new Promise(resolve => setTimeout(resolve, 100))
      
    } catch (error) {
      console.error('远程日志上报失败:', error)
    }
  }

  /**
   * 清理过期日志
   */
  cleanupExpiredLogs() {
    try {
      const now = new Date()
      const retentionTime = this.options.retentionDays * 24 * 60 * 60 * 1000
      
      // 清理内存日志
      this.logs = this.logs.filter(log => {
        const logTime = new Date(log.timestamp)
        return now - logTime < retentionTime
      })
      
      // 清理存储日志
      const storedLogs = this.getStoredLogs()
      const filteredLogs = storedLogs.filter(log => {
        const logTime = new Date(log.timestamp)
        return now - logTime < retentionTime
      })
      
      if (filteredLogs.length !== storedLogs.length) {
        uni.setStorageSync(this.storageKey, JSON.stringify(filteredLogs))
      }
      
    } catch (error) {
      console.error('清理过期日志失败:', error)
    }
  }

  /**
   * 获取日志统计
   * @returns {Object} 日志统计信息
   */
  getLogStats() {
    const stats = {
      total: this.logs.length,
      byType: {},
      byLevel: {},
      byDate: {},
      recent: this.logs.slice(-10)
    }
    
    this.logs.forEach(log => {
      // 按类型统计
      stats.byType[log.type] = (stats.byType[log.type] || 0) + 1
      
      // 按级别统计
      stats.byLevel[log.level] = (stats.byLevel[log.level] || 0) + 1
      
      // 按日期统计
      const date = log.timestamp.split('T')[0]
      stats.byDate[date] = (stats.byDate[date] || 0) + 1
    })
    
    return stats
  }

  /**
   * 导出日志
   * @param {Object} options - 导出选项
   * @returns {string} 导出的日志数据
   */
  exportLogs(options = {}) {
    const {
      format = 'json',
      startDate = null,
      endDate = null,
      types = null,
      levels = null
    } = options
    
    let filteredLogs = [...this.logs]
    
    // 按日期过滤
    if (startDate || endDate) {
      filteredLogs = filteredLogs.filter(log => {
        const logDate = new Date(log.timestamp)
        if (startDate && logDate < new Date(startDate)) return false
        if (endDate && logDate > new Date(endDate)) return false
        return true
      })
    }
    
    // 按类型过滤
    if (types && types.length > 0) {
      filteredLogs = filteredLogs.filter(log => types.includes(log.type))
    }
    
    // 按级别过滤
    if (levels && levels.length > 0) {
      filteredLogs = filteredLogs.filter(log => levels.includes(log.level))
    }
    
    // 格式化输出
    switch (format) {
      case 'json':
        return JSON.stringify(filteredLogs, null, 2)
      case 'csv':
        return this.formatAsCSV(filteredLogs)
      case 'txt':
        return this.formatAsText(filteredLogs)
      default:
        return JSON.stringify(filteredLogs, null, 2)
    }
  }

  /**
   * 格式化为CSV
   * @param {Array} logs - 日志数组
   * @returns {string} CSV格式的日志
   */
  formatAsCSV(logs) {
    if (logs.length === 0) return ''
    
    const headers = ['timestamp', 'type', 'level', 'message', 'code', 'url']
    const csvRows = [headers.join(',')]
    
    logs.forEach(log => {
      const row = headers.map(header => {
        const value = log[header] || ''
        return `"${value.toString().replace(/"/g, '""')}"`
      })
      csvRows.push(row.join(','))
    })
    
    return csvRows.join('\n')
  }

  /**
   * 格式化为文本
   * @param {Array} logs - 日志数组
   * @returns {string} 文本格式的日志
   */
  formatAsText(logs) {
    return logs.map(log => {
      return `[${log.timestamp}] ${log.level} ${log.type}: ${log.message}`
    }).join('\n')
  }

  /**
   * 清空所有日志
   */
  clearLogs() {
    this.logs = []
    try {
      uni.removeStorageSync(this.storageKey)
    } catch (error) {
      console.error('清空存储日志失败:', error)
    }
  }

  /**
   * 初始化日志存储
   */
  initLogStorage() {
    try {
      // 加载存储的日志
      const storedLogs = this.getStoredLogs()
      this.logs = storedLogs
      
      // 清理过期日志
      this.cleanupExpiredLogs()
      
    } catch (error) {
      console.error('初始化日志存储失败:', error)
    }
  }

  /**
   * 获取会话ID
   * @returns {string} 会话ID
   */
  getSessionId() {
    try {
      let sessionId = uni.getStorageSync('session_id')
      if (!sessionId) {
        sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        uni.setStorageSync('session_id', sessionId)
      }
      return sessionId
    } catch (error) {
      return 'unknown'
    }
  }

  /**
   * 获取用户ID
   * @returns {string} 用户ID
   */
  getUserId() {
    try {
      return uni.getStorageSync('user_id') || 'anonymous'
    } catch (error) {
      return 'anonymous'
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
   * 获取应用版本
   * @returns {string} 应用版本
   */
  getAppVersion() {
    try {
      const systemInfo = uni.getSystemInfoSync()
      return systemInfo.version || '1.0.0'
    } catch (error) {
      return '1.0.0'
    }
  }
}

// 创建全局错误日志记录器实例
export const globalErrorLogger = new ErrorLogger()
