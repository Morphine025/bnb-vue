/**
 * 用户模块状态管理
 * 功能描述：管理用户相关的所有状态
 * 主要功能：用户信息、登录状态、用户统计、用户设置
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { API } from '../../api'

export const useUserStore = defineStore('user', () => {
  // 用户基本信息
  const userInfo = ref(null)
  const isLoggedIn = computed(() => !!userInfo.value)
  
  // 请求去重机制
  const pendingRequests = new Set()
  
  // 用户统计数据
  const userStats = ref({
    followers: 0,
    following: 0,
    homestays: 0,
    likes: 0,
    views: 0
  })
  
  // 用户设置
  const userSettings = ref({
    notifications: true,
    privacy: 'public',
    language: 'zh-CN',
    theme: 'light'
  })
  
  // 登录状态
  const loginStatus = ref({
    isLoggingIn: false,
    lastLoginTime: null,
    loginError: null
  })
  
  // Actions
  const setUserInfo = (info) => {
    userInfo.value = info
    // 持久化到本地存储
    if (info) {
      uni.setStorageSync('userInfo', JSON.stringify(info))
    } else {
      uni.removeStorageSync('userInfo')
    }
  }
  
  const setUserStats = (stats) => {
    userStats.value = { ...userStats.value, ...stats }
  }
  
  const setUserSettings = (settings) => {
    userSettings.value = { ...userSettings.value, ...settings }
    // 持久化设置
    uni.setStorageSync('userSettings', JSON.stringify(userSettings.value))
  }
  
  const setLoginStatus = (status) => {
    loginStatus.value = { ...loginStatus.value, ...status }
  }
  
  // 获取用户信息
  const fetchUserInfo = async () => {
    try {
      setLoginStatus({ isLoggingIn: true, loginError: null })
      
      const response = await API.user.getInfo()
      if (response && response.code === 1) {
        setUserInfo(response.data)
        return response.data
      } else {
        throw new Error(response?.msg || '获取用户信息失败')
      }
    } catch (error) {
      console.error('获取用户信息失败:', error)
      setLoginStatus({ loginError: error.message })
      throw error
    } finally {
      setLoginStatus({ isLoggingIn: false })
    }
  }
  
  // 更新用户信息
  const updateUser = async (data) => {
    try {
      const response = await API.user.updateInfo(data)
      if (response && response.code === 1) {
        // 更新本地用户信息
        const updatedInfo = { ...userInfo.value, ...data }
        setUserInfo(updatedInfo)
        return response.data
      } else {
        throw new Error(response?.msg || '更新用户信息失败')
      }
    } catch (error) {
      console.error('更新用户信息失败:', error)
      throw error
    }
  }
  
  // 获取用户统计
  const fetchUserStats = async () => {
    try {
      const response = await API.user.getStats()
      if (response && response.code === 1) {
        setUserStats(response.data)
        return response.data
      }
    } catch (error) {
      console.error('获取用户统计失败:', error)
    }
  }
  
  // 登录
  const performLogin = async (loginData) => {
    try {
      setLoginStatus({ isLoggingIn: true, loginError: null })
      
      // 调用真实登录API
      const response = await API.user.login(loginData.code, loginData.avatarUrl, loginData.nickName)
      
      if (response && response.code === 1) {
        // 保存token
        const token = response.data.token
        uni.setStorageSync('token', token)
        
        // 获取用户信息
        const userData = await fetchUserInfo()
        setUserInfo(userData)
        setLoginStatus({ 
          isLoggingIn: false, 
          lastLoginTime: new Date().toISOString() 
        })
        
        return userData
      } else {
        throw new Error(response?.msg || '登录失败')
      }
    } catch (error) {
      console.error('登录失败:', error)
      setLoginStatus({ 
        isLoggingIn: false, 
        loginError: error.message 
      })
      throw error
    }
  }
  
  // 登出
  const logout = () => {
    setUserInfo(null)
    setUserStats({
      followers: 0,
      following: 0,
      homestays: 0,
      likes: 0,
      views: 0
    })
    setLoginStatus({
      isLoggingIn: false,
      lastLoginTime: null,
      loginError: null
    })
    
    // 清除本地存储
    uni.removeStorageSync('token')
    uni.removeStorageSync('userInfo')
  }
  
  // 初始化用户数据
  const initializeUser = async () => {
    try {
      // 从本地存储恢复用户信息
      const localUserInfo = uni.getStorageSync('userInfo')
      if (localUserInfo) {
        const user = JSON.parse(localUserInfo)
        setUserInfo(user)
      }
      
      // 从本地存储恢复用户设置
      const localSettings = uni.getStorageSync('userSettings')
      if (localSettings) {
        const settings = JSON.parse(localSettings)
        setUserSettings(settings)
      }
      
      // 如果已登录，获取最新用户信息
      if (isLoggedIn.value) {
        await fetchUserInfo()
        await fetchUserStats()
      }
    } catch (error) {
      console.error('初始化用户数据失败:', error)
    }
  }

  // 获取其他用户信息
  const fetchUserInfoById = async (userId) => {
    try {
      const response = await API.user.getInfoById(userId)
      if (response && response.code === 1) {
        return response.data
      } else {
        throw new Error(response?.msg || '获取用户信息失败')
      }
    } catch (error) {
      console.error('获取用户信息失败:', error)
      throw error
    }
  }

  // 获取关注列表
  const fetchFollowList = async (page = 1, size = 10) => {
    try {
      const response = await API.user.getFollowList({ page, size })
      if (response && response.code === 1) {
        return response.data.list || []
      } else {
        throw new Error(response?.msg || '获取关注列表失败')
      }
    } catch (error) {
      console.error('获取关注列表失败:', error)
      throw error
    }
  }

  // 获取粉丝列表
  const fetchFansList = async (page = 1, size = 10) => {
    try {
      const response = await API.user.getFansList({ page, size })
      if (response && response.code === 1) {
        return response.data.list || []
      } else {
        throw new Error(response?.msg || '获取粉丝列表失败')
      }
    } catch (error) {
      console.error('获取粉丝列表失败:', error)
      throw error
    }
  }

  // 切换关注状态
  const toggleFollowUser = async (userId, action) => {
    try {
      const response = await API.user.toggleFollow(userId, action)
      if (response && response.code === 1) {
        return response.data
      } else {
        throw new Error(response?.msg || '操作失败')
      }
    } catch (error) {
      console.error('切换关注状态失败:', error)
      throw error
    }
  }

  // 检查关注状态
  const checkUserFollowStatus = async (userId) => {
    try {
      const response = await API.user.checkFollowStatus(userId)
      if (response && response.code === 1) {
        return response.data.isFollowing
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
      if (response && response.code === 1) {
        return response.data
      } else {
        throw new Error(response?.msg || '移除粉丝失败')
      }
    } catch (error) {
      console.error('移除粉丝失败:', error)
      throw error
    }
  }
  
  return {
    // State
    userInfo,
    userStats,
    userSettings,
    loginStatus,
    
    // Computed
    isLoggedIn,
    
    // Actions
    setUserInfo,
    setUserStats,
    setUserSettings,
    setLoginStatus,
    fetchUserInfo,
    updateUser,
    fetchUserStats,
    performLogin,
    logout,
    initializeUser,
    
    // API Methods
    fetchUserInfoById,
    fetchFollowList,
    fetchFansList,
    toggleFollowUser,
    checkUserFollowStatus,
    removeUserFan
  }
})
