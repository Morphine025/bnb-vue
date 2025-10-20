/**
 * 用户信息管理Store
 * 功能描述：管理用户基本信息相关的状态和操作
 * 主要功能：用户信息、登录状态、认证等
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { API } from '../../../api'

export const useUserProfileStore = defineStore('userProfile', () => {
  // 用户基本信息
  const userInfo = ref(null)
  const isLoggedIn = computed(() => !!userInfo.value)
  
  // 请求去重机制
  const pendingRequests = new Set()
  
  // 登录状态
  const loginStatus = ref({
    isLoggingIn: false,
    lastLoginTime: null,
    loginError: null
  })

  // Actions
  const setUserInfo = (info) => {
    console.log('🔄 Store setUserInfo 被调用，参数:', info)
    userInfo.value = info
    console.log('✅ Store userInfo 已更新:', userInfo.value)
    
    // 持久化到本地存储
    if (info) {
      uni.setStorageSync('userInfo', JSON.stringify(info))
      console.log('✅ 用户信息已保存到本地存储')
    } else {
      uni.removeStorageSync('userInfo')
      console.log('✅ 本地存储已清除')
    }
  }
  
  const setLoginStatus = (status) => {
    loginStatus.value = { ...loginStatus.value, ...status }
  }

  // 获取用户信息
  const fetchUserInfo = async () => {
    try {
      setLoginStatus({ isLoggingIn: true, loginError: null })
      
      const response = await API.user.getInfo()
      console.log('🔍 fetchUserInfo API响应:', response)
      
      if (response && response.data) {
        // 提取用户数据部分，而不是整个API响应
        const userData = response.data
        console.log('✅ 提取的用户数据:', userData)
        setUserInfo(userData)
        return userData
      } else {
        throw new Error('获取用户信息失败')
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
      if (response) {
        // 更新本地用户信息
        const updatedInfo = { ...userInfo.value, ...data }
        setUserInfo(updatedInfo)
        return response
      } else {
        throw new Error('更新用户信息失败')
      }
    } catch (error) {
      console.error('更新用户信息失败:', error)
      throw error
    }
  }
  
  // 登录
  const performLogin = async (loginData) => {
    try {
      setLoginStatus({ isLoggingIn: true, loginError: null })
      
      // 调用服务层登录
      const response = await API.user.login(
        loginData.code, 
        loginData.avatarUrl, 
        loginData.nickName
      )
      
      console.log('登录API响应:', response)
      
      // 处理后端返回的Result格式
      if (response && response.code === 1 && response.data) {
        const { token, userInfo } = response.data
        
        if (token) {
          // 保存token
          uni.setStorageSync('token', token)
          console.log('Token已保存:', token)
          
          // 直接使用返回的用户信息，不需要再次请求
          if (userInfo) {
            setUserInfo(userInfo)
            console.log('用户信息已设置:', userInfo)
          }
          
          setLoginStatus({ 
            isLoggingIn: false, 
            lastLoginTime: new Date().toISOString() 
          })
          
          return userInfo
        } else {
          throw new Error('登录响应中缺少token')
        }
      } else {
        throw new Error(response?.message || '登录失败')
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
      
      // 如果已登录，获取最新用户信息
      if (isLoggedIn.value) {
        await fetchUserInfo()
      }
    } catch (error) {
      console.error('初始化用户数据失败:', error)
    }
  }

  // 获取其他用户信息
  const fetchUserInfoById = async (userId) => {
    try {
      const response = await API.user.getInfoById(userId)
      if (response) {
        return response
      } else {
        throw new Error('获取用户信息失败')
      }
    } catch (error) {
      console.error('获取用户信息失败:', error)
      throw error
    }
  }

  return {
    // State
    userInfo,
    loginStatus,
    
    // Computed
    isLoggedIn,
    
    // Actions
    setUserInfo,
    setLoginStatus,
    fetchUserInfo,
    updateUser,
    performLogin,
    logout,
    initializeUser,
    fetchUserInfoById
  }
})
