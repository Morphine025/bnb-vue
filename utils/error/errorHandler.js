/**
 * 简化错误处理器
 * 功能描述：提供基础的错误处理功能
 */

// 简化的错误类型和选项，保持向后兼容
export const ErrorTypes = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  BUSINESS_ERROR: 'BUSINESS_ERROR',
  NETWORK_ERROR: 'NETWORK_ERROR',
  API_ERROR: 'API_ERROR',
  UNKNOWN_ERROR: 'UNKNOWN_ERROR'
}

export const ErrorOptions = {
  SHOW_TOAST: 'showToast',
  LOG_ERROR: 'logError',
  REPORT_ERROR: 'reportError',
  RETRY_ENABLED: 'retryEnabled'
}

/**
 * 处理错误
 * @param {Error} error - 错误对象
 * @param {string|Object} context - 上下文信息
 * @param {Object} options - 处理选项
 * @returns {Object} 处理结果
 */
export const handleError = (error, context = '', options = {}) => {
  // 基础错误信息
  const errorInfo = {
    message: error.message || '未知错误',
    type: error.type || ErrorTypes.UNKNOWN_ERROR,
    code: error.code || 'UNKNOWN',
    context: typeof context === 'string' ? context : JSON.stringify(context),
    timestamp: new Date().toISOString()
  }

  // 记录错误日志
  console.error(`[${errorInfo.type}] ${errorInfo.message}`, {
    context: errorInfo.context,
    timestamp: errorInfo.timestamp,
    stack: error.stack
  })

  // 显示用户提示
  if (options[ErrorOptions.SHOW_TOAST] !== false && options.showToast !== false) {
    uni.showToast({
      title: errorInfo.message,
      icon: 'none',
      duration: 2000
    })
  }

  return {
    handled: true,
    errorInfo: errorInfo
  }
}

/**
 * 显示成功提示
 * @param {string} message - 提示信息
 */
export const showSuccess = (message) => {
  uni.showToast({
    title: message,
    icon: 'success',
    duration: 2000
  })
}

/**
 * 显示错误提示
 * @param {string} message - 提示信息
 */
export const showError = (message) => {
  uni.showToast({
    title: message,
    icon: 'none',
    duration: 2000
  })
}