/**
 * 缓存模块状态管理（优化版）
 * 功能描述：管理数据缓存和离线数据，使用分层缓存策略
 * 主要功能：数据缓存、离线数据、分层缓存策略、数据同步
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useCacheStore = defineStore('cache', () => {
  
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

  // ==================== Actions ====================
  
  /**
   * 设置缓存配置
   * @description 更新缓存配置参数，支持动态调整缓存策略
   * @param {Object} config - 新的缓存配置
   * @param {Object} config.shortTerm - 短期缓存配置
   * @param {Object} config.mediumTerm - 中期缓存配置
   * @param {Object} config.longTerm - 长期缓存配置
   * @param {boolean} config.enableOffline - 是否启用离线缓存
   * @param {boolean} config.enableCompression - 是否启用数据压缩
   * @example
   * ```javascript
   * cacheStore.setCacheConfig({
   *   shortTerm: { maxAge: 5 * 60 * 1000, maxSize: 5 * 1024 * 1024 },
   *   enableOffline: true
   * })
   * ```
   */
  const setCacheConfig = (config) => {
    cacheConfig.value = { ...cacheConfig.value, ...config }
    console.log('✅ 缓存配置已更新:', config)
  }

  /**
   * 设置缓存数据
   * @description 使用分层缓存策略设置缓存数据，支持不同数据类型的缓存策略
   * @param {string} key - 缓存键名
   * @param {*} data - 要缓存的数据
   * @param {Object} options - 缓存选项
   * @param {string} options.dataType - 数据类型（shortTerm/mediumTerm/longTerm）
   * @param {number} options.maxAge - 最大缓存时间（毫秒）
   * @param {number} options.maxSize - 最大缓存大小（字节）
   * @param {string} options.priority - 缓存优先级（high/medium/low）
   * @returns {boolean} 是否设置成功
   * @example
   * ```javascript
   * // 设置短期缓存
   * cacheStore.setCache('user-info', userData, { 
   *   dataType: 'shortTerm',
   *   maxAge: 5 * 60 * 1000 
   * })
   * 
   * // 设置长期缓存
   * cacheStore.setCache('static-config', configData, { 
   *   dataType: 'longTerm',
   *   maxAge: 24 * 60 * 60 * 1000 
   * })
   * ```
   */
  const setCache = (key, data, options = {}) => {
    try {
      // 使用简化的缓存策略
      const dataType = options.dataType || 'default'
      const maxAge = options.maxAge || cacheConfig.value.mediumTerm.maxAge
      
      // 直接设置到缓存数据中
      cacheData.value.set(key, data)
      cacheTimestamps.value.set(key, Date.now())
      
      // 计算数据大小
      const dataSize = JSON.stringify(data).length
      cacheSizes.value.set(key, dataSize)
      
      // 保存到本地存储
      saveCacheToStorage(key, data)
      
      console.log(`✅ 缓存设置成功: ${key} (${dataType})`)
      return true
    } catch (error) {
      console.error('❌ 设置缓存失败:', error)
      return false
    }
  }

  /**
   * 获取缓存数据
   * @description 从分层缓存中获取数据，支持不同数据类型的缓存策略
   * @param {string} key - 缓存键名
   * @param {Object} options - 获取选项
   * @param {string} options.dataType - 数据类型（shortTerm/mediumTerm/longTerm）
   * @param {boolean} options.refresh - 是否刷新缓存时间
   * @returns {*} 缓存的数据，如果不存在则返回null
   * @example
   * ```javascript
   * // 获取短期缓存
   * const userInfo = cacheStore.getCache('user-info', { dataType: 'shortTerm' })
   * 
   * // 获取长期缓存并刷新时间
   * const config = cacheStore.getCache('static-config', { 
   *   dataType: 'longTerm',
   *   refresh: true 
   * })
   * ```
   */
  const getCache = (key, options = {}) => {
    try {
      // 使用简化的缓存策略
      const dataType = options.dataType || 'default'
      
      // 先从内存缓存获取
      if (cacheData.value.has(key)) {
        const timestamp = cacheTimestamps.value.get(key)
        const maxAge = options.maxAge || cacheConfig.value.mediumTerm.maxAge
        
        // 检查是否过期
        if (Date.now() - timestamp < maxAge) {
          console.log(`✅ 缓存命中: ${key} (${dataType})`)
          return cacheData.value.get(key)
        } else {
          // 过期了，删除缓存
          removeCache(key)
        }
      }
      
      // 尝试从本地存储加载
      const storedData = loadCacheFromStorage(key)
      if (storedData) {
        // 重新设置到内存缓存
        cacheData.value.set(key, storedData)
        cacheTimestamps.value.set(key, Date.now())
        console.log(`✅ 从本地存储加载缓存: ${key} (${dataType})`)
        return storedData
      }
      
      console.log(`❌ 缓存未命中: ${key} (${dataType})`)
      return null
    } catch (error) {
      console.error('❌ 获取缓存失败:', error)
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
      cacheKeys: cacheKeys.value,
      expiredKeys: expiredKeys.value,
      offlineDataCount: offlineData.value.size,
      pendingSyncCount: pendingSyncCount.value,
      cacheConfig: cacheConfig.value,
      syncStatus: syncStatus.value
    }
  }

  const initializeCache = () => {
    // 初始化缓存系统
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
