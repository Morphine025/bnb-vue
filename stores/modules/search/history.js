/**
 * 搜索历史管理Store
 * 功能描述：管理搜索历史相关的状态和操作
 * 主要功能：搜索历史记录、历史管理、持久化等
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { API } from '../../../api'

export const useSearchHistoryStore = defineStore('searchHistory', () => {
  // 搜索历史
  const searchHistory = ref([])
  const maxHistoryCount = 20

  // 计算属性
  const recentSearches = computed(() => 
    searchHistory.value.slice(0, 10)
  )

  const hasSearchHistory = computed(() => 
    searchHistory.value.length > 0
  )

  // Actions
  const setSearchHistory = (history) => {
    searchHistory.value = history
  }

  const addToSearchHistory = (keyword) => {
    if (!keyword || !keyword.trim()) return
    
    const trimmedKeyword = keyword.trim()
    
    // 移除重复项
    const filteredHistory = searchHistory.value.filter(item => item !== trimmedKeyword)
    
    // 添加到开头
    filteredHistory.unshift(trimmedKeyword)
    
    // 限制历史记录数量
    if (filteredHistory.length > maxHistoryCount) {
      filteredHistory.splice(maxHistoryCount)
    }
    
    searchHistory.value = filteredHistory
    
    // 持久化到本地存储
    saveSearchHistoryToStorage()
  }

  const removeFromSearchHistory = (keyword) => {
    const index = searchHistory.value.indexOf(keyword)
    if (index > -1) {
      searchHistory.value.splice(index, 1)
      saveSearchHistoryToStorage()
    }
  }

  const clearSearchHistory = () => {
    searchHistory.value = []
    saveSearchHistoryToStorage()
  }

  // 持久化相关方法
  const saveSearchHistoryToStorage = () => {
    try {
      uni.setStorageSync('search_history', JSON.stringify(searchHistory.value))
    } catch (error) {
      console.error('保存搜索历史失败:', error)
    }
  }

  const loadSearchHistoryFromStorage = () => {
    try {
      const history = uni.getStorageSync('search_history')
      if (history) {
        searchHistory.value = JSON.parse(history)
      }
    } catch (error) {
      console.error('加载搜索历史失败:', error)
    }
  }

  // 从服务器获取搜索历史
  const fetchUserSearchHistory = async () => {
    try {
      const response = await API.search.getSearchHistory()
      if (response && response.list) {
        setSearchHistory(response.list)
        return response.list
      }
    } catch (error) {
      console.error('获取搜索历史失败:', error)
      // 如果服务器获取失败，使用本地存储
      loadSearchHistoryFromStorage()
    }
  }

  // 清除服务器搜索历史
  const clearUserSearchHistory = async () => {
    try {
      await API.search.clearSearchHistory()
      clearSearchHistory()
    } catch (error) {
      console.error('清除搜索历史失败:', error)
      // 即使服务器清除失败，也清除本地历史
      clearSearchHistory()
    }
  }

  // 初始化搜索历史
  const initializeSearchHistory = () => {
    loadSearchHistoryFromStorage()
  }

  return {
    // State
    searchHistory,
    maxHistoryCount,
    
    // Computed
    recentSearches,
    hasSearchHistory,
    
    // Actions
    setSearchHistory,
    addToSearchHistory,
    removeFromSearchHistory,
    clearSearchHistory,
    saveSearchHistoryToStorage,
    loadSearchHistoryFromStorage,
    fetchUserSearchHistory,
    clearUserSearchHistory,
    initializeSearchHistory
  }
})
