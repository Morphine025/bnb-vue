<template>
  <view class="usage-examples">
    <view class="section">
      <text class="title">Pinia Store 使用示例</text>
      
      <!-- 应用状态示例 -->
      <view class="example-section">
        <text class="section-title">应用状态管理</text>
        <button @click="initApp">初始化应用</button>
        <text>应用状态: {{ isAppReady ? '已就绪' : '未就绪' }}</text>
        <text>用户登录状态: {{ isLoggedIn ? '已登录' : '未登录' }}</text>
      </view>
      
      <!-- 民宿状态示例 -->
      <view class="example-section">
        <text class="section-title">民宿状态管理</text>
        <button @click="loadHomestays">加载民宿列表</button>
        <button @click="toggleFavorite(1)">切换收藏</button>
        <text>民宿数量: {{ homestayList.length }}</text>
        <text>收藏数量: {{ favoriteIds.length }}</text>
      </view>
      
      <!-- 搜索状态示例 -->
      <view class="example-section">
        <text class="section-title">搜索状态管理</text>
        <input v-model="searchKeyword" placeholder="输入搜索关键词" />
        <button @click="performSearch">搜索</button>
        <button @click="clearSearchHistory">清空搜索历史</button>
        <text>搜索结果: {{ searchResults.length }}</text>
        <text>搜索历史: {{ recentSearches.join(', ') }}</text>
      </view>
      
      <!-- UI状态示例 -->
      <view class="example-section">
        <text class="section-title">UI状态管理</text>
        <button @click="showLoading">显示加载</button>
        <button @click="hideLoading">隐藏加载</button>
        <button @click="showError">显示错误</button>
        <button @click="showSuccess">显示成功</button>
        <button @click="toggleTheme">切换主题</button>
        <text>当前主题: {{ currentTheme }}</text>
        <text>加载状态: {{ globalLoading ? '加载中' : '空闲' }}</text>
      </view>
      
      <!-- 缓存状态示例 -->
      <view class="example-section">
        <text class="section-title">缓存状态管理</text>
        <button @click="setCacheData">设置缓存</button>
        <button @click="getCacheData">获取缓存</button>
        <button @click="clearAllCache">清空缓存</button>
        <text>缓存大小: {{ (totalCacheSize / 1024).toFixed(2) }}KB</text>
        <text>缓存键数量: {{ cacheKeys.length }}</text>
      </view>
    </view>
  </view>
</template>

<script setup>
/**
 * Pinia Store 使用示例
 * 功能描述：展示如何在组件中使用各个store模块
 * 主要功能：状态管理、数据操作、UI交互
 */

import { ref, computed } from 'vue'
import { 
  useAppStore, 
  useHomestayStore, 
  useSearchStore, 
  useUIStore, 
  useCacheStore 
} from '../index.js'

// 获取各个store实例
const appStore = useAppStore()
const homestayStore = useHomestayStore()
const searchStore = useSearchStore()
const uiStore = useUIStore()
const cacheStore = useCacheStore()

// 响应式数据
const searchKeyword = ref('')

// 计算属性
const isAppReady = computed(() => appStore.isAppReady)
const isLoggedIn = computed(() => appStore.isLoggedIn)
const homestayList = computed(() => homestayStore.homestayList)
const favoriteIds = computed(() => homestayStore.favoriteIds)
const searchResults = computed(() => searchStore.searchResults)
const recentSearches = computed(() => searchStore.recentSearches)
const globalLoading = computed(() => uiStore.globalLoading)
const currentTheme = computed(() => uiStore.currentTheme)
const totalCacheSize = computed(() => cacheStore.totalCacheSize)
const cacheKeys = computed(() => cacheStore.cacheKeys)

// 应用状态管理方法
const initApp = async () => {
  await appStore.initApp()
  console.log('应用初始化完成')
}

// 民宿状态管理方法
const loadHomestays = async () => {
  await homestayStore.loadMoreHomestays()
  console.log('民宿列表加载完成')
}

const toggleFavorite = (homestayId) => {
  const homestay = { id: homestayId, title: '示例民宿' }
  homestayStore.toggleFavorite(homestay)
  console.log('收藏状态已切换')
}

// 搜索状态管理方法
const performSearch = async () => {
  if (searchKeyword.value.trim()) {
    await searchStore.performSearch(searchKeyword.value)
    console.log('搜索完成')
  }
}

const clearSearchHistory = () => {
  searchStore.clearSearchHistory()
  console.log('搜索历史已清空')
}

// UI状态管理方法
const showLoading = () => {
  uiStore.showGlobalLoading('正在处理...')
  setTimeout(() => {
    uiStore.hideGlobalLoading()
  }, 2000)
}

const hideLoading = () => {
  uiStore.hideGlobalLoading()
}

const showError = () => {
  uiStore.showError('这是一个错误示例', '错误提示')
}

const showSuccess = () => {
  uiStore.showSuccess('操作成功！')
}

const toggleTheme = () => {
  const newTheme = uiStore.currentTheme === 'light' ? 'dark' : 'light'
  uiStore.setTheme(newTheme)
  console.log('主题已切换为:', newTheme)
}

// 缓存状态管理方法
const setCacheData = () => {
  const testData = {
    timestamp: Date.now(),
    message: '这是测试缓存数据',
    data: { id: 1, name: '测试' }
  }
  
  const success = cacheStore.setCache('test_data', testData)
  if (success) {
    console.log('缓存设置成功')
  } else {
    console.log('缓存设置失败')
  }
}

const getCacheData = () => {
  const data = cacheStore.getCache('test_data')
  if (data) {
    console.log('获取缓存数据:', data)
  } else {
    console.log('缓存数据不存在')
  }
}

const clearAllCache = () => {
  cacheStore.clearCache()
  console.log('所有缓存已清空')
}

// 组件挂载时初始化
const initializeStores = () => {
  // 初始化各个store
  appStore.initApp()
  searchStore.initializeSearch()
  uiStore.initializeUI()
  cacheStore.initializeCache()
}

// 组件挂载时调用
initializeStores()
</script>

<style scoped>
.usage-examples {
  padding: 20rpx;
}

.section {
  margin-bottom: 40rpx;
}

.title {
  font-size: 36rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 20rpx;
}

.example-section {
  margin-bottom: 30rpx;
  padding: 20rpx;
  background-color: #f5f5f5;
  border-radius: 10rpx;
}

.section-title {
  font-size: 28rpx;
  font-weight: bold;
  color: #666;
  margin-bottom: 15rpx;
  display: block;
}

button {
  margin: 10rpx;
  padding: 15rpx 30rpx;
  background-color: #007AFF;
  color: white;
  border: none;
  border-radius: 8rpx;
  font-size: 24rpx;
}

button:active {
  background-color: #0056CC;
}

text {
  display: block;
  margin: 10rpx 0;
  font-size: 24rpx;
  color: #333;
}

input {
  width: 100%;
  padding: 15rpx;
  border: 1px solid #ddd;
  border-radius: 8rpx;
  font-size: 24rpx;
  margin: 10rpx 0;
}
</style>
