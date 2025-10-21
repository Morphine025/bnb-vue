/**
 * 简化用户信息管理工具
 * 功能描述：提供基础的用户信息管理功能
 */

// 导入API接口
import { UserAPI } from "../../api/modules/UserAPI.js";

/**
 * 创建简化的用户信息管理器
 * @param {Object} apiClient - API客户端
 * @param {string} storageKey - 存储键名
 * @returns {Object} 用户信息管理器
 */
export const createSimpleUserInfoManager = (apiClient, storageKey = 'userInfo') => {
  return {
    /**
     * 刷新用户信息
     * @returns {Promise<Object>} 用户信息
     */
    async refreshUserInfo() {
      try {
        const userInfo = await apiClient.getInfo()
        if (userInfo) {
          uni.setStorageSync(storageKey, JSON.stringify(userInfo))
        }
        return userInfo
      } catch (error) {
        console.error('获取用户信息失败:', error)
        throw error
      }
    },

    /**
     * 获取本地用户信息
     * @returns {Object|null} 用户信息
     */
    getLocalUserInfo() {
      try {
        const userInfo = uni.getStorageSync(storageKey)
        return userInfo ? JSON.parse(userInfo) : null
      } catch (error) {
        console.error('获取本地用户信息失败:', error)
        return null
      }
    },

    /**
     * 更新用户信息
     * @param {Object} userData - 用户数据
     * @returns {Promise<Object>} 更新结果
     */
    async updateUserInfo(userData) {
      try {
        const result = await apiClient.updateInfo(userData)
        if (result) {
          uni.setStorageSync(storageKey, JSON.stringify(result))
        }
        return result
      } catch (error) {
        console.error('更新用户信息失败:', error)
        throw error
      }
    },

    /**
     * 清除用户信息
     */
    clearUserInfo() {
      uni.removeStorageSync(storageKey)
    }
  }
}

/**
 * 默认用户信息管理器
 */
export const userInfoManager = createSimpleUserInfoManager({
  getInfo: UserAPI.getInfo,
  updateInfo: UserAPI.updateInfo
}, 'userInfo')

/**
 * 刷新用户信息
 * @returns {Promise<Object>} 用户信息
 */
export const refreshUserInfo = () => userInfoManager.refreshUserInfo()

/**
 * 获取本地用户信息
 * @returns {Object|null} 用户信息
 */
export const getLocalUserInfo = () => userInfoManager.getLocalUserInfo()

/**
 * 清理和验证用户信息
 * @param {Object} userInfo - 原始用户信息
 * @returns {Object} 清理后的用户信息
 */
export const sanitizeUserInfo = (userInfo) => {
  if (!userInfo || typeof userInfo !== 'object') {
    return {}
  }

  const sanitized = {}
  
  // 清理字符串字段，移除前后空格和特殊字符
  const stringFields = ['nickname', 'username', 'email', 'phone', 'avatar', 'bio', 'location']
  stringFields.forEach(field => {
    if (userInfo[field] !== undefined && userInfo[field] !== null) {
      let value = String(userInfo[field]).trim()
      
      // 移除潜在的XSS字符
      value = value.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      value = value.replace(/javascript:/gi, '')
      value = value.replace(/on\w+\s*=/gi, '')
      
      // 限制长度
      if (field === 'nickname' || field === 'username') {
        value = value.substring(0, 50)
      } else if (field === 'bio') {
        value = value.substring(0, 200)
      } else if (field === 'email') {
        value = value.substring(0, 100)
      } else if (field === 'phone') {
        value = value.substring(0, 20)
      }
      
      sanitized[field] = value
    }
  })
  
  // 清理数字字段
  const numberFields = ['age', 'gender']
  numberFields.forEach(field => {
    if (userInfo[field] !== undefined && userInfo[field] !== null) {
      const value = Number(userInfo[field])
      if (!isNaN(value) && value >= 0) {
        sanitized[field] = value
      }
    }
  })
  
  // 清理布尔字段
  const booleanFields = ['isVerified', 'isActive']
  booleanFields.forEach(field => {
    if (userInfo[field] !== undefined && userInfo[field] !== null) {
      sanitized[field] = Boolean(userInfo[field])
    }
  })
  
  // 清理日期字段
  if (userInfo.birthday) {
    const date = new Date(userInfo.birthday)
    if (!isNaN(date.getTime())) {
      sanitized.birthday = date.toISOString().split('T')[0] // 只保留日期部分
    }
  }
  
  // 保留其他有效字段（排除函数和复杂对象）
  Object.keys(userInfo).forEach(key => {
    if (!sanitized.hasOwnProperty(key) && 
        typeof userInfo[key] !== 'function' && 
        typeof userInfo[key] !== 'object') {
      sanitized[key] = userInfo[key]
    }
  })
  
  return sanitized
}