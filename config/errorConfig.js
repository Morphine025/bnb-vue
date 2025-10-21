/**
 * 错误处理配置
 * 功能描述：定义错误处理的配置选项
 * 主要功能：错误处理配置、消息配置、上报配置
 */

import { ErrorTypes, ErrorLevels, ErrorOptions } from '../utils/error/errorTypes.js'

/**
 * 错误处理配置
 */
export const ErrorConfig = {
  // 基础配置
  basic: {
    // 是否启用错误处理
    enabled: true,
    
    // 是否启用错误上报
    reportEnabled: false,
    
    // 是否启用错误重试
    retryEnabled: true,
    
    // 是否启用错误日志
    logEnabled: true,
    
    // 是否启用错误统计
    statsEnabled: true
  },
  
  // 错误处理选项
  options: {
    // 默认处理选项
    default: {
      [ErrorOptions.SHOW_TOAST]: true,
      [ErrorOptions.SHOW_MODAL]: false,
      [ErrorOptions.SHOW_LOADING]: false,
      [ErrorOptions.LOG_ERROR]: true,
      [ErrorOptions.LOG_STACK]: true,
      [ErrorOptions.LOG_CONTEXT]: true,
      [ErrorOptions.REPORT_ERROR]: false,
      [ErrorOptions.REPORT_STACK]: false,
      [ErrorOptions.REPORT_USER_INFO]: false,
      [ErrorOptions.RETRY_ENABLED]: false,
      [ErrorOptions.RETRY_COUNT]: 3,
      [ErrorOptions.RETRY_DELAY]: 1000
    },
    
    // 错误级别配置
    byLevel: {
      [ErrorLevels.LOW]: {
        [ErrorOptions.SHOW_TOAST]: true,
        [ErrorOptions.SHOW_MODAL]: false,
        [ErrorOptions.LOG_ERROR]: true,
        [ErrorOptions.REPORT_ERROR]: false,
        [ErrorOptions.RETRY_ENABLED]: false
      },
      [ErrorLevels.MEDIUM]: {
        [ErrorOptions.SHOW_TOAST]: true,
        [ErrorOptions.SHOW_MODAL]: false,
        [ErrorOptions.LOG_ERROR]: true,
        [ErrorOptions.REPORT_ERROR]: false,
        [ErrorOptions.RETRY_ENABLED]: true
      },
      [ErrorLevels.HIGH]: {
        [ErrorOptions.SHOW_TOAST]: true,
        [ErrorOptions.SHOW_MODAL]: true,
        [ErrorOptions.LOG_ERROR]: true,
        [ErrorOptions.REPORT_ERROR]: true,
        [ErrorOptions.RETRY_ENABLED]: true
      },
      [ErrorLevels.CRITICAL]: {
        [ErrorOptions.SHOW_TOAST]: true,
        [ErrorOptions.SHOW_MODAL]: true,
        [ErrorOptions.LOG_ERROR]: true,
        [ErrorOptions.REPORT_ERROR]: true,
        [ErrorOptions.RETRY_ENABLED]: true
      }
    },
    
    // 错误类型配置
    byType: {
      [ErrorTypes.NETWORK_ERROR]: {
        level: ErrorLevels.HIGH,
        [ErrorOptions.RETRY_ENABLED]: true,
        [ErrorOptions.RETRY_COUNT]: 3,
        [ErrorOptions.RETRY_DELAY]: 2000
      },
      [ErrorTypes.TIMEOUT_ERROR]: {
        level: ErrorLevels.MEDIUM,
        [ErrorOptions.RETRY_ENABLED]: true,
        [ErrorOptions.RETRY_COUNT]: 2,
        [ErrorOptions.RETRY_DELAY]: 1000
      },
      [ErrorTypes.AUTH_ERROR]: {
        level: ErrorLevels.HIGH,
        [ErrorOptions.RETRY_ENABLED]: false,
        [ErrorOptions.SHOW_MODAL]: true
      },
      [ErrorTypes.PERMISSION_ERROR]: {
        level: ErrorLevels.MEDIUM,
        [ErrorOptions.RETRY_ENABLED]: false,
        [ErrorOptions.SHOW_MODAL]: true
      },
      [ErrorTypes.VALIDATION_ERROR]: {
        level: ErrorLevels.LOW,
        [ErrorOptions.RETRY_ENABLED]: false,
        [ErrorOptions.SHOW_MODAL]: false
      },
      [ErrorTypes.SERVER_ERROR]: {
        level: ErrorLevels.HIGH,
        [ErrorOptions.RETRY_ENABLED]: true,
        [ErrorOptions.RETRY_COUNT]: 2,
        [ErrorOptions.RETRY_DELAY]: 3000
      },
      [ErrorTypes.BUSINESS_ERROR]: {
        level: ErrorLevels.MEDIUM,
        [ErrorOptions.RETRY_ENABLED]: false,
        [ErrorOptions.SHOW_MODAL]: true
      },
      [ErrorTypes.SYSTEM_ERROR]: {
        level: ErrorLevels.CRITICAL,
        [ErrorOptions.RETRY_ENABLED]: true,
        [ErrorOptions.RETRY_COUNT]: 1,
        [ErrorOptions.RETRY_DELAY]: 5000
      },
      [ErrorTypes.UNKNOWN_ERROR]: {
        level: ErrorLevels.MEDIUM,
        [ErrorOptions.RETRY_ENABLED]: false,
        [ErrorOptions.SHOW_MODAL]: true
      }
    }
  },
  
  // 错误统计配置
  stats: {
    // 最大错误队列大小
    maxQueueSize: 100,
    
    // 最大日志大小
    maxLogSize: 1000,
    
    // 日志保留天数
    logRetentionDays: 7,
    
    // 上报阈值
    reportThreshold: 5,
    
    // 上报间隔（毫秒）
    reportInterval: 60000,
    
    // 统计更新间隔（毫秒）
    statsUpdateInterval: 30000
  },
  
  // 错误重试配置
  retry: {
    // 最大重试次数
    maxRetries: 3,
    
    // 基础延迟时间（毫秒）
    baseDelay: 1000,
    
    // 最大延迟时间（毫秒）
    maxDelay: 10000,
    
    // 退避乘数
    backoffMultiplier: 2,
    
    // 是否启用抖动
    jitter: true,
    
    // 抖动范围（0-1）
    jitterRange: 0.1
  },
  
  // 错误上报配置
  report: {
    // 是否启用错误上报
    enabled: false,
    
    // 上报端点
    endpoint: '/api/error/report',
    
    // 批量大小
    batchSize: 10,
    
    // 刷新间隔（毫秒）
    flushInterval: 30000,
    
    // 是否包含用户信息
    includeUserInfo: false,
    
    // 是否包含堆栈信息
    includeStack: false,
    
    // 是否包含上下文信息
    includeContext: true,
    
    // 上报超时时间（毫秒）
    timeout: 10000,
    
    // 最大重试次数
    maxRetries: 3
  },
  
  // 错误日志配置
  logging: {
    // 是否启用控制台日志
    enableConsole: true,
    
    // 是否启用本地存储
    enableStorage: true,
    
    // 是否启用远程日志
    enableRemote: false,
    
    // 日志级别
    level: 'info',
    
    // 日志格式
    format: 'json',
    
    // 日志文件大小限制（字节）
    maxFileSize: 10 * 1024 * 1024, // 10MB
    
    // 日志文件数量限制
    maxFileCount: 5
  },
  
  // 错误提示配置
  notification: {
    // Toast配置
    toast: {
      duration: 2000,
      icon: 'none',
      position: 'center'
    },
    
    // Modal配置
    modal: {
      showCancel: false,
      confirmText: '确定',
      cancelText: '取消'
    },
    
    // 加载配置
    loading: {
      title: '加载中...',
      mask: true
    }
  },
  
  // 错误处理中间件配置
  middleware: {
    // 是否启用错误处理中间件
    enabled: true,
    
    // 中间件执行顺序
    order: [
      'errorClassification',
      'errorLogging',
      'errorNotification',
      'errorRetry',
      'errorReport'
    ],
    
    // 中间件配置
    config: {
      errorClassification: {
        enabled: true,
        priority: 1
      },
      errorLogging: {
        enabled: true,
        priority: 2
      },
      errorNotification: {
        enabled: true,
        priority: 3
      },
      errorRetry: {
        enabled: true,
        priority: 4
      },
      errorReport: {
        enabled: false,
        priority: 5
      }
    }
  },
  
  // 错误处理性能配置
  performance: {
    // 是否启用性能监控
    enabled: true,
    
    // 性能监控阈值（毫秒）
    threshold: 100,
    
    // 是否启用性能日志
    logPerformance: true,
    
    // 性能统计间隔（毫秒）
    statsInterval: 60000
  },
  
  // 错误处理安全配置
  security: {
    // 是否启用错误信息脱敏
    enableDataMasking: true,
    
    // 脱敏字段
    maskFields: ['password', 'token', 'secret', 'key'],
    
    // 是否启用错误信息加密
    enableEncryption: false,
    
    // 加密算法
    encryptionAlgorithm: 'AES-256-GCM',
    
    // 是否启用错误信息签名
    enableSigning: false,
    
    // 签名算法
    signingAlgorithm: 'HMAC-SHA256'
  }
}

/**
 * 错误处理配置管理器
 */
export class ErrorConfigManager {
  constructor() {
    this.config = { ...ErrorConfig }
    this.customConfig = {}
  }

  /**
   * 获取配置
   * @param {string} path - 配置路径
   * @returns {any} 配置值
   */
  getConfig(path) {
    const keys = path.split('.')
    let value = this.config
    
    for (const key of keys) {
      if (value && typeof value === 'object' && key in value) {
        value = value[key]
      } else {
        return undefined
      }
    }
    
    return value
  }

  /**
   * 设置配置
   * @param {string} path - 配置路径
   * @param {any} value - 配置值
   */
  setConfig(path, value) {
    const keys = path.split('.')
    let current = this.config
    
    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i]
      if (!(key in current) || typeof current[key] !== 'object') {
        current[key] = {}
      }
      current = current[key]
    }
    
    current[keys[keys.length - 1]] = value
  }

  /**
   * 设置自定义配置
   * @param {string} path - 配置路径
   * @param {any} value - 配置值
   */
  setCustomConfig(path, value) {
    const keys = path.split('.')
    let current = this.customConfig
    
    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i]
      if (!(key in current) || typeof current[key] !== 'object') {
        current[key] = {}
      }
      current = current[key]
    }
    
    current[keys[keys.length - 1]] = value
  }

  /**
   * 获取自定义配置
   * @param {string} path - 配置路径
   * @returns {any} 配置值
   */
  getCustomConfig(path) {
    const keys = path.split('.')
    let value = this.customConfig
    
    for (const key of keys) {
      if (value && typeof value === 'object' && key in value) {
        value = value[key]
      } else {
        return undefined
      }
    }
    
    return value
  }

  /**
   * 合并配置
   * @param {Object} config - 要合并的配置
   */
  mergeConfig(config) {
    this.config = this.deepMerge(this.config, config)
  }

  /**
   * 深度合并对象
   * @param {Object} target - 目标对象
   * @param {Object} source - 源对象
   * @returns {Object} 合并后的对象
   */
  deepMerge(target, source) {
    const result = { ...target }
    
    for (const key in source) {
      if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
        result[key] = this.deepMerge(target[key] || {}, source[key])
      } else {
        result[key] = source[key]
      }
    }
    
    return result
  }

  /**
   * 重置配置
   */
  resetConfig() {
    this.config = { ...ErrorConfig }
    this.customConfig = {}
  }

  /**
   * 导出配置
   * @returns {Object} 配置对象
   */
  exportConfig() {
    return {
      config: this.config,
      customConfig: this.customConfig
    }
  }

  /**
   * 导入配置
   * @param {Object} configData - 配置数据
   */
  importConfig(configData) {
    if (configData.config) {
      this.config = configData.config
    }
    if (configData.customConfig) {
      this.customConfig = configData.customConfig
    }
  }
}

// 创建全局错误配置管理器实例
export const globalErrorConfigManager = new ErrorConfigManager()

// 导出便捷方法
export const getErrorConfig = (path) => globalErrorConfigManager.getConfig(path)
export const setErrorConfig = (path, value) => globalErrorConfigManager.setConfig(path, value)
export const getCustomErrorConfig = (path) => globalErrorConfigManager.getCustomConfig(path)
export const setCustomErrorConfig = (path, value) => globalErrorConfigManager.setCustomConfig(path, value)
export const mergeErrorConfig = (config) => globalErrorConfigManager.mergeConfig(config)
export const resetErrorConfig = () => globalErrorConfigManager.resetConfig()
export const exportErrorConfig = () => globalErrorConfigManager.exportConfig()
export const importErrorConfig = (configData) => globalErrorConfigManager.importConfig(configData)
