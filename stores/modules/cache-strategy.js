/**
 * 分层缓存策略管理器
 * 功能描述：实现分层缓存策略，根据数据类型选择不同的缓存策略
 * 主要功能：短期缓存、中期缓存、长期缓存、缓存优先级、命中率统计
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useCacheStrategyStore = defineStore('cacheStrategy', () => {
  // 分层缓存配置
  const cacheConfig = ref({
    // 短期缓存（5分钟）- 用于实时数据
    shortTerm: { 
      maxAge: 5 * 60 * 1000, 
      maxSize: 10 * 1024 * 1024, // 10MB
      priority: 'high',
      cleanupInterval: 2 * 60 * 1000 // 2分钟清理一次
    },
    // 中期缓存（1小时）- 用于列表数据
    mediumTerm: { 
      maxAge: 60 * 60 * 1000, 
      maxSize: 50 * 1024 * 1024, // 50MB
      priority: 'medium',
      cleanupInterval: 10 * 60 * 1000 // 10分钟清理一次
    },
    // 长期缓存（24小时）- 用于静态数据
    longTerm: { 
      maxAge: 24 * 60 * 60 * 1000, 
      maxSize: 100 * 1024 * 1024, // 100MB
      priority: 'low',
      cleanupInterval: 60 * 60 * 1000 // 1小时清理一次
    }
  })

  // 缓存数据存储
  const cacheData = ref({
    shortTerm: new Map(),
    mediumTerm: new Map(),
    longTerm: new Map()
  })

  // 缓存时间戳
  const cacheTimestamps = ref({
    shortTerm: new Map(),
    mediumTerm: new Map(),
    longTerm: new Map()
  })

  // 缓存大小统计
  const cacheSizes = ref({
    shortTerm: new Map(),
    mediumTerm: new Map(),
    longTerm: new Map()
  })

  // 缓存统计信息
  const cacheStats = ref({
    hits: 0,
    misses: 0,
    totalRequests: 0,
    lastCleanup: Date.now(),
    cleanupCount: 0
  })

  // 数据类型到缓存策略的映射
  const dataTypeMapping = ref({
    'user-info': 'mediumTerm',
    'homestay-list': 'shortTerm',
    'search-results': 'shortTerm',
    'static-config': 'longTerm',
    'banner-data': 'mediumTerm',
    'hot-searches': 'longTerm',
    'user-stats': 'mediumTerm',
    'filter-conditions': 'shortTerm',
    'conversation-list': 'shortTerm',
    'message-list': 'shortTerm'
  })

  // 计算属性
  const totalCacheSize = computed(() => {
    let total = 0
    Object.values(cacheSizes.value).forEach(sizeMap => {
      sizeMap.forEach(size => total += size)
    })
    return total
  })

  const cacheHitRate = computed(() => {
    if (cacheStats.value.totalRequests === 0) return 0
    return (cacheStats.value.hits / cacheStats.value.totalRequests * 100).toFixed(2)
  })

  const cacheInfo = computed(() => {
    const info = {}
    Object.keys(cacheData.value).forEach(strategy => {
      info[strategy] = {
        count: cacheData.value[strategy].size,
        size: Array.from(cacheSizes.value[strategy].values()).reduce((sum, size) => sum + size, 0),
        maxAge: cacheConfig.value[strategy].maxAge,
        maxSize: cacheConfig.value[strategy].maxSize
      }
    })
    return info
  })

  // 根据数据类型获取缓存策略
  const getCacheStrategy = (dataType) => {
    return dataTypeMapping.value[dataType] || 'mediumTerm'
  }

  // 设置缓存
  const setCache = (key, data, dataType = 'default', options = {}) => {
    try {
      const strategy = getCacheStrategy(dataType)
      const serializedData = JSON.stringify(data)
      const dataSize = new Blob([serializedData]).size
      
      // 检查缓存大小限制
      const config = cacheConfig.value[strategy]
      if (dataSize > config.maxSize) {
        console.warn(`缓存数据过大: ${key}, 大小: ${dataSize}, 策略: ${strategy}`)
        return false
      }
      
      // 检查是否需要清理
      const currentSize = Array.from(cacheSizes.value[strategy].values()).reduce((sum, size) => sum + size, 0)
      if (currentSize + dataSize > config.maxSize) {
        cleanupCache(strategy)
      }
      
      // 设置缓存
      cacheData.value[strategy].set(key, data)
      cacheTimestamps.value[strategy].set(key, Date.now())
      cacheSizes.value[strategy].set(key, dataSize)
      
      // 持久化到本地存储
      if (options.persist !== false) {
        saveCacheToStorage(strategy, key, data)
      }
      
      console.log(`✅ 缓存设置成功: ${key} (${strategy})`)
      return true
    } catch (error) {
      console.error('设置缓存失败:', error)
      return false
    }
  }

  // 获取缓存
  const getCache = (key, dataType = 'default', options = {}) => {
    try {
      const strategy = getCacheStrategy(dataType)
      const config = cacheConfig.value[strategy]
      
      // 更新统计
      cacheStats.value.totalRequests++
      
      // 检查缓存是否存在
      if (!cacheData.value[strategy].has(key)) {
        // 尝试从本地存储加载
        if (options.loadFromStorage !== false) {
          const data = loadCacheFromStorage(strategy, key)
          if (data) {
            cacheData.value[strategy].set(key, data)
            cacheTimestamps.value[strategy].set(key, Date.now())
            cacheSizes.value[strategy].set(key, new Blob([JSON.stringify(data)]).size)
            cacheStats.value.hits++
            return data
          }
        }
        cacheStats.value.misses++
        return null
      }
      
      // 检查是否过期
      const timestamp = cacheTimestamps.value[strategy].get(key)
      const now = Date.now()
      
      if (options.checkExpiry !== false && now - timestamp > config.maxAge) {
        removeCache(strategy, key)
        cacheStats.value.misses++
        return null
      }
      
      cacheStats.value.hits++
      return cacheData.value[strategy].get(key)
    } catch (error) {
      console.error('获取缓存失败:', error)
      cacheStats.value.misses++
      return null
    }
  }

  // 移除缓存
  const removeCache = (strategy, key) => {
    cacheData.value[strategy].delete(key)
    cacheTimestamps.value[strategy].delete(key)
    cacheSizes.value[strategy].delete(key)
    
    // 从本地存储删除
    try {
      uni.removeStorageSync(`cache_${strategy}_${key}`)
    } catch (error) {
      console.error('删除本地缓存失败:', error)
    }
  }

  // 清理过期缓存
  const cleanupCache = (strategy) => {
    const config = cacheConfig.value[strategy]
    const now = Date.now()
    const expiredKeys = []
    
    cacheTimestamps.value[strategy].forEach((timestamp, key) => {
      if (now - timestamp > config.maxAge) {
        expiredKeys.push(key)
      }
    })
    
    expiredKeys.forEach(key => {
      removeCache(strategy, key)
    })
    
    cacheStats.value.cleanupCount++
    cacheStats.value.lastCleanup = now
    
    console.log(`🧹 清理过期缓存: ${strategy}, 清理数量: ${expiredKeys.length}`)
  }

  // 清理所有缓存
  const clearAllCache = () => {
    Object.keys(cacheData.value).forEach(strategy => {
      cacheData.value[strategy].clear()
      cacheTimestamps.value[strategy].clear()
      cacheSizes.value[strategy].clear()
    })
    
    // 清理本地存储
    try {
      const storageInfo = uni.getStorageInfoSync()
      const keys = storageInfo.keys.filter(key => key.startsWith('cache_'))
      keys.forEach(key => {
        uni.removeStorageSync(key)
      })
    } catch (error) {
      console.error('清理本地缓存失败:', error)
    }
    
    console.log('🧹 清理所有缓存完成')
  }

  // 持久化到本地存储
  const saveCacheToStorage = (strategy, key, data) => {
    try {
      uni.setStorageSync(`cache_${strategy}_${key}`, JSON.stringify(data))
    } catch (error) {
      console.error('保存缓存到本地存储失败:', error)
    }
  }

  // 从本地存储加载
  const loadCacheFromStorage = (strategy, key) => {
    try {
      const data = uni.getStorageSync(`cache_${strategy}_${key}`)
      return data ? JSON.parse(data) : null
    } catch (error) {
      console.error('从本地存储加载缓存失败:', error)
      return null
    }
  }

  // 获取缓存统计信息
  const getCacheStats = () => {
    return {
      ...cacheStats.value,
      hitRate: cacheHitRate.value,
      totalSize: totalCacheSize.value,
      cacheInfo: cacheInfo.value
    }
  }

  // 重置统计信息
  const resetStats = () => {
    cacheStats.value = {
      hits: 0,
      misses: 0,
      totalRequests: 0,
      lastCleanup: Date.now(),
      cleanupCount: 0
    }
  }

  // 自动清理定时器
  let cleanupTimer = null
  
  const startAutoCleanup = () => {
    if (cleanupTimer) return
    
    cleanupTimer = setInterval(() => {
      Object.keys(cacheConfig.value).forEach(strategy => {
        const config = cacheConfig.value[strategy]
        const now = Date.now()
        
        if (now - cacheStats.value.lastCleanup > config.cleanupInterval) {
          cleanupCache(strategy)
        }
      })
    }, 60000) // 每分钟检查一次
  }

  const stopAutoCleanup = () => {
    if (cleanupTimer) {
      clearInterval(cleanupTimer)
      cleanupTimer = null
    }
  }

  // 初始化
  const initializeCache = () => {
    startAutoCleanup()
    console.log('🚀 分层缓存策略初始化完成')
  }

  return {
    // State
    cacheConfig,
    cacheData,
    cacheTimestamps,
    cacheSizes,
    cacheStats,
    dataTypeMapping,
    
    // Computed
    totalCacheSize,
    cacheHitRate,
    cacheInfo,
    
    // Actions
    getCacheStrategy,
    setCache,
    getCache,
    removeCache,
    cleanupCache,
    clearAllCache,
    getCacheStats,
    resetStats,
    startAutoCleanup,
    stopAutoCleanup,
    initializeCache
  }
})
