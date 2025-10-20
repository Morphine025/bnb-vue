/**
 * 民宿收藏管理Store
 * 功能描述：管理民宿收藏相关的状态和操作
 * 主要功能：收藏列表、收藏操作、状态管理等
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { API } from '../../../api'

export const useHomestayFavoritesStore = defineStore('homestayFavorites', () => {
  // 收藏的民宿
  const favoriteHomestays = ref([])
  const isFavoriteLoading = ref(false)
  
  // 请求去重机制
  const pendingRequests = new Set()

  // 计算属性
  const favoriteIds = computed(() => 
    favoriteHomestays.value.map(item => item.id)
  )

  const favoriteCount = computed(() => 
    favoriteHomestays.value.length
  )

  // Actions
  const setFavoriteHomestays = (favorites) => {
    favoriteHomestays.value = favorites
  }

  const setFavoriteLoading = (loading) => {
    isFavoriteLoading.value = loading
  }

  const addToFavorites = (homestay) => {
    if (!favoriteIds.value.includes(homestay.id)) {
      favoriteHomestays.value.push(homestay)
    }
  }

  const removeFromFavorites = (homestayId) => {
    const index = favoriteHomestays.value.findIndex(item => item.id === homestayId)
    if (index > -1) {
      favoriteHomestays.value.splice(index, 1)
    }
  }

  const toggleFavorite = (homestay) => {
    if (favoriteIds.value.includes(homestay.id)) {
      removeFromFavorites(homestay.id)
    } else {
      addToFavorites(homestay)
    }
  }

  const isFavorite = (homestayId) => {
    return favoriteIds.value.includes(homestayId)
  }

  const clearFavorites = () => {
    favoriteHomestays.value = []
  }

  // 获取收藏列表
  const fetchCollectList = async (page = 1, size = 10) => {
    setFavoriteLoading(true)
    try {
      const response = await API.user.getCollectList({ page, size })
      if (response && response.list) {
        setFavoriteHomestays(response.list)
        return response.list
      } else {
        throw new Error('获取收藏列表失败')
      }
    } catch (error) {
      console.error('获取收藏列表失败:', error)
      throw error
    } finally {
      setFavoriteLoading(false)
    }
  }

  // 切换收藏状态
  const toggleCollectStatus = async (homestayId, action) => {
    // 请求去重
    const requestKey = `collect_${homestayId}_${action}`
    if (pendingRequests.has(requestKey)) {
      console.log('⚠️ 收藏操作已在进行中，跳过重复请求')
      return
    }
    
    pendingRequests.add(requestKey)
    
    try {
      const response = await API.homestay.toggleCollect(homestayId, action)
      if (response) {
        // 更新本地收藏状态
        if (action === 'collect') {
          // 这里需要获取民宿详情来添加到收藏列表
          // 实际项目中可能需要从其他地方获取民宿信息
          console.log('收藏成功，需要更新本地状态')
        } else {
          removeFromFavorites(homestayId)
        }
        return response
      } else {
        throw new Error('操作失败')
      }
    } catch (error) {
      console.error('切换收藏状态失败:', error)
      throw error
    } finally {
      pendingRequests.delete(requestKey)
    }
  }

  // 批量操作收藏
  const batchToggleFavorites = async (homestayIds, action) => {
    const promises = homestayIds.map(id => 
      toggleCollectStatus(id, action)
    )
    
    try {
      await Promise.all(promises)
      return true
    } catch (error) {
      console.error('批量收藏操作失败:', error)
      throw error
    }
  }

  return {
    // State
    favoriteHomestays,
    isFavoriteLoading,
    
    // Computed
    favoriteIds,
    favoriteCount,
    
    // Actions
    setFavoriteHomestays,
    setFavoriteLoading,
    addToFavorites,
    removeFromFavorites,
    toggleFavorite,
    isFavorite,
    clearFavorites,
    fetchCollectList,
    toggleCollectStatus,
    batchToggleFavorites
  }
})
