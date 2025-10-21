/**
 * 简化错误类型定义
 * 功能描述：提供基础的错误类型和选项定义
 */

// 错误类型
export const ErrorTypes = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  BUSINESS_ERROR: 'BUSINESS_ERROR',
  NETWORK_ERROR: 'NETWORK_ERROR',
  API_ERROR: 'API_ERROR',
  UNKNOWN_ERROR: 'UNKNOWN_ERROR'
}

// 错误选项
export const ErrorOptions = {
  SHOW_TOAST: 'showToast',
  LOG_ERROR: 'logError',
  REPORT_ERROR: 'reportError',
  RETRY_ENABLED: 'retryEnabled'
}

// 错误级别
export const ErrorLevels = {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
  CRITICAL: 'CRITICAL'
}

// 简化的错误消息
export const ErrorMessages = {
  [ErrorTypes.VALIDATION_ERROR]: {
    title: '数据验证失败',
    message: '请检查输入数据格式',
    action: '请重新输入'
  },
  [ErrorTypes.BUSINESS_ERROR]: {
    title: '业务处理失败',
    message: '操作无法完成',
    action: '请稍后重试'
  },
  [ErrorTypes.NETWORK_ERROR]: {
    title: '网络连接失败',
    message: '请检查网络连接',
    action: '请重试'
  },
  [ErrorTypes.API_ERROR]: {
    title: '接口调用失败',
    message: '服务器响应异常',
    action: '请稍后重试'
  },
  [ErrorTypes.UNKNOWN_ERROR]: {
    title: '未知错误',
    message: '系统出现异常',
    action: '请重试或联系客服'
  }
}