/**
 * 民宿列表管理Store
 * 功能描述：管理民宿列表相关的状态和操作
 * 主要功能：列表加载、分页、筛选、排序等
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { API } from '../../../api'

export const useHomestayListStore = defineStore('homestayList', () => {
  // 民宿列表数据
  const homestayList = ref([])
  const currentPage = ref(1)
  const pageSize = ref(10)
  const hasMore = ref(true)
  const isLoading = ref(false)
  
  // 请求去重机制
  const pendingRequests = new Set()

  // 数据映射缓存 - 使用computed缓存映射结果，避免重复计算
  const processedHomestayList = computed(() => {
    console.log('🔄 processedHomestayList 计算中，原始数据长度:', homestayList.value.length)
    const processed = homestayList.value.map((item, index) => ({
      ...item,
      id: item.homestayId || item.id || `item_${index}`,
      img: item.images && item.images.length > 0 
        ? item.images[0] 
        : `https://picsum.photos/400/300?random=${index}`,
      likes: item.likeCount || 0,
      supports: item.viewCount || 0,
      avatar: item.avatar || '/static/logo.png',
      userId: item.userId || item.authorId || null,
      stats: item.stats || null
    }))
    console.log('✅ processedHomestayList 处理完成，处理后数据长度:', processed.length)
    return processed
  })

  // Actions
  const setHomestayList = (list) => {
    homestayList.value = list
  }

  const appendHomestayList = (list) => {
    homestayList.value.push(...list)
  }

  const setCurrentPage = (page) => {
    currentPage.value = page
  }

  const setHasMore = (value) => {
    hasMore.value = value
  }

  const setLoading = (loading) => {
    isLoading.value = loading
  }

  const clearHomestayList = () => {
    homestayList.value = []
    currentPage.value = 1
    hasMore.value = true
  }

  // 加载更多民宿
  const loadMoreHomestays = async () => {
    console.log('🚀 loadMoreHomestays 被调用')
    console.log('   - isLoading:', isLoading.value)
    console.log('   - hasMore:', hasMore.value)
    console.log('   - currentPage:', currentPage.value)
    console.log('   - homestayList.length:', homestayList.value.length)
    
    if (isLoading.value || !hasMore.value) {
      console.log('⚠️ 跳过加载: isLoading=', isLoading.value, ', hasMore=', hasMore.value)
      return
    }
    
    // 请求去重 - 防止重复请求
    const requestKey = `loadMore_${currentPage.value + 1}`
    if (pendingRequests.has(requestKey)) {
      console.log('⚠️ 请求已在进行中，跳过重复请求')
      return
    }
    
    pendingRequests.add(requestKey)
    setLoading(true)
    
    try {
      // 调用服务层获取数据
      const pageToLoad = homestayList.value.length === 0 ? 1 : currentPage.value + 1
      console.log('📡 准备请求第', pageToLoad, '页数据')
      
      const response = await API.homestay.getHomeList({
        page: pageToLoad,
        size: pageSize.value
      })
      
      console.log('📡 API响应:', response)
      console.log('📡 response.data:', response.data)
      console.log('📡 response.data 类型:', typeof response.data)
      
      if (response && response.data) {
        // 检查数据结构
        const newList = Array.isArray(response.data) ? response.data : (response.data.list || response.data.records || [])
        console.log('📡 API返回数据:', newList.length, '条')
        
        // 数据去重 - 避免重复数据
        const existingIds = new Set(homestayList.value.map(item => item.homestayId || item.id))
        const uniqueNewList = newList.filter(item => 
          !existingIds.has(item.homestayId || item.id)
        )
        console.log('🔄 去重后数据:', uniqueNewList.length, '条')
        
        if (uniqueNewList.length > 0) {
          // 直接添加原始数据，让computed处理映射
          appendHomestayList(uniqueNewList)
          console.log('✅ 数据已添加到homestayList，当前总数:', homestayList.value.length)
          // 修复：只有在不是首次加载时才增加页码
          if (homestayList.value.length > uniqueNewList.length) {
            setCurrentPage(currentPage.value + 1)
          } else {
            setCurrentPage(pageToLoad)
          }
        }
        
        setHasMore(newList.length === pageSize.value)
      } else {
        console.log('❌ API返回数据格式错误或为空')
        setHasMore(false)
      }
    } catch (error) {
      console.error('加载民宿列表失败:', error)
      throw error
    } finally {
      setLoading(false)
      pendingRequests.delete(requestKey)
    }
  }

  const refreshHomestayList = async () => {
    clearHomestayList()
    await loadMoreHomestays()
  }

  return {
    // State
    homestayList,
    currentPage,
    pageSize,
    hasMore,
    isLoading,
    
    // Computed
    processedHomestayList,
    
    // Actions
    setHomestayList,
    appendHomestayList,
    setCurrentPage,
    setHasMore,
    setLoading,
    clearHomestayList,
    loadMoreHomestays,
    refreshHomestayList
  }
})
