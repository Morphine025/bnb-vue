/**
 * API配置文件
 * 功能描述：统一管理API相关配置
 * 主要功能：环境配置、URL管理、常量定义
 */

// 环境配置
const ENV_CONFIG = {
  development: {
    baseUrl: 'http://localhost:8081/api',
    uploadUrl: 'http://localhost:8081/api/upload/image',
    timeout: 10000
  },
  production: {
    baseUrl: 'https://m1.apifoxmock.com/m1/4728220-0-default/api',
    uploadUrl: 'https://m1.apifoxmock.com/m1/4728220-0-default/api/upload/image',
    timeout: 15000
  }
}

// 获取当前环境配置
const getCurrentConfig = () => {
  const env = process.env.NODE_ENV || 'development'
  return ENV_CONFIG[env] || ENV_CONFIG.development
}

// 导出配置
export const config = {
  ...getCurrentConfig(),
  
  // 通用配置
  common: {
    // 请求头配置
    headers: {
      'Content-Type': 'application/json'
    },
    
    // 分页默认配置
    pagination: {
      defaultPage: 1,
      defaultSize: 10,
      maxSize: 100
    },
    
    // 上传配置
    upload: {
      maxSize: 5 * 1024 * 1024, // 5MB
      allowedTypes: ['image/jpeg', 'image/png', 'image/gif'],
      quality: 0.8
    },
    
    // 缓存配置
    cache: {
      userInfo: 30 * 60 * 1000, // 30分钟
      homestayList: 5 * 60 * 1000, // 5分钟
      searchHistory: 24 * 60 * 60 * 1000 // 24小时
    }
  }
}

// 导出便捷方法
export const getBaseUrl = () => config.baseUrl
export const getUploadUrl = () => config.uploadUrl
export const getTimeout = () => config.timeout

export default config
