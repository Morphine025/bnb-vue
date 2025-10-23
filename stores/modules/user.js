/**
 * 用户模块状态管理
 * 功能描述：管理用户相关的所有状态
 * 主要功能：用户信息、登录状态、用户统计、用户设置
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { API } from '../../api'
import { useLoadingStore } from './loading'
import { useCacheStore } from './cache'
import { validate, validateApiResponse, validateUserId, validatePhone, validateEmail } from '../../utils/security/dataValidator'

export const useUserStore = defineStore('user', () => {
  // 使用统一的loading管理
  const loadingStore = useLoadingStore()
  const cacheStore = useCacheStore()
  // 验证功能已合并到工具函数中
  
  // 用户基本信息
  const userInfo = ref(null)
  const isLoggedIn = computed(() => !!userInfo.value)
  
  // 用户统计数据 - 合并到userStore中统一管理
  const userStats = ref({
    followers: 0,
    following: 0,
    homestays: 0,
    likes: 0,
    views: 0,
    collections: 0
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
    const requestKey = 'fetch-user-info'
    if (!loadingStore.addPendingRequest(requestKey)) {
      console.log('获取用户信息请求已在进行中')
      return
    }
    
    loadingStore.setLoading('user-info', true)
    try {
      setLoginStatus({ isLoggingIn: true, loginError: null })
      
      // 检查缓存
      const cacheKey = 'user-info'
      const cachedData = cacheStore.getCache(cacheKey, { dataType: 'user-info' })
      if (cachedData) {
        console.log('✅ 使用缓存的用户信息')
        // 验证缓存数据
        const userInfoRules = {
          userId: { required: true, type: 'string' },
          nickName: { required: true, type: 'string', maxLength: 20 },
          avatarUrl: { type: 'string', pattern: /^https?:\/\/.+/ },
          phone: { type: 'string', pattern: /^1[3-9]\d{9}$/ },
          email: { type: 'string', pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ },
          isVip: { type: 'boolean' },
          level: { type: 'number', min: 0, max: 10 }
        }
        const validationResult = validate(cachedData, userInfoRules)
        if (validationResult.isValid) {
          setUserInfo(validationResult.data)
          return validationResult.data
        } else {
          console.warn('缓存数据验证失败，重新获取')
        }
      }
      
      const response = await API.user.getInfo()
      // 验证API响应数据
      const apiValidationResult = validateApiResponse(response)
      if (apiValidationResult.isValid) {
        setUserInfo(apiValidationResult.data)
        
        // 缓存验证后的用户信息
        cacheStore.setCache(cacheKey, apiValidationResult.data, { dataType: 'user-info' })
        console.log('✅ 用户信息获取并验证成功')
        return apiValidationResult.data
      } else {
        throw new Error('用户信息验证失败')
      }
    } catch (error) {
      console.error('获取用户信息失败:', error)
      setLoginStatus({ loginError: error.message })
      throw error
    } finally {
      setLoginStatus({ isLoggingIn: false })
      loadingStore.setLoading('user-info', false)
      loadingStore.removePendingRequest(requestKey)
    }
  }
  
  // 更新用户信息
  const updateUser = async (data) => {
    loadingStore.setLoading('update-user', true)
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
    } finally {
      loadingStore.setLoading('update-user', false)
    }
  }
  
  // 获取用户统计
  const fetchUserStats = async () => {
    loadingStore.setLoading('user-stats', true)
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
      loadingStore.setLoading('user-stats', false)
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
        
        // 登录成功，无需额外同步
        
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
    
    // 登出成功，无需额外同步
  }
  
  // 初始化用户数据
  const initializeUser = async () => {
    try {
      console.log('🔄 开始初始化用户数据')
      
      // 从本地存储恢复用户信息
      const localUserInfo = uni.getStorageSync('userInfo')
      if (localUserInfo) {
        const user = JSON.parse(localUserInfo)
        setUserInfo(user)
        console.log('✅ 从本地存储恢复用户信息:', user)
      } else {
        console.log('❌ 本地存储中没有用户信息')
      }
      
      // 从本地存储恢复用户设置
      const localSettings = uni.getStorageSync('userSettings')
      if (localSettings) {
        const settings = JSON.parse(localSettings)
        setUserSettings(settings)
        console.log('✅ 从本地存储恢复用户设置:', settings)
      }
      
      // 从本地存储恢复用户统计数据
      const localStats = uni.getStorageSync('userStats')
      if (localStats) {
        const stats = JSON.parse(localStats)
        setUserStats(stats)
        console.log('✅ 从本地存储恢复用户统计数据:', stats)
      }
      
      // 如果已登录且有token，尝试获取最新用户信息
      const token = uni.getStorageSync('token')
      if (isLoggedIn.value && token) {
        console.log('✅ 用户已登录且有token，尝试获取最新数据')
        try {
          await fetchUserInfo()
          await fetchUserStats()
        } catch (error) {
          console.warn('获取最新用户数据失败，使用本地数据:', error)
        }
      }
      
      console.log('✅ 用户数据初始化完成')
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
      console.log(`🏪 Store获取关注列表 - 页码: ${page}, 大小: ${size}`)
      const response = await API.user.getFollowList({ page, size })
      console.log(`🏪 Store关注列表API响应:`, response)
      if (response && response.code === 1) {
        const result = response.data.list || []
        console.log(`🏪 Store关注列表数据:`, result)
        return result
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
      console.log(`🏪 Store获取粉丝列表 - 页码: ${page}, 大小: ${size}`)
      const response = await API.user.getFansList({ page, size })
      console.log(`🏪 Store粉丝列表API响应:`, response)
      if (response && response.code === 1) {
        const result = response.data.list || []
        console.log(`🏪 Store粉丝列表数据:`, result)
        return result
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

  // 用户列表缓存管理 - 使用响应式ref确保数据变化能被检测到
  const userListCache = ref({
    followList: [],
    fansList: []
  })

  // 获取缓存的用户列表
  const getUserList = (listType) => {
    const result = userListCache.value[listType] || []
    console.log(`🏪 Store获取用户列表 - 类型: ${listType}, 数据:`, result)
    return result
  }

  // 设置用户列表缓存
  const setUserList = (listType, list) => {
    console.log(`🏪 Store设置用户列表 - 类型: ${listType}, 数据:`, list)
    // 确保响应式更新
    userListCache.value = {
      ...userListCache.value,
      [listType]: list
    }
    console.log(`🏪 Store设置后的缓存:`, userListCache.value)
  }

  // 清空用户列表缓存
  const clearUserListCache = (listType) => {
    if (listType) {
      userListCache.value[listType] = []
    } else {
      userListCache.value = { followList: [], fansList: [] }
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
    removeUserFan,
    
    // List Cache Methods
    getUserList,
    setUserList,
    clearUserListCache
  }
})
