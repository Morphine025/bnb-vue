/**
 * 状态同步管理器
 * 功能描述：实现多个store之间的状态同步机制
 * 主要功能：状态订阅、变更通知、同步队列、离线同步
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useStateSyncStore = defineStore('stateSync', () => {
  // 订阅者管理
  const subscribers = ref(new Map())
  
  // 同步队列
  const syncQueue = ref([])
  
  // 同步状态
  const syncStatus = ref({
    isSyncing: false,
    lastSyncTime: null,
    syncErrors: [],
    pendingCount: 0,
    successCount: 0,
    failureCount: 0
  })
  
  // 网络状态
  const networkStatus = ref({
    isOnline: true,
    lastOnlineTime: null,
    connectionType: 'unknown'
  })
  
  // 计算属性
  const pendingSyncCount = computed(() => syncQueue.value.length)
  
  const syncStats = computed(() => ({
    total: syncStatus.value.successCount + syncStatus.value.failureCount,
    success: syncStatus.value.successCount,
    failure: syncStatus.value.failureCount,
    successRate: syncStatus.value.successCount + syncStatus.value.failureCount > 0 
      ? (syncStatus.value.successCount / (syncStatus.value.successCount + syncStatus.value.failureCount) * 100).toFixed(2)
      : 0
  }))
  
  // 订阅状态变更
  const subscribe = (storeName, callback, options = {}) => {
    if (!subscribers.value.has(storeName)) {
      subscribers.value.set(storeName, [])
    }
    
    const subscription = {
      id: generateId(),
      callback,
      options: {
        immediate: false,
        once: false,
        ...options
      }
    }
    
    subscribers.value.get(storeName).push(subscription)
    
    // 立即执行一次（如果设置了immediate）
    if (subscription.options.immediate) {
      try {
        callback({ type: 'initial', storeName })
      } catch (error) {
        console.error('订阅回调执行失败:', error)
      }
    }
    
    console.log(`📡 订阅状态变更: ${storeName}`)
    return subscription.id
  }
  
  // 取消订阅
  const unsubscribe = (storeName, subscriptionId) => {
    if (!subscribers.value.has(storeName)) return false
    
    const subscriptions = subscribers.value.get(storeName)
    const index = subscriptions.findIndex(sub => sub.id === subscriptionId)
    
    if (index > -1) {
      subscriptions.splice(index, 1)
      console.log(`📡 取消订阅: ${storeName}`)
      return true
    }
    
    return false
  }
  
  // 通知状态变更
  const notify = (storeName, data, options = {}) => {
    const callbacks = subscribers.value.get(storeName) || []
    const notifications = []
    
    callbacks.forEach(subscription => {
      try {
        const result = subscription.callback({
          type: 'change',
          storeName,
          data,
          timestamp: Date.now(),
          ...options
        })
        
        notifications.push({
          subscriptionId: subscription.id,
          success: true,
          result
        })
        
        // 如果是一次性订阅，执行后移除
        if (subscription.options.once) {
          unsubscribe(storeName, subscription.id)
        }
      } catch (error) {
        console.error('状态同步回调执行失败:', error)
        notifications.push({
          subscriptionId: subscription.id,
          success: false,
          error: error.message
        })
      }
    })
    
    console.log(`📢 通知状态变更: ${storeName}, 订阅者数量: ${callbacks.length}`)
    return notifications
  }
  
  // 添加同步操作到队列
  const addToSyncQueue = (action) => {
    const syncAction = {
      id: generateId(),
      ...action,
      timestamp: Date.now(),
      retryCount: 0,
      maxRetries: action.maxRetries || 3,
      priority: action.priority || 'normal'
    }
    
    syncQueue.value.push(syncAction)
    syncStatus.value.pendingCount = syncQueue.value.length
    
    console.log(`📝 添加同步操作到队列: ${action.type}`)
    return syncAction.id
  }
  
  // 处理同步队列
  const processSyncQueue = async () => {
    if (syncStatus.value.isSyncing || syncQueue.value.length === 0) return
    
    syncStatus.value.isSyncing = true
    console.log('🔄 开始处理同步队列...')
    
    try {
      while (syncQueue.value.length > 0) {
        const action = syncQueue.value.shift()
        
        try {
          await executeSyncAction(action)
          syncStatus.value.successCount++
          console.log(`✅ 同步操作成功: ${action.type}`)
        } catch (error) {
          console.error(`❌ 同步操作失败: ${action.type}`, error)
          
          // 重试逻辑
          if (action.retryCount < action.maxRetries) {
            action.retryCount++
            syncQueue.value.push(action)
            console.log(`🔄 重试同步操作: ${action.type} (${action.retryCount}/${action.maxRetries})`)
          } else {
            syncStatus.value.failureCount++
            syncStatus.value.syncErrors.push({
              time: new Date().toISOString(),
              action: action.type,
              error: error.message
            })
          }
        }
      }
      
      syncStatus.value.lastSyncTime = new Date().toISOString()
      syncStatus.value.pendingCount = 0
      
    } catch (error) {
      console.error('处理同步队列失败:', error)
    } finally {
      syncStatus.value.isSyncing = false
    }
  }
  
  // 执行同步操作
  const executeSyncAction = async (action) => {
    switch (action.type) {
      case 'user-login':
        return await syncUserLogin(action.data)
      case 'user-logout':
        return await syncUserLogout(action.data)
      case 'homestay-like':
        return await syncHomestayLike(action.data)
      case 'homestay-collect':
        return await syncHomestayCollect(action.data)
      case 'search-history':
        return await syncSearchHistory(action.data)
      case 'message-send':
        return await syncMessageSend(action.data)
      default:
        throw new Error(`未知的同步操作类型: ${action.type}`)
    }
  }
  
  // 具体的同步操作实现
  const syncUserLogin = async (data) => {
    // 通知所有相关store用户登录状态变更
    notify('user', { type: 'login', userInfo: data })
    notify('app', { type: 'user-login', userInfo: data })
    notify('cache', { type: 'user-login', userInfo: data })
  }
  
  const syncUserLogout = async (data) => {
    // 通知所有相关store用户登出状态变更
    notify('user', { type: 'logout' })
    notify('app', { type: 'user-logout' })
    notify('cache', { type: 'user-logout' })
    notify('homestay', { type: 'user-logout' })
    notify('search', { type: 'user-logout' })
  }
  
  const syncHomestayLike = async (data) => {
    // 同步民宿点赞状态
    notify('homestay', { type: 'like', homestayId: data.homestayId, liked: data.liked })
    notify('user', { type: 'homestay-like', homestayId: data.homestayId, liked: data.liked })
  }
  
  const syncHomestayCollect = async (data) => {
    // 同步民宿收藏状态
    notify('homestay', { type: 'collect', homestayId: data.homestayId, collected: data.collected })
    notify('user', { type: 'homestay-collect', homestayId: data.homestayId, collected: data.collected })
  }
  
  const syncSearchHistory = async (data) => {
    // 同步搜索历史
    notify('search', { type: 'history-add', keyword: data.keyword })
  }
  
  const syncMessageSend = async (data) => {
    // 同步消息发送
    notify('message', { type: 'message-send', message: data })
  }
  
  // 网络状态管理
  const setNetworkStatus = (status) => {
    networkStatus.value = {
      ...networkStatus.value,
      ...status,
      lastOnlineTime: status.isOnline ? new Date().toISOString() : networkStatus.value.lastOnlineTime
    }
    
    // 网络恢复时处理同步队列
    if (status.isOnline && syncQueue.value.length > 0) {
      processSyncQueue()
    }
  }
  
  // 批量同步
  const batchSync = async (actions) => {
    console.log(`📦 开始批量同步: ${actions.length} 个操作`)
    
    for (const action of actions) {
      addToSyncQueue(action)
    }
    
    await processSyncQueue()
  }
  
  // 清理同步队列
  const clearSyncQueue = () => {
    syncQueue.value = []
    syncStatus.value.pendingCount = 0
    console.log('🧹 清理同步队列完成')
  }
  
  // 重置同步状态
  const resetSyncStatus = () => {
    syncStatus.value = {
      isSyncing: false,
      lastSyncTime: null,
      syncErrors: [],
      pendingCount: 0,
      successCount: 0,
      failureCount: 0
    }
    console.log('🔄 重置同步状态完成')
  }
  
  // 获取同步统计
  const getSyncStats = () => {
    return {
      ...syncStatus.value,
      ...syncStats.value,
      networkStatus: networkStatus.value,
      subscribersCount: Array.from(subscribers.value.values()).reduce((total, subs) => total + subs.length, 0)
    }
  }
  
  // 工具函数
  const generateId = () => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2)
  }
  
  // 初始化
  const initializeSync = () => {
    // 监听网络状态变化
    uni.onNetworkStatusChange((res) => {
      setNetworkStatus({
        isOnline: res.isConnected,
        connectionType: res.networkType
      })
    })
    
    // 定期处理同步队列
    setInterval(() => {
      if (networkStatus.value.isOnline && syncQueue.value.length > 0) {
        processSyncQueue()
      }
    }, 5000) // 每5秒检查一次
    
    console.log('🚀 状态同步管理器初始化完成')
  }
  
  return {
    // State
    subscribers,
    syncQueue,
    syncStatus,
    networkStatus,
    
    // Computed
    pendingSyncCount,
    syncStats,
    
    // Actions
    subscribe,
    unsubscribe,
    notify,
    addToSyncQueue,
    processSyncQueue,
    setNetworkStatus,
    batchSync,
    clearSyncQueue,
    resetSyncStatus,
    getSyncStats,
    initializeSync
  }
})
