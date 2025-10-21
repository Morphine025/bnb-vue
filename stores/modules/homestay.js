/**
 * 民宿模块状态管理
 * 功能描述：管理民宿相关的所有状态
 * 主要功能：民宿列表、详情、筛选条件、收藏状态
 */

import { defineStore } from 'pinia'
import { ref, computed, shallowRef } from 'vue'
import { API } from '../../api'
import { processHomestayImages, debounce, throttle, createVirtualList } from '../../utils'
import { useLoadingStore } from './loading'
import { useCacheStore } from './cache'
import { useStateSyncStore } from './state-sync'
import { useValidationStore } from './validation'

export const useHomestayStore = defineStore('homestay', () => {
  // 使用统一的loading管理
  const loadingStore = useLoadingStore()
  const cacheStore = useCacheStore()
  const stateSyncStore = useStateSyncStore()
  const validationStore = useValidationStore()
  
  // 民宿列表数据 - 使用ref确保响应性
  const homestayList = ref([])
  const currentPage = ref(1)
  const pageSize = ref(10)
  const hasMore = ref(true)

  // 民宿详情数据
  const homestayDetail = ref(null)
  const isDetailLoading = ref(false)

  // 筛选条件
  const filterConditions = ref({
    location: '', // 位置
    priceRange: [0, 10000], // 价格范围
    roomType: '', // 房间类型
    facilities: [], // 设施
    rating: 0, // 评分
    sortBy: 'default', // 排序方式：default, price_asc, price_desc, rating
    checkInDate: '',
    checkOutDate: '',
    guests: 1
  })

  // 收藏的民宿
  const favoriteHomestays = ref([])
  const isFavoriteLoading = ref(false)

  /**
   * 处理后的民宿列表
   * @description 使用computed缓存映射结果，避免重复计算，提升性能
   * @type {ComputedRef<Array>}
   */
  const processedHomestayList = computed(() => {
    console.log('🔄 processedHomestayList 计算中，原始数据长度:', homestayList.value.length)
    
    // 使用浅拷贝避免深度响应式，提升性能
    const processed = homestayList.value.map((item, index) => {
      // 处理图片URL，确保使用HTTPS
      const processedItem = processHomestayImages(item)
      
      return {
        ...processedItem,
        id: processedItem.homestayId || processedItem.id || `item_${index}`,
        img: processedItem.images && processedItem.images.length > 0 
          ? processedItem.images[0] 
          : `https://picsum.photos/400/300?random=${index}`,
        likes: processedItem.likeCount || 0,
        supports: processedItem.viewCount || 0,
        avatar: processedItem.avatar || '/static/logo.png',
        userId: processedItem.userId || processedItem.authorId || null,
        stats: processedItem.stats || null
      }
    })
    
    console.log('✅ processedHomestayList 处理完成，处理后数据长度:', processed.length)
    return processed
  })

  /**
   * 筛选后的民宿列表
   * @description 根据筛选条件过滤和排序民宿列表，使用优化的过滤逻辑
   * @type {ComputedRef<Array>}
   */
  const filteredList = computed(() => {
    let filtered = [...processedHomestayList.value]
    
    // 位置筛选 - 使用includes进行模糊匹配
    if (filterConditions.value.location) {
      filtered = filtered.filter(item => 
        item.location?.toLowerCase().includes(filterConditions.value.location.toLowerCase())
      )
    }
    
    // 价格筛选 - 范围筛选
    const [minPrice, maxPrice] = filterConditions.value.priceRange
    filtered = filtered.filter(item => 
      item.price >= minPrice && item.price <= maxPrice
    )
    
    // 房间类型筛选 - 精确匹配
    if (filterConditions.value.roomType) {
      filtered = filtered.filter(item => 
        item.roomType === filterConditions.value.roomType
      )
    }
    
    // 设施筛选 - 所有选中的设施都必须包含
    if (filterConditions.value.facilities.length > 0) {
      filtered = filtered.filter(item => 
        filterConditions.value.facilities.every(facility => 
          item.facilities?.includes(facility)
        )
      )
    }
    
    // 评分筛选 - 大于等于指定评分
    if (filterConditions.value.rating > 0) {
      filtered = filtered.filter(item => 
        (item.rating || 0) >= filterConditions.value.rating
      )
    }
    
    // 排序 - 使用稳定的排序算法
    switch (filterConditions.value.sortBy) {
      case 'price_asc':
        filtered.sort((a, b) => (a.price || 0) - (b.price || 0))
        break
      case 'price_desc':
        filtered.sort((a, b) => (b.price || 0) - (a.price || 0))
        break
      case 'rating':
        filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0))
        break
      default:
        // 默认排序保持原有顺序
        break
    }
    
    console.log(`✅ 筛选完成: ${filtered.length} 条结果`)
    return filtered
  })

  /**
   * 收藏的民宿ID列表
   * @description 快速查找收藏状态的ID列表
   * @type {ComputedRef<Array>}
   */
  const favoriteIds = computed(() => 
    favoriteHomestays.value.map(item => item.id)
  )

  // 虚拟滚动相关状态
  const virtualListConfig = ref({
    itemHeight: 200, // 单个民宿卡片高度
    containerHeight: 600, // 容器高度
    bufferSize: 5, // 缓冲区大小
    enableSmoothScroll: true // 启用平滑滚动
  })

  /**
   * 创建虚拟列表实例
   * @description 为大数据量列表创建虚拟滚动实例
   * @param {Object} config - 虚拟列表配置
   * @returns {Object} 虚拟列表实例
   */
  const createVirtualListInstance = (config = {}) => {
    const finalConfig = { ...virtualListConfig.value, ...config }
    return createVirtualList(filteredList.value, finalConfig)
  }

  /**
   * 防抖加载更多民宿
   * @description 使用防抖优化加载更多操作，避免频繁请求
   * @type {Function}
   */
  const debouncedLoadMore = debounce(loadMoreHomestays, 300, {
    leading: false,
    trailing: true
  })

  /**
   * 节流刷新列表
   * @description 使用节流优化刷新操作，避免频繁刷新
   * @type {Function}
   */
  const throttledRefresh = throttle(refreshHomestayList, 1000, {
    leading: true,
    trailing: false
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
    loadingStore.setLoading('homestay-list', loading)
  }

  const setHomestayDetail = (detail) => {
    homestayDetail.value = detail
  }

  const setDetailLoading = (loading) => {
    isDetailLoading.value = loading
  }

  const setFilterConditions = (conditions) => {
    filterConditions.value = { ...filterConditions.value, ...conditions }
  }

  const resetFilterConditions = () => {
    filterConditions.value = {
      location: '',
      priceRange: [0, 10000],
      roomType: '',
      facilities: [],
      rating: 0,
      sortBy: 'default',
      checkInDate: '',
      checkOutDate: '',
      guests: 1
    }
  }

  const setFavoriteHomestays = (favorites) => {
    favoriteHomestays.value = favorites
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

  const clearHomestayList = () => {
    homestayList.value = []
    currentPage.value = 1
    hasMore.value = true
  }

  const loadMoreHomestays = async () => {
    console.log('🚀 loadMoreHomestays 被调用')
    console.log('   - isLoading:', loadingStore.isLoading('homestay-list'))
    console.log('   - hasMore:', hasMore.value)
    console.log('   - currentPage:', currentPage.value)
    console.log('   - homestayList.length:', homestayList.value.length)
    
    if (loadingStore.isLoading('homestay-list') || !hasMore.value) {
      console.log('⚠️ 跳过加载: isLoading=', loadingStore.isLoading('homestay-list'), ', hasMore=', hasMore.value)
      return
    }
    
    // 请求去重 - 防止重复请求
    const requestKey = `loadMore_${currentPage.value + 1}_${JSON.stringify(filterConditions.value)}`
    if (!loadingStore.addPendingRequest(requestKey)) {
      console.log('⚠️ 请求已在进行中，跳过重复请求')
      return
    }
    
    setLoading(true)
    
    try {
      // 调用真实API获取数据 - 修复：如果是首次加载，请求第1页
      const pageToLoad = homestayList.value.length === 0 ? 1 : currentPage.value + 1
      console.log('📡 准备请求第', pageToLoad, '页数据')
      
      // 检查缓存
      const cacheKey = `homestay-list-${pageToLoad}-${JSON.stringify(filterConditions.value)}`
      const cachedData = cacheStore.getCache(cacheKey, { dataType: 'homestay-list' })
      if (cachedData) {
        console.log('✅ 使用缓存的民宿列表数据')
        // 验证缓存数据
        const validatedCachedData = validationStore.validateApiResponseData(cachedData, 'homestay')
        const newList = validatedCachedData.list || []
        if (newList.length > 0) {
          appendHomestayList(newList)
          setCurrentPage(pageToLoad)
          setHasMore(validatedCachedData.hasMore || false)
        }
        return
      }
      
      // 验证搜索参数
      const validatedParams = validationStore.validateSearchParams({
        page: pageToLoad,
        size: pageSize.value,
        ...filterConditions.value
      })
      
      const response = await API.homestay.getHomeList(validatedParams)
      
      console.log('📡 API响应:', response)
      
      // 验证API响应数据
      const validatedResponse = validationStore.validateApiResponseData(response, 'homestay')
      if (validatedResponse) {
        const newList = validatedResponse.list || []
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
          
          // 缓存数据
          const cacheData = {
            list: uniqueNewList,
            hasMore: newList.length === pageSize.value,
            page: pageToLoad,
            filterConditions: filterConditions.value
          }
          cacheStore.setCache(cacheKey, cacheData, { dataType: 'homestay-list' })
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
      loadingStore.removePendingRequest(requestKey)
    }
  }

  const refreshHomestayList = async () => {
    clearHomestayList()
    await loadMoreHomestays()
  }

  // 获取民宿详情
  const fetchHomestayDetail = async (homestayId) => {
    setDetailLoading(true)
    try {
      const response = await API.homestay.getDetail(homestayId)
      if (response && response.code === 1) {
        setHomestayDetail(response.data)
        return response.data
      } else {
        throw new Error(response?.msg || '获取民宿详情失败')
      }
    } catch (error) {
      console.error('获取民宿详情失败:', error)
      throw error
    } finally {
      setDetailLoading(false)
    }
  }

  // 切换点赞状态
  const toggleLikeStatus = async (homestayId, action) => {
    try {
      const response = await API.homestay.toggleLike(homestayId, action)
      if (response && response.code === 1) {
        // 更新本地列表中的点赞状态
        const index = homestayList.value.findIndex(item => item.id === homestayId)
        if (index > -1) {
          if (action === 'like') {
            homestayList.value[index].likes = (homestayList.value[index].likes || 0) + 1
            homestayList.value[index].isLiked = true
          } else {
            homestayList.value[index].likes = Math.max((homestayList.value[index].likes || 0) - 1, 0)
            homestayList.value[index].isLiked = false
          }
        }
        
        // 通知状态同步
        stateSyncStore.addToSyncQueue({
          type: 'homestay-like',
          data: {
            homestayId,
            liked: action === 'like',
            likeCount: homestayList.value[index]?.likes || 0
          }
        })
        
        return response.data
      } else {
        throw new Error(response?.msg || '操作失败')
      }
    } catch (error) {
      console.error('切换点赞状态失败:', error)
      throw error
    }
  }

  // 切换收藏状态
  const toggleCollectStatus = async (homestayId, action) => {
    try {
      const response = await API.homestay.toggleCollect(homestayId, action)
      if (response && response.code === 1) {
        // 更新本地列表中的收藏状态
        const index = homestayList.value.findIndex(item => item.id === homestayId)
        if (index > -1) {
          if (action === 'collect') {
            homestayList.value[index].supports = (homestayList.value[index].supports || 0) + 1
            homestayList.value[index].isCollected = true
          } else {
            homestayList.value[index].supports = Math.max((homestayList.value[index].supports || 0) - 1, 0)
            homestayList.value[index].isCollected = false
          }
        }
        
        // 通知状态同步
        stateSyncStore.addToSyncQueue({
          type: 'homestay-collect',
          data: {
            homestayId,
            collected: action === 'collect'
          }
        })
        
        return response.data
      } else {
        throw new Error(response?.msg || '操作失败')
      }
    } catch (error) {
      console.error('切换收藏状态失败:', error)
      throw error
    }
  }

  // 获取收藏列表
  const fetchCollectList = async (page = 1, size = 10) => {
    setFavoriteLoading(true)
    try {
      const response = await API.user.getCollectList({ page, size })
      if (response && response.code === 1) {
        const collectList = response.data.list || []
        setFavoriteHomestays(collectList)
        return collectList
      } else {
        throw new Error(response?.msg || '获取收藏列表失败')
      }
    } catch (error) {
      console.error('获取收藏列表失败:', error)
      throw error
    } finally {
      setFavoriteLoading(false)
    }
  }

  // 获取我的发布列表
  const fetchMyHomestayList = async (page = 1, size = 10) => {
    setLoading(true)
    try {
      const response = await API.user.getMyList({ page, size })
      if (response && response.code === 1) {
        const myList = response.data.list || []
        return myList
      } else {
        throw new Error(response?.msg || '获取我的发布列表失败')
      }
    } catch (error) {
      console.error('获取我的发布列表失败:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  // 发布民宿
  const publishNewHomestay = async (homestayData) => {
    setLoading(true)
    try {
      const response = await API.homestay.publish(homestayData)
      if (response && response.code === 1) {
        return response.data
      } else {
        throw new Error(response?.msg || '发布失败')
      }
    } catch (error) {
      console.error('发布民宿失败:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  // 更新民宿
  const updateHomestayInfo = async (homestayId, homestayData) => {
    setLoading(true)
    try {
      const response = await API.homestay.update(homestayId, homestayData)
      if (response && response.code === 1) {
        return response.data
      } else {
        throw new Error(response?.msg || '更新失败')
      }
    } catch (error) {
      console.error('更新民宿失败:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  // 删除民宿
  const deleteHomestayInfo = async (homestayId) => {
    setLoading(true)
    try {
      const response = await API.homestay.delete(homestayId)
      if (response && response.code === 1) {
        return response.data
      } else {
        throw new Error(response?.msg || '删除失败')
      }
    } catch (error) {
      console.error('删除民宿失败:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  // 上架民宿
  const onlineHomestayInfo = async (homestayId) => {
    setLoading(true)
    try {
      const response = await API.homestay.online(homestayId)
      if (response && response.code === 1) {
        return response.data
      } else {
        throw new Error(response?.msg || '上架失败')
      }
    } catch (error) {
      console.error('上架民宿失败:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  // 下架民宿
  const offlineHomestayInfo = async (homestayId) => {
    setLoading(true)
    try {
      const response = await API.homestay.offline(homestayId)
      if (response && response.code === 1) {
        return response.data
      } else {
        throw new Error(response?.msg || '下架失败')
      }
    } catch (error) {
      console.error('下架民宿失败:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  return {
    // State
    homestayList,
    currentPage,
    pageSize,
    hasMore,
    isLoading,
    homestayDetail,
    isDetailLoading,
    filterConditions,
    favoriteHomestays,
    isFavoriteLoading,
    
    // Computed
    processedHomestayList,
    filteredList,
    favoriteIds,
    
    // Virtual List
    virtualListConfig,
    createVirtualListInstance,
    debouncedLoadMore,
    throttledRefresh,
    
    // Actions
    setHomestayList,
    appendHomestayList,
    setCurrentPage,
    setHasMore,
    setLoading,
    setHomestayDetail,
    setDetailLoading,
    setFilterConditions,
    resetFilterConditions,
    setFavoriteHomestays,
    addToFavorites,
    removeFromFavorites,
    toggleFavorite,
    isFavorite,
    clearHomestayList,
    loadMoreHomestays,
    refreshHomestayList,
    
    // API Methods
    fetchHomestayDetail,
    toggleLikeStatus,
    toggleCollectStatus,
    fetchCollectList,
    fetchMyHomestayList,
    publishNewHomestay,
    updateHomestayInfo,
    deleteHomestayInfo,
    onlineHomestayInfo,
    offlineHomestayInfo
  }
})
