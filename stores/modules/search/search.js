/**
 * 搜索功能管理Store
 * 功能描述：管理搜索功能相关的状态和操作
 * 主要功能：搜索执行、结果管理、搜索统计等
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { API } from '../../../api'
import { cacheUtils } from '@/utils'

export const useSearchStore = defineStore('search', () => {
  // 当前搜索关键词
  const currentKeyword = ref('')
  const searchKeyword = ref('')

  // 搜索结果
  const searchResults = ref([])
  const isSearching = ref(false)
  const searchPage = ref(1)
  const searchPageSize = ref(10)
  const hasMoreResults = ref(true)

  // 搜索历史
  const searchHistory = ref([])

  // 搜索统计
  const searchStats = ref({
    totalResults: 0,
    searchTime: 0,
    lastSearchTime: null
  })

  // 请求去重机制
  const pendingRequests = new Set()

  // 转换 HTTP 为 HTTPS
  const convertToHttps = (url) => {
    if (!url || typeof url !== 'string') return url
    if (url.startsWith('http://localhost') || url.startsWith('http://127.0.0.1')) {
      // 本地开发环境，保持 HTTP
      return url
    }
    if (url.startsWith('http://')) {
      return url.replace('http://', 'https://')
    }
    return url
  }

  // 计算属性
  const hasSearchResults = computed(() => 
    searchResults.value.length > 0
  )

  const isSearchEmpty = computed(() => 
    !searchKeyword.value.trim()
  )

  // Actions
  const setCurrentKeyword = (keyword) => {
    currentKeyword.value = keyword
  }

  const setSearchKeyword = (keyword) => {
    searchKeyword.value = keyword
  }

  const setSearchResults = (results) => {
    searchResults.value = results
  }

  const appendSearchResults = (results) => {
    searchResults.value.push(...results)
  }

  const setSearching = (searching) => {
    isSearching.value = searching
  }

  const setSearchPage = (page) => {
    searchPage.value = page
  }

  const setHasMoreResults = (hasMore) => {
    hasMoreResults.value = hasMore
  }

  const setSearchStats = (stats) => {
    searchStats.value = { ...searchStats.value, ...stats }
  }

  const clearSearchResults = () => {
    searchResults.value = []
    searchPage.value = 1
    hasMoreResults.value = true
    searchStats.value = {
      totalResults: 0,
      searchTime: 0,
      lastSearchTime: null
    }
  }

  // 执行搜索
  const performSearch = async (keyword, options = {}) => {
    if (!keyword || !keyword.trim()) return
    
    const trimmedKeyword = keyword.trim()
    setSearchKeyword(trimmedKeyword)
    
    // 检查缓存
    const cacheKey = cacheUtils.generateKey('search', { keyword: trimmedKeyword, page: 1 })
    const cachedResult = cacheUtils.get(cacheKey)
    
    if (cachedResult) {
      console.log('使用缓存的搜索结果')
      setSearchResults(cachedResult.list || [])
      setSearchStats({
        totalResults: cachedResult.total || 0,
        searchTime: 0,
        lastSearchTime: Date.now()
      })
      return cachedResult
    }
    
    // 请求去重
    const requestKey = `search_${trimmedKeyword}`
    if (pendingRequests.has(requestKey)) {
      console.log('搜索请求已在进行中，跳过重复请求')
      return
    }
    
    pendingRequests.add(requestKey)
    setSearching(true)
    
    const startTime = Date.now()
    
    try {
      // 调用服务层搜索
      const response = await API.homestay.search({
        keyword: trimmedKeyword,
        page: searchPage.value,
        size: searchPageSize.value,
        ...options
      })
      
      if (response && response.data && response.data.list) {
        const rawResults = response.data.list || []
        // 转换数据格式，确保字段名一致
        const results = rawResults.map(item => ({
          ...item,
          img: item.images && item.images.length > 0 ? convertToHttps(item.images[0]) : '/static/logo.png',
          // 确保其他必要字段存在
          title: item.title || '未知标题',
          price: item.price || 0,
          location: item.location || '未知位置',
          author: item.author || '未知作者',
          avatar: convertToHttps(item.avatar) || '/static/logo.png'
        }))
        setSearchResults(results)
        
        const searchStats = {
          totalResults: response.data.total || results.length,
          searchTime: Date.now() - startTime,
          lastSearchTime: new Date().toISOString()
        }
        setSearchStats(searchStats)
        
        // 缓存搜索结果
        const cacheData = {
          list: results,
          total: response.data.total || results.length,
          timestamp: Date.now()
        }
        cacheUtils.set(cacheKey, cacheData, 60000) // 缓存1分钟
        
      } else {
        setSearchResults([])
        setSearchStats({
          totalResults: 0,
          searchTime: Date.now() - startTime,
          lastSearchTime: new Date().toISOString()
        })
      }
      
    } catch (error) {
      console.error('搜索失败:', error)
      setSearchResults([])
    } finally {
      setSearching(false)
      pendingRequests.delete(requestKey)
    }
  }

  // 加载更多搜索结果
  const loadMoreSearchResults = async () => {
    if (isSearching.value || !hasMoreResults.value) return
    
    setSearching(true)
    try {
      // 调用服务层获取更多搜索结果
      const response = await API.homestay.search({
        keyword: searchKeyword.value,
        page: searchPage.value + 1,
        size: searchPageSize.value
      })
      
      if (response && response.data && response.data.list) {
        const rawResults = response.data.list || []
        // 转换数据格式，确保字段名一致
        const newResults = rawResults.map(item => ({
          ...item,
          img: item.images && item.images.length > 0 ? convertToHttps(item.images[0]) : '/static/logo.png',
          // 确保其他必要字段存在
          title: item.title || '未知标题',
          price: item.price || 0,
          location: item.location || '未知位置',
          author: item.author || '未知作者',
          avatar: convertToHttps(item.avatar) || '/static/logo.png'
        }))
        appendSearchResults(newResults)
        setSearchPage(searchPage.value + 1)
        setHasMoreResults(newResults.length === searchPageSize.value)
      } else {
        setHasMoreResults(false)
      }
      
    } catch (error) {
      console.error('加载更多搜索结果失败:', error)
    } finally {
      setSearching(false)
    }
  }

  // 设置搜索历史
  const setSearchHistory = (history) => {
    console.log('设置搜索历史:', history)
    searchHistory.value = Array.isArray(history) ? history : []
  }

  // 获取搜索建议
  const getSearchSuggestions = async (keyword) => {
    if (!keyword || !keyword.trim()) {
      return
    }
    
    try {
      // 这里可以调用搜索建议API，暂时返回空数组
      console.log('获取搜索建议:', keyword)
      return []
    } catch (error) {
      console.error('获取搜索建议失败:', error)
      return []
    }
  }

  // 添加到搜索历史
  const addToSearchHistory = (keyword) => {
    if (!keyword || !keyword.trim()) {
      return
    }
    console.log('添加到搜索历史:', keyword)
    // 这里可以调用搜索历史存储模块
  }

  // 清除搜索历史
  const clearSearchHistory = () => {
    console.log('清除搜索历史')
    // 这里可以调用搜索历史存储模块
  }

  // 清除搜索建议
  const clearSearchSuggestions = () => {
    console.log('清除搜索建议')
    // 这里可以调用搜索建议存储模块
  }

  // 初始化搜索模块
  const initializeSearch = () => {
    // 初始化搜索相关状态
    clearSearchResults()
    setSearchKeyword('')
    setCurrentKeyword('')
  }

  return {
    // State
    currentKeyword,
    searchKeyword,
    searchResults,
    isSearching,
    searchPage,
    searchPageSize,
    hasMoreResults,
    searchHistory,
    searchStats,
    
    // Computed
    hasSearchResults,
    isSearchEmpty,
    
    // Actions
    setCurrentKeyword,
    setSearchKeyword,
    setSearchResults,
    appendSearchResults,
    setSearching,
    setSearchPage,
    setHasMoreResults,
    setSearchStats,
    clearSearchResults,
    performSearch,
    loadMoreSearchResults,
    setSearchHistory,
    getSearchSuggestions,
    addToSearchHistory,
    clearSearchHistory,
    clearSearchSuggestions,
    initializeSearch
  }
})
