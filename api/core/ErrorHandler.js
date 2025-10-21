/**
 * 统一错误处理机制
 * 功能描述：提供全局错误处理、错误分类、错误上报等功能
 * 主要功能：统一错误处理逻辑，提供用户友好的错误提示
 */

// 导入统一错误处理模块
import { handleError } from '../../utils/error/errorHandler.js'
import { ErrorTypes, ErrorLevels } from '../../utils/error/errorTypes.js'
import { getErrorMessage, getErrorTitle, getErrorAction } from '../../utils/error/errorMessages.js'

/**
 * API层错误处理器类
 * 提供API特定的错误处理功能
 */
export class APIErrorHandler {
  constructor(options = {}) {
    this.options = options
    this.apiContext = {
      module: 'API',
      layer: 'API'
    }
  }

  /**
   * 基础错误处理方法
   * @param {Error} error - 错误对象
   * @param {object} options - 处理选项
   * @param {object} context - 上下文信息
   */
  handle(error, options = {}, context = {}) {
    const mergedContext = {
      ...this.apiContext,
      ...context
    }
    
    return handleError(error, mergedContext, options)
  }

  /**
   * 处理API错误
   * @param {Error} error - 错误对象
   * @param {object} options - 处理选项
   * @param {object} context - 上下文信息
   */
  handleAPIError(error, options = {}, context = {}) {
    const apiContext = {
      ...this.apiContext,
      ...context
    }
    
    return this.handle(error, options, apiContext)
  }

  /**
   * 处理API请求错误
   * @param {Error} error - 错误对象
   * @param {object} requestInfo - 请求信息
   * @param {object} options - 处理选项
   */
  handleRequestError(error, requestInfo = {}, options = {}) {
    const context = {
      ...this.apiContext,
      requestInfo,
      url: requestInfo.url,
      method: requestInfo.method,
      params: requestInfo.params
    }
    
    return this.handleAPIError(error, options, context)
  }

  /**
   * 处理API响应错误
   * @param {Error} error - 错误对象
   * @param {object} responseInfo - 响应信息
   * @param {object} options - 处理选项
   */
  handleResponseError(error, responseInfo = {}, options = {}) {
    const context = {
      ...this.apiContext,
      responseInfo,
      statusCode: responseInfo.statusCode,
      statusText: responseInfo.statusText
    }
    
    return this.handleAPIError(error, options, context)
  }

  /**
   * 处理API认证错误
   * @param {Error} error - 错误对象
   * @param {object} options - 处理选项
   */
  handleAuthError(error, options = {}) {
    const context = {
      ...this.apiContext,
      errorType: 'AUTH_ERROR',
      action: 'redirect_to_login'
    }
    
    const result = this.handleAPIError(error, options, context)
    
    // 认证错误特殊处理：跳转到登录页
    if (result.handled) {
      setTimeout(() => {
        uni.navigateTo({
          url: '/pages/login/login'
        })
      }, 2000)
    }
    
    return result
  }

  /**
   * 处理API权限错误
   * @param {Error} error - 错误对象
   * @param {object} options - 处理选项
   */
  handlePermissionError(error, options = {}) {
    const context = {
      ...this.apiContext,
      errorType: 'PERMISSION_ERROR',
      action: 'show_permission_denied'
    }
    
    return this.handleAPIError(error, options, context)
  }

  /**
   * 处理API网络错误
   * @param {Error} error - 错误对象
   * @param {object} options - 处理选项
   */
  handleNetworkError(error, options = {}) {
    const context = {
      ...this.apiContext,
      errorType: 'NETWORK_ERROR',
      action: 'retry_request'
    }
    
    return this.handleAPIError(error, options, context)
  }

  /**
   * 处理API服务器错误
   * @param {Error} error - 错误对象
   * @param {object} options - 处理选项
   */
  handleServerError(error, options = {}) {
    const context = {
      ...this.apiContext,
      errorType: 'SERVER_ERROR',
      action: 'retry_request'
    }
    
    return this.handleAPIError(error, options, context)
  }

  /**
   * 处理API验证错误
   * @param {Error} error - 错误对象
   * @param {object} options - 处理选项
   */
  handleValidationError(error, options = {}) {
    const context = {
      ...this.apiContext,
      errorType: 'VALIDATION_ERROR',
      action: 'show_validation_error'
    }
    
    return this.handleAPIError(error, options, context)
  }

  /**
   * 处理API业务错误
   * @param {Error} error - 错误对象
   * @param {object} options - 处理选项
   */
  handleBusinessError(error, options = {}) {
    const context = {
      ...this.apiContext,
      errorType: 'BUSINESS_ERROR',
      action: 'show_business_error'
    }
    
    return this.handleAPIError(error, options, context)
  }

  /**
   * 处理API超时错误
   * @param {Error} error - 错误对象
   * @param {object} options - 处理选项
   */
  handleTimeoutError(error, options = {}) {
    const context = {
      ...this.apiContext,
      errorType: 'TIMEOUT_ERROR',
      action: 'retry_request'
    }
    
    return this.handleAPIError(error, options, context)
  }

  /**
   * 处理API系统错误
   * @param {Error} error - 错误对象
   * @param {object} options - 处理选项
   */
  handleSystemError(error, options = {}) {
    const context = {
      ...this.apiContext,
      errorType: 'SYSTEM_ERROR',
      action: 'show_system_error'
    }
    
    return this.handleAPIError(error, options, context)
  }

  /**
   * 处理API未知错误
   * @param {Error} error - 错误对象
   * @param {object} options - 处理选项
   */
  handleUnknownError(error, options = {}) {
    const context = {
      ...this.apiContext,
      errorType: 'UNKNOWN_ERROR',
      action: 'show_unknown_error'
    }
    
    return this.handleAPIError(error, options, context)
  }
}

// 创建全局API错误处理器实例
export const globalAPIErrorHandler = new APIErrorHandler()

// 导出便捷方法
export const handleAPIError = (error, options, context) => globalAPIErrorHandler.handleAPIError(error, options, context)
export const handleRequestError = (error, requestInfo, options) => globalAPIErrorHandler.handleRequestError(error, requestInfo, options)
export const handleResponseError = (error, responseInfo, options) => globalAPIErrorHandler.handleResponseError(error, responseInfo, options)
export const handleAuthError = (error, options) => globalAPIErrorHandler.handleAuthError(error, options)
export const handlePermissionError = (error, options) => globalAPIErrorHandler.handlePermissionError(error, options)
export const handleNetworkError = (error, options) => globalAPIErrorHandler.handleNetworkError(error, options)
export const handleServerError = (error, options) => globalAPIErrorHandler.handleServerError(error, options)
export const handleValidationError = (error, options) => globalAPIErrorHandler.handleValidationError(error, options)
export const handleBusinessError = (error, options) => globalAPIErrorHandler.handleBusinessError(error, options)
export const handleTimeoutError = (error, options) => globalAPIErrorHandler.handleTimeoutError(error, options)
export const handleSystemError = (error, options) => globalAPIErrorHandler.handleSystemError(error, options)
export const handleUnknownError = (error, options) => globalAPIErrorHandler.handleUnknownError(error, options)
