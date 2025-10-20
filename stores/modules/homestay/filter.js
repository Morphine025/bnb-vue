/**
 * 民宿筛选管理Store
 * 功能描述：管理民宿筛选相关的状态和操作
 * 主要功能：筛选条件、排序、地区筛选等
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { API } from '../../../api'

export const useHomestayFilterStore = defineStore('homestayFilter', () => {
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
    guests: 1,
    province: '', // 省份
    city: '', // 城市
    district: '' // 区县
  })

  // 地区数据
  const regionData = ref({
    provinces: [],
    cities: [],
    districts: []
  })

  // 设施选项
  const facilityOptions = ref([
    { value: 'wifi', label: 'WiFi' },
    { value: 'parking', label: '停车位' },
    { value: 'kitchen', label: '厨房' },
    { value: 'washing', label: '洗衣机' },
    { value: 'air_conditioning', label: '空调' },
    { value: 'heating', label: '暖气' },
    { value: 'tv', label: '电视' },
    { value: 'refrigerator', label: '冰箱' }
  ])

  // 房间类型选项
  const roomTypeOptions = ref([
    { value: 'single', label: '单人间' },
    { value: 'double', label: '双人间' },
    { value: 'suite', label: '套房' },
    { value: 'apartment', label: '公寓' },
    { value: 'house', label: '整栋房屋' }
  ])

  // 排序选项
  const sortOptions = ref([
    { value: 'default', label: '默认排序' },
    { value: 'price_asc', label: '价格从低到高' },
    { value: 'price_desc', label: '价格从高到低' },
    { value: 'rating', label: '评分排序' },
    { value: 'newest', label: '最新发布' }
  ])

  // 计算属性
  const hasActiveFilters = computed(() => {
    const conditions = filterConditions.value
    return !!(
      conditions.location ||
      conditions.priceRange[0] > 0 ||
      conditions.priceRange[1] < 10000 ||
      conditions.roomType ||
      conditions.facilities.length > 0 ||
      conditions.rating > 0 ||
      conditions.sortBy !== 'default' ||
      conditions.province ||
      conditions.city ||
      conditions.district
    )
  })

  const activeFilterCount = computed(() => {
    let count = 0
    const conditions = filterConditions.value
    
    if (conditions.location) count++
    if (conditions.priceRange[0] > 0 || conditions.priceRange[1] < 10000) count++
    if (conditions.roomType) count++
    if (conditions.facilities.length > 0) count++
    if (conditions.rating > 0) count++
    if (conditions.sortBy !== 'default') count++
    if (conditions.province) count++
    if (conditions.city) count++
    if (conditions.district) count++
    
    return count
  })

  // Actions
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
      guests: 1,
      province: '',
      city: '',
      district: ''
    }
  }

  const setRegionData = (data) => {
    regionData.value = { ...regionData.value, ...data }
  }

  // 根据地区筛选民宿
  const filterByRegion = async (params = {}) => {
    try {
      const response = await API.homestay.filterByRegion({
        ...filterConditions.value,
        ...params
      })
      return response
    } catch (error) {
      console.error('地区筛选失败:', error)
      throw error
    }
  }

  // 应用筛选条件到列表
  const applyFiltersToList = (list) => {
    let filtered = [...list]
    const conditions = filterConditions.value
    
    // 位置筛选
    if (conditions.location) {
      filtered = filtered.filter(item => 
        item.location?.includes(conditions.location)
      )
    }
    
    // 价格筛选
    const [minPrice, maxPrice] = conditions.priceRange
    filtered = filtered.filter(item => 
      item.price >= minPrice && item.price <= maxPrice
    )
    
    // 房间类型筛选
    if (conditions.roomType) {
      filtered = filtered.filter(item => 
        item.roomType === conditions.roomType
      )
    }
    
    // 设施筛选
    if (conditions.facilities.length > 0) {
      filtered = filtered.filter(item => 
        conditions.facilities.every(facility => 
          item.facilities?.includes(facility)
        )
      )
    }
    
    // 评分筛选
    if (conditions.rating > 0) {
      filtered = filtered.filter(item => 
        item.rating >= conditions.rating
      )
    }
    
    // 排序
    switch (conditions.sortBy) {
      case 'price_asc':
        filtered.sort((a, b) => a.price - b.price)
        break
      case 'price_desc':
        filtered.sort((a, b) => b.price - a.price)
        break
      case 'rating':
        filtered.sort((a, b) => b.rating - a.rating)
        break
      case 'newest':
        filtered.sort((a, b) => new Date(b.createTime) - new Date(a.createTime))
        break
      default:
        // 默认排序保持原有顺序
        break
    }
    
    return filtered
  }

  return {
    // State
    filterConditions,
    regionData,
    facilityOptions,
    roomTypeOptions,
    sortOptions,
    
    // Computed
    hasActiveFilters,
    activeFilterCount,
    
    // Actions
    setFilterConditions,
    resetFilterConditions,
    setRegionData,
    filterByRegion,
    applyFiltersToList
  }
})
