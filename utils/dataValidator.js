/**
 * 数据验证工具函数
 * 功能描述：提供数据验证和清洗功能
 * 主要功能：API数据验证、数据清洗、类型检查
 */

/**
 * 验证关注列表数据结构
 * @param {Object} data - API返回的数据
 * @returns {Object} 验证结果
 */
export const validateFollowListData = (data) => {
  const result = {
    isValid: false,
    data: null,
    errors: []
  }

  try {
    // 检查基本结构
    if (!data || typeof data !== 'object') {
      result.errors.push('数据格式错误：不是有效的对象')
      return result
    }

    // 检查code字段 - 后端返回1表示成功
    if (data.code !== 1) {
      result.errors.push(`请求失败：${data.msg || data.message || '未知错误'}`)
      return result
    }

    // 检查data字段
    if (!data.data || typeof data.data !== 'object') {
      result.errors.push('数据格式错误：缺少data字段')
      return result
    }

    // 检查list字段
    if (!Array.isArray(data.data.list)) {
      result.errors.push('数据格式错误：list不是数组')
      return result
    }

    // 验证每个关注项
    const validFollows = []
    data.data.list.forEach((item, index) => {
      const itemResult = validateFollowItem(item, index)
      if (itemResult.isValid) {
        validFollows.push(itemResult.data)
      } else {
        result.errors.push(...itemResult.errors)
      }
    })

    result.isValid = true
    result.data = {
      list: validFollows,
      total: data.data.total || validFollows.length,
      page: data.data.page || 1,
      size: data.data.size || 10
    }

  } catch (error) {
    result.errors.push(`数据验证异常：${error.message}`)
  }

  return result
}

/**
 * 验证单个关注项
 * @param {Object} item - 关注项数据
 * @param {number} index - 索引
 * @returns {Object} 验证结果
 */
export const validateFollowItem = (item, index) => {
  const result = {
    isValid: false,
    data: null,
    errors: []
  }

  try {
    // 检查必要字段
    const requiredFields = ['followUserId', 'followUserNickname']
    const missingFields = requiredFields.filter(field => !item[field])
    
    if (missingFields.length > 0) {
      result.errors.push(`第${index + 1}项缺少必要字段：${missingFields.join(', ')}`)
      return result
    }

    // 验证字段类型
    if (typeof item.followUserId !== 'string' || item.followUserId.trim() === '') {
      result.errors.push(`第${index + 1}项followUserId格式错误`)
      return result
    }

    if (typeof item.followUserNickname !== 'string' || item.followUserNickname.trim() === '') {
      result.errors.push(`第${index + 1}项followUserNickname格式错误`)
      return result
    }

    // 清洗数据
    const cleanedItem = {
      followId: item.followId || `follow_${Date.now()}_${index}`,
      followUserId: item.followUserId.trim(),
      followUserNickname: item.followUserNickname.trim(),
      followUserAvatar: item.followUserAvatar || '/static/logo.png',
      createTime: item.createTime || new Date().toISOString(),
      fansCount: item.fansCount || 0,
      // 添加其他可能需要的字段
      ...item
    }

    result.isValid = true
    result.data = cleanedItem

  } catch (error) {
    result.errors.push(`第${index + 1}项验证异常：${error.message}`)
  }

  return result
}

/**
 * 验证API响应格式
 * @param {Object} response - API响应
 * @returns {Object} 验证结果
 */
export const validateApiResponse = (response) => {
  const result = {
    isValid: false,
    data: null,
    errors: []
  }

  try {
    // 检查响应是否存在
    if (!response) {
      result.errors.push('API响应为空')
      return result
    }

    // 检查基本结构
    if (typeof response !== 'object') {
      result.errors.push('API响应格式错误')
      return result
    }

    // 检查状态码
    if (response.code !== 1) {
      result.errors.push(`API请求失败：${response.msg || response.message || '未知错误'}`)
      return result
    }

    // 检查数据字段
    if (!response.data) {
      result.errors.push('API响应缺少data字段')
      return result
    }

    result.isValid = true
    result.data = response.data

  } catch (error) {
    result.errors.push(`API响应验证异常：${error.message}`)
  }

  return result
}

/**
 * 清洗用户输入数据
 * @param {Object} input - 用户输入
 * @returns {Object} 清洗后的数据
 */
export const sanitizeUserInput = (input) => {
  if (!input || typeof input !== 'object') {
    return {}
  }

  const sanitized = {}
  
  Object.keys(input).forEach(key => {
    const value = input[key]
    
    if (typeof value === 'string') {
      // 去除首尾空格，限制长度
      sanitized[key] = value.trim().substring(0, 1000)
    } else if (typeof value === 'number') {
      // 验证数字范围
      sanitized[key] = isNaN(value) ? 0 : Math.max(0, Math.min(value, 999999))
    } else if (Array.isArray(value)) {
      // 验证数组
      sanitized[key] = value.filter(item => item != null)
    } else if (typeof value === 'object' && value !== null) {
      // 递归处理对象
      sanitized[key] = sanitizeUserInput(value)
    } else {
      sanitized[key] = value
    }
  })

  return sanitized
}

/**
 * 验证分页参数
 * @param {Object} params - 分页参数
 * @returns {Object} 验证结果
 */
export const validatePaginationParams = (params) => {
  const result = {
    isValid: false,
    data: null,
    errors: []
  }

  try {
    const { page = 1, size = 10 } = params || {}

    // 验证页码
    if (typeof page !== 'number' || page < 1 || !Number.isInteger(page)) {
      result.errors.push('页码必须是大于0的整数')
      return result
    }

    // 验证每页数量
    if (typeof size !== 'number' || size < 1 || size > 100 || !Number.isInteger(size)) {
      result.errors.push('每页数量必须是1-100之间的整数')
      return result
    }

    result.isValid = true
    result.data = {
      page: Math.max(1, page),
      size: Math.min(100, Math.max(1, size))
    }

  } catch (error) {
    result.errors.push(`分页参数验证异常：${error.message}`)
  }

  return result
}

/**
 * 验证用户ID格式
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
 * 验证时间格式
 * @param {string} timeStr - 时间字符串
 * @returns {boolean} 是否有效
 */
export const validateTimeString = (timeStr) => {
  if (!timeStr || typeof timeStr !== 'string') {
    return false
  }
  
  const date = new Date(timeStr)
  return !isNaN(date.getTime())
}

/**
 * 数据验证装饰器
 * @param {Function} validator - 验证函数
 * @returns {Function} 装饰器函数
 */
export const validateDecorator = (validator) => {
  return function(target, propertyKey, descriptor) {
    const originalMethod = descriptor.value
    
    descriptor.value = function(...args) {
      const validationResult = validator(args[0])
      
      if (!validationResult.isValid) {
        throw new Error(`数据验证失败：${validationResult.errors.join(', ')}`)
      }
      
      return originalMethod.apply(this, args)
    }
    
    return descriptor
  }
}
