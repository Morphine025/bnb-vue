/**
 * 状态同步测试工具
 * 功能描述：测试状态同步机制的效果
 * 主要功能：同步测试、订阅测试、离线同步测试
 */

import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useStateSyncStore } from './state-sync'

export const useSyncTestStore = defineStore('syncTest', () => {
  const stateSyncStore = useStateSyncStore()
  
  // 测试结果
  const testResults = ref({
    subscription: {},
    sync: {},
    offline: {},
    testTime: null
  })
  
  // 订阅测试
  const testSubscription = () => {
    console.log('🧪 开始订阅测试...')
    
    const results = {
      subscriptions: [],
      notifications: []
    }
    
    // 订阅用户状态变更
    const userSubscriptionId = stateSyncStore.subscribe('user', (data) => {
      console.log('📢 收到用户状态变更通知:', data)
      results.notifications.push({
        type: 'user',
        data,
        timestamp: Date.now()
      })
    }, { immediate: true })
    
    // 订阅民宿状态变更
    const homestaySubscriptionId = stateSyncStore.subscribe('homestay', (data) => {
      console.log('📢 收到民宿状态变更通知:', data)
      results.notifications.push({
        type: 'homestay',
        data,
        timestamp: Date.now()
      })
    })
    
    // 订阅搜索状态变更
    const searchSubscriptionId = stateSyncStore.subscribe('search', (data) => {
      console.log('📢 收到搜索状态变更通知:', data)
      results.notifications.push({
        type: 'search',
        data,
        timestamp: Date.now()
      })
    })
    
    results.subscriptions = [
      { id: userSubscriptionId, store: 'user' },
      { id: homestaySubscriptionId, store: 'homestay' },
      { id: searchSubscriptionId, store: 'search' }
    ]
    
    // 测试通知
    stateSyncStore.notify('user', { type: 'test', message: '测试用户通知' })
    stateSyncStore.notify('homestay', { type: 'test', message: '测试民宿通知' })
    stateSyncStore.notify('search', { type: 'test', message: '测试搜索通知' })
    
    testResults.value.subscription = results
    console.log('✅ 订阅测试完成:', results)
    return results
  }
  
  // 同步队列测试
  const testSyncQueue = () => {
    console.log('🧪 开始同步队列测试...')
    
    const results = {
      added: [],
      processed: []
    }
    
    // 添加各种同步操作
    const actions = [
      {
        type: 'user-login',
        data: { userId: '123', username: 'testuser' },
        priority: 'high'
      },
      {
        type: 'homestay-like',
        data: { homestayId: '456', liked: true },
        priority: 'normal'
      },
      {
        type: 'search-history',
        data: { keyword: '测试关键词' },
        priority: 'low'
      },
      {
        type: 'homestay-collect',
        data: { homestayId: '789', collected: true },
        priority: 'normal'
      }
    ]
    
    // 添加到同步队列
    actions.forEach(action => {
      const id = stateSyncStore.addToSyncQueue(action)
      results.added.push({ id, ...action })
    })
    
    // 处理同步队列
    stateSyncStore.processSyncQueue()
    
    results.processed = stateSyncStore.getSyncStats()
    
    testResults.value.sync = results
    console.log('✅ 同步队列测试完成:', results)
    return results
  }
  
  // 离线同步测试
  const testOfflineSync = () => {
    console.log('🧪 开始离线同步测试...')
    
    const results = {
      offlineActions: [],
      syncResults: []
    }
    
    // 模拟离线状态
    stateSyncStore.setNetworkStatus({ isOnline: false })
    
    // 添加离线操作
    const offlineActions = [
      {
        type: 'user-login',
        data: { userId: 'offline-123', username: 'offlineuser' }
      },
      {
        type: 'homestay-like',
        data: { homestayId: 'offline-456', liked: true }
      },
      {
        type: 'search-history',
        data: { keyword: '离线搜索' }
      }
    ]
    
    offlineActions.forEach(action => {
      const id = stateSyncStore.addToSyncQueue(action)
      results.offlineActions.push({ id, ...action })
    })
    
    // 模拟网络恢复
    setTimeout(() => {
      stateSyncStore.setNetworkStatus({ isOnline: true })
      stateSyncStore.processSyncQueue()
      
      results.syncResults = stateSyncStore.getSyncStats()
      console.log('✅ 离线同步测试完成:', results)
    }, 1000)
    
    testResults.value.offline = results
    return results
  }
  
  // 批量同步测试
  const testBatchSync = () => {
    console.log('🧪 开始批量同步测试...')
    
    const batchActions = [
      { type: 'user-login', data: { userId: 'batch-1' } },
      { type: 'user-login', data: { userId: 'batch-2' } },
      { type: 'homestay-like', data: { homestayId: 'batch-3', liked: true } },
      { type: 'homestay-like', data: { homestayId: 'batch-4', liked: false } },
      { type: 'search-history', data: { keyword: '批量搜索1' } },
      { type: 'search-history', data: { keyword: '批量搜索2' } }
    ]
    
    return stateSyncStore.batchSync(batchActions)
  }
  
  // 性能测试
  const testPerformance = () => {
    console.log('🧪 开始性能测试...')
    
    const startTime = Date.now()
    const results = {
      subscriptionTime: 0,
      notificationTime: 0,
      syncTime: 0,
      totalTime: 0
    }
    
    // 测试订阅性能
    const subStartTime = Date.now()
    for (let i = 0; i < 100; i++) {
      stateSyncStore.subscribe(`test-store-${i}`, () => {})
    }
    results.subscriptionTime = Date.now() - subStartTime
    
    // 测试通知性能
    const notifStartTime = Date.now()
    for (let i = 0; i < 100; i++) {
      stateSyncStore.notify(`test-store-${i}`, { test: true })
    }
    results.notificationTime = Date.now() - notifStartTime
    
    // 测试同步性能
    const syncStartTime = Date.now()
    for (let i = 0; i < 50; i++) {
      stateSyncStore.addToSyncQueue({
        type: 'test-sync',
        data: { index: i }
      })
    }
    results.syncTime = Date.now() - syncStartTime
    
    results.totalTime = Date.now() - startTime
    
    console.log('✅ 性能测试完成:', results)
    return results
  }
  
  // 运行所有测试
  const runAllTests = async () => {
    console.log('🧪 开始运行所有状态同步测试...')
    const startTime = Date.now()
    
    try {
      await testSubscription()
      await testSyncQueue()
      await testOfflineSync()
      await testBatchSync()
      await testPerformance()
      
      testResults.value.testTime = Date.now() - startTime
      
      console.log('🎉 所有状态同步测试完成!')
      console.log('📊 测试结果:', testResults.value)
      
      return testResults.value
    } catch (error) {
      console.error('❌ 测试过程中出现错误:', error)
      throw error
    }
  }
  
  // 清理测试数据
  const cleanupTestData = () => {
    stateSyncStore.clearSyncQueue()
    stateSyncStore.resetSyncStatus()
    testResults.value = {
      subscription: {},
      sync: {},
      offline: {},
      testTime: null
    }
    console.log('🧹 测试数据清理完成')
  }
  
  return {
    testResults,
    testSubscription,
    testSyncQueue,
    testOfflineSync,
    testBatchSync,
    testPerformance,
    runAllTests,
    cleanupTestData
  }
})
