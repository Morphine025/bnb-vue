/**
 * 搜索建议管理Store
 * 功能描述：管理搜索建议相关的状态和操作
 * 主要功能：搜索建议、热门搜索、建议管理等
 */

import { defineStore } from 'pinia'
import { ref } from 'vue'
import { API } from '../../../api'

export const useSearchSuggestionsStore = defineStore('searchSuggestions', () => {
  // 搜索建议
  const searchSuggestions = ref([])
  const isSuggestionsLoading = ref(false)

  // 热门搜索
  const hotSearches = ref([])
  const isHotSearchesLoading = ref(false)

  // Actions
  const setSearchSuggestions = (suggestions) => {
    searchSuggestions.value = suggestions
  }

  const setSuggestionsLoading = (loading) => {
    isSuggestionsLoading.value = loading
  }

  const setHotSearches = (hotSearches) => {
    hotSearches.value = hotSearches
  }

  const setHotSearchesLoading = (loading) => {
    isHotSearchesLoading.value = loading
  }

  const clearSearchSuggestions = () => {
    searchSuggestions.value = []
  }

  // 获取搜索建议
  const getSearchSuggestions = async (keyword) => {
    if (!keyword || !keyword.trim()) {
      clearSearchSuggestions()
      return
    }
    
    setSuggestionsLoading(true)
    try {
      // 调用服务层获取搜索建议
      const response = await API.search.getSuggestions({ keyword: keyword.trim() })
      
      if (response && response.list) {
        setSearchSuggestions(response.list)
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

  // 加载热门搜索
  const loadHotSearches = async () => {
    setHotSearchesLoading(true)
    try {
      // 调用服务层获取热门搜索
      const response = await API.search.getHotSearches()
      
      if (response && response.list) {
        setHotSearches(response.list)
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

  // 初始化搜索建议
  const initializeSuggestions = () => {
    loadHotSearches()
  }

  return {
    // State
    searchSuggestions,
    isSuggestionsLoading,
    hotSearches,
    isHotSearchesLoading,
    
    // Actions
    setSearchSuggestions,
    setSuggestionsLoading,
    setHotSearches,
    setHotSearchesLoading,
    clearSearchSuggestions,
    getSearchSuggestions,
    loadHotSearches,
    initializeSuggestions
  }
})
