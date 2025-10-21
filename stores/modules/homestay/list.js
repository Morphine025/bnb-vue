/**
 * 民宿列表管理Store（简化版）
 * 功能描述：专注于民宿列表的特定功能，避免与主homestay store重复
 * 主要功能：列表展示、分页控制、视图模式等
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useLoadingStore } from '../loading'

export const useHomestayListStore = defineStore('homestayList', () => {
  // 使用统一的loading管理
  const loadingStore = useLoadingStore()
  
  // 列表展示相关状态
  const viewMode = ref('waterfall') // waterfall, list
  const sortBy = ref('default') // default, price_asc, price_desc, rating
  const showFilters = ref(false)

  // 计算属性
  const isWaterfallMode = computed(() => viewMode.value === 'waterfall')
  const isListMode = computed(() => viewMode.value === 'list')
  
  // 排序选项
  const sortOptions = computed(() => [
    { value: 'default', label: '默认排序' },
    { value: 'price_asc', label: '价格从低到高' },
    { value: 'price_desc', label: '价格从高到低' },
    { value: 'rating', label: '评分排序' }
  ])

  // Actions
  const setViewMode = (mode) => {
    viewMode.value = mode
    // 持久化视图模式
    uni.setStorageSync('homestay_view_mode', mode)
  }
  
  const setSortBy = (sort) => {
    sortBy.value = sort
    // 持久化排序方式
    uni.setStorageSync('homestay_sort_by', sort)
  }
  
  const toggleFilters = () => {
    showFilters.value = !showFilters.value
  }
  
  const hideFilters = () => {
    showFilters.value = false
  }
  
  const showFiltersPanel = () => {
    showFilters.value = true
  }
  
  // 初始化设置
  const initializeSettings = () => {
    // 从本地存储恢复设置
    const savedViewMode = uni.getStorageSync('homestay_view_mode')
    if (savedViewMode) {
      viewMode.value = savedViewMode
    }
    
    const savedSortBy = uni.getStorageSync('homestay_sort_by')
    if (savedSortBy) {
      sortBy.value = savedSortBy
    }
  }

  return {
    // State
    viewMode,
    sortBy,
    showFilters,
    
    // Computed
    isWaterfallMode,
    isListMode,
    sortOptions,
    
    // Actions
    setViewMode,
    setSortBy,
    toggleFilters,
    hideFilters,
    showFiltersPanel,
    initializeSettings
  }
})
