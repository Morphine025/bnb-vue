/**
 * 缓存模块状态管理（优化版）
 * 功能描述：管理数据缓存和离线数据，使用分层缓存策略
 * 主要功能：数据缓存、离线数据、分层缓存策略、数据同步
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useCacheStrategyStore } from './cache-strategy'

export const useCacheStore = defineStore('cache', () => {
  // 使用分层缓存策略
  const cacheStrategyStore = useCacheStrategyStore()
  
  // 缓存数据（保持向后兼容）
  const cacheData = ref(new Map())
  const cacheTimestamps = ref(new Map())
  const cacheSizes = ref(new Map())
  
  // 优化后的缓存配置
  const cacheConfig = ref({
    // 短期缓存配置
    shortTerm: {
      maxSize: 10 * 1024 * 1024, // 10MB
      maxAge: 5 * 60 * 1000, // 5分钟
      priority: 'high'
    },
    // 中期缓存配置
    mediumTerm: {
      maxSize: 50 * 1024 * 1024, // 50MB
      maxAge: 60 * 60 * 1000, // 1小时
      priority: 'medium'
    },
    // 长期缓存配置
    longTerm: {
      maxSize: 100 * 1024 * 1024, // 100MB
      maxAge: 24 * 60 * 60 * 1000, // 24小时
      priority: 'low'
    },
    enableOffline: true,
    enableCompression: true
  })

  // 离线数据
  const offlineData = ref(new Map())
  const offlineQueue = ref([])
  const isOffline = ref(false)
  const lastSyncTime = ref(null)

  // 同步状态
  const syncStatus = ref({
    isSyncing: false,
    lastSyncTime: null,
    syncErrors: [],
    pendingCount: 0
  })

  // 计算属性
  const totalCacheSize = computed(() => {
    let total = 0
    cacheSizes.value.forEach(size => {
      total += size
    })
    return total
  })

  const cacheKeys = computed(() => 
    Array.from(cacheData.value.keys())
  )

  const expiredKeys = computed(() => {
    const now = Date.now()
    const expired = []
    
    cacheTimestamps.value.forEach((timestamp, key) => {
      if (now - timestamp > cacheConfig.value.maxAge) {
        expired.push(key)
      }
    })
    
    return expired
  })

  const pendingSyncCount = computed(() => 
    offlineQueue.value.length
  )

  // Actions
  const setCacheConfig = (config) => {
    cacheConfig.value = { ...cacheConfig.value, ...config }
  }

  const setCache = (key, data, options = {}) => {
    try {
      // 使用分层缓存策略
      const dataType = options.dataType || 'default'
      return cacheStrategyStore.setCache(key, data, dataType, options)
    } catch (error) {
      console.error('设置缓存失败:', error)
      return false
    }
  }

  const getCache = (key, options = {}) => {
    try {
      // 使用分层缓存策略
      const dataType = options.dataType || 'default'
      return cacheStrategyStore.getCache(key, dataType, options)
    } catch (error) {
      console.error('获取缓存失败:', error)
      return null
    }
  }

  const removeCache = (key) => {
    cacheData.value.delete(key)
    cacheTimestamps.value.delete(key)
    cacheSizes.value.delete(key)
    
    // 从本地存储删除
    try {
      uni.removeStorageSync(`cache_${key}`)
    } catch (error) {
      console.error('删除本地缓存失败:', error)
    }
  }

  const clearCache = () => {
    cacheData.value.clear()
    cacheTimestamps.value.clear()
    cacheSizes.value.clear()
    
    // 清理本地存储中的缓存
    try {
      const storageInfo = uni.getStorageInfoSync()
      const keys = storageInfo.keys.filter(key => key.startsWith('cache_'))
      keys.forEach(key => {
        uni.removeStorageSync(key)
      })
    } catch (error) {
      console.error('清理本地缓存失败:', error)
    }
  }

  const cleanupExpiredCache = () => {
    const expiredKeys = computed.value
    expiredKeys.forEach(key => {
      removeCache(key)
    })
  }

  const cleanupOldCache = () => {
    const now = Date.now()
    const keys = Array.from(cacheTimestamps.value.keys())
    
    // 按时间排序，删除最旧的缓存
    keys.sort((a, b) => cacheTimestamps.value.get(a) - cacheTimestamps.value.get(b))
    
    const keysToRemove = keys.slice(0, Math.floor(keys.length / 2))
    keysToRemove.forEach(key => {
      removeCache(key)
    })
  }

  // 离线数据管理
  const setOfflineData = (key, data) => {
    offlineData.value.set(key, data)
    saveOfflineDataToStorage(key, data)
  }

  const getOfflineData = (key) => {
    if (offlineData.value.has(key)) {
      return offlineData.value.get(key)
    }
    
    // 尝试从本地存储加载
    return loadOfflineDataFromStorage(key)
  }

  const addToOfflineQueue = (action) => {
    offlineQueue.value.push({
      ...action,
      timestamp: Date.now(),
      id: generateId()
    })
    saveOfflineQueueToStorage()
  }

  const removeFromOfflineQueue = (id) => {
    const index = offlineQueue.value.findIndex(item => item.id === id)
    if (index > -1) {
      offlineQueue.value.splice(index, 1)
      saveOfflineQueueToStorage()
    }
  }

  const clearOfflineQueue = () => {
    offlineQueue.value = []
    saveOfflineQueueToStorage()
  }

  const setIsOffline = (offline) => {
    isOffline.value = offline
  }

  const setLastSyncTime = (time) => {
    lastSyncTime.value = time
  }

  // 同步相关方法
  const setSyncStatus = (status) => {
    syncStatus.value = { ...syncStatus.value, ...status }
  }

  const startSync = () => {
    setSyncStatus({ isSyncing: true })
  }

  const endSync = (success = true, error = null) => {
    setSyncStatus({ 
      isSyncing: false,
      lastSyncTime: new Date().toISOString()
    })
    
    if (!success && error) {
      syncStatus.value.syncErrors.push({
        time: new Date().toISOString(),
        error: error.message || error
      })
    }
  }

  const syncOfflineData = async () => {
    if (isOffline.value || syncStatus.value.isSyncing) return
    
    startSync()
    
    try {
      // 处理离线队列
      for (const action of offlineQueue.value) {
        try {
          // 这里应该调用相应的API
          // await api.syncAction(action)
          console.log('同步离线操作:', action)
          
          // 同步成功后从队列中移除
          removeFromOfflineQueue(action.id)
        } catch (error) {
          console.error('同步离线操作失败:', error)
        }
      }
      
      endSync(true)
    } catch (error) {
      endSync(false, error)
    }
  }

  // 持久化相关方法
  const saveCacheToStorage = (key, data) => {
    try {
      uni.setStorageSync(`cache_${key}`, JSON.stringify(data))
    } catch (error) {
      console.error('保存缓存到本地存储失败:', error)
    }
  }

  const loadCacheFromStorage = (key) => {
    try {
      const data = uni.getStorageSync(`cache_${key}`)
      return data ? JSON.parse(data) : null
    } catch (error) {
      console.error('从本地存储加载缓存失败:', error)
      return null
    }
  }

  const saveOfflineDataToStorage = (key, data) => {
    try {
      uni.setStorageSync(`offline_${key}`, JSON.stringify(data))
    } catch (error) {
      console.error('保存离线数据失败:', error)
    }
  }

  const loadOfflineDataFromStorage = (key) => {
    try {
      const data = uni.getStorageSync(`offline_${key}`)
      return data ? JSON.parse(data) : null
    } catch (error) {
      console.error('加载离线数据失败:', error)
      return null
    }
  }

  const saveOfflineQueueToStorage = () => {
    try {
      uni.setStorageSync('offline_queue', JSON.stringify(offlineQueue.value))
    } catch (error) {
      console.error('保存离线队列失败:', error)
    }
  }

  const loadOfflineQueueFromStorage = () => {
    try {
      const queue = uni.getStorageSync('offline_queue')
      offlineQueue.value = queue ? JSON.parse(queue) : []
    } catch (error) {
      console.error('加载离线队列失败:', error)
    }
  }

  // 工具方法
  const generateId = () => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2)
  }

  const getCacheInfo = () => {
    const strategyStats = cacheStrategyStore.getCacheStats()
    return {
      totalSize: cacheStrategyStore.totalCacheSize,
      hitRate: cacheStrategyStore.cacheHitRate,
      cacheInfo: cacheStrategyStore.cacheInfo,
      offlineDataCount: offlineData.value.size,
      pendingSyncCount: pendingSyncCount.value,
      ...strategyStats
    }
  }

  const initializeCache = () => {
    // 初始化分层缓存策略
    cacheStrategyStore.initializeCache()
    
    loadOfflineQueueFromStorage()
    
    // 监听网络状态
    uni.onNetworkStatusChange((res) => {
      setIsOffline(!res.isConnected)
      
      if (res.isConnected && offlineQueue.value.length > 0) {
        syncOfflineData()
      }
    })
    
    console.log('🚀 优化缓存系统初始化完成')
  }

  return {
    // State
    cacheData,
    cacheTimestamps,
    cacheSizes,
    cacheConfig,
    offlineData,
    offlineQueue,
    isOffline,
    lastSyncTime,
    syncStatus,
    
    // Computed
    totalCacheSize,
    cacheKeys,
    expiredKeys,
    pendingSyncCount,
    
    // Actions
    setCacheConfig,
    setCache,
    getCache,
    removeCache,
    clearCache,
    cleanupExpiredCache,
    cleanupOldCache,
    setOfflineData,
    getOfflineData,
    addToOfflineQueue,
    removeFromOfflineQueue,
    clearOfflineQueue,
    setIsOffline,
    setLastSyncTime,
    setSyncStatus,
    startSync,
    endSync,
    syncOfflineData,
    getCacheInfo,
    initializeCache
  }
})
