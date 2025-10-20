<template>
  <view class="refactored-usage-examples">
    <view class="section">
      <text class="title">重构后的Store使用示例</text>
      
      <!-- 民宿列表示例 -->
      <view class="example-section">
        <text class="section-title">民宿列表管理</text>
        <button @click="loadHomestayList">加载民宿列表</button>
        <button @click="loadMoreHomestays">加载更多</button>
        <text>列表长度: {{ homestayListStore.homestayList.length }}</text>
      </view>

      <!-- 民宿详情示例 -->
      <view class="example-section">
        <text class="section-title">民宿详情管理</text>
        <button @click="loadHomestayDetail">加载民宿详情</button>
        <text>详情加载中: {{ homestayDetailStore.isDetailLoading }}</text>
      </view>

      <!-- 用户信息示例 -->
      <view class="example-section">
        <text class="section-title">用户信息管理</text>
        <button @click="loadUserInfo">加载用户信息</button>
        <text>登录状态: {{ userProfileStore.isLoggedIn }}</text>
      </view>

      <!-- 搜索功能示例 -->
      <view class="example-section">
        <text class="section-title">搜索功能</text>
        <input v-model="searchKeyword" placeholder="输入搜索关键词" />
        <button @click="performSearch">搜索</button>
        <text>搜索结果: {{ searchStore.searchResults.length }} 条</text>
      </view>
    </view>
  </view>
</template>

<script>
import { ref } from 'vue'
import { 
  useHomestayListStore,
  useHomestayDetailStore,
  useHomestayFilterStore,
  useHomestayFavoritesStore,
  useUserProfileStore,
  useUserStatsStore,
  useUserSettingsStore,
  useUserFollowStore,
  useSearchStore,
  useSearchHistoryStore,
  useSearchSuggestionsStore
} from '../index.js'

export default {
  name: 'RefactoredUsageExamples',
  setup() {
    const searchKeyword = ref('')

    // 民宿相关Store
    const homestayListStore = useHomestayListStore()
    const homestayDetailStore = useHomestayDetailStore()
    const homestayFilterStore = useHomestayFilterStore()
    const homestayFavoritesStore = useHomestayFavoritesStore()

    // 用户相关Store
    const userProfileStore = useUserProfileStore()
    const userStatsStore = useUserStatsStore()
    const userSettingsStore = useUserSettingsStore()
    const userFollowStore = useUserFollowStore()

    // 搜索相关Store
    const searchStore = useSearchStore()
    const searchHistoryStore = useSearchHistoryStore()
    const searchSuggestionsStore = useSearchSuggestionsStore()

    // 示例方法
    const loadHomestayList = async () => {
      try {
        await homestayListStore.loadMoreHomestays()
        console.log('民宿列表加载成功')
      } catch (error) {
        console.error('加载民宿列表失败:', error)
      }
    }

    const loadMoreHomestays = async () => {
      try {
        await homestayListStore.loadMoreHomestays()
        console.log('加载更多民宿成功')
      } catch (error) {
        console.error('加载更多民宿失败:', error)
      }
    }

    const loadHomestayDetail = async () => {
      try {
        const homestayId = 'example-id'
        await homestayDetailStore.fetchHomestayDetail(homestayId)
        console.log('民宿详情加载成功')
      } catch (error) {
        console.error('加载民宿详情失败:', error)
      }
    }

    const loadUserInfo = async () => {
      try {
        await userProfileStore.fetchUserInfo()
        console.log('用户信息加载成功')
      } catch (error) {
        console.error('加载用户信息失败:', error)
      }
    }

    const performSearch = async () => {
      try {
        await searchStore.performSearch(searchKeyword.value)
        console.log('搜索完成')
      } catch (error) {
        console.error('搜索失败:', error)
      }
    }

    return {
      searchKeyword,
      homestayListStore,
      homestayDetailStore,
      homestayFilterStore,
      homestayFavoritesStore,
      userProfileStore,
      userStatsStore,
      userSettingsStore,
      userFollowStore,
      searchStore,
      searchHistoryStore,
      searchSuggestionsStore,
      loadHomestayList,
      loadMoreHomestays,
      loadHomestayDetail,
      loadUserInfo,
      performSearch
    }
  }
}
</script>

<style scoped>
.refactored-usage-examples {
  padding: 20px;
}

.section {
  margin-bottom: 20px;
}

.title {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 15px;
}

.example-section {
  margin-bottom: 15px;
  padding: 10px;
  border: 1px solid #eee;
  border-radius: 5px;
}

.section-title {
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 10px;
  display: block;
}

button {
  margin: 5px;
  padding: 8px 16px;
  background-color: #007aff;
  color: white;
  border: none;
  border-radius: 4px;
}

input {
  margin: 5px;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}
</style>
