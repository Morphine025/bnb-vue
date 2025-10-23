/**
 * 统一Loading状态管理
 * 功能描述：统一管理所有模块的loading状态，避免重复代码
 * 主要功能：loading状态管理、请求去重、状态订阅
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useLoadingStore = defineStore('loading', () => {
  // 全局loading状态映射
  const loadingStates = ref(new Map())
  
  // 请求去重机制
  const pendingRequests = ref(new Set())
  
  // 全局loading状态
  const globalLoading = ref(false)
  
  // 计算属性 - 获取所有loading状态
  const allLoadingStates = computed(() => {
    const states = {}
    loadingStates.value.forEach((value, key) => {
      states[key] = value
    })
    return states
  })
  
  // 计算属性 - 是否有任何loading状态
  const hasAnyLoading = computed(() => {
    return Array.from(loadingStates.value.values()).some(loading => loading)
  })
  
  // 计算属性 - 活跃的loading数量
  const activeLoadingCount = computed(() => {
    return Array.from(loadingStates.value.values()).filter(loading => loading).length
  })
  
  // Actions
  /**
   * 设置指定key的loading状态
   * @param {string} key - loading状态标识
   * @param {boolean} loading - loading状态
   */
  const setLoading = (key, loading) => {
    loadingStates.value.set(key, loading)
    
    // 更新全局loading状态
    globalLoading.value = hasAnyLoading.value
  }
  
  /**
   * 获取指定key的loading状态
   * @param {string} key - loading状态标识
   * @returns {boolean} loading状态
   */
  const isLoading = (key) => {
    return loadingStates.value.get(key) || false
  }
  
  /**
   * 批量设置loading状态
   * @param {Object} states - 状态对象
   */
  const setMultipleLoading = (states) => {
    Object.entries(states).forEach(([key, loading]) => {
      setLoading(key, loading)
    })
  }
  
  /**
   * 清除指定key的loading状态
   * @param {string} key - loading状态标识
   */
  const clearLoading = (key) => {
    loadingStates.value.delete(key)
    globalLoading.value = hasAnyLoading.value
  }
  
  /**
   * 清除所有loading状态
   */
  const clearAllLoading = () => {
    loadingStates.value.clear()
    globalLoading.value = false
  }
  
  /**
   * 请求去重管理
   * @param {string} requestKey - 请求标识
   * @returns {boolean} 是否为新请求
   */
  const addPendingRequest = (requestKey) => {
    if (pendingRequests.value.has(requestKey)) {
      return false // 请求已存在
    }
    pendingRequests.value.add(requestKey)
    return true // 新请求
  }
  
  /**
   * 移除pending请求
   * @param {string} requestKey - 请求标识
   */
  const removePendingRequest = (requestKey) => {
    pendingRequests.value.delete(requestKey)
  }
  
  /**
   * 检查请求是否在进行中
   * @param {string} requestKey - 请求标识
   * @returns {boolean} 是否在进行中
   */
  const isRequestPending = (requestKey) => {
    return pendingRequests.value.has(requestKey)
  }
  
  /**
   * 清除所有pending请求
   */
  const clearAllPendingRequests = () => {
    pendingRequests.value.clear()
  }
  
  /**
   * 获取pending请求数量
   */
  const pendingRequestCount = computed(() => {
    return pendingRequests.value.size
  })
  
  /**
   * 获取pending请求列表
   */
  const pendingRequestsList = computed(() => {
    return Array.from(pendingRequests.value)
  })
  
  /**
   * 设置全局loading状态
   * @param {boolean} loading - 全局loading状态
   */
  const setGlobalLoading = (loading) => {
    globalLoading.value = loading
  }
  
  /**
   * 显示loading状态（带自动隐藏）
   * @param {string} key - loading状态标识
   * @param {number} timeout - 超时时间（毫秒）
   */
  const showLoadingWithTimeout = (key, timeout = 10000) => {
    setLoading(key, true)
    
    // 设置超时自动隐藏
    setTimeout(() => {
      if (isLoading(key)) {
        console.warn(`Loading状态超时自动隐藏: ${key}`)
        setLoading(key, false)
      }
    }, timeout)
  }
  
  /**
   * 批量显示loading状态
   * @param {string[]} keys - loading状态标识数组
   */
  const showMultipleLoading = (keys) => {
    keys.forEach(key => setLoading(key, true))
  }
  
  /**
   * 批量隐藏loading状态
   * @param {string[]} keys - loading状态标识数组
   */
  const hideMultipleLoading = (keys) => {
    keys.forEach(key => setLoading(key, false))
  }
  
  /**
   * 获取loading状态统计信息
   */
  const getLoadingStats = () => {
    return {
      totalStates: loadingStates.value.size,
      activeStates: activeLoadingCount.value,
      pendingRequests: pendingRequestCount.value,
      globalLoading: globalLoading.value,
      states: allLoadingStates.value
    }
  }
  
  /**
   * 设置错误状态
   * @param {string} key - 错误状态标识
   * @param {string|null} error - 错误信息
   */
  const setError = (key, error) => {
    loadingStates.value.set(key, false)
    // 只有在有实际错误时才打印日志
    if (error !== null && error !== undefined) {
      console.error(`错误状态设置: ${key}`, error)
    }
  }

  /**
   * 获取错误信息
   * @param {string} key - 错误状态标识
   * @returns {string} 错误信息
   */
  const getError = (key) => {
    // 这里可以返回存储的错误信息
    return null
  }

  return {
    // State
    loadingStates,
    pendingRequests,
    globalLoading,
    
    // Computed
    allLoadingStates,
    hasAnyLoading,
    activeLoadingCount,
    pendingRequestCount,
    pendingRequestsList,
    
    // Actions
    setLoading,
    isLoading,
    setMultipleLoading,
    clearLoading,
    clearAllLoading,
    addPendingRequest,
    removePendingRequest,
    isRequestPending,
    clearAllPendingRequests,
    setGlobalLoading,
    showLoadingWithTimeout,
    showMultipleLoading,
    hideMultipleLoading,
    getLoadingStats,
    setError,
    getError
  }
})
