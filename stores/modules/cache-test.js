/**
 * 缓存测试工具
 * 功能描述：测试分层缓存策略的效果
 * 主要功能：缓存性能测试、命中率测试、内存使用测试
 */

import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useCacheStrategyStore } from './cache-strategy'

export const useCacheTestStore = defineStore('cacheTest', () => {
  const cacheStrategyStore = useCacheStrategyStore()
  
  // 测试结果
  const testResults = ref({
    performance: {},
    hitRate: {},
    memoryUsage: {},
    testTime: null
  })
  
  // 测试数据
  const testData = {
    'user-info': { id: 1, name: '测试用户', avatar: 'test.jpg' },
    'homestay-list': { list: Array.from({ length: 10 }, (_, i) => ({ id: i, title: `民宿${i}` })) },
    'search-results': { results: Array.from({ length: 5 }, (_, i) => ({ id: i, title: `搜索结果${i}` })) },
    'static-config': { theme: 'light', language: 'zh-CN' }
  }
  
  // 性能测试
  const runPerformanceTest = async () => {
    console.log('🚀 开始缓存性能测试...')
    const startTime = Date.now()
    
    // 测试设置缓存性能
    const setStartTime = Date.now()
    for (const [key, data] of Object.entries(testData)) {
      cacheStrategyStore.setCache(key, data, key)
    }
    const setTime = Date.now() - setStartTime
    
    // 测试获取缓存性能
    const getStartTime = Date.now()
    for (const key of Object.keys(testData)) {
      cacheStrategyStore.getCache(key, key)
    }
    const getTime = Date.now() - getStartTime
    
    const totalTime = Date.now() - startTime
    
    testResults.value.performance = {
      setTime,
      getTime,
      totalTime,
      setOpsPerSecond: Math.round((Object.keys(testData).length / setTime) * 1000),
      getOpsPerSecond: Math.round((Object.keys(testData).length / getTime) * 1000)
    }
    
    console.log('✅ 性能测试完成:', testResults.value.performance)
    return testResults.value.performance
  }
  
  // 命中率测试
  const runHitRateTest = async () => {
    console.log('🎯 开始缓存命中率测试...')
    
    // 重置统计
    cacheStrategyStore.resetStats()
    
    // 第一轮：设置缓存
    for (const [key, data] of Object.entries(testData)) {
      cacheStrategyStore.setCache(key, data, key)
    }
    
    // 第二轮：获取缓存（应该命中）
    for (const key of Object.keys(testData)) {
      cacheStrategyStore.getCache(key, key)
    }
    
    // 第三轮：获取不存在的缓存（应该未命中）
    for (let i = 0; i < 5; i++) {
      cacheStrategyStore.getCache(`non-existent-${i}`, 'default')
    }
    
    const stats = cacheStrategyStore.getCacheStats()
    testResults.value.hitRate = {
      hits: stats.hits,
      misses: stats.misses,
      totalRequests: stats.totalRequests,
      hitRate: stats.hitRate
    }
    
    console.log('✅ 命中率测试完成:', testResults.value.hitRate)
    return testResults.value.hitRate
  }
  
  // 内存使用测试
  const runMemoryTest = async () => {
    console.log('💾 开始内存使用测试...')
    
    const initialStats = cacheStrategyStore.getCacheStats()
    
    // 添加大量数据
    const largeData = Array.from({ length: 100 }, (_, i) => ({
      id: i,
      title: `大数据项${i}`,
      content: 'x'.repeat(1000) // 1KB数据
    }))
    
    cacheStrategyStore.setCache('large-data', largeData, 'mediumTerm')
    
    const finalStats = cacheStrategyStore.getCacheStats()
    
    testResults.value.memoryUsage = {
      initialSize: initialStats.totalSize,
      finalSize: finalStats.totalSize,
      sizeIncrease: finalStats.totalSize - initialStats.totalSize,
      cacheInfo: finalStats.cacheInfo
    }
    
    console.log('✅ 内存使用测试完成:', testResults.value.memoryUsage)
    return testResults.value.memoryUsage
  }
  
  // 分层缓存测试
  const runLayeredCacheTest = async () => {
    console.log('🏗️ 开始分层缓存测试...')
    
    const testCases = [
      { key: 'short-term-data', data: { type: 'real-time' }, strategy: 'shortTerm' },
      { key: 'medium-term-data', data: { type: 'list' }, strategy: 'mediumTerm' },
      { key: 'long-term-data', data: { type: 'static' }, strategy: 'longTerm' }
    ]
    
    const results = {}
    
    for (const testCase of testCases) {
      const dataType = testCase.strategy === 'shortTerm' ? 'homestay-list' : 
                      testCase.strategy === 'mediumTerm' ? 'user-info' : 'static-config'
      
      cacheStrategyStore.setCache(testCase.key, testCase.data, dataType)
      
      const retrieved = cacheStrategyStore.getCache(testCase.key, dataType)
      results[testCase.strategy] = {
        set: true,
        get: retrieved !== null,
        strategy: cacheStrategyStore.getCacheStrategy(dataType)
      }
    }
    
    console.log('✅ 分层缓存测试完成:', results)
    return results
  }
  
  // 运行所有测试
  const runAllTests = async () => {
    console.log('🧪 开始运行所有缓存测试...')
    const startTime = Date.now()
    
    try {
      await runPerformanceTest()
      await runHitRateTest()
      await runMemoryTest()
      await runLayeredCacheTest()
      
      testResults.value.testTime = Date.now() - startTime
      
      console.log('🎉 所有测试完成!')
      console.log('📊 测试结果:', testResults.value)
      
      return testResults.value
    } catch (error) {
      console.error('❌ 测试过程中出现错误:', error)
      throw error
    }
  }
  
  // 清理测试数据
  const cleanupTestData = () => {
    cacheStrategyStore.clearAllCache()
    testResults.value = {
      performance: {},
      hitRate: {},
      memoryUsage: {},
      testTime: null
    }
    console.log('🧹 测试数据清理完成')
  }
  
  return {
    testResults,
    runPerformanceTest,
    runHitRateTest,
    runMemoryTest,
    runLayeredCacheTest,
    runAllTests,
    cleanupTestData
  }
})
