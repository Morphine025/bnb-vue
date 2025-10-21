/**
 * 简化错误处理配置
 * 功能描述：提供基础的错误处理配置
 */

import { ErrorTypes, ErrorLevels, ErrorOptions } from '../utils/error/errorTypes.js'

/**
 * 简化的错误处理配置
 */
export const ErrorConfig = {
  // 基础配置
  enabled: true,
  reportEnabled: false,
  retryEnabled: false,
  logEnabled: true,
  
  // 默认处理选项
  defaultOptions: {
    [ErrorOptions.SHOW_TOAST]: true,
    [ErrorOptions.LOG_ERROR]: true,
    [ErrorOptions.REPORT_ERROR]: false,
    [ErrorOptions.RETRY_ENABLED]: false
  },
  
  // 错误类型配置
  typeConfig: {
    [ErrorTypes.VALIDATION_ERROR]: {
      showToast: true,
      logError: true,
      reportError: false
    },
    [ErrorTypes.BUSINESS_ERROR]: {
      showToast: true,
      logError: true,
      reportError: false
    },
    [ErrorTypes.NETWORK_ERROR]: {
      showToast: true,
      logError: true,
      reportError: false
    },
    [ErrorTypes.API_ERROR]: {
      showToast: true,
      logError: true,
      reportError: false
    },
    [ErrorTypes.UNKNOWN_ERROR]: {
      showToast: true,
      logError: true,
      reportError: false
    }
  }
}

/**
 * 简化的错误配置管理器
 */
export class ErrorConfigManager {
  constructor() {
    this.config = { ...ErrorConfig }
  }

  /**
   * 获取配置
   * @param {string} path - 配置路径
   * @returns {any} 配置值
   */
  getConfig(path) {
    return this.config[path]
  }

  /**
   * 设置配置
   * @param {string} path - 配置路径
   * @param {any} value - 配置值
   */
  setConfig(path, value) {
    this.config[path] = value
  }
}

// 创建全局错误配置管理器实例
export const globalErrorConfigManager = new ErrorConfigManager()