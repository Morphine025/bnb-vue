/**
 * 用户设置管理Store
 * 功能描述：管理用户设置相关的状态和操作
 * 主要功能：用户偏好、通知设置、隐私设置等
 */

import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useUserSettingsStore = defineStore('userSettings', () => {
  // 用户设置
  const userSettings = ref({
    notifications: {
      push: true,
      email: true,
      sms: false,
      message: true,
      like: true,
      follow: true,
      comment: true
    },
    privacy: {
      profile: 'public', // public, friends, private
      homestays: 'public',
      location: 'public',
      contact: 'friends'
    },
    preferences: {
      language: 'zh-CN',
      theme: 'light',
      currency: 'CNY',
      timezone: 'Asia/Shanghai'
    },
    display: {
      showOnlineStatus: true,
      showLastSeen: true,
      showReadReceipts: true
    }
  })

  // 加载状态
  const isSettingsLoading = ref(false)

  // Actions
  const setUserSettings = (settings) => {
    userSettings.value = { ...userSettings.value, ...settings }
    // 持久化设置
    uni.setStorageSync('userSettings', JSON.stringify(userSettings.value))
  }

  const setSettingsLoading = (loading) => {
    isSettingsLoading.value = loading
  }

  // 更新通知设置
  const updateNotificationSettings = (settings) => {
    userSettings.value.notifications = {
      ...userSettings.value.notifications,
      ...settings
    }
    uni.setStorageSync('userSettings', JSON.stringify(userSettings.value))
  }

  // 更新隐私设置
  const updatePrivacySettings = (settings) => {
    userSettings.value.privacy = {
      ...userSettings.value.privacy,
      ...settings
    }
    uni.setStorageSync('userSettings', JSON.stringify(userSettings.value))
  }

  // 更新偏好设置
  const updatePreferenceSettings = (settings) => {
    userSettings.value.preferences = {
      ...userSettings.value.preferences,
      ...settings
    }
    uni.setStorageSync('userSettings', JSON.stringify(userSettings.value))
  }

  // 更新显示设置
  const updateDisplaySettings = (settings) => {
    userSettings.value.display = {
      ...userSettings.value.display,
      ...settings
    }
    uni.setStorageSync('userSettings', JSON.stringify(userSettings.value))
  }

  // 初始化用户设置
  const initializeSettings = () => {
    try {
      // 从本地存储恢复用户设置
      const localSettings = uni.getStorageSync('userSettings')
      if (localSettings) {
        const settings = JSON.parse(localSettings)
        setUserSettings(settings)
      }
    } catch (error) {
      console.error('初始化用户设置失败:', error)
    }
  }

  // 重置所有设置
  const resetAllSettings = () => {
    userSettings.value = {
      notifications: {
        push: true,
        email: true,
        sms: false,
        message: true,
        like: true,
        follow: true,
        comment: true
      },
      privacy: {
        profile: 'public',
        homestays: 'public',
        location: 'public',
        contact: 'friends'
      },
      preferences: {
        language: 'zh-CN',
        theme: 'light',
        currency: 'CNY',
        timezone: 'Asia/Shanghai'
      },
      display: {
        showOnlineStatus: true,
        showLastSeen: true,
        showReadReceipts: true
      }
    }
    uni.setStorageSync('userSettings', JSON.stringify(userSettings.value))
  }

  // 获取特定设置
  const getSetting = (category, key) => {
    return userSettings.value[category]?.[key]
  }

  // 设置特定设置
  const setSetting = (category, key, value) => {
    if (userSettings.value[category]) {
      userSettings.value[category][key] = value
      uni.setStorageSync('userSettings', JSON.stringify(userSettings.value))
    }
  }

  return {
    // State
    userSettings,
    isSettingsLoading,
    
    // Actions
    setUserSettings,
    setSettingsLoading,
    updateNotificationSettings,
    updatePrivacySettings,
    updatePreferenceSettings,
    updateDisplaySettings,
    initializeSettings,
    resetAllSettings,
    getSetting,
    setSetting
  }
})
