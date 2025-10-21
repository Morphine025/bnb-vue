/**
 * 简化缓存管理器
 * 功能描述：提供基础的缓存功能，适合移动端小程序环境
 * 主要功能：简单过期管理、基础缓存操作
 */

// 简单缓存存储
const cache = new Map()

/**
 * 设置缓存
 * @param {string} key - 缓存键
 * @param {any} value - 缓存值
 * @param {number} ttl - 缓存时间（毫秒），默认5分钟
 * @example
 * // 设置缓存
 * setCache('user_info', userData, 5 * 60 * 1000)
 */
export const setCache = (key, value, ttl = 5 * 60 * 1000) => {
  cache.set(key, {
    value,
    expire: Date.now() + ttl
  })
}

/**
 * 获取缓存
 * @param {string} key - 缓存键
 * @returns {any|null} 缓存值
 * @example
 * // 获取缓存
 * const userData = getCache('user_info')
 */
export const getCache = (key) => {
  const item = cache.get(key)
  if (!item) return null
  
  if (Date.now() > item.expire) {
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
  return item && Date.now() <= item.expire
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
 * 简单的缓存装饰器
 * @param {number} ttl - 缓存时间
 * @returns {Function} 装饰器函数
 * @example
 * // 使用缓存装饰器
 * const cachedApiCall = withCache(5 * 60 * 1000)(apiCall)
 */
export const withCache = (ttl = 5 * 60 * 1000) => {
  return (fn) => {
    return async (...args) => {
      const key = `${fn.name}_${JSON.stringify(args)}`
      const cached = getCache(key)
      
      if (cached) {
        return cached
      }
      
      const result = await fn(...args)
      setCache(key, result, ttl)
      
      return result
    }
  }
}

/**
 * 简化的缓存工具
 */
export const cacheUtils = {
  set: setCache,
  get: getCache,
  has: hasCache,
  delete: deleteCache,
  clear: clearCache,
  withCache: withCache
}

// 默认导出
export default cacheUtils
