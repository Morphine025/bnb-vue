/**
 * 错误消息映射
 * 功能描述：提供统一的错误消息和多语言支持
 * 主要功能：错误消息定义、多语言支持、消息模板
 */

import { ErrorTypes } from './errorTypes.js'

/**
 * 错误消息配置
 */
export const ErrorMessageConfig = {
  // 默认语言
  defaultLanguage: 'zh-CN',
  
  // 支持的语言
  supportedLanguages: ['zh-CN', 'en-US', 'ja-JP', 'ko-KR'],
  
  // 消息模板配置
  messageTemplates: {
    // 通用消息模板
    common: {
      title: '{title}',
      message: '{message}',
      action: '{action}',
      retry: '重试',
      cancel: '取消',
      confirm: '确定',
      close: '关闭'
    },
    
    // 错误消息模板
    error: {
      title: '错误',
      message: '{message}',
      action: '请重试或联系客服'
    },
    
    // 警告消息模板
    warning: {
      title: '警告',
      message: '{message}',
      action: '请检查后重试'
    },
    
    // 信息消息模板
    info: {
      title: '提示',
      message: '{message}',
      action: '请继续操作'
    }
  }
}

/**
 * 错误消息映射
 */
export const ErrorMessages = {
  'zh-CN': {
    [ErrorTypes.NETWORK_ERROR]: {
      title: '网络错误',
      message: '网络连接失败，请检查网络设置',
      action: '请检查网络连接后重试',
      icon: 'wifi-off',
      color: '#ff4444'
    },
    [ErrorTypes.TIMEOUT_ERROR]: {
      title: '请求超时',
      message: '请求超时，请稍后重试',
      action: '请稍后重试或检查网络状况',
      icon: 'clock',
      color: '#ff8800'
    },
    [ErrorTypes.AUTH_ERROR]: {
      title: '认证失败',
      message: '登录已过期，请重新登录',
      action: '请重新登录',
      icon: 'user-x',
      color: '#ff4444'
    },
    [ErrorTypes.PERMISSION_ERROR]: {
      title: '权限不足',
      message: '没有权限执行此操作',
      action: '请联系管理员或检查权限设置',
      icon: 'shield-x',
      color: '#ff8800'
    },
    [ErrorTypes.VALIDATION_ERROR]: {
      title: '数据验证失败',
      message: '输入信息有误，请检查后重试',
      action: '请检查输入信息格式',
      icon: 'alert-circle',
      color: '#ff8800'
    },
    [ErrorTypes.SERVER_ERROR]: {
      title: '服务器错误',
      message: '服务器错误，请稍后重试',
      action: '请稍后重试或联系客服',
      icon: 'server',
      color: '#ff4444'
    },
    [ErrorTypes.BUSINESS_ERROR]: {
      title: '业务错误',
      message: '操作失败，请重试',
      action: '请重试或联系客服',
      icon: 'x-circle',
      color: '#ff8800'
    },
    [ErrorTypes.SYSTEM_ERROR]: {
      title: '系统错误',
      message: '系统错误，请稍后重试',
      action: '请稍后重试或联系技术支持',
      icon: 'alert-triangle',
      color: '#ff4444'
    },
    [ErrorTypes.UNKNOWN_ERROR]: {
      title: '未知错误',
      message: '发生未知错误，请重试',
      action: '请重试或联系客服',
      icon: 'help-circle',
      color: '#666666'
    }
  },
  
  'en-US': {
    [ErrorTypes.NETWORK_ERROR]: {
      title: 'Network Error',
      message: 'Network connection failed, please check your network settings',
      action: 'Please check your network connection and try again',
      icon: 'wifi-off',
      color: '#ff4444'
    },
    [ErrorTypes.TIMEOUT_ERROR]: {
      title: 'Request Timeout',
      message: 'Request timeout, please try again later',
      action: 'Please try again later or check your network status',
      icon: 'clock',
      color: '#ff8800'
    },
    [ErrorTypes.AUTH_ERROR]: {
      title: 'Authentication Failed',
      message: 'Login has expired, please login again',
      action: 'Please login again',
      icon: 'user-x',
      color: '#ff4444'
    },
    [ErrorTypes.PERMISSION_ERROR]: {
      title: 'Permission Denied',
      message: 'You do not have permission to perform this operation',
      action: 'Please contact administrator or check permission settings',
      icon: 'shield-x',
      color: '#ff8800'
    },
    [ErrorTypes.VALIDATION_ERROR]: {
      title: 'Validation Failed',
      message: 'Input information is incorrect, please check and try again',
      action: 'Please check the format of input information',
      icon: 'alert-circle',
      color: '#ff8800'
    },
    [ErrorTypes.SERVER_ERROR]: {
      title: 'Server Error',
      message: 'Server error, please try again later',
      action: 'Please try again later or contact customer service',
      icon: 'server',
      color: '#ff4444'
    },
    [ErrorTypes.BUSINESS_ERROR]: {
      title: 'Business Error',
      message: 'Operation failed, please try again',
      action: 'Please try again or contact customer service',
      icon: 'x-circle',
      color: '#ff8800'
    },
    [ErrorTypes.SYSTEM_ERROR]: {
      title: 'System Error',
      message: 'System error, please try again later',
      action: 'Please try again later or contact technical support',
      icon: 'alert-triangle',
      color: '#ff4444'
    },
    [ErrorTypes.UNKNOWN_ERROR]: {
      title: 'Unknown Error',
      message: 'An unknown error occurred, please try again',
      action: 'Please try again or contact customer service',
      icon: 'help-circle',
      color: '#666666'
    }
  },
  
  'ja-JP': {
    [ErrorTypes.NETWORK_ERROR]: {
      title: 'ネットワークエラー',
      message: 'ネットワーク接続に失敗しました。ネットワーク設定を確認してください',
      action: 'ネットワーク接続を確認してから再試行してください',
      icon: 'wifi-off',
      color: '#ff4444'
    },
    [ErrorTypes.TIMEOUT_ERROR]: {
      title: 'リクエストタイムアウト',
      message: 'リクエストがタイムアウトしました。しばらくしてから再試行してください',
      action: 'しばらくしてから再試行するか、ネットワーク状況を確認してください',
      icon: 'clock',
      color: '#ff8800'
    },
    [ErrorTypes.AUTH_ERROR]: {
      title: '認証失敗',
      message: 'ログインの有効期限が切れました。再度ログインしてください',
      action: '再度ログインしてください',
      icon: 'user-x',
      color: '#ff4444'
    },
    [ErrorTypes.PERMISSION_ERROR]: {
      title: '権限不足',
      message: 'この操作を実行する権限がありません',
      action: '管理者に連絡するか、権限設定を確認してください',
      icon: 'shield-x',
      color: '#ff8800'
    },
    [ErrorTypes.VALIDATION_ERROR]: {
      title: 'データ検証失敗',
      message: '入力情報に誤りがあります。確認してから再試行してください',
      action: '入力情報の形式を確認してください',
      icon: 'alert-circle',
      color: '#ff8800'
    },
    [ErrorTypes.SERVER_ERROR]: {
      title: 'サーバーエラー',
      message: 'サーバーエラーが発生しました。しばらくしてから再試行してください',
      action: 'しばらくしてから再試行するか、カスタマーサービスに連絡してください',
      icon: 'server',
      color: '#ff4444'
    },
    [ErrorTypes.BUSINESS_ERROR]: {
      title: 'ビジネスエラー',
      message: '操作に失敗しました。再試行してください',
      action: '再試行するか、カスタマーサービスに連絡してください',
      icon: 'x-circle',
      color: '#ff8800'
    },
    [ErrorTypes.SYSTEM_ERROR]: {
      title: 'システムエラー',
      message: 'システムエラーが発生しました。しばらくしてから再試行してください',
      action: 'しばらくしてから再試行するか、テクニカルサポートに連絡してください',
      icon: 'alert-triangle',
      color: '#ff4444'
    },
    [ErrorTypes.UNKNOWN_ERROR]: {
      title: '不明なエラー',
      message: '不明なエラーが発生しました。再試行してください',
      action: '再試行するか、カスタマーサービスに連絡してください',
      icon: 'help-circle',
      color: '#666666'
    }
  },
  
  'ko-KR': {
    [ErrorTypes.NETWORK_ERROR]: {
      title: '네트워크 오류',
      message: '네트워크 연결에 실패했습니다. 네트워크 설정을 확인해주세요',
      action: '네트워크 연결을 확인한 후 다시 시도해주세요',
      icon: 'wifi-off',
      color: '#ff4444'
    },
    [ErrorTypes.TIMEOUT_ERROR]: {
      title: '요청 시간 초과',
      message: '요청 시간이 초과되었습니다. 잠시 후 다시 시도해주세요',
      action: '잠시 후 다시 시도하거나 네트워크 상태를 확인해주세요',
      icon: 'clock',
      color: '#ff8800'
    },
    [ErrorTypes.AUTH_ERROR]: {
      title: '인증 실패',
      message: '로그인이 만료되었습니다. 다시 로그인해주세요',
      action: '다시 로그인해주세요',
      icon: 'user-x',
      color: '#ff4444'
    },
    [ErrorTypes.PERMISSION_ERROR]: {
      title: '권한 부족',
      message: '이 작업을 실행할 권한이 없습니다',
      action: '관리자에게 문의하거나 권한 설정을 확인해주세요',
      icon: 'shield-x',
      color: '#ff8800'
    },
    [ErrorTypes.VALIDATION_ERROR]: {
      title: '데이터 검증 실패',
      message: '입력 정보에 오류가 있습니다. 확인 후 다시 시도해주세요',
      action: '입력 정보 형식을 확인해주세요',
      icon: 'alert-circle',
      color: '#ff8800'
    },
    [ErrorTypes.SERVER_ERROR]: {
      title: '서버 오류',
      message: '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요',
      action: '잠시 후 다시 시도하거나 고객 서비스에 문의해주세요',
      icon: 'server',
      color: '#ff4444'
    },
    [ErrorTypes.BUSINESS_ERROR]: {
      title: '비즈니스 오류',
      message: '작업에 실패했습니다. 다시 시도해주세요',
      action: '다시 시도하거나 고객 서비스에 문의해주세요',
      icon: 'x-circle',
      color: '#ff8800'
    },
    [ErrorTypes.SYSTEM_ERROR]: {
      title: '시스템 오류',
      message: '시스템 오류가 발생했습니다. 잠시 후 다시 시도해주세요',
      action: '잠시 후 다시 시도하거나 기술 지원에 문의해주세요',
      icon: 'alert-triangle',
      color: '#ff4444'
    },
    [ErrorTypes.UNKNOWN_ERROR]: {
      title: '알 수 없는 오류',
      message: '알 수 없는 오류가 발생했습니다. 다시 시도해주세요',
      action: '다시 시도하거나 고객 서비스에 문의해주세요',
      icon: 'help-circle',
      color: '#666666'
    }
  }
}

/**
 * 错误消息管理器
 */
export class ErrorMessageManager {
  constructor() {
    this.currentLanguage = ErrorMessageConfig.defaultLanguage
    this.customMessages = {}
  }

  /**
   * 设置当前语言
   * @param {string} language - 语言代码
   */
  setLanguage(language) {
    if (ErrorMessageConfig.supportedLanguages.includes(language)) {
      this.currentLanguage = language
    } else {
      console.warn(`不支持的语言: ${language}，使用默认语言: ${ErrorMessageConfig.defaultLanguage}`)
    }
  }

  /**
   * 获取当前语言
   * @returns {string} 当前语言代码
   */
  getCurrentLanguage() {
    return this.currentLanguage
  }

  /**
   * 获取错误消息
   * @param {string} errorType - 错误类型
   * @param {string} language - 语言代码（可选）
   * @returns {Object} 错误消息对象
   */
  getErrorMessage(errorType, language = null) {
    const lang = language || this.currentLanguage
    const messages = ErrorMessages[lang] || ErrorMessages[ErrorMessageConfig.defaultLanguage]
    
    return messages[errorType] || messages[ErrorTypes.UNKNOWN_ERROR]
  }

  /**
   * 获取错误标题
   * @param {string} errorType - 错误类型
   * @param {string} language - 语言代码（可选）
   * @returns {string} 错误标题
   */
  getErrorTitle(errorType, language = null) {
    const message = this.getErrorMessage(errorType, language)
    return message.title
  }

  /**
   * 获取错误消息
   * @param {string} errorType - 错误类型
   * @param {string} language - 语言代码（可选）
   * @returns {string} 错误消息
   */
  getErrorMessage(errorType, language = null) {
    const message = this.getErrorMessage(errorType, language)
    return message.message
  }

  /**
   * 获取错误操作提示
   * @param {string} errorType - 错误类型
   * @param {string} language - 语言代码（可选）
   * @returns {string} 错误操作提示
   */
  getErrorAction(errorType, language = null) {
    const message = this.getErrorMessage(errorType, language)
    return message.action
  }

  /**
   * 获取错误图标
   * @param {string} errorType - 错误类型
   * @param {string} language - 语言代码（可选）
   * @returns {string} 错误图标
   */
  getErrorIcon(errorType, language = null) {
    const message = this.getErrorMessage(errorType, language)
    return message.icon
  }

  /**
   * 获取错误颜色
   * @param {string} errorType - 错误类型
   * @param {string} language - 语言代码（可选）
   * @returns {string} 错误颜色
   */
  getErrorColor(errorType, language = null) {
    const message = this.getErrorMessage(errorType, language)
    return message.color
  }

  /**
   * 设置自定义错误消息
   * @param {string} errorType - 错误类型
   * @param {Object} message - 自定义消息
   * @param {string} language - 语言代码（可选）
   */
  setCustomMessage(errorType, message, language = null) {
    const lang = language || this.currentLanguage
    
    if (!this.customMessages[lang]) {
      this.customMessages[lang] = {}
    }
    
    this.customMessages[lang][errorType] = message
  }

  /**
   * 获取自定义错误消息
   * @param {string} errorType - 错误类型
   * @param {string} language - 语言代码（可选）
   * @returns {Object|null} 自定义错误消息
   */
  getCustomMessage(errorType, language = null) {
    const lang = language || this.currentLanguage
    return this.customMessages[lang]?.[errorType] || null
  }

  /**
   * 清除自定义错误消息
   * @param {string} errorType - 错误类型（可选）
   * @param {string} language - 语言代码（可选）
   */
  clearCustomMessage(errorType = null, language = null) {
    if (errorType && language) {
      if (this.customMessages[language]) {
        delete this.customMessages[language][errorType]
      }
    } else if (errorType) {
      Object.keys(this.customMessages).forEach(lang => {
        if (this.customMessages[lang]) {
          delete this.customMessages[lang][errorType]
        }
      })
    } else if (language) {
      delete this.customMessages[language]
    } else {
      this.customMessages = {}
    }
  }

  /**
   * 格式化错误消息
   * @param {string} template - 消息模板
   * @param {Object} variables - 变量对象
   * @returns {string} 格式化后的消息
   */
  formatMessage(template, variables = {}) {
    let message = template
    
    Object.keys(variables).forEach(key => {
      const placeholder = `{${key}}`
      message = message.replace(new RegExp(placeholder, 'g'), variables[key])
    })
    
    return message
  }

  /**
   * 获取所有支持的语言
   * @returns {Array} 支持的语言列表
   */
  getSupportedLanguages() {
    return [...ErrorMessageConfig.supportedLanguages]
  }

  /**
   * 检查语言是否支持
   * @param {string} language - 语言代码
   * @returns {boolean} 是否支持
   */
  isLanguageSupported(language) {
    return ErrorMessageConfig.supportedLanguages.includes(language)
  }
}

// 创建全局错误消息管理器实例
export const globalErrorMessageManager = new ErrorMessageManager()

// 导出便捷方法
export const getErrorMessage = (errorType, language) => globalErrorMessageManager.getErrorMessage(errorType, language)
export const getErrorTitle = (errorType, language) => globalErrorMessageManager.getErrorTitle(errorType, language)
export const getErrorAction = (errorType, language) => globalErrorMessageManager.getErrorAction(errorType, language)
export const getErrorIcon = (errorType, language) => globalErrorMessageManager.getErrorIcon(errorType, language)
export const getErrorColor = (errorType, language) => globalErrorMessageManager.getErrorColor(errorType, language)
