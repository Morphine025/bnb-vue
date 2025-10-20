/**
 * UI模块状态管理
 * 功能描述：管理UI相关的所有状态
 * 主要功能：加载状态、错误状态、主题设置、弹窗状态
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useUIStore = defineStore('ui', () => {
  // 全局加载状态
  const globalLoading = ref(false)
  const loadingText = ref('加载中...')
  const loadingMask = ref(true) // 是否显示遮罩层

  // 错误状态
  const globalError = ref(null)
  const errorVisible = ref(false)
  const errorTitle = ref('错误')
  const errorMessage = ref('')
  const errorActions = ref([])

  // 成功提示状态
  const successVisible = ref(false)
  const successMessage = ref('')
  const successDuration = ref(2000)

  // 主题设置
  const theme = ref('light') // light, dark, auto
  const primaryColor = ref('#007AFF')
  const fontSize = ref('normal') // small, normal, large
  const language = ref('zh-CN')

  // 弹窗状态
  const modalVisible = ref(false)
  const modalTitle = ref('')
  const modalContent = ref('')
  const modalActions = ref([])

  // 底部弹窗状态
  const bottomSheetVisible = ref(false)
  const bottomSheetContent = ref(null)

  // 侧边栏状态
  const sidebarVisible = ref(false)
  const sidebarPosition = ref('left') // left, right

  // 导航栏状态
  const navigationBarVisible = ref(true)
  const navigationBarTitle = ref('')
  const navigationBarBackground = ref('transparent')

  // Tab栏状态
  const tabBarVisible = ref(true)
  const tabBarActiveIndex = ref(0)

  // 键盘状态
  const keyboardHeight = ref(0)
  const isKeyboardVisible = ref(false)

  // 计算属性
  const isDarkTheme = computed(() => {
    if (theme.value === 'auto') {
      // 根据系统设置判断
      return false // 这里可以根据系统设置判断
    }
    return theme.value === 'dark'
  })

  const currentTheme = computed(() => {
    if (theme.value === 'auto') {
      return isDarkTheme.value ? 'dark' : 'light'
    }
    return theme.value
  })

  const themeColors = computed(() => {
    const isDark = isDarkTheme.value
    return {
      primary: primaryColor.value,
      background: isDark ? '#1a1a1a' : '#ffffff',
      surface: isDark ? '#2a2a2a' : '#f5f5f5',
      text: isDark ? '#ffffff' : '#333333',
      textSecondary: isDark ? '#cccccc' : '#666666',
      border: isDark ? '#404040' : '#e0e0e0',
      error: '#ff4444',
      warning: '#ff8800',
      success: '#00aa00',
      info: '#0088ff'
    }
  })

  // Actions
  const setGlobalLoading = (loading, text = '加载中...', mask = true) => {
    globalLoading.value = loading
    loadingText.value = text
    loadingMask.value = mask
  }

  const showGlobalLoading = (text = '加载中...', mask = true) => {
    setGlobalLoading(true, text, mask)
  }

  const hideGlobalLoading = () => {
    setGlobalLoading(false)
  }

  const setGlobalError = (error, title = '错误', actions = []) => {
    globalError.value = error
    errorTitle.value = title
    errorMessage.value = error?.message || error || '未知错误'
    errorActions.value = actions
    errorVisible.value = true
  }

  const showError = (message, title = '错误', actions = []) => {
    setGlobalError({ message }, title, actions)
  }

  const hideError = () => {
    errorVisible.value = false
    globalError.value = null
    errorMessage.value = ''
    errorActions.value = []
  }

  const showSuccess = (message, duration = 2000) => {
    successMessage.value = message
    successDuration.value = duration
    successVisible.value = true
    
    // 自动隐藏
    setTimeout(() => {
      successVisible.value = false
    }, duration)
  }

  const setTheme = (newTheme) => {
    theme.value = newTheme
    saveThemeToStorage()
  }

  const setPrimaryColor = (color) => {
    primaryColor.value = color
    saveThemeToStorage()
  }

  const setFontSize = (size) => {
    fontSize.value = size
    saveThemeToStorage()
  }

  const setLanguage = (lang) => {
    language.value = lang
    saveThemeToStorage()
  }

  const showModal = (title, content, actions = []) => {
    modalTitle.value = title
    modalContent.value = content
    modalActions.value = actions
    modalVisible.value = true
  }

  const hideModal = () => {
    modalVisible.value = false
    modalTitle.value = ''
    modalContent.value = ''
    modalActions.value = []
  }

  const showBottomSheet = (content) => {
    bottomSheetContent.value = content
    bottomSheetVisible.value = true
  }

  const hideBottomSheet = () => {
    bottomSheetVisible.value = false
    bottomSheetContent.value = null
  }

  const setSidebarVisible = (visible) => {
    sidebarVisible.value = visible
  }

  const setSidebarPosition = (position) => {
    sidebarPosition.value = position
  }

  const setNavigationBarVisible = (visible) => {
    navigationBarVisible.value = visible
  }

  const setNavigationBarTitle = (title) => {
    navigationBarTitle.value = title
  }

  const setNavigationBarBackground = (background) => {
    navigationBarBackground.value = background
  }

  const setTabBarVisible = (visible) => {
    tabBarVisible.value = visible
  }

  const setTabBarActiveIndex = (index) => {
    tabBarActiveIndex.value = index
  }

  const setKeyboardHeight = (height) => {
    keyboardHeight.value = height
    isKeyboardVisible.value = height > 0
  }

  // 持久化相关方法
  const saveThemeToStorage = () => {
    try {
      const themeConfig = {
        theme: theme.value,
        primaryColor: primaryColor.value,
        fontSize: fontSize.value,
        language: language.value
      }
      uni.setStorageSync('ui_theme_config', JSON.stringify(themeConfig))
    } catch (error) {
      console.error('保存主题配置失败:', error)
    }
  }

  const loadThemeFromStorage = () => {
    try {
      const themeConfig = uni.getStorageSync('ui_theme_config')
      if (themeConfig) {
        const config = JSON.parse(themeConfig)
        theme.value = config.theme || 'light'
        primaryColor.value = config.primaryColor || '#007AFF'
        fontSize.value = config.fontSize || 'normal'
        language.value = config.language || 'zh-CN'
      }
    } catch (error) {
      console.error('加载主题配置失败:', error)
    }
  }

  // 初始化方法
  const initializeUI = () => {
    loadThemeFromStorage()
    
    // 监听键盘事件
    uni.onKeyboardHeightChange((res) => {
      setKeyboardHeight(res.height)
    })
  }

  // 重置UI状态
  const resetUI = () => {
    hideGlobalLoading()
    hideError()
    hideModal()
    hideBottomSheet()
    setSidebarVisible(false)
    setNavigationBarVisible(true)
    setTabBarVisible(true)
  }

  // 工具方法
  const showConfirm = (title, content, onConfirm, onCancel) => {
    const actions = [
      {
        text: '取消',
        style: 'cancel',
        handler: onCancel
      },
      {
        text: '确定',
        style: 'default',
        handler: onConfirm
      }
    ]
    showModal(title, content, actions)
  }

  const showAlert = (title, content, onOk) => {
    const actions = [
      {
        text: '确定',
        style: 'default',
        handler: onOk
      }
    ]
    showModal(title, content, actions)
  }

  return {
    // State
    globalLoading,
    loadingText,
    loadingMask,
    globalError,
    errorVisible,
    errorTitle,
    errorMessage,
    errorActions,
    successVisible,
    successMessage,
    successDuration,
    theme,
    primaryColor,
    fontSize,
    language,
    modalVisible,
    modalTitle,
    modalContent,
    modalActions,
    bottomSheetVisible,
    bottomSheetContent,
    sidebarVisible,
    sidebarPosition,
    navigationBarVisible,
    navigationBarTitle,
    navigationBarBackground,
    tabBarVisible,
    tabBarActiveIndex,
    keyboardHeight,
    isKeyboardVisible,
    
    // Computed
    isDarkTheme,
    currentTheme,
    themeColors,
    
    // Actions
    setGlobalLoading,
    showGlobalLoading,
    hideGlobalLoading,
    setGlobalError,
    showError,
    hideError,
    showSuccess,
    setTheme,
    setPrimaryColor,
    setFontSize,
    setLanguage,
    showModal,
    hideModal,
    showBottomSheet,
    hideBottomSheet,
    setSidebarVisible,
    setSidebarPosition,
    setNavigationBarVisible,
    setNavigationBarTitle,
    setNavigationBarBackground,
    setTabBarVisible,
    setTabBarActiveIndex,
    setKeyboardHeight,
    saveThemeToStorage,
    loadThemeFromStorage,
    initializeUI,
    resetUI,
    showConfirm,
    showAlert
  }
})
