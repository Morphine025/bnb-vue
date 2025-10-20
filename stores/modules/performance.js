/**
 * 性能监控模块状态管理
 * 功能描述：监控应用性能指标和状态变化
 * 主要功能：性能指标收集、状态变化监控、性能分析
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const usePerformanceStore = defineStore('performance', () => {
  // 性能指标
  const metrics = ref({
    // 页面加载时间
    pageLoadTime: 0,
    // API响应时间
    apiResponseTime: {},
    // 状态变化次数
    stateChanges: {},
    // 内存使用情况
    memoryUsage: 0,
    // 网络请求统计
    networkStats: {
      totalRequests: 0,
      successRequests: 0,
      failedRequests: 0,
      averageResponseTime: 0
    }
  })
  
  // 状态变化历史
  const stateChangeHistory = ref([])
  const maxHistorySize = 100
  
  // 性能监控开关
  const isMonitoring = ref(true)
  
  // 计算属性
  const performanceScore = computed(() => {
    const { networkStats } = metrics.value
    const successRate = networkStats.totalRequests > 0 
      ? (networkStats.successRequests / networkStats.totalRequests) * 100 
      : 100
    
    const responseTimeScore = networkStats.averageResponseTime < 1000 ? 100 
      : networkStats.averageResponseTime < 2000 ? 80 
      : networkStats.averageResponseTime < 3000 ? 60 
      : 40
    
    return Math.round((successRate + responseTimeScore) / 2)
  })
  
  const isPerformanceGood = computed(() => performanceScore.value >= 80)
  
  // Actions
  const setMetrics = (newMetrics) => {
    metrics.value = { ...metrics.value, ...newMetrics }
  }
  
  const setMonitoring = (enabled) => {
    isMonitoring.value = enabled
  }
  
  // 记录页面加载时间
  const recordPageLoadTime = (pageName, loadTime) => {
    if (!isMonitoring.value) return
    
    metrics.value.pageLoadTime = loadTime
    console.log(`📊 页面加载时间 [${pageName}]: ${loadTime}ms`)
  }
  
  // 记录API响应时间
  const recordApiResponseTime = (apiName, responseTime) => {
    if (!isMonitoring.value) return
    
    metrics.value.apiResponseTime[apiName] = responseTime
    
    // 更新网络统计
    const { networkStats } = metrics.value
    networkStats.totalRequests++
    networkStats.successRequests++
    
    // 计算平均响应时间
    const totalTime = Object.values(metrics.value.apiResponseTime).reduce((sum, time) => sum + time, 0)
    networkStats.averageResponseTime = totalTime / Object.keys(metrics.value.apiResponseTime).length
    
    console.log(`📊 API响应时间 [${apiName}]: ${responseTime}ms`)
  }
  
  // 记录API失败
  const recordApiFailure = (apiName, error) => {
    if (!isMonitoring.value) return
    
    const { networkStats } = metrics.value
    networkStats.totalRequests++
    networkStats.failedRequests++
    
    console.error(`📊 API请求失败 [${apiName}]:`, error)
  }
  
  // 记录状态变化
  const recordStateChange = (storeName, actionName, oldValue, newValue) => {
    if (!isMonitoring.value) return
    
    const change = {
      timestamp: Date.now(),
      storeName,
      actionName,
      oldValue: JSON.stringify(oldValue),
      newValue: JSON.stringify(newValue),
      changeSize: JSON.stringify(newValue).length - JSON.stringify(oldValue).length
    }
    
    // 添加到历史记录
    stateChangeHistory.value.unshift(change)
    
    // 限制历史记录大小
    if (stateChangeHistory.value.length > maxHistorySize) {
      stateChangeHistory.value = stateChangeHistory.value.slice(0, maxHistorySize)
    }
    
    // 更新状态变化统计
    const key = `${storeName}.${actionName}`
    metrics.value.stateChanges[key] = (metrics.value.stateChanges[key] || 0) + 1
    
    console.log(`📊 状态变化 [${storeName}.${actionName}]:`, {
      oldValue,
      newValue,
      changeSize: change.changeSize
    })
  }
  
  // 记录内存使用情况
  const recordMemoryUsage = () => {
    if (!isMonitoring.value) return
    
    try {
      // 在支持的环境中获取内存使用情况
      if (typeof performance !== 'undefined' && performance.memory) {
        metrics.value.memoryUsage = performance.memory.usedJSHeapSize
        console.log(`📊 内存使用: ${(metrics.value.memoryUsage / 1024 / 1024).toFixed(2)}MB`)
      }
    } catch (error) {
      console.warn('无法获取内存使用情况:', error)
    }
  }
  
  // 获取性能报告
  const getPerformanceReport = () => {
    return {
      metrics: metrics.value,
      stateChangeHistory: stateChangeHistory.value,
      performanceScore: performanceScore.value,
      isPerformanceGood: isPerformanceGood.value,
      timestamp: new Date().toISOString()
    }
  }
  
  // 清除性能数据
  const clearPerformanceData = () => {
    metrics.value = {
      pageLoadTime: 0,
      apiResponseTime: {},
      stateChanges: {},
      memoryUsage: 0,
      networkStats: {
        totalRequests: 0,
        successRequests: 0,
        failedRequests: 0,
        averageResponseTime: 0
      }
    }
    stateChangeHistory.value = []
  }
  
  // 导出性能数据
  const exportPerformanceData = () => {
    const report = getPerformanceReport()
    const dataStr = JSON.stringify(report, null, 2)
    
    // 在支持的环境中下载文件
    if (typeof window !== 'undefined' && window.Blob) {
      const blob = new Blob([dataStr], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `performance-report-${Date.now()}.json`
      a.click()
      URL.revokeObjectURL(url)
    }
    
    return report
  }
  
  // 初始化性能监控
  const initializePerformanceMonitoring = () => {
    console.log('📊 性能监控已启动')
    
    // 定期记录内存使用情况
    setInterval(() => {
      recordMemoryUsage()
    }, 30000) // 每30秒记录一次
    
    // 监听页面卸载事件
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', () => {
        console.log('📊 页面即将卸载，最终性能报告:', getPerformanceReport())
      })
    }
  }
  
  return {
    // State
    metrics,
    stateChangeHistory,
    isMonitoring,
    
    // Computed
    performanceScore,
    isPerformanceGood,
    
    // Actions
    setMetrics,
    setMonitoring,
    recordPageLoadTime,
    recordApiResponseTime,
    recordApiFailure,
    recordStateChange,
    recordMemoryUsage,
    getPerformanceReport,
    clearPerformanceData,
    exportPerformanceData,
    initializePerformanceMonitoring
  }
})
