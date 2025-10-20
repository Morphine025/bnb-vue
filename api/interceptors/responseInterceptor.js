/**
 * 响应拦截器
 * 功能描述：统一处理所有API响应
 * 主要功能：响应格式统一、错误处理、日志记录等
 */

/**
 * 响应拦截器
 * @param {Object} response - 响应对象
 * @returns {Object} 处理后的响应
 */
export const responseInterceptor = (response) => {
  // 记录响应日志
  console.log(`✅ API响应: ${response.statusCode}`, {
    data: response.data,
    header: response.header
  })
  
  // 统一处理响应格式
  if (response.data && typeof response.data === 'object') {
    // 如果响应格式正确
    if (response.data.code === 1) {
      return response.data
    } else {
      // 业务错误 - 修复字段名从msg改为message
      const error = new Error(response.data.message || response.data.msg || '请求失败')
      error.code = response.data.code
      error.data = response.data.data
      throw error
    }
  } else {
    // 响应格式错误
    const error = new Error('响应格式错误')
    error.code = -1
    error.data = response.data
    throw error
  }
}

/**
 * 响应错误拦截器
 * @param {Error} error - 响应错误
 * @returns {Promise} 错误处理
 */
export const responseErrorInterceptor = (error) => {
  console.error('❌ 响应错误:', error)
  
  // 网络错误
  if (error.errMsg && error.errMsg.includes('request:fail')) {
    const networkError = new Error('网络连接失败，请检查网络设置')
    networkError.code = 'NETWORK_ERROR'
    return Promise.reject(networkError)
  }
  
  // 超时错误
  if (error.errMsg && error.errMsg.includes('timeout')) {
    const timeoutError = new Error('请求超时，请稍后重试')
    timeoutError.code = 'TIMEOUT_ERROR'
    return Promise.reject(timeoutError)
  }
  
  // HTTP状态码错误
  if (error.statusCode) {
    switch (error.statusCode) {
      case 401:
        const authError = new Error('登录已过期，请重新登录')
        authError.code = 'AUTH_ERROR'
        return Promise.reject(authError)
      case 403:
        const permissionError = new Error('没有权限执行此操作')
        permissionError.code = 'PERMISSION_ERROR'
        return Promise.reject(permissionError)
      case 404:
        const notFoundError = new Error('请求的资源不存在')
        notFoundError.code = 'NOT_FOUND_ERROR'
        return Promise.reject(notFoundError)
      case 500:
        const serverError = new Error('服务器错误，请稍后重试')
        serverError.code = 'SERVER_ERROR'
        return Promise.reject(serverError)
      default:
        const unknownError = new Error(`请求失败 (${error.statusCode})`)
        unknownError.code = 'UNKNOWN_ERROR'
        return Promise.reject(unknownError)
    }
  }
  
  return Promise.reject(error)
}
