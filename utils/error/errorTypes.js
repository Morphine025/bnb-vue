/**
 * 统一错误处理类型定义
 * 功能描述：定义统一的错误类型、级别、处理选项和消息映射
 * 主要功能：提供标准化的错误分类和处理机制
 */

/**
 * 错误类型枚举
 */
export const ErrorTypes = {
  // 网络相关错误
  NETWORK_ERROR: 'NETWORK_ERROR',
  TIMEOUT_ERROR: 'TIMEOUT_ERROR',
  
  // 认证和权限错误
  AUTH_ERROR: 'AUTH_ERROR',
  PERMISSION_ERROR: 'PERMISSION_ERROR',
  
  // 数据验证错误
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  
  // 服务器错误
  SERVER_ERROR: 'SERVER_ERROR',
  
  // 业务逻辑错误
  BUSINESS_ERROR: 'BUSINESS_ERROR',
  
  // 系统错误
  SYSTEM_ERROR: 'SYSTEM_ERROR',
  
  // 未知错误
  UNKNOWN_ERROR: 'UNKNOWN_ERROR'
}

/**
 * 错误级别枚举
 */
export const ErrorLevels = {
  LOW: 'LOW',           // 低级别 - 不影响核心功能
  MEDIUM: 'MEDIUM',     // 中级别 - 影响部分功能
  HIGH: 'HIGH',         // 高级别 - 影响核心功能
  CRITICAL: 'CRITICAL'  // 严重级别 - 系统无法正常运行
}

/**
 * 错误处理选项
 */
export const ErrorOptions = {
  // 显示选项
  SHOW_TOAST: 'SHOW_TOAST',
  SHOW_MODAL: 'SHOW_MODAL',
  SHOW_LOADING: 'SHOW_LOADING',
  
  // 记录选项
  LOG_ERROR: 'LOG_ERROR',
  LOG_STACK: 'LOG_STACK',
  LOG_CONTEXT: 'LOG_CONTEXT',
  
  // 上报选项
  REPORT_ERROR: 'REPORT_ERROR',
  REPORT_STACK: 'REPORT_STACK',
  REPORT_USER_INFO: 'REPORT_USER_INFO',
  
  // 重试选项
  RETRY_ENABLED: 'RETRY_ENABLED',
  RETRY_COUNT: 'RETRY_COUNT',
  RETRY_DELAY: 'RETRY_DELAY'
}

/**
 * 错误消息映射
 */
export const ErrorMessages = {
  [ErrorTypes.NETWORK_ERROR]: {
    title: '网络错误',
    message: '网络连接失败，请检查网络设置',
    action: '请检查网络连接后重试'
  },
  [ErrorTypes.TIMEOUT_ERROR]: {
    title: '请求超时',
    message: '请求超时，请稍后重试',
    action: '请稍后重试或检查网络状况'
  },
  [ErrorTypes.AUTH_ERROR]: {
    title: '认证失败',
    message: '登录已过期，请重新登录',
    action: '请重新登录'
  },
  [ErrorTypes.PERMISSION_ERROR]: {
    title: '权限不足',
    message: '没有权限执行此操作',
    action: '请联系管理员或检查权限设置'
  },
  [ErrorTypes.VALIDATION_ERROR]: {
    title: '数据验证失败',
    message: '输入信息有误，请检查后重试',
    action: '请检查输入信息格式'
  },
  [ErrorTypes.SERVER_ERROR]: {
    title: '服务器错误',
    message: '服务器错误，请稍后重试',
    action: '请稍后重试或联系客服'
  },
  [ErrorTypes.BUSINESS_ERROR]: {
    title: '业务错误',
    message: '操作失败，请重试',
    action: '请重试或联系客服'
  },
  [ErrorTypes.SYSTEM_ERROR]: {
    title: '系统错误',
    message: '系统错误，请稍后重试',
    action: '请稍后重试或联系技术支持'
  },
  [ErrorTypes.UNKNOWN_ERROR]: {
    title: '未知错误',
    message: '发生未知错误，请重试',
    action: '请重试或联系客服'
  }
}

/**
 * 错误处理配置
 */
export const ErrorConfig = {
  // 默认处理选项
  defaultOptions: {
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
  levelConfig: {
    [ErrorLevels.LOW]: {
      showToast: true,
      showModal: false,
      logError: true,
      reportError: false,
      retryEnabled: false
    },
    [ErrorLevels.MEDIUM]: {
      showToast: true,
      showModal: false,
      logError: true,
      reportError: false,
      retryEnabled: true
    },
    [ErrorLevels.HIGH]: {
      showToast: true,
      showModal: true,
      logError: true,
      reportError: true,
      retryEnabled: true
    },
    [ErrorLevels.CRITICAL]: {
      showToast: true,
      showModal: true,
      logError: true,
      reportError: true,
      retryEnabled: true
    }
  },
  
  // 错误类型配置
  typeConfig: {
    [ErrorTypes.NETWORK_ERROR]: {
      level: ErrorLevels.HIGH,
      retryEnabled: true,
      retryCount: 3,
      retryDelay: 2000
    },
    [ErrorTypes.TIMEOUT_ERROR]: {
      level: ErrorLevels.MEDIUM,
      retryEnabled: true,
      retryCount: 2,
      retryDelay: 1000
    },
    [ErrorTypes.AUTH_ERROR]: {
      level: ErrorLevels.HIGH,
      retryEnabled: false,
      showModal: true
    },
    [ErrorTypes.PERMISSION_ERROR]: {
      level: ErrorLevels.MEDIUM,
      retryEnabled: false,
      showModal: true
    },
    [ErrorTypes.VALIDATION_ERROR]: {
      level: ErrorLevels.LOW,
      retryEnabled: false,
      showModal: false
    },
    [ErrorTypes.SERVER_ERROR]: {
      level: ErrorLevels.HIGH,
      retryEnabled: true,
      retryCount: 2,
      retryDelay: 3000
    },
    [ErrorTypes.BUSINESS_ERROR]: {
      level: ErrorLevels.MEDIUM,
      retryEnabled: false,
      showModal: true
    },
    [ErrorTypes.SYSTEM_ERROR]: {
      level: ErrorLevels.CRITICAL,
      retryEnabled: true,
      retryCount: 1,
      retryDelay: 5000
    },
    [ErrorTypes.UNKNOWN_ERROR]: {
      level: ErrorLevels.MEDIUM,
      retryEnabled: false,
      showModal: true
    }
  }
}

/**
 * 错误统计配置
 */
export const ErrorStatsConfig = {
  maxQueueSize: 100,
  maxLogSize: 1000,
  logRetentionDays: 7,
  reportThreshold: 5, // 错误数量达到阈值时上报
  reportInterval: 60000 // 上报间隔（毫秒）
}

/**
 * 错误重试配置
 */
export const ErrorRetryConfig = {
  maxRetries: 3,
  baseDelay: 1000,
  maxDelay: 10000,
  backoffMultiplier: 2,
  jitter: true
}

/**
 * 错误上报配置
 */
export const ErrorReportConfig = {
  enabled: false, // 默认关闭，需要时开启
  endpoint: '/api/error/report',
  batchSize: 10,
  flushInterval: 30000,
  includeUserInfo: false,
  includeStack: false,
  includeContext: true
}
