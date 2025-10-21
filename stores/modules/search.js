/**
 * 搜索模块状态管理
 * 功能描述：管理搜索相关的所有状态
 * 主要功能：搜索历史、热门搜索、搜索结果、搜索建议
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { API } from '../../api'
import { cacheUtils } from '@/utils'

export const useSearchStore = defineStore('search', () => {
  // 搜索历史
  const searchHistory = ref([])
  const maxHistoryCount = 20
  
  // 请求去重机制
  const pendingRequests = new Set()

  // 热门搜索
  const hotSearches = ref([])
  const isHotSearchesLoading = ref(false)

  // 搜索建议
  const searchSuggestions = ref([])
  const isSuggestionsLoading = ref(false)

  // 当前搜索关键词
  const currentKeyword = ref('')
  const searchKeyword = ref('')

  // 搜索结果
  const searchResults = ref([])
  const isSearching = ref(false)
  const searchPage = ref(1)
  const searchPageSize = ref(10)
  const hasMoreResults = ref(true)

  // 搜索统计
  const searchStats = ref({
    totalResults: 0,
    searchTime: 0,
    lastSearchTime: null
  })

  // 计算属性
  const recentSearches = computed(() => 
    searchHistory.value.slice(0, 10)
  )

  const hasSearchHistory = computed(() => 
    searchHistory.value.length > 0
  )

  const hasSearchResults = computed(() => 
    searchResults.value.length > 0
  )

  const isSearchEmpty = computed(() => 
    !searchKeyword.value.trim()
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

  const setHotSearches = (hotSearches) => {
    hotSearches.value = hotSearches
  }

  const setHotSearchesLoading = (loading) => {
    isHotSearchesLoading.value = loading
  }

  const setSearchSuggestions = (suggestions) => {
    searchSuggestions.value = suggestions
  }

  const setSuggestionsLoading = (loading) => {
    isSuggestionsLoading.value = loading
  }

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

  const clearSearchSuggestions = () => {
    searchSuggestions.value = []
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

  // 搜索相关方法 - 添加缓存和防抖优化
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
      // 添加到搜索历史
      addToSearchHistory(trimmedKeyword)
      
      // 调用服务层搜索
      const response = await API.homestay.search({
        keyword: trimmedKeyword,
        page: searchPage.value,
        size: searchPageSize.value,
        ...options
      })
      
      if (response && response.code === 1 && response.data) {
        const results = response.data.list || []
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
      
      if (response && response.code === 1 && response.data) {
        const newResults = response.data.list || []
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

  const getSearchSuggestions = async (keyword) => {
    if (!keyword || !keyword.trim()) {
      clearSearchSuggestions()
      return
    }
    
    setSuggestionsLoading(true)
    try {
      // 调用服务层获取搜索建议
      const response = await API.search.getSuggestions({ keyword: keyword.trim() })
      
      if (response && response.code === 1 && response.data) {
        setSearchSuggestions(response.data)
      } else {
        // 如果API失败，使用默认建议
        const defaultSuggestions = [
          `${keyword}民宿`,
          `${keyword}酒店`,
          `${keyword}住宿`
        ]
        setSearchSuggestions(defaultSuggestions)
      }
      
    } catch (error) {
      console.error('获取搜索建议失败:', error)
      // 使用默认建议
      const defaultSuggestions = [
        `${keyword}民宿`,
        `${keyword}酒店`,
        `${keyword}住宿`
      ]
      setSearchSuggestions(defaultSuggestions)
    } finally {
      setSuggestionsLoading(false)
    }
  }

  const loadHotSearches = async () => {
    setHotSearchesLoading(true)
    try {
      // 调用服务层获取热门搜索
      const response = await API.search.getHotSearches()
      
      if (response && response.code === 1 && response.data) {
        setHotSearches(response.data)
      } else {
        // 如果API失败，使用默认热门搜索
        const defaultHotSearches = [
          '海边民宿',
          '山景房',
          '温泉酒店',
          '城市中心',
          '度假村'
        ]
        setHotSearches(defaultHotSearches)
      }
      
    } catch (error) {
      console.error('获取热门搜索失败:', error)
      // 使用默认热门搜索
      const defaultHotSearches = [
        '海边民宿',
        '山景房',
        '温泉酒店',
        '城市中心',
        '度假村'
      ]
      setHotSearches(defaultHotSearches)
    } finally {
      setHotSearchesLoading(false)
    }
  }

  const initializeSearch = () => {
    loadSearchHistoryFromStorage()
    loadHotSearches()
  }

  return {
    // State
    searchHistory,
    hotSearches,
    isHotSearchesLoading,
    searchSuggestions,
    isSuggestionsLoading,
    currentKeyword,
    searchKeyword,
    searchResults,
    isSearching,
    searchPage,
    searchPageSize,
    hasMoreResults,
    searchStats,
    
    // Computed
    recentSearches,
    hasSearchHistory,
    hasSearchResults,
    isSearchEmpty,
    
    // Actions
    setSearchHistory,
    addToSearchHistory,
    removeFromSearchHistory,
    clearSearchHistory,
    setHotSearches,
    setHotSearchesLoading,
    setSearchSuggestions,
    setSuggestionsLoading,
    setCurrentKeyword,
    setSearchKeyword,
    setSearchResults,
    appendSearchResults,
    setSearching,
    setSearchPage,
    setHasMoreResults,
    setSearchStats,
    clearSearchResults,
    clearSearchSuggestions,
    performSearch,
    loadMoreSearchResults,
    getSearchSuggestions,
    loadHotSearches,
    initializeSearch
  }
})
