/**
 * 民宿详情管理Store
 * 功能描述：管理民宿详情相关的状态和操作
 * 主要功能：详情获取、状态管理、数据缓存等
 */

import { defineStore } from 'pinia'
import { ref } from 'vue'
import { API } from '../../../api'

export const useHomestayDetailStore = defineStore('homestayDetail', () => {
  // 民宿详情数据
  const homestayDetail = ref(null)
  const isDetailLoading = ref(false)
  
  // 详情缓存
  const detailCache = new Map()

  // Actions
  const setHomestayDetail = (detail) => {
    homestayDetail.value = detail
  }

  const setDetailLoading = (loading) => {
    isDetailLoading.value = loading
  }

  const clearHomestayDetail = () => {
    homestayDetail.value = null
  }

  // 获取民宿详情
  const fetchHomestayDetail = async (homestayId) => {
    // 检查缓存
    if (detailCache.has(homestayId)) {
      const cachedDetail = detailCache.get(homestayId)
      setHomestayDetail(cachedDetail)
      return cachedDetail
    }

    setDetailLoading(true)
    try {
      const response = await API.homestay.getDetail(homestayId)
      if (response) {
        setHomestayDetail(response)
        // 缓存详情数据
        detailCache.set(homestayId, response)
        return response
      } else {
        throw new Error('获取民宿详情失败')
      }
    } catch (error) {
      console.error('获取民宿详情失败:', error)
      throw error
    } finally {
      setDetailLoading(false)
    }
  }

  // 清除缓存
  const clearDetailCache = () => {
    detailCache.clear()
  }

  // 清除特定缓存
  const clearDetailCacheById = (homestayId) => {
    detailCache.delete(homestayId)
  }

  return {
    // State
    homestayDetail,
    isDetailLoading,
    
    // Actions
    setHomestayDetail,
    setDetailLoading,
    clearHomestayDetail,
    fetchHomestayDetail,
    clearDetailCache,
    clearDetailCacheById
  }
})
