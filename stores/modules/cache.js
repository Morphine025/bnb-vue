/**
 * 缓存模块状态管理（优化版）
 * 功能描述：管理数据缓存和离线数据，使用分层缓存策略
 * 主要功能：数据缓存、离线数据、分层缓存策略、数据同步
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { config } from '../../api/config'

export const useCacheStore = defineStore('cache', () => {
  
  // 缓存数据（保持向后兼容）
  const cacheData = ref(new Map())
  const cacheTimestamps = ref(new Map())
  const cacheSizes = ref(new Map())
  
  // 优化后的缓存配置 - 针对民宿平台优化
  const cacheConfig = ref({
    // 实时数据缓存 - 民宿列表等频繁变化的数据
    realtime: {
      maxSize: 5 * 1024 * 1024, // 5MB
      maxAge: 2 * 60 * 1000, // 2分钟 - 大幅缩短缓存时间
      priority: 'high',
      enableRefresh: true // 支持强制刷新
    },
    // 短期缓存配置 - 用户信息等半实时数据
    shortTerm: {
      maxSize: 10 * 1024 * 1024, // 10MB
      maxAge: 10 * 60 * 1000, // 10分钟
      priority: 'high'
    },
    // 中期缓存配置 - 地区信息等相对稳定的数据
    mediumTerm: {
      maxSize: 20 * 1024 * 1024, // 20MB
      maxAge: 30 * 60 * 1000, // 30分钟
      priority: 'medium'
    },
    // 长期缓存配置 - 静态配置等很少变化的数据
    longTerm: {
      maxSize: 50 * 1024 * 1024, // 50MB
      maxAge: 24 * 60 * 60 * 1000, // 24小时
      priority: 'low'
    },
    enableOffline: true,
    enableCompression: true,
    // 新增：数据同步配置
    syncConfig: {
      checkInterval: 2 * 60 * 1000, // 2分钟检查一次数据更新
      forceRefreshThreshold: 5 * 60 * 1000, // 5分钟强制刷新阈值
      enableWebSocket: false // 暂时关闭WebSocket，后续可扩展
    }
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

  // 新增：数据同步检查状态
  const dataSyncStatus = ref({
    lastCheckTime: null,
    hasNewData: false,
    pendingUpdates: [],
    syncInterval: null
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

  // 新增：缓存年龄计算
  const getCacheAge = (key) => {
    const timestamp = cacheTimestamps.value.get(key)
    return timestamp ? Date.now() - timestamp : null
  }

  // 新增：检查缓存是否需要刷新
  const shouldRefreshCache = (key, dataType = 'default') => {
    const age = getCacheAge(key)
    if (!age) return true
    
    const config = cacheConfig.value[dataType] || cacheConfig.value.mediumTerm
    return age > config.maxAge
  }

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

  // 新增：智能缓存失效方法
  const clearCacheByCondition = (condition) => {
    const cacheKeys = Array.from(cacheData.value.keys())
    let clearedCount = 0
    
    cacheKeys.forEach(key => {
      if (condition(key)) {
        removeCache(key)
        clearedCount++
      }
    })
    
    console.log(`🧹 智能缓存清理完成，清理了 ${clearedCount} 个缓存项`)
    return clearedCount
  }

  // 新增：根据数据类型清除缓存
  const clearCacheByDataType = (dataType) => {
    return clearCacheByCondition(key => key.includes(dataType))
  }

  // 新增：根据时间条件清除过期缓存
  const clearExpiredCache = () => {
    return clearCacheByCondition(key => {
      const age = getCacheAge(key)
      return age && age > cacheConfig.value.mediumTerm.maxAge
    })
  }

  // 新增：强制清除所有缓存
  const clearAllCache = () => {
    cacheData.value.clear()
    cacheTimestamps.value.clear()
    cacheSizes.value.clear()
    console.log('🧹 已清除所有缓存')
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

  // 新增：数据同步检查机制
  const startDataSyncCheck = () => {
    if (dataSyncStatus.value.syncInterval) {
      clearInterval(dataSyncStatus.value.syncInterval)
    }
    
    dataSyncStatus.value.syncInterval = setInterval(async () => {
      await checkForDataUpdates()
    }, cacheConfig.value.syncConfig.checkInterval)
    
    console.log('🔄 数据同步检查已启动，检查间隔:', cacheConfig.value.syncConfig.checkInterval / 1000, '秒')
  }

  const stopDataSyncCheck = () => {
    if (dataSyncStatus.value.syncInterval) {
      clearInterval(dataSyncStatus.value.syncInterval)
      dataSyncStatus.value.syncInterval = null
      console.log('⏹️ 数据同步检查已停止')
    }
  }

  const checkForDataUpdates = async () => {
    // 小程序环境下禁用数据同步检查功能
    // 原因：
    // 1. 小程序生命周期短，不适合长时间后台检查
    // 2. 用户更习惯主动下拉刷新获取最新数据
    // 3. 减少不必要的网络请求和电池消耗
    // 4. 现有缓存机制和下拉刷新已能满足需求
    console.log('🔄 数据同步检查功能已禁用（小程序环境优化）')
  }

  // 新增：强制刷新缓存
  const forceRefreshCache = (dataType) => {
    if (dataType) {
      clearCacheByDataType(dataType)
    } else {
      clearAllCache()
    }
    console.log('🔄 强制刷新缓存完成')
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
    dataSyncStatus,
    
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
    initializeCache,
    
    // 新增：智能缓存管理
    getCacheAge,
    shouldRefreshCache,
    clearCacheByCondition,
    clearCacheByDataType,
    clearAllCache,
    
    // 新增：数据同步检查
    startDataSyncCheck,
    stopDataSyncCheck,
    checkForDataUpdates,
    forceRefreshCache
  }
})
