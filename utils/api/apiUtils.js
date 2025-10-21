/**
 * 统一错误处理工具
 * 功能描述：提供统一的错误处理功能
 * 主要功能：错误分类、用户提示、日志记录
 */

/**
 * 生成请求ID
 * @returns {string} 请求ID
 */
export const generateRequestId = () => {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

/**
 * 统一错误处理
 * @param {Error|Object} error - 错误对象
 * @param {string} context - 错误上下文
 * @param {Object} options - 处理选项
 * @returns {Object} 处理结果
 */
export const handleError = (error, context = '', options = {}) => {
  const result = {
    type: 'UNKNOWN',
    level: 'medium',
    message: error.message || '操作失败',
    showToast: options.showToast !== false,
    logError: options.logError !== false
  }

  // 错误分类
  if (isNetworkError(error)) {
    result.type = 'NETWORK'
    result.message = '网络连接失败，请检查网络设置'
  } else if (isApiError(error)) {
    result.type = 'API'
    result.message = error.message || '请求失败，请重试'
  } else if (isValidationError(error)) {
    result.type = 'VALIDATION'
    result.level = 'low'
    result.message = error.message || '输入信息有误'
  }

  // 记录错误日志
  if (result.logError) {
    console.error(`${context}:`, error)
  }

  // 显示用户提示
  if (result.showToast) {
    uni.showToast({
      title: result.message,
      icon: 'none',
      duration: 2000
    })
  }

  return result
}

/**
 * 判断是否为网络错误
 * @param {Error|Object} error - 错误对象
 * @returns {boolean} 是否为网络错误
 */
const isNetworkError = (error) => {
  if (!error) return false

  const networkKeywords = ['network', 'timeout', 'connection', 'fetch']
  const errorMessage = (error.message || '').toLowerCase()

  return (
    networkKeywords.some((keyword) => errorMessage.includes(keyword)) ||
    error.code === 'NETWORK_ERROR' ||
    error.status === 0
  )
}

/**
 * 判断是否为API错误
 * @param {Error|Object} error - 错误对象
 * @returns {boolean} 是否为API错误
 */
const isApiError = (error) => {
  if (!error) return false

  return (
    error.code !== undefined ||
    error.status !== undefined ||
    error.response !== undefined
  )
}

/**
 * 判断是否为验证错误
 * @param {Error|Object} error - 错误对象
 * @returns {boolean} 是否为验证错误
 */
const isValidationError = (error) => {
  if (!error) return false

  const validationKeywords = ['validation', 'invalid', 'required', 'format']
  const errorMessage = (error.message || '').toLowerCase()

  return (
    validationKeywords.some((keyword) => errorMessage.includes(keyword)) ||
    error.type === 'VALIDATION_ERROR'
  )
}

/**
 * 显示成功提示
 * @param {string} message - 成功消息
 */
export const showSuccess = (message) => {
  uni.showToast({
    title: message,
    icon: 'success',
    duration: 1500
  })
}

/**
 * 显示错误提示
 * @param {string} message - 错误消息
 */
export const showError = (message) => {
  uni.showToast({
    title: message,
    icon: 'none',
    duration: 2000
  })
}
