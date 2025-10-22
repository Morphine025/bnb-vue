/**
 * 用户统计管理Store
 * 功能描述：管理用户统计数据相关的状态和操作
 * 主要功能：粉丝数、关注数、发布数、点赞数等统计
 */

import { defineStore } from 'pinia'
import { ref } from 'vue'
import { API } from '../../../api'

export const useUserStatsStore = defineStore('userStats', () => {
  // 用户统计数据
  const userStats = ref({
    followers: 0,
    following: 0,
    homestays: 0,
    likes: 0,
    views: 0,
    collections: 0
  })
  
  // 加载状态
  const isStatsLoading = ref(false)

  // Actions
  const setUserStats = (stats) => {
    console.log('🔄 设置用户统计数据，原始数据:', stats)
    
    // 字段名映射：后端字段名 -> 前端字段名
    const fieldMapping = {
      fansCount: 'followers',
      followCount: 'following', 
      likeCount: 'likes',
      collectCount: 'collections',
      viewCount: 'views',
      postCount: 'homestays',
      // 兼容可能的其他字段名
      followers: 'followers',
      following: 'following',
      likes: 'likes',
      collections: 'collections',
      views: 'views',
      homestays: 'homestays'
    }
    
    // 转换字段名
    const mappedStats = {}
    Object.keys(stats).forEach(key => {
      const frontendKey = fieldMapping[key] || key
      mappedStats[frontendKey] = stats[key] || 0
    })
    
    console.log('✅ 字段名映射后的数据:', mappedStats)
    userStats.value = { ...userStats.value, ...mappedStats }
    
    // 保存到本地存储
    try {
      uni.setStorageSync('userStats', JSON.stringify(userStats.value))
      console.log('✅ 统计数据已保存到本地存储')
    } catch (error) {
      console.error('保存统计数据到本地存储失败:', error)
    }
    
    console.log('✅ 最终保存的统计数据:', userStats.value)
  }
  
  const setStatsLoading = (loading) => {
    isStatsLoading.value = loading
  }

  // 获取用户统计
  const fetchUserStats = async () => {
    setStatsLoading(true)
    try {
      const response = await API.user.getStats()
      console.log('🔍 fetchUserStats API响应:', response)
      
      if (response && response.data) {
        // 提取统计数据部分，而不是整个API响应
        const statsData = response.data
        console.log('✅ 提取的统计数据:', statsData)
        setUserStats(statsData)
        return statsData
      } else {
        throw new Error('获取用户统计失败')
      }
    } catch (error) {
      console.error('获取用户统计失败:', error)
      throw error
    } finally {
      setStatsLoading(false)
    }
  }

  // 更新统计数据的特定字段
  const updateStatsField = (field, value) => {
    if (userStats.value.hasOwnProperty(field)) {
      userStats.value[field] = value
    }
  }

  // 增加统计数据的特定字段
  const incrementStatsField = (field, increment = 1) => {
    if (userStats.value.hasOwnProperty(field)) {
      userStats.value[field] += increment
    }
  }

  // 减少统计数据的特定字段
  const decrementStatsField = (field, decrement = 1) => {
    if (userStats.value.hasOwnProperty(field)) {
      userStats.value[field] = Math.max(0, userStats.value[field] - decrement)
    }
  }

  // 重置统计数据
  const resetUserStats = () => {
    userStats.value = {
      followers: 0,
      following: 0,
      homestays: 0,
      likes: 0,
      views: 0,
      collections: 0
    }
  }

  return {
    // State
    userStats,
    isStatsLoading,
    
    // Actions
    setUserStats,
    setStatsLoading,
    fetchUserStats,
    updateStatsField,
    incrementStatsField,
    decrementStatsField,
    resetUserStats
  }
})
