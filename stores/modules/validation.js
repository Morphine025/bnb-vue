/**
 * 数据验证中间件
 * 功能描述：提供统一的数据验证机制，支持API响应验证、用户输入验证、数据格式统一
 * 主要功能：验证中间件、错误处理、数据清洗、格式统一
 */

import { defineStore } from 'pinia'
import { ref } from 'vue'
import { validate, validateApiResponse, validatePagination } from '../../utils/security/dataValidator'

export const useValidationStore = defineStore('validation', () => {
  // 验证统计
  const validationStats = ref({
    totalValidations: 0,
    successfulValidations: 0,
    failedValidations: 0,
    lastValidationTime: null
  })
  
  // 验证规则定义
  const validationRules = ref({
    // 用户信息验证规则
    userInfo: {
      id: { required: true, type: 'string' },
      nickName: { required: true, type: 'string', maxLength: 20 },
      avatarUrl: { type: 'string', pattern: /^https?:\/\/.+/ },
      phone: { type: 'string', pattern: /^1[3-9]\d{9}$/ },
      email: { type: 'string', pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ },
      isVip: { type: 'boolean' },
      level: { type: 'number', min: 0, max: 10 }
    },
    
    // 民宿信息验证规则
    homestay: {
      id: { required: true, type: 'string' },
      title: { required: true, type: 'string', maxLength: 100 },
      description: { type: 'string', maxLength: 500 },
      price: { required: true, type: 'number', min: 0 },
      location: { required: true, type: 'string', maxLength: 100 },
      images: { type: 'object', isArray: true },
      facilities: { type: 'object', isArray: true },
      rating: { type: 'number', min: 0, max: 5 },
      reviewCount: { type: 'number', min: 0 },
      host: { type: 'object' },
      coordinates: { type: 'object' },
      roomType: { type: 'string' },
      maxGuests: { type: 'number', min: 1, max: 20 },
      amenities: { type: 'object', isArray: true },
      policies: { type: 'object' },
      availability: { type: 'object' }
    },
    
    // 搜索参数验证规则
    searchParams: {
      keyword: { type: 'string', maxLength: 50 },
      page: { type: 'number', min: 1 },
      size: { type: 'number', min: 1, max: 100 },
      sortBy: { type: 'string', enum: ['default', 'price_asc', 'price_desc', 'rating'] },
      location: { type: 'string', maxLength: 100 }
    },
    
    // 筛选条件验证规则
    filterConditions: {
      location: { type: 'string', maxLength: 100 },
      priceRange: { type: 'object', isArray: true, length: 2 },
      roomType: { type: 'string' },
      facilities: { type: 'object', isArray: true },
      rating: { type: 'number', min: 0, max: 5 },
      sortBy: { type: 'string' },
      checkInDate: { type: 'string', pattern: /^\d{4}-\d{2}-\d{2}$/ },
      checkOutDate: { type: 'string', pattern: /^\d{4}-\d{2}-\d{2}$/ },
      guests: { type: 'number', min: 1, max: 20 }
    },
    
    // 消息验证规则
    message: {
      id: { required: true, type: 'string' },
      type: { required: true, type: 'string', enum: ['text', 'image', 'file'] },
      title: { type: 'string', maxLength: 100 },
      content: { required: true, type: 'string', maxLength: 1000 },
      sender: { required: true, type: 'string' },
      receiver: { required: true, type: 'string' },
      timestamp: { required: true, type: 'number' },
      isRead: { type: 'boolean' },
      attachments: { type: 'object', isArray: true }
    }
  })
  
  // 计算属性
  const validationSuccessRate = computed(() => {
    if (validationStats.value.totalValidations === 0) return 0
    return (validationStats.value.successfulValidations / validationStats.value.totalValidations * 100).toFixed(2)
  })
  
  // 创建验证中间件
  const createValidationMiddleware = (schema) => {
    return (data) => {
      try {
        validationStats.value.totalValidations++
        validationStats.value.lastValidationTime = Date.now()
        
        const result = validate(data, schema)
        
        if (result.isValid) {
          validationStats.value.successfulValidations++
          console.log('✅ 数据验证通过')
          return result.data
        } else {
          validationStats.value.failedValidations++
          console.error('❌ 数据验证失败:', result.errors)
          throw new Error(`数据验证失败: ${result.errors.join(', ')}`)
        }
      } catch (error) {
        validationStats.value.failedValidations++
        console.error('❌ 数据验证异常:', error)
        throw error
      }
    }
  }
  
  // 验证用户信息
  const validateUserInfo = (userInfo) => {
    return createValidationMiddleware(validationRules.value.userInfo)(userInfo)
  }
  
  // 验证民宿信息
  const validateHomestay = (homestay) => {
    return createValidationMiddleware(validationRules.value.homestay)(homestay)
  }
  
  // 验证搜索参数
  const validateSearchParams = (params) => {
    return createValidationMiddleware(validationRules.value.searchParams)(params)
  }
  
  // 验证筛选条件
  const validateFilterConditions = (conditions) => {
    return createValidationMiddleware(validationRules.value.filterConditions)(conditions)
  }
  
  // 验证消息
  const validateMessage = (message) => {
    return createValidationMiddleware(validationRules.value.message)(message)
  }
  
  // 验证API响应
  const validateApiResponseData = (response, expectedDataType = 'default') => {
    try {
      validationStats.value.totalValidations++
      validationStats.value.lastValidationTime = Date.now()
      
      const result = validateApiResponse(response)
      
      if (!result.isValid) {
        validationStats.value.failedValidations++
        throw new Error(`API响应验证失败: ${result.errors.join(', ')}`)
      }
      
      // 根据数据类型进行进一步验证
      if (expectedDataType !== 'default' && validationRules.value[expectedDataType]) {
        const dataResult = validate(result.data, validationRules.value[expectedDataType])
        if (!dataResult.isValid) {
          validationStats.value.failedValidations++
          throw new Error(`API数据格式验证失败: ${dataResult.errors.join(', ')}`)
        }
        return dataResult.data
      }
      
      validationStats.value.successfulValidations++
      console.log('✅ API响应验证通过')
      return result.data
    } catch (error) {
      validationStats.value.failedValidations++
      console.error('❌ API响应验证失败:', error)
      throw error
    }
  }
  
  // 验证分页参数
  const validatePaginationParams = (params) => {
    try {
      validationStats.value.totalValidations++
      validationStats.value.lastValidationTime = Date.now()
      
      const result = validatePagination(params)
      
      if (result.isValid) {
        validationStats.value.successfulValidations++
        console.log('✅ 分页参数验证通过')
        return result.data
      } else {
        validationStats.value.failedValidations++
        throw new Error(`分页参数验证失败: ${result.errors.join(', ')}`)
      }
    } catch (error) {
      validationStats.value.failedValidations++
      console.error('❌ 分页参数验证失败:', error)
      throw error
    }
  }
  
  // 数据清洗和格式化
  const sanitizeData = (data, rules) => {
    const sanitized = {}
    
    for (const [field, rule] of Object.entries(rules)) {
      const value = data[field]
      
      if (value === undefined || value === null) {
        if (rule.required) {
          throw new Error(`${field} 是必填项`)
        }
        continue
      }
      
      // 字符串清洗
      if (rule.type === 'string' && typeof value === 'string') {
        sanitized[field] = value.trim()
      }
      // 数字清洗
      else if (rule.type === 'number' && typeof value === 'number') {
        sanitized[field] = Number(value)
      }
      // 布尔值清洗
      else if (rule.type === 'boolean' && typeof value === 'boolean') {
        sanitized[field] = Boolean(value)
      }
      // 数组清洗
      else if (rule.isArray && Array.isArray(value)) {
        sanitized[field] = value.filter(item => item !== null && item !== undefined)
      }
      // 对象清洗
      else if (rule.type === 'object' && typeof value === 'object' && !Array.isArray(value)) {
        sanitized[field] = { ...value }
      }
      else {
        sanitized[field] = value
      }
    }
    
    return sanitized
  }
  
  // 批量验证
  const batchValidate = (dataList, schema) => {
    const results = []
    const errors = []
    
    dataList.forEach((data, index) => {
      try {
        const result = createValidationMiddleware(schema)(data)
        results.push({ index, data: result, success: true })
      } catch (error) {
        errors.push({ index, error: error.message })
        results.push({ index, data: null, success: false })
      }
    })
    
    return {
      results,
      errors,
      successCount: results.filter(r => r.success).length,
      failureCount: results.filter(r => !r.success).length
    }
  }
  
  // 获取验证统计
  const getValidationStats = () => {
    return {
      ...validationStats.value,
      successRate: validationSuccessRate.value
    }
  }
  
  // 重置验证统计
  const resetValidationStats = () => {
    validationStats.value = {
      totalValidations: 0,
      successfulValidations: 0,
      failedValidations: 0,
      lastValidationTime: null
    }
  }
  
  // 添加自定义验证规则
  const addValidationRule = (name, rules) => {
    validationRules.value[name] = rules
    console.log(`✅ 添加验证规则: ${name}`)
  }
  
  // 更新验证规则
  const updateValidationRule = (name, rules) => {
    if (validationRules.value[name]) {
      validationRules.value[name] = { ...validationRules.value[name], ...rules }
      console.log(`✅ 更新验证规则: ${name}`)
    } else {
      addValidationRule(name, rules)
    }
  }
  
  return {
    // State
    validationStats,
    validationRules,
    
    // Computed
    validationSuccessRate,
    
    // Actions
    createValidationMiddleware,
    validateUserInfo,
    validateHomestay,
    validateSearchParams,
    validateFilterConditions,
    validateMessage,
    validateApiResponseData,
    validatePaginationParams,
    sanitizeData,
    batchValidate,
    getValidationStats,
    resetValidationStats,
    addValidationRule,
    updateValidationRule
  }
})
