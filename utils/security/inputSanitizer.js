/**
 * 简化输入清理工具
 * 功能描述：提供基础的输入清理和安全验证
 * 主要功能：XSS防护、输入清理、数据验证
 */

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
 * 清理用户输入
 * @param {string} input - 输入字符串
 * @param {Object} options - 清理选项
 * @returns {string} 清理后的字符串
 */
export const sanitizeInput = (input, options = {}) => {
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
 * 验证手机号
 * @param {string} phone - 手机号
 * @returns {boolean} 验证结果
 */
export const validatePhone = (phone) => {
  if (!phone || typeof phone !== 'string') return false
  
  const cleaned = sanitizeInput(phone, { stripHtml: false, stripSpecialChars: true })
  const phonePattern = /^1[3-9]\d{9}$/
  
  return phonePattern.test(cleaned)
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
  
  const cleaned = sanitizeInput(nickname, {
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
  
  const cleaned = sanitizeInput(wechat, {
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
