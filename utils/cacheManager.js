/**
 * 缓存管理器
 * 功能描述：提供统一的数据缓存管理
 * 主要功能：内存缓存、本地存储缓存、缓存策略
 */

// 内存缓存
const memoryCache = new Map()

// 缓存配置
const CACHE_CONFIG = {
  // 默认缓存时间（毫秒）
  DEFAULT_TTL: 5 * 60 * 1000, // 5分钟
  
  // 不同类型数据的缓存时间
  TTL: {
    USER_INFO: 10 * 60 * 1000, // 用户信息 10分钟
    HOMESTAY_LIST: 2 * 60 * 1000, // 民宿列表 2分钟
    SEARCH_RESULTS: 1 * 60 * 1000, // 搜索结果 1分钟
    MESSAGE_LIST: 30 * 1000, // 消息列表 30秒
    HOT_SEARCHES: 15 * 60 * 1000, // 热门搜索 15分钟
  },
  
  // 最大缓存条目数
  MAX_ENTRIES: 100
}

/**
 * 缓存条目
 */
class CacheEntry {
  constructor(data, ttl = CACHE_CONFIG.DEFAULT_TTL) {
    this.data = data
    this.timestamp = Date.now()
    this.ttl = ttl
    this.accessCount = 0
    this.lastAccess = this.timestamp
  }
  
  isExpired() {
    return Date.now() - this.timestamp > this.ttl
  }
  
  isValid() {
    return !this.isExpired()
  }
  
  touch() {
    this.accessCount++
    this.lastAccess = Date.now()
  }
}

/**
 * 缓存管理器类
 */
class CacheManager {
  constructor() {
    this.memoryCache = new Map()
    this.maxEntries = CACHE_CONFIG.MAX_ENTRIES
  }
  
  /**
   * 生成缓存键
   * @param {string} prefix - 前缀
   * @param {object} params - 参数
   * @returns {string} 缓存键
   */
  generateKey(prefix, params = {}) {
    const sortedParams = Object.keys(params)
      .sort()
      .reduce((result, key) => {
        result[key] = params[key]
        return result
      }, {})
    
    return `${prefix}_${JSON.stringify(sortedParams)}`
  }
  
  /**
   * 设置缓存
   * @param {string} key - 缓存键
   * @param {any} data - 数据
   * @param {number} ttl - 缓存时间
   */
  set(key, data, ttl = CACHE_CONFIG.DEFAULT_TTL) {
    // 检查缓存大小，清理过期条目
    this.cleanup()
    
    const entry = new CacheEntry(data, ttl)
    this.memoryCache.set(key, entry)
  }
  
  /**
   * 获取缓存
   * @param {string} key - 缓存键
   * @returns {any|null} 缓存数据
   */
  get(key) {
    const entry = this.memoryCache.get(key)
    
    if (!entry) {
      return null
    }
    
    if (entry.isExpired()) {
      this.memoryCache.delete(key)
      return null
    }
    
    entry.touch()
    return entry.data
  }
  
  /**
   * 检查缓存是否存在且有效
   * @param {string} key - 缓存键
   * @returns {boolean} 是否存在
   */
  has(key) {
    const entry = this.memoryCache.get(key)
    return entry && entry.isValid()
  }
  
  /**
   * 删除缓存
   * @param {string} key - 缓存键
   */
  delete(key) {
    this.memoryCache.delete(key)
  }
  
  /**
   * 清空所有缓存
   */
  clear() {
    this.memoryCache.clear()
  }
  
  /**
   * 清理过期缓存
   */
  cleanup() {
    const now = Date.now()
    const entries = Array.from(this.memoryCache.entries())
    
    // 删除过期条目
    entries.forEach(([key, entry]) => {
      if (entry.isExpired()) {
        this.memoryCache.delete(key)
      }
    })
    
    // 如果缓存条目过多，删除最少使用的条目
    if (this.memoryCache.size > this.maxEntries) {
      const sortedEntries = Array.from(this.memoryCache.entries())
        .sort(([, a], [, b]) => a.lastAccess - b.lastAccess)
      
      const toDelete = sortedEntries.slice(0, this.memoryCache.size - this.maxEntries)
      toDelete.forEach(([key]) => {
        this.memoryCache.delete(key)
      })
    }
  }
  
  /**
   * 获取缓存统计信息
   * @returns {object} 统计信息
   */
  getStats() {
    const entries = Array.from(this.memoryCache.values())
    const now = Date.now()
    
    return {
      totalEntries: this.memoryCache.size,
      expiredEntries: entries.filter(entry => entry.isExpired()).length,
      validEntries: entries.filter(entry => entry.isValid()).length,
      totalAccessCount: entries.reduce((sum, entry) => sum + entry.accessCount, 0),
      averageAge: entries.length > 0 
        ? entries.reduce((sum, entry) => sum + (now - entry.timestamp), 0) / entries.length 
        : 0
    }
  }
}

// 创建全局缓存管理器实例
const cacheManager = new CacheManager()

/**
 * 缓存装饰器 - 为API调用添加缓存
 * @param {string} prefix - 缓存前缀
 * @param {string} ttlType - TTL类型
 * @param {function} apiFunction - API函数
 * @returns {function} 带缓存的API函数
 */
export function withCache(prefix, ttlType = 'DEFAULT', apiFunction) {
  return async function(...args) {
    const cacheKey = cacheManager.generateKey(prefix, { args })
    
    // 尝试从缓存获取
    const cachedData = cacheManager.get(cacheKey)
    if (cachedData) {
      console.log(`缓存命中: ${prefix}`)
      return cachedData
    }
    
    // 缓存未命中，调用API
    console.log(`缓存未命中，调用API: ${prefix}`)
    try {
      const result = await apiFunction(...args)
      
      // 将结果存入缓存
      const ttl = CACHE_CONFIG.TTL[ttlType] || CACHE_CONFIG.DEFAULT_TTL
      cacheManager.set(cacheKey, result, ttl)
      
      return result
    } catch (error) {
      console.error(`API调用失败: ${prefix}`, error)
      throw error
    }
  }
}

/**
 * 缓存工具函数
 */
export const cacheUtils = {
  /**
   * 设置缓存
   */
  set: (key, data, ttl) => cacheManager.set(key, data, ttl),
  
  /**
   * 获取缓存
   */
  get: (key) => cacheManager.get(key),
  
  /**
   * 检查缓存
   */
  has: (key) => cacheManager.has(key),
  
  /**
   * 删除缓存
   */
  delete: (key) => cacheManager.delete(key),
  
  /**
   * 清空缓存
   */
  clear: () => cacheManager.clear(),
  
  /**
   * 获取统计信息
   */
  getStats: () => cacheManager.getStats(),
  
  /**
   * 生成缓存键
   */
  generateKey: (prefix, params) => cacheManager.generateKey(prefix, params)
}

export default cacheManager
