/**
 * 缓存模块状态管理
 * 功能描述：管理数据缓存和离线数据
 * 主要功能：数据缓存、离线数据、缓存策略、数据同步
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useCacheStore = defineStore('cache', () => {
  // 缓存数据
  const cacheData = ref(new Map())
  const cacheTimestamps = ref(new Map())
  const cacheSizes = ref(new Map())
  
  // 缓存配置
  const cacheConfig = ref({
    maxSize: 50 * 1024 * 1024, // 50MB
    maxAge: 24 * 60 * 60 * 1000, // 24小时
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
      const serializedData = JSON.stringify(data)
      const dataSize = new Blob([serializedData]).size
      
      // 检查缓存大小限制
      if (dataSize > cacheConfig.value.maxSize) {
        console.warn(`缓存数据过大: ${key}, 大小: ${dataSize}`)
        return false
      }
      
      // 清理过期缓存
      if (totalCacheSize.value + dataSize > cacheConfig.value.maxSize) {
        cleanupExpiredCache()
      }
      
      cacheData.value.set(key, data)
      cacheTimestamps.value.set(key, Date.now())
      cacheSizes.value.set(key, dataSize)
      
      // 持久化到本地存储
      if (options.persist !== false) {
        saveCacheToStorage(key, data)
      }
      
      return true
    } catch (error) {
      console.error('设置缓存失败:', error)
      return false
    }
  }

  const getCache = (key, options = {}) => {
    try {
      // 检查缓存是否存在
      if (!cacheData.value.has(key)) {
        // 尝试从本地存储加载
        if (options.loadFromStorage !== false) {
          const data = loadCacheFromStorage(key)
          if (data) {
            cacheData.value.set(key, data)
            cacheTimestamps.value.set(key, Date.now())
            return data
          }
        }
        return null
      }
      
      // 检查是否过期
      const timestamp = cacheTimestamps.value.get(key)
      const now = Date.now()
      
      if (options.checkExpiry !== false && now - timestamp > cacheConfig.value.maxAge) {
        removeCache(key)
        return null
      }
      
      return cacheData.value.get(key)
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
    return {
      totalSize: totalCacheSize.value,
      keyCount: cacheData.value.size,
      expiredCount: expiredKeys.value.length,
      offlineDataCount: offlineData.value.size,
      pendingSyncCount: pendingSyncCount.value
    }
  }

  const initializeCache = () => {
    loadOfflineQueueFromStorage()
    
    // 监听网络状态
    uni.onNetworkStatusChange((res) => {
      setIsOffline(!res.isConnected)
      
      if (res.isConnected && offlineQueue.value.length > 0) {
        syncOfflineData()
      }
    })
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
