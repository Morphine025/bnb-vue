/**
 * 统一数据验证工具
 * 功能描述：提供统一的数据验证功能
 * 主要功能：通用验证、API响应验证、数据清洗
 */

import { handleError } from '../error/errorHandler.js'
import { ErrorTypes, ErrorOptions } from '../error/errorTypes.js'

/**
 * 通用验证函数
 * @param {any} data - 要验证的数据
 * @param {Object} rules - 验证规则
 * @param {Object} options - 验证选项
 * @returns {Object} 验证结果
 * @example
 * // 验证用户数据
 * const result = validate(userData, {
 *   nickName: { required: true, type: 'string', maxLength: 20 },
 *   phone: { required: true, pattern: /^1[3-9]\d{9}$/ }
 * })
 */
export const validate = (data, rules, options = {}) => {
  try {
    const errors = []
    
    for (const [field, rule] of Object.entries(rules)) {
      const value = data[field]
      
      // 必填验证
      if (rule.required && (value === undefined || value === null || value === '')) {
        errors.push(`${field} 是必填项`)
        continue
      }
      
      // 类型验证 - 只有当字段存在且不为undefined/null时才验证类型
      if (rule.type && value !== undefined && value !== null && typeof value !== rule.type) {
        errors.push(`${field} 必须是 ${rule.type} 类型`)
        continue
      }
      
      // 长度验证
      if (rule.maxLength && value && value.length > rule.maxLength) {
        errors.push(`${field} 不能超过 ${rule.maxLength} 个字符`)
        continue
      }
      
      // 模式验证
      if (rule.pattern && value && !rule.pattern.test(value)) {
        errors.push(`${field} 格式不正确`)
        continue
      }
      
      // 范围验证
      if (rule.min !== undefined && value < rule.min) {
        errors.push(`${field} 不能小于 ${rule.min}`)
        continue
      }
      
      if (rule.max !== undefined && value > rule.max) {
        errors.push(`${field} 不能大于 ${rule.max}`)
        continue
      }
    }
    
    const result = {
      isValid: errors.length === 0,
      errors,
      data: errors.length === 0 ? data : null
    }
    
    // 如果验证失败且需要处理错误
    if (!result.isValid && options.handleErrors !== false) {
      const validationError = new Error(`数据验证失败: ${errors.join(', ')}`)
      validationError.type = ErrorTypes.VALIDATION_ERROR
      validationError.code = 'VALIDATION_ERROR'
      validationError.errors = errors
      
      const validatorContext = {
        module: 'DataValidator',
        layer: 'Utils',
        field: 'validate',
        data: data,
        rules: rules
      }
      
      const errorOptions = {
        [ErrorOptions.SHOW_TOAST]: options.showToast !== false,
        [ErrorOptions.LOG_ERROR]: true,
        [ErrorOptions.REPORT_ERROR]: options.reportError || false,
        [ErrorOptions.RETRY_ENABLED]: false,
        customMessage: `数据验证失败: ${errors.join(', ')}`
      }
      
      handleError(validationError, validatorContext, errorOptions)
    }
    
    return result
  } catch (error) {
    const validatorContext = {
      module: 'DataValidator',
      layer: 'Utils',
      field: 'validate',
      data: data,
      rules: rules
    }
    
    const errorOptions = {
      [ErrorOptions.SHOW_TOAST]: false,
      [ErrorOptions.LOG_ERROR]: true,
      [ErrorOptions.REPORT_ERROR]: true,
      [ErrorOptions.RETRY_ENABLED]: false,
      customMessage: '数据验证过程出错'
    }
    
    handleError(error, validatorContext, errorOptions)
    
    return {
      isValid: false,
      errors: ['数据验证过程出错'],
      data: null
    }
  }
}

/**
 * 验证API响应
 * @param {Object} response - API响应
 * @param {Object} options - 验证选项
 * @returns {Object} 验证结果
 */
export const validateApiResponse = (response, options = {}) => {
  try {
    if (!response) {
      const error = new Error('API响应为空')
      error.type = ErrorTypes.VALIDATION_ERROR
      error.code = 'API_RESPONSE_EMPTY'
      
      const validatorContext = {
        module: 'DataValidator',
        layer: 'Utils',
        field: 'validateApiResponse',
        response: response
      }
      
      const errorOptions = {
        [ErrorOptions.SHOW_TOAST]: options.showToast !== false,
        [ErrorOptions.LOG_ERROR]: true,
        [ErrorOptions.REPORT_ERROR]: options.reportError || false,
        [ErrorOptions.RETRY_ENABLED]: false,
        customMessage: 'API响应为空'
      }
      
      handleError(error, validatorContext, errorOptions)
      
      return { isValid: false, errors: ['API响应为空'], data: null }
    }
    
    if (response.code !== 1) {
      const errorMessage = response.msg || response.message || '请求失败'
      const error = new Error(errorMessage)
      error.type = ErrorTypes.BUSINESS_ERROR
      error.code = 'API_RESPONSE_ERROR'
      error.responseCode = response.code
      
      const validatorContext = {
        module: 'DataValidator',
        layer: 'Utils',
        field: 'validateApiResponse',
        response: response
      }
      
      const errorOptions = {
        [ErrorOptions.SHOW_TOAST]: options.showToast !== false,
        [ErrorOptions.LOG_ERROR]: true,
        [ErrorOptions.REPORT_ERROR]: options.reportError || false,
        [ErrorOptions.RETRY_ENABLED]: false,
        customMessage: errorMessage
      }
      
      handleError(error, validatorContext, errorOptions)
      
      return { 
        isValid: false, 
        errors: [errorMessage], 
        data: null 
      }
    }
    
    return { isValid: true, errors: [], data: response.data }
  } catch (error) {
    const validatorContext = {
      module: 'DataValidator',
      layer: 'Utils',
      field: 'validateApiResponse',
      response: response
    }
    
    const errorOptions = {
      [ErrorOptions.SHOW_TOAST]: false,
      [ErrorOptions.LOG_ERROR]: true,
      [ErrorOptions.REPORT_ERROR]: true,
      [ErrorOptions.RETRY_ENABLED]: false,
      customMessage: 'API响应验证过程出错'
    }
    
    handleError(error, validatorContext, errorOptions)
    
    return {
      isValid: false,
      errors: ['API响应验证过程出错'],
      data: null
    }
  }
}

/**
 * 验证分页参数
 * @param {Object} params - 分页参数
 * @param {Object} options - 验证选项
 * @returns {Object} 验证结果
 */
export const validatePagination = (params, options = {}) => {
  const rules = {
    page: { required: true, type: 'number', min: 1 },
    size: { required: true, type: 'number', min: 1, max: 100 }
  }
  
  return validate(params || {}, rules, options)
}

/**
 * 验证用户ID
 * @param {string} userId - 用户ID
 * @param {Object} options - 验证选项
 * @returns {boolean} 是否有效
 */
export const validateUserId = (userId, options = {}) => {
  try {
    if (!userId || typeof userId !== 'string') {
      if (options.handleErrors !== false) {
        const error = new Error('用户ID不能为空或格式不正确')
        error.type = ErrorTypes.VALIDATION_ERROR
        error.code = 'INVALID_USER_ID'
        
        const validatorContext = {
          module: 'DataValidator',
          layer: 'Utils',
          field: 'validateUserId',
          userId: userId
        }
        
        const errorOptions = {
          [ErrorOptions.SHOW_TOAST]: options.showToast !== false,
          [ErrorOptions.LOG_ERROR]: true,
          [ErrorOptions.REPORT_ERROR]: options.reportError || false,
          [ErrorOptions.RETRY_ENABLED]: false,
          customMessage: '用户ID不能为空或格式不正确'
        }
        
        handleError(error, validatorContext, errorOptions)
      }
      return false
    }
    
    // UUID格式验证
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    const isValid = uuidRegex.test(userId.trim())
    
    if (!isValid && options.handleErrors !== false) {
      const error = new Error('用户ID格式不正确')
      error.type = ErrorTypes.VALIDATION_ERROR
      error.code = 'INVALID_USER_ID_FORMAT'
      
      const validatorContext = {
        module: 'DataValidator',
        layer: 'Utils',
        field: 'validateUserId',
        userId: userId
      }
      
      const errorOptions = {
        [ErrorOptions.SHOW_TOAST]: options.showToast !== false,
        [ErrorOptions.LOG_ERROR]: true,
        [ErrorOptions.REPORT_ERROR]: options.reportError || false,
        [ErrorOptions.RETRY_ENABLED]: false,
        customMessage: '用户ID格式不正确'
      }
      
      handleError(error, validatorContext, errorOptions)
    }
    
    return isValid
  } catch (error) {
    const validatorContext = {
      module: 'DataValidator',
      layer: 'Utils',
      field: 'validateUserId',
      userId: userId
    }
    
    const errorOptions = {
      [ErrorOptions.SHOW_TOAST]: false,
      [ErrorOptions.LOG_ERROR]: true,
      [ErrorOptions.REPORT_ERROR]: true,
      [ErrorOptions.RETRY_ENABLED]: false,
      customMessage: '用户ID验证过程出错'
    }
    
    handleError(error, validatorContext, errorOptions)
    return false
  }
}

/**
 * 验证手机号
 * @param {string} phone - 手机号
 * @param {Object} options - 验证选项
 * @returns {boolean} 是否有效
 */
export const validatePhone = (phone, options = {}) => {
  try {
    if (!phone || typeof phone !== 'string') {
      if (options.handleErrors !== false) {
        const error = new Error('手机号不能为空或格式不正确')
        error.type = ErrorTypes.VALIDATION_ERROR
        error.code = 'INVALID_PHONE'
        
        const validatorContext = {
          module: 'DataValidator',
          layer: 'Utils',
          field: 'validatePhone',
          phone: phone
        }
        
        const errorOptions = {
          [ErrorOptions.SHOW_TOAST]: options.showToast !== false,
          [ErrorOptions.LOG_ERROR]: true,
          [ErrorOptions.REPORT_ERROR]: options.reportError || false,
          [ErrorOptions.RETRY_ENABLED]: false,
          customMessage: '手机号不能为空或格式不正确'
        }
        
        handleError(error, validatorContext, errorOptions)
      }
      return false
    }
    
    const phonePattern = /^1[3-9]\d{9}$/
    const isValid = phonePattern.test(phone.trim())
    
    if (!isValid && options.handleErrors !== false) {
      const error = new Error('手机号格式不正确')
      error.type = ErrorTypes.VALIDATION_ERROR
      error.code = 'INVALID_PHONE_FORMAT'
      
      const validatorContext = {
        module: 'DataValidator',
        layer: 'Utils',
        field: 'validatePhone',
        phone: phone
      }
      
      const errorOptions = {
        [ErrorOptions.SHOW_TOAST]: options.showToast !== false,
        [ErrorOptions.LOG_ERROR]: true,
        [ErrorOptions.REPORT_ERROR]: options.reportError || false,
        [ErrorOptions.RETRY_ENABLED]: false,
        customMessage: '手机号格式不正确'
      }
      
      handleError(error, validatorContext, errorOptions)
    }
    
    return isValid
  } catch (error) {
    const validatorContext = {
      module: 'DataValidator',
      layer: 'Utils',
      field: 'validatePhone',
      phone: phone
    }
    
    const errorOptions = {
      [ErrorOptions.SHOW_TOAST]: false,
      [ErrorOptions.LOG_ERROR]: true,
      [ErrorOptions.REPORT_ERROR]: true,
      [ErrorOptions.RETRY_ENABLED]: false,
      customMessage: '手机号验证过程出错'
    }
    
    handleError(error, validatorContext, errorOptions)
    return false
  }
}

/**
 * 验证邮箱
 * @param {string} email - 邮箱
 * @param {Object} options - 验证选项
 * @returns {boolean} 是否有效
 */
export const validateEmail = (email, options = {}) => {
  try {
    if (!email || typeof email !== 'string') {
      if (options.handleErrors !== false) {
        const error = new Error('邮箱不能为空或格式不正确')
        error.type = ErrorTypes.VALIDATION_ERROR
        error.code = 'INVALID_EMAIL'
        
        const validatorContext = {
          module: 'DataValidator',
          layer: 'Utils',
          field: 'validateEmail',
          email: email
        }
        
        const errorOptions = {
          [ErrorOptions.SHOW_TOAST]: options.showToast !== false,
          [ErrorOptions.LOG_ERROR]: true,
          [ErrorOptions.REPORT_ERROR]: options.reportError || false,
          [ErrorOptions.RETRY_ENABLED]: false,
          customMessage: '邮箱不能为空或格式不正确'
        }
        
        handleError(error, validatorContext, errorOptions)
      }
      return false
    }
    
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    const isValid = emailPattern.test(email.trim())
    
    if (!isValid && options.handleErrors !== false) {
      const error = new Error('邮箱格式不正确')
      error.type = ErrorTypes.VALIDATION_ERROR
      error.code = 'INVALID_EMAIL_FORMAT'
      
      const validatorContext = {
        module: 'DataValidator',
        layer: 'Utils',
        field: 'validateEmail',
        email: email
      }
      
      const errorOptions = {
        [ErrorOptions.SHOW_TOAST]: options.showToast !== false,
        [ErrorOptions.LOG_ERROR]: true,
        [ErrorOptions.REPORT_ERROR]: options.reportError || false,
        [ErrorOptions.RETRY_ENABLED]: false,
        customMessage: '邮箱格式不正确'
      }
      
      handleError(error, validatorContext, errorOptions)
    }
    
    return isValid
  } catch (error) {
    const validatorContext = {
      module: 'DataValidator',
      layer: 'Utils',
      field: 'validateEmail',
      email: email
    }
    
    const errorOptions = {
      [ErrorOptions.SHOW_TOAST]: false,
      [ErrorOptions.LOG_ERROR]: true,
      [ErrorOptions.REPORT_ERROR]: true,
      [ErrorOptions.RETRY_ENABLED]: false,
      customMessage: '邮箱验证过程出错'
    }
    
    handleError(error, validatorContext, errorOptions)
    return false
  }
}

/**
 * 清理HTML标签
 * @param {string} input - 输入字符串
 * @returns {string} 清理后的字符串
 */
export const stripHtmlTags = (input) => {
  if (typeof input !== 'string') return ''
  
  return input
    .replace(/<[^>]*>/g, '') // 移除HTML标签
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/&#x2F;/g, '/')
}

/**
 * 清理特殊字符
 * @param {string} input - 输入字符串
 * @returns {string} 清理后的字符串
 */
export const sanitizeSpecialChars = (input) => {
  if (typeof input !== 'string') return ''
  
  return input
    .replace(/[<>]/g, '') // 移除尖括号
    .replace(/javascript:/gi, '') // 移除javascript协议
    .replace(/on\w+\s*=/gi, '') // 移除事件处理器
    .trim()
}

/**
 * 检查输入是否安全
 * @param {string} input - 输入字符串
 * @returns {boolean} 是否安全
 */
export const isInputSafe = (input) => {
  if (!input || typeof input !== 'string') return true
  
  // 检查危险模式
  const dangerousPatterns = [
    /<script/i,
    /javascript:/i,
    /on\w+\s*=/i,
    /<iframe/i,
    /<object/i,
    /<embed/i
  ]
  
  return !dangerousPatterns.some(pattern => pattern.test(input))
}

/**
 * 验证图片URL
 * @param {string} url - 图片URL
 * @returns {boolean} 是否为有效的图片URL
 */
export const isValidImageUrl = (url) => {
  if (!url || typeof url !== 'string') return false
  
  // 检查是否为有效的URL格式
  try {
    const urlObj = new URL(url)
    const validProtocols = ['http:', 'https:', 'file:']
    if (!validProtocols.includes(urlObj.protocol)) {
      return false
    }
  } catch {
    // 如果不是完整URL，检查是否为本地路径
    if (!url.startsWith('/') && !url.startsWith('./') && !url.startsWith('../')) {
      return false
    }
  }
  
  // 检查文件扩展名
  const validExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp']
  const hasValidExtension = validExtensions.some(ext => 
    url.toLowerCase().includes(ext)
  )
  
  return hasValidExtension || url.includes('temp') // 临时文件也允许
}

/**
 * 验证昵称
 * @param {string} nickname - 昵称
 * @param {Object} options - 验证选项
 * @returns {Object} 验证结果
 */
export const validateNickname = (nickname, options = {}) => {
  const result = {
    valid: false,
    message: '',
    cleaned: ''
  }
  
  if (!nickname || typeof nickname !== 'string') {
    result.message = '昵称不能为空'
    return result
  }
  
  const cleaned = sanitizeStringInput(nickname, {
    maxLength: options.maxLength || 20
  })
  
  result.cleaned = cleaned
  
  if (!cleaned.trim()) {
    result.message = '昵称不能为空'
    return result
  }
  
  if (cleaned.length > (options.maxLength || 20)) {
    result.message = `昵称不能超过${options.maxLength || 20}个字符`
    return result
  }
  
  // 检查是否包含非法字符
  const invalidChars = /[<>'"&]/
  if (invalidChars.test(cleaned)) {
    result.message = '昵称包含非法字符'
    return result
  }
  
  result.valid = true
  return result
}

/**
 * 验证微信号
 * @param {string} wechat - 微信号
 * @param {Object} options - 验证选项
 * @returns {Object} 验证结果
 */
export const validateWechat = (wechat, options = {}) => {
  const result = {
    valid: false,
    message: '',
    cleaned: ''
  }
  
  if (!wechat || typeof wechat !== 'string') {
    result.valid = true // 微信号可以为空
    return result
  }
  
  const cleaned = sanitizeStringInput(wechat, {
    maxLength: options.maxLength || 20
  })
  
  result.cleaned = cleaned
  
  if (cleaned.length > (options.maxLength || 20)) {
    result.message = `微信号不能超过${options.maxLength || 20}个字符`
    return result
  }
  
  result.valid = true
  return result
}

/**
 * 清理字符串输入
 * @param {string} input - 输入字符串
 * @param {Object} options - 清理选项
 * @returns {string} 清理后的字符串
 */
export const sanitizeStringInput = (input, options = {}) => {
  if (typeof input !== 'string') return ''
  
  let cleaned = input
  
  // 移除HTML标签
  if (options.stripHtml !== false) {
    cleaned = stripHtmlTags(cleaned)
  }
  
  // 清理特殊字符
  if (options.stripSpecialChars !== false) {
    cleaned = sanitizeSpecialChars(cleaned)
  }
  
  // 移除多余空格
  if (options.trim !== false) {
    cleaned = cleaned.trim()
  }
  
  // 限制长度
  if (options.maxLength && cleaned.length > options.maxLength) {
    cleaned = cleaned.substring(0, options.maxLength)
  }
  
  return cleaned
}

/**
 * 清洗用户输入
 * @param {Object} input - 用户输入
 * @param {Object} options - 清洗选项
 * @returns {Object} 清洗后的数据
 */
export const sanitizeInput = (input, options = {}) => {
  try {
    if (!input || typeof input !== 'object') {
      if (options.handleErrors !== false) {
        const error = new Error('输入数据不能为空或格式不正确')
        error.type = ErrorTypes.VALIDATION_ERROR
        error.code = 'INVALID_INPUT'
        
        const validatorContext = {
          module: 'DataValidator',
          layer: 'Utils',
          field: 'sanitizeInput',
          input: input
        }
        
        const errorOptions = {
          [ErrorOptions.SHOW_TOAST]: options.showToast !== false,
          [ErrorOptions.LOG_ERROR]: true,
          [ErrorOptions.REPORT_ERROR]: options.reportError || false,
          [ErrorOptions.RETRY_ENABLED]: false,
          customMessage: '输入数据不能为空或格式不正确'
        }
        
        handleError(error, validatorContext, errorOptions)
      }
      return {}
    }

    const sanitized = {}
    
    Object.keys(input).forEach(key => {
      try {
        const value = input[key]
        
        if (typeof value === 'string') {
          sanitized[key] = sanitizeStringInput(value, {
            maxLength: options.maxLength || 1000
          })
        } else if (typeof value === 'number') {
          sanitized[key] = isNaN(value) ? 0 : Math.max(0, Math.min(value, 999999))
        } else if (Array.isArray(value)) {
          sanitized[key] = value.filter(item => item != null)
        } else if (typeof value === 'object' && value !== null) {
          sanitized[key] = sanitizeInput(value, { ...options, handleErrors: false })
        } else {
          sanitized[key] = value
        }
      } catch (fieldError) {
        if (options.handleErrors !== false) {
          const error = new Error(`字段 ${key} 清洗失败`)
          error.type = ErrorTypes.VALIDATION_ERROR
          error.code = 'SANITIZE_FIELD_ERROR'
          error.field = key
          error.originalError = fieldError
          
          const validatorContext = {
            module: 'DataValidator',
            layer: 'Utils',
            field: 'sanitizeInput',
            key: key,
            value: input[key]
          }
          
          const errorOptions = {
            [ErrorOptions.SHOW_TOAST]: false,
            [ErrorOptions.LOG_ERROR]: true,
            [ErrorOptions.REPORT_ERROR]: options.reportError || false,
            [ErrorOptions.RETRY_ENABLED]: false,
            customMessage: `字段 ${key} 清洗失败`
          }
          
          handleError(error, validatorContext, errorOptions)
        }
        // 清洗失败时保留原值
        sanitized[key] = input[key]
      }
    })

    return sanitized
  } catch (error) {
    const validatorContext = {
      module: 'DataValidator',
      layer: 'Utils',
      field: 'sanitizeInput',
      input: input
    }
    
    const errorOptions = {
      [ErrorOptions.SHOW_TOAST]: false,
      [ErrorOptions.LOG_ERROR]: true,
      [ErrorOptions.REPORT_ERROR]: true,
      [ErrorOptions.RETRY_ENABLED]: false,
      customMessage: '数据清洗过程出错'
    }
    
    handleError(error, validatorContext, errorOptions)
    
    // 清洗失败时返回空对象
    return {}
  }
}
