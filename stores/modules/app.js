/**
 * 应用全局状态管理
 * 功能描述：管理应用级别的全局状态
 * 主要功能：应用配置、全局UI状态、用户信息
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useAppStore = defineStore('app', () => {
  // 应用配置信息
  const appConfig = ref({
    version: '1.0.0',
    name: '民宿预订平台',
    apiBaseUrl: 'https://api.example.com',
    isDebug: false
  })

  // 全局UI状态
  const globalUI = ref({
    isOnline: true,
    networkType: 'wifi',
    systemInfo: null,
    statusBarHeight: 0,
    navigationBarHeight: 44
  })

  // 用户信息
  const userInfo = ref(null)
  const isLoggedIn = computed(() => !!userInfo.value)

  // 应用初始化状态
  const isAppReady = ref(false)

  // Actions
  const setAppConfig = (config) => {
    appConfig.value = { ...appConfig.value, ...config }
  }

  const setGlobalUI = (ui) => {
    globalUI.value = { ...globalUI.value, ...ui }
  }

  const setUserInfo = (user) => {
    userInfo.value = user
  }

  const setAppReady = (ready) => {
    isAppReady.value = ready
  }

  const logout = () => {
    userInfo.value = null
  }

  const initApp = async () => {
    try {
      // 获取系统信息 - 使用新的API
      let systemInfo = null
      try {
        // 优先使用新的API
        if (typeof wx !== 'undefined' && wx.getWindowInfo) {
          const windowInfo = wx.getWindowInfo()
          const deviceInfo = wx.getDeviceInfo()
          const appBaseInfo = wx.getAppBaseInfo()
          systemInfo = {
            ...windowInfo,
            ...deviceInfo,
            ...appBaseInfo
          }
        } else {
          // 使用 uni-app 的 getSystemInfo 异步API
          try {
            const systemInfoRes = await uni.getSystemInfo()
            systemInfo = systemInfoRes
          } catch (syncError) {
            console.warn('获取系统信息失败，使用默认值:', syncError)
            systemInfo = {
              statusBarHeight: 0,
              windowWidth: 375,
              windowHeight: 667,
              platform: 'unknown',
              system: 'unknown'
            }
          }
        }
      } catch (e) {
        console.warn('获取系统信息失败，使用默认值:', e)
        // 提供默认的系统信息
        systemInfo = {
          statusBarHeight: 0,
          windowWidth: 375,
          windowHeight: 667,
          platform: 'unknown',
          system: 'unknown'
        }
      }
      
      globalUI.value.systemInfo = systemInfo
      globalUI.value.statusBarHeight = systemInfo.statusBarHeight || 0
      
      // 检查网络状态
      const networkInfo = await uni.getNetworkType()
      globalUI.value.isOnline = networkInfo.networkType !== 'none'
      globalUI.value.networkType = networkInfo.networkType

      setAppReady(true)
    } catch (error) {
      console.error('应用初始化失败:', error)
    }
  }

  return {
    // State
    appConfig,
    globalUI,
    userInfo,
    isLoggedIn,
    isAppReady,
    
    // Actions
    setAppConfig,
    setGlobalUI,
    setUserInfo,
    setAppReady,
    logout,
    initApp
  }
})
