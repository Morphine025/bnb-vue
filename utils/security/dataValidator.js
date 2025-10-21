/**
 * 统一数据验证工具
 * 功能描述：提供统一的数据验证功能
 * 主要功能：通用验证、API响应验证、数据清洗
 */

/**
 * 通用验证函数
 * @param {any} data - 要验证的数据
 * @param {Object} rules - 验证规则
 * @returns {Object} 验证结果
 * @example
 * // 验证用户数据
 * const result = validate(userData, {
 *   nickName: { required: true, type: 'string', maxLength: 20 },
 *   phone: { required: true, pattern: /^1[3-9]\d{9}$/ }
 * })
 */
export const validate = (data, rules) => {
  const errors = []
  
  for (const [field, rule] of Object.entries(rules)) {
    const value = data[field]
    
    // 必填验证
    if (rule.required && (value === undefined || value === null || value === '')) {
      errors.push(`${field} 是必填项`)
      continue
    }
    
    // 类型验证
    if (rule.type && typeof value !== rule.type) {
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
  
  return {
    isValid: errors.length === 0,
    errors,
    data: errors.length === 0 ? data : null
  }
}

/**
 * 验证API响应
 * @param {Object} response - API响应
 * @returns {Object} 验证结果
 */
export const validateApiResponse = (response) => {
  if (!response) {
    return { isValid: false, errors: ['API响应为空'], data: null }
  }
  
  if (response.code !== 1) {
    return { 
      isValid: false, 
      errors: [response.msg || response.message || '请求失败'], 
      data: null 
    }
  }
  
  return { isValid: true, errors: [], data: response.data }
}

/**
 * 验证分页参数
 * @param {Object} params - 分页参数
 * @returns {Object} 验证结果
 */
export const validatePagination = (params) => {
  const rules = {
    page: { required: true, type: 'number', min: 1 },
    size: { required: true, type: 'number', min: 1, max: 100 }
  }
  
  return validate(params || {}, rules)
}

/**
 * 验证用户ID
 * @param {string} userId - 用户ID
 * @returns {boolean} 是否有效
 */
export const validateUserId = (userId) => {
  if (!userId || typeof userId !== 'string') {
    return false
  }
  
  // UUID格式验证
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  return uuidRegex.test(userId.trim())
}

/**
 * 验证手机号
 * @param {string} phone - 手机号
 * @returns {boolean} 是否有效
 */
export const validatePhone = (phone) => {
  if (!phone || typeof phone !== 'string') {
    return false
  }
  
  const phonePattern = /^1[3-9]\d{9}$/
  return phonePattern.test(phone.trim())
}

/**
 * 验证邮箱
 * @param {string} email - 邮箱
 * @returns {boolean} 是否有效
 */
export const validateEmail = (email) => {
  if (!email || typeof email !== 'string') {
    return false
  }
  
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailPattern.test(email.trim())
}

/**
 * 清洗用户输入
 * @param {Object} input - 用户输入
 * @returns {Object} 清洗后的数据
 */
export const sanitizeInput = (input) => {
  if (!input || typeof input !== 'object') {
    return {}
  }

  const sanitized = {}
  
  Object.keys(input).forEach(key => {
    const value = input[key]
    
    if (typeof value === 'string') {
      sanitized[key] = value.trim().substring(0, 1000)
    } else if (typeof value === 'number') {
      sanitized[key] = isNaN(value) ? 0 : Math.max(0, Math.min(value, 999999))
    } else if (Array.isArray(value)) {
      sanitized[key] = value.filter(item => item != null)
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeInput(value)
    } else {
      sanitized[key] = value
    }
  })

  return sanitized
}
