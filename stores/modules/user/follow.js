/**
 * 用户关注管理Store
 * 功能描述：管理用户关注相关的状态和操作
 * 主要功能：关注列表、粉丝列表、关注操作等
 */

import { defineStore } from 'pinia'
import { ref } from 'vue'
import { API } from '../../../api'

export const useUserFollowStore = defineStore('userFollow', () => {
  // 关注列表
  const followList = ref([])
  const isFollowListLoading = ref(false)
  
  // 粉丝列表
  const fansList = ref([])
  const isFansListLoading = ref(false)
  
  // 请求去重机制
  const pendingRequests = new Set()

  // Actions
  const setFollowList = (list) => {
    followList.value = list
  }

  const setFansList = (list) => {
    fansList.value = list
  }

  const setFollowListLoading = (loading) => {
    isFollowListLoading.value = loading
  }

  const setFansListLoading = (loading) => {
    isFansListLoading.value = loading
  }

  // 获取关注列表
  const fetchFollowList = async (page = 1, size = 10) => {
    setFollowListLoading(true)
    try {
      const response = await API.user.getFollowList({ page, size })
      const rawList = response && response.data && response.data.list ? response.data.list : []
      const normalized = rawList.map(item => ({
        ...item,
        followUserId: item.followUserId || item.userId || item.followeeUserId || item.fanUserId || item.id,
        followUserAvatar: item.followUserAvatar || item.avatar || item.avatarUrl || item.userAvatar,
        followUserNickname: item.followUserNickname || item.nickname || item.nickName || item.userNickname
      }))
      setFollowList(normalized)
      return normalized
    } catch (error) {
      console.error('获取关注列表失败:', error)
      throw error
    } finally {
      setFollowListLoading(false)
    }
  }

  // 获取粉丝列表
  const fetchFansList = async (page = 1, size = 10) => {
    setFansListLoading(true)
    try {
      const response = await API.user.getFansList({ page, size })
      const rawList = response && response.data && response.data.list ? response.data.list : []
      const normalized = rawList.map(item => ({
        ...item,
        fanUserId: item.fanUserId || item.userId || item.followerUserId || item.followUserId || item.id,
        followUserAvatar: item.followUserAvatar || item.avatar || item.avatarUrl || item.userAvatar,
        followUserNickname: item.followUserNickname || item.nickname || item.nickName || item.userNickname
      }))
      setFansList(normalized)
      return normalized
    } catch (error) {
      console.error('获取粉丝列表失败:', error)
      throw error
    } finally {
      setFansListLoading(false)
    }
  }

  // 切换关注状态
  const toggleFollowUser = async (userId, action) => {
    // 请求去重
    const requestKey = `follow_${userId}_${action}`
    if (pendingRequests.has(requestKey)) {
      console.log('⚠️ 关注操作已在进行中，跳过重复请求')
      return
    }
    
    pendingRequests.add(requestKey)
    
    try {
      const response = await API.user.toggleFollow(userId, action)
      if (response) {
        // 更新本地列表状态
        if (action === 'follow') {
          // 添加到关注列表（需要获取用户信息）
          console.log('关注成功，需要更新本地状态')
        } else {
          // 从关注列表移除
          const index = followList.value.findIndex(item => item.id === userId)
          if (index > -1) {
            followList.value.splice(index, 1)
          }
        }
        return response
      } else {
        throw new Error('操作失败')
      }
    } catch (error) {
      console.error('切换关注状态失败:', error)
      throw error
    } finally {
      pendingRequests.delete(requestKey)
    }
  }

  // 检查关注状态
  const checkUserFollowStatus = async (userId) => {
    try {
      const response = await API.user.checkFollowStatus(userId)
      if (response) {
        return response.isFollowing
      } else {
        return false
      }
    } catch (error) {
      console.error('检查关注状态失败:', error)
      return false
    }
  }

  // 移除粉丝
  const removeUserFan = async (userId) => {
    try {
      const response = await API.user.removeFan(userId)
      if (response) {
        // 从粉丝列表移除
        const index = fansList.value.findIndex(item => item.id === userId)
        if (index > -1) {
          fansList.value.splice(index, 1)
        }
        return response
      } else {
        throw new Error('移除粉丝失败')
      }
    } catch (error) {
      console.error('移除粉丝失败:', error)
      throw error
    }
  }

  // 批量关注/取消关注
  const batchToggleFollow = async (userIds, action) => {
    const promises = userIds.map(id => 
      toggleFollowUser(id, action)
    )
    
    try {
      await Promise.all(promises)
      return true
    } catch (error) {
      console.error('批量关注操作失败:', error)
      throw error
    }
  }

  // 清空列表
  const clearFollowList = () => {
    followList.value = []
  }

  const clearFansList = () => {
    fansList.value = []
  }

  return {
    // State
    followList,
    isFollowListLoading,
    fansList,
    isFansListLoading,
    
    // Actions
    setFollowList,
    setFansList,
    setFollowListLoading,
    setFansListLoading,
    fetchFollowList,
    fetchFansList,
    toggleFollowUser,
    checkUserFollowStatus,
    removeUserFan,
    batchToggleFollow,
    clearFollowList,
    clearFansList
  }
})
