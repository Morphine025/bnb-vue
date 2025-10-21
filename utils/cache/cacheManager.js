/**
 * 简化缓存管理器
 * 功能描述：提供轻量级的数据缓存管理
 * 主要功能：基础内存缓存、简单过期策略
 */

// 简化的缓存配置
const CACHE_CONFIG = {
  DEFAULT_TTL: 5 * 60 * 1000, // 5分钟
  MAX_SIZE: 50, // 最大缓存条目数
  TTL_TYPES: {
    SHORT: 1 * 60 * 1000,    // 1分钟
    MEDIUM: 5 * 60 * 1000,   // 5分钟
    LONG: 15 * 60 * 1000     // 15分钟
  }
}

// 内存缓存存储
const cache = new Map()

/**
 * 设置缓存
 * @param {string} key - 缓存键
 * @param {any} value - 缓存值
 * @param {number} ttl - 缓存时间（毫秒）
 * @example
 * // 设置缓存
 * cacheUtils.set('user_info', userData, 5 * 60 * 1000)
 */
export const setCache = (key, value, ttl = CACHE_CONFIG.DEFAULT_TTL) => {
  // 简单的大小限制
  if (cache.size >= CACHE_CONFIG.MAX_SIZE) {
    const firstKey = cache.keys().next().value
    cache.delete(firstKey)
  }
  
  cache.set(key, {
    value,
    expireTime: Date.now() + ttl
  })
}

/**
 * 获取缓存
 * @param {string} key - 缓存键
 * @returns {any|null} 缓存值
 * @example
 * // 获取缓存
 * const userData = cacheUtils.get('user_info')
 */
export const getCache = (key) => {
  const item = cache.get(key)
  if (!item) return null
  
  if (Date.now() > item.expireTime) {
    cache.delete(key)
    return null
  }
  
  return item.value
}

/**
 * 检查缓存是否存在
 * @param {string} key - 缓存键
 * @returns {boolean} 是否存在
 */
export const hasCache = (key) => {
  const item = cache.get(key)
  return item && Date.now() <= item.expireTime
}

/**
 * 删除缓存
 * @param {string} key - 缓存键
 */
export const deleteCache = (key) => {
  cache.delete(key)
}

/**
 * 清空所有缓存
 */
export const clearCache = () => {
  cache.clear()
}

/**
 * 获取缓存统计信息
 * @returns {object} 统计信息
 */
export const getCacheStats = () => {
  const now = Date.now()
  const entries = Array.from(cache.values())
  
  return {
    totalEntries: cache.size,
    expiredEntries: entries.filter(item => now > item.expireTime).length,
    validEntries: entries.filter(item => now <= item.expireTime).length
  }
}

/**
 * 简单的缓存装饰器
 * @param {number} ttl - 缓存时间
 * @returns {Function} 装饰器函数
 * @example
 * // 使用缓存装饰器
 * const cachedApiCall = withCache(5 * 60 * 1000)(apiCall)
 */
export const withCache = (ttl = CACHE_CONFIG.DEFAULT_TTL) => {
  return (fn) => {
    return async (...args) => {
      const key = `${fn.name}_${JSON.stringify(args)}`
      const cached = getCache(key)
      
      if (cached) {
        console.log(`缓存命中: ${fn.name}`)
        return cached
      }
      
      console.log(`缓存未命中，调用函数: ${fn.name}`)
      const result = await fn(...args)
      setCache(key, result, ttl)
      
      return result
    }
  }
}

/**
 * 缓存工具函数集合
 */
export const cacheUtils = {
  /**
   * 设置缓存
   * @param {string} key - 缓存键
   * @param {any} data - 缓存数据
   * @param {number} ttl - 缓存时间
   */
  set: setCache,
  
  /**
   * 获取缓存
   * @param {string} key - 缓存键
   * @returns {any|null} 缓存数据
   */
  get: getCache,
  
  /**
   * 检查缓存
   * @param {string} key - 缓存键
   * @returns {boolean} 是否存在
   */
  has: hasCache,
  
  /**
   * 删除缓存
   * @param {string} key - 缓存键
   */
  delete: deleteCache,
  
  /**
   * 清空缓存
   */
  clear: clearCache,
  
  /**
   * 获取统计信息
   * @returns {object} 统计信息
   */
  getStats: getCacheStats,
  
  /**
   * 缓存装饰器
   * @param {number} ttl - 缓存时间
   * @returns {Function} 装饰器函数
   */
  withCache: withCache,
  
  /**
   * 生成缓存键
   * @param {string} prefix - 前缀
   * @param {object} params - 参数
   * @returns {string} 缓存键
   */
  generateKey: (prefix, params = {}) => {
    const sortedParams = Object.keys(params)
      .sort()
      .reduce((result, key) => {
        result[key] = params[key]
        return result
      }, {})
    
    return `${prefix}_${JSON.stringify(sortedParams)}`
  }
}

// 默认导出缓存工具
export default cacheUtils
