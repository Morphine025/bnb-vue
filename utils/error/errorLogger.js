/**
 * 简化错误日志记录器
 * 功能描述：提供基础的错误日志记录功能
 */

import { ErrorTypes } from './errorTypes.js'

/**
 * 简化的错误日志记录器
 */
export class ErrorLogger {
  constructor(options = {}) {
    this.options = {
      enableConsole: true,
      enableStorage: false, // 简化：默认不启用存储
      ...options
    }
  }

  /**
   * 记录错误日志
   * @param {Object} errorInfo - 错误信息
   * @param {Object} context - 上下文信息
   */
  log(errorInfo, context = {}) {
    if (this.options.enableConsole) {
      console.error(`[${errorInfo.type}] ${errorInfo.message}`, {
        context: context,
        timestamp: errorInfo.timestamp,
        stack: errorInfo.stack
      })
    }
  }

  /**
   * 记录警告日志
   * @param {string} message - 警告消息
   * @param {Object} context - 上下文信息
   */
  warn(message, context = {}) {
    if (this.options.enableConsole) {
      console.warn(`[WARNING] ${message}`, context)
    }
  }

  /**
   * 记录信息日志
   * @param {string} message - 信息消息
   * @param {Object} context - 上下文信息
   */
  info(message, context = {}) {
    if (this.options.enableConsole) {
      console.info(`[INFO] ${message}`, context)
    }
  }
}

// 创建默认的错误日志记录器实例
export const errorLogger = new ErrorLogger()