/**
 * 简化用户信息管理工具
 * 功能描述：提供基础的用户信息管理功能，避免过度设计
 */

// 导入API接口 - 使用新的统一API
import { UserAPI } from "../../api/modules/UserAPI.js";
import { handleError } from '../error/errorHandler.js'
import { ErrorTypes, ErrorOptions } from '../error/errorTypes.js'

/**
 * 参数验证工具
 * @param {any} value - 要验证的值
 * @param {string} name - 参数名
 * @param {string} type - 期望类型
 * @param {Object} options - 验证选项
 * @throws {Error} 参数验证失败时抛出错误
 */
const validateParam = (value, name, type, options = {}) => {
  try {
    if (value === null || value === undefined) {
      const error = new Error(`参数 ${name} 不能为空`)
      error.type = ErrorTypes.VALIDATION_ERROR
      error.code = 'INVALID_PARAM'
      
      const businessContext = {
        module: 'UserInfo',
        layer: 'Business',
        field: 'validateParam',
        paramName: name,
        paramType: type,
        paramValue: value
      }
      
      const errorOptions = {
        [ErrorOptions.SHOW_TOAST]: options.showToast !== false,
        [ErrorOptions.LOG_ERROR]: true,
        [ErrorOptions.REPORT_ERROR]: options.reportError || false,
        [ErrorOptions.RETRY_ENABLED]: false,
        customMessage: `参数 ${name} 不能为空`
      }
      
      handleError(error, businessContext, errorOptions)
      throw error
    }

    if (
      type === "object" &&
      (typeof value !== "object" || Array.isArray(value))
    ) {
      const error = new Error(`参数 ${name} 必须是对象类型`)
      error.type = ErrorTypes.VALIDATION_ERROR
      error.code = 'INVALID_PARAM_TYPE'
      
      const businessContext = {
        module: 'UserInfo',
        layer: 'Business',
        field: 'validateParam',
        paramName: name,
        paramType: type,
        paramValue: value
      }
      
      const errorOptions = {
        [ErrorOptions.SHOW_TOAST]: options.showToast !== false,
        [ErrorOptions.LOG_ERROR]: true,
        [ErrorOptions.REPORT_ERROR]: options.reportError || false,
        [ErrorOptions.RETRY_ENABLED]: false,
        customMessage: `参数 ${name} 必须是对象类型`
      }
      
      handleError(error, businessContext, errorOptions)
      throw error
    }

    if (type === "string" && typeof value !== "string") {
      const error = new Error(`参数 ${name} 必须是字符串类型`)
      error.type = ErrorTypes.VALIDATION_ERROR
      error.code = 'INVALID_PARAM_TYPE'
      
      const businessContext = {
        module: 'UserInfo',
        layer: 'Business',
        field: 'validateParam',
        paramName: name,
        paramType: type,
        paramValue: value
      }
      
      const errorOptions = {
        [ErrorOptions.SHOW_TOAST]: options.showToast !== false,
        [ErrorOptions.LOG_ERROR]: true,
        [ErrorOptions.REPORT_ERROR]: options.reportError || false,
        [ErrorOptions.RETRY_ENABLED]: false,
        customMessage: `参数 ${name} 必须是字符串类型`
      }
      
      handleError(error, businessContext, errorOptions)
      throw error
    }

    if (type === "function" && typeof value !== "function") {
      const error = new Error(`参数 ${name} 必须是函数类型`)
      error.type = ErrorTypes.VALIDATION_ERROR
      error.code = 'INVALID_PARAM_TYPE'
      
      const businessContext = {
        module: 'UserInfo',
        layer: 'Business',
        field: 'validateParam',
        paramName: name,
        paramType: type,
        paramValue: value
      }
      
      const errorOptions = {
        [ErrorOptions.SHOW_TOAST]: options.showToast !== false,
        [ErrorOptions.LOG_ERROR]: true,
        [ErrorOptions.REPORT_ERROR]: options.reportError || false,
        [ErrorOptions.RETRY_ENABLED]: false,
        customMessage: `参数 ${name} 必须是函数类型`
      }
      
      handleError(error, businessContext, errorOptions)
      throw error
    }
  } catch (error) {
    const businessContext = {
      module: 'UserInfo',
      layer: 'Business',
      field: 'validateParam',
      paramName: name,
      paramType: type,
      paramValue: value
    }
    
    const errorOptions = {
      [ErrorOptions.SHOW_TOAST]: false,
      [ErrorOptions.LOG_ERROR]: true,
      [ErrorOptions.REPORT_ERROR]: true,
      [ErrorOptions.RETRY_ENABLED]: false,
      customMessage: '参数验证过程出错'
    }
    
    handleError(error, businessContext, errorOptions)
    throw error
  }
};

/**
 * 创建简化用户信息管理器
 * @param {Object} apiClient - API客户端
 * @param {string} storageKey - 本地存储键名
 * @returns {Object} 用户信息管理器
 * @throws {Error} 参数验证失败时抛出错误
 * @example
 * // 创建用户信息管理器
 * const userInfoManager = createSimpleUserInfoManager({
 *   getInfo: UserAPI.getInfo,
 *   updateInfo: UserAPI.updateInfo
 * }, 'userInfo')
 * const userInfo = await userInfoManager.refreshUserInfo()
 */
export const createSimpleUserInfoManager = (
  apiClient,
  storageKey = "userInfo"
) => {
  // 参数验证
  validateParam(apiClient, "apiClient", "object");
  validateParam(storageKey, "storageKey", "string");

  if (!apiClient.getInfo || typeof apiClient.getInfo !== "function") {
    const error = new Error("apiClient 必须包含 getInfo 静态方法")
    error.type = ErrorTypes.VALIDATION_ERROR
    error.code = 'INVALID_API_CLIENT'
    
    const businessContext = {
      module: 'UserInfo',
      layer: 'Business',
      field: 'createSimpleUserInfoManager',
      apiClient: apiClient
    }
    
    const errorOptions = {
      [ErrorOptions.SHOW_TOAST]: false,
      [ErrorOptions.LOG_ERROR]: true,
      [ErrorOptions.REPORT_ERROR]: true,
      [ErrorOptions.RETRY_ENABLED]: false,
      customMessage: 'apiClient 必须包含 getInfo 静态方法'
    }
    
    handleError(error, businessContext, errorOptions)
    throw error
  }

  if (!apiClient.updateInfo || typeof apiClient.updateInfo !== "function") {
    const error = new Error("apiClient 必须包含 updateInfo 静态方法")
    error.type = ErrorTypes.VALIDATION_ERROR
    error.code = 'INVALID_API_CLIENT'
    
    const businessContext = {
      module: 'UserInfo',
      layer: 'Business',
      field: 'createSimpleUserInfoManager',
      apiClient: apiClient
    }
    
    const errorOptions = {
      [ErrorOptions.SHOW_TOAST]: false,
      [ErrorOptions.LOG_ERROR]: true,
      [ErrorOptions.REPORT_ERROR]: true,
      [ErrorOptions.RETRY_ENABLED]: false,
      customMessage: 'apiClient 必须包含 updateInfo 静态方法'
    }
    
    handleError(error, businessContext, errorOptions)
    throw error
  }
  // 公共错误处理方法
  const handleUserError = (error, operation, context = {}) => {
    const businessContext = {
      module: 'UserInfo',
      layer: 'Business',
      field: operation,
      ...context
    }
    
    const errorOptions = {
      [ErrorOptions.SHOW_TOAST]: true,
      [ErrorOptions.LOG_ERROR]: true,
      [ErrorOptions.REPORT_ERROR]: true,
      [ErrorOptions.RETRY_ENABLED]: false,
      customMessage: `${operation}失败`
    }
    
    handleError(error, businessContext, errorOptions)
    throw error
  }

  // 公共数据验证方法
  const validateUserData = (userData, options = {}) => {
    try {
      if (!userData) {
        const error = new Error("用户信息为空")
        error.type = ErrorTypes.VALIDATION_ERROR
        error.code = 'INVALID_USER_DATA'
        
        const businessContext = {
          module: 'UserInfo',
          layer: 'Business',
          field: 'validateUserData',
          userData: userData
        }
        
        const errorOptions = {
          [ErrorOptions.SHOW_TOAST]: options.showToast !== false,
          [ErrorOptions.LOG_ERROR]: true,
          [ErrorOptions.REPORT_ERROR]: options.reportError || false,
          [ErrorOptions.RETRY_ENABLED]: false,
          customMessage: '用户信息为空'
        }
        
        handleError(error, businessContext, errorOptions)
        throw error
      }
      return userData
    } catch (error) {
      const businessContext = {
        module: 'UserInfo',
        layer: 'Business',
        field: 'validateUserData',
        userData: userData
      }
      
      const errorOptions = {
        [ErrorOptions.SHOW_TOAST]: false,
        [ErrorOptions.LOG_ERROR]: true,
        [ErrorOptions.REPORT_ERROR]: true,
        [ErrorOptions.RETRY_ENABLED]: false,
        customMessage: '用户数据验证过程出错'
      }
      
      handleError(error, businessContext, errorOptions)
      throw error
    }
  }

  // 公共API调用方法
  const callApi = async (apiMethod, operation, options = {}) => {
    try {
      const response = await apiMethod()
      return response.data || response
    } catch (error) {
      const businessContext = {
        module: 'UserInfo',
        layer: 'Business',
        field: 'callApi',
        operation: operation
      }
      
      const errorOptions = {
        [ErrorOptions.SHOW_TOAST]: options.showToast !== false,
        [ErrorOptions.LOG_ERROR]: true,
        [ErrorOptions.REPORT_ERROR]: options.reportError || false,
        [ErrorOptions.RETRY_ENABLED]: options.retryEnabled || false,
        customMessage: `${operation}失败`
      }
      
      handleError(error, businessContext, errorOptions)
      throw error
    }
  }

  return {
    /**
     * 刷新用户信息
     * @param {Object} options - 选项
     * @returns {Promise<Object>} 用户信息
     */
    async refreshUserInfo(options = {}) {
      try {
        const userData = await callApi(() => apiClient.getInfo(), "获取用户信息", options)
        validateUserData(userData, options)
        this.saveToStorage(userData, options)
        return userData
      } catch (error) {
        const businessContext = {
          module: 'UserInfo',
          layer: 'Business',
          field: 'refreshUserInfo'
        }
        
        const errorOptions = {
          [ErrorOptions.SHOW_TOAST]: options.showToast !== false,
          [ErrorOptions.LOG_ERROR]: true,
          [ErrorOptions.REPORT_ERROR]: options.reportError || false,
          [ErrorOptions.RETRY_ENABLED]: options.retryEnabled || false,
          customMessage: '刷新用户信息失败'
        }
        
        handleError(error, businessContext, errorOptions)
        throw error
      }
    },

    /**
     * 获取本地用户信息
     * @param {Object} options - 选项
     * @returns {Promise<Object>} 用户信息
     */
    async getLocalUserInfo(options = {}) {
      try {
        const localData = uni.getStorageSync(storageKey)
        if (localData) {
          return JSON.parse(localData)
        }

        // 本地没有信息，从服务器获取
        return await this.refreshUserInfo(options)
      } catch (error) {
        const businessContext = {
          module: 'UserInfo',
          layer: 'Business',
          field: 'getLocalUserInfo'
        }
        
        const errorOptions = {
          [ErrorOptions.SHOW_TOAST]: options.showToast !== false,
          [ErrorOptions.LOG_ERROR]: true,
          [ErrorOptions.REPORT_ERROR]: options.reportError || false,
          [ErrorOptions.RETRY_ENABLED]: options.retryEnabled || false,
          customMessage: '获取本地用户信息失败'
        }
        
        handleError(error, businessContext, errorOptions)
        throw error
      }
    },

    /**
     * 更新用户信息
     * @param {Object} userInfo - 用户信息
     * @param {Object} options - 选项
     * @returns {Promise<Object>} 更新后的用户信息
     */
    async updateUserInfo(userInfo, options = {}) {
      try {
        validateParam(userInfo, "userInfo", "object", options)
        const updatedData = await callApi(
          () => apiClient.updateInfo(userInfo),
          "更新用户信息",
          options
        )
        this.saveToStorage(updatedData, options)
        console.log("用户信息已更新:", updatedData)
        return updatedData
      } catch (error) {
        const businessContext = {
          module: 'UserInfo',
          layer: 'Business',
          field: 'updateUserInfo',
          userInfo: userInfo
        }
        
        const errorOptions = {
          [ErrorOptions.SHOW_TOAST]: options.showToast !== false,
          [ErrorOptions.LOG_ERROR]: true,
          [ErrorOptions.REPORT_ERROR]: options.reportError || false,
          [ErrorOptions.RETRY_ENABLED]: options.retryEnabled || false,
          customMessage: '更新用户信息失败'
        }
        
        handleError(error, businessContext, errorOptions)
        throw error
      }
    },

    /**
     * 保存用户信息到本地存储
     * @param {Object} userInfo - 用户信息
     * @param {Object} options - 选项
     */
    saveToStorage(userInfo, options = {}) {
      try {
        validateUserData(userInfo, { ...options, handleErrors: false })
        uni.setStorageSync(storageKey, JSON.stringify(userInfo))
      } catch (error) {
        const businessContext = {
          module: 'UserInfo',
          layer: 'Business',
          field: 'saveToStorage',
          userInfo: userInfo
        }
        
        const errorOptions = {
          [ErrorOptions.SHOW_TOAST]: options.showToast !== false,
          [ErrorOptions.LOG_ERROR]: true,
          [ErrorOptions.REPORT_ERROR]: options.reportError || false,
          [ErrorOptions.RETRY_ENABLED]: false,
          customMessage: '保存用户信息到本地存储失败'
        }
        
        handleError(error, businessContext, errorOptions)
        throw error
      }
    },

    /**
     * 清除本地用户信息
     * @param {Object} options - 选项
     */
    clearUserInfo(options = {}) {
      try {
        uni.removeStorageSync(storageKey)
        console.log("本地用户信息已清除")
      } catch (error) {
        const businessContext = {
          module: 'UserInfo',
          layer: 'Business',
          field: 'clearUserInfo'
        }
        
        const errorOptions = {
          [ErrorOptions.SHOW_TOAST]: options.showToast !== false,
          [ErrorOptions.LOG_ERROR]: true,
          [ErrorOptions.REPORT_ERROR]: options.reportError || false,
          [ErrorOptions.RETRY_ENABLED]: false,
          customMessage: '清除本地用户信息失败'
        }
        
        handleError(error, businessContext, errorOptions)
        throw error
      }
    },

    /**
     * 检查用户是否已登录
     * @param {Object} options - 选项
     * @returns {boolean} 是否已登录
     */
    isLoggedIn(options = {}) {
      try {
        const localData = uni.getStorageSync(storageKey)
        return !!localData
      } catch (error) {
        const businessContext = {
          module: 'UserInfo',
          layer: 'Business',
          field: 'isLoggedIn'
        }
        
        const errorOptions = {
          [ErrorOptions.SHOW_TOAST]: false,
          [ErrorOptions.LOG_ERROR]: true,
          [ErrorOptions.REPORT_ERROR]: options.reportError || false,
          [ErrorOptions.RETRY_ENABLED]: false,
          customMessage: '检查登录状态失败'
        }
        
        handleError(error, businessContext, errorOptions)
        return false
      }
    },
  };
};

// 创建默认的用户信息管理器
const userInfoManager = createSimpleUserInfoManager(
  {
    getInfo: UserAPI.getInfo,
    updateInfo: UserAPI.updateInfo,
  },
  "userInfo"
);

// 为了保持向后兼容，导出原有的函数（内部使用新的管理器）
export const refreshUserInfo = () => userInfoManager.refreshUserInfo();
export const getLocalUserInfo = () => userInfoManager.getLocalUserInfo();
export const updateLocalUserInfo = (userInfo) =>
  userInfoManager.saveToStorage(userInfo);

/**
 * 清理用户信息
 * @description 清理和验证用户信息数据，移除敏感信息和无效数据
 * @param {Object} userInfo - 用户信息对象
 * @param {Object} options - 清理选项
 * @returns {Object} 清理后的用户信息
 * 
 * @example
 * ```javascript
 * const cleanUserInfo = sanitizeUserInfo({
 *   nickname: '  <script>alert("xss")</script>  ',
 *   bio: 'Hello &lt;b&gt;World&lt;/b&gt;',
 *   email: 'user@example.com'
 * })
 * ```
 */
export const sanitizeUserInfo = (userInfo, options = {}) => {
  if (!userInfo || typeof userInfo !== 'object') {
    return {}
  }
  
  const defaultOptions = {
    removeEmpty: true,
    trimStrings: true,
    sanitizeHtml: true,
    maxLength: {
      nickname: 50,
      bio: 200,
      location: 100
    }
  }
  
  const mergedOptions = { ...defaultOptions, ...options }
  const sanitized = {}
  
  // 清理昵称
  if (userInfo.nickname) {
    let nickname = String(userInfo.nickname)
    if (mergedOptions.trimStrings) {
      nickname = nickname.trim()
    }
    if (mergedOptions.sanitizeHtml) {
      nickname = nickname.replace(/<[^>]*>/g, '').replace(/[<>]/g, '')
    }
    if (nickname.length <= mergedOptions.maxLength.nickname) {
      sanitized.nickname = nickname
    }
  }
  
  // 清理个人简介
  if (userInfo.bio) {
    let bio = String(userInfo.bio)
    if (mergedOptions.trimStrings) {
      bio = bio.trim()
    }
    if (mergedOptions.sanitizeHtml) {
      bio = bio.replace(/<[^>]*>/g, '').replace(/[<>]/g, '')
    }
    if (bio.length <= mergedOptions.maxLength.bio) {
      sanitized.bio = bio
    }
  }
  
  // 清理位置信息
  if (userInfo.location) {
    let location = String(userInfo.location)
    if (mergedOptions.trimStrings) {
      location = location.trim()
    }
    if (mergedOptions.sanitizeHtml) {
      location = location.replace(/<[^>]*>/g, '').replace(/[<>]/g, '')
    }
    if (location.length <= mergedOptions.maxLength.location) {
      sanitized.location = location
    }
  }
  
  // 清理头像URL
  if (userInfo.avatar) {
    const avatar = String(userInfo.avatar).trim()
    // 简单的URL验证
    if (avatar.match(/^https?:\/\/.+/)) {
      sanitized.avatar = avatar
    }
  }
  
  // 保留其他安全字段
  const safeFields = ['id', 'userId', 'email', 'phone', 'gender', 'birthday']
  safeFields.forEach(field => {
    if (userInfo[field] !== undefined) {
      sanitized[field] = userInfo[field]
    }
  })
  
  // 移除空值
  if (mergedOptions.removeEmpty) {
    Object.keys(sanitized).forEach(key => {
      if (sanitized[key] === '' || sanitized[key] === null || sanitized[key] === undefined) {
        delete sanitized[key]
      }
    })
  }
  
  return sanitized
}

// 导出新的管理器
export { userInfoManager };
