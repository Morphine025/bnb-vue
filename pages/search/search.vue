<template>
	<view class="search-page">
		<!-- 顶部搜索栏 -->
		<view class="search-header">
			<view class="search-container">
				<view class="search-input">
					<up-icon name="search" size="18" color="#999"></up-icon>
					<input 
						type="text" 
						placeholder="搜索民宿/用户/地点" 
						v-model="searchKeyword"
						class="search-field"
						@input="handleSearchInput"
						@confirm="handleSearch"
						:focus="isInputFocused"
						@focus="handleInputFocus"
						@blur="handleInputBlur"
					/>
					<view class="search-clear" v-if="searchKeyword" @click="clearSearch">
						<up-icon name="close-circle-fill" size="16" color="#ccc"></up-icon>
					</view>
				</view>
			</view>
		</view>

		<!-- 搜索内容区域 -->
		<view class="search-content">
			<!-- 历史搜索 -->
			<view class="search-section" v-if="!searchKeyword && (!searchResults || searchResults.length === 0)">
				<view class="section-header">
					<text class="section-title">历史搜索</text>
					<view class="clear-history" @click="clearHistory" v-if="historySearches.length > 0">
						<up-icon name="trash" size="16" color="#999"></up-icon>
					</view>
				</view>
				<view class="search-tags" v-if="historySearches.length > 0">
					<view 
						class="search-tag" 
						v-for="(item, index) in historySearches" 
						:key="index"
						@click="selectHistorySearch(item)"
					>
						{{ item }}
					</view>
				</view>
				<view class="empty-history" v-else>
					<text class="empty-text">暂无搜索历史</text>
				</view>
			</view>


			<!-- 搜索结果 -->
			<view class="search-results" v-if="searchKeyword && searchResults && searchResults.length > 0">
				<view class="results-header">
					<text class="results-count">找到 {{ searchResults.length }} 个结果</text>
					<view class="sort-options" @click="showSortOptions">
						<up-icon name="arrow-down" size="14" color="#666"></up-icon>
						<text class="sort-text">排序</text>
					</view>
				</view>
				
				<!-- 搜索结果列表 -->
				<view class="results-list">
					<view 
						class="result-item" 
						v-for="(item, index) in searchResults" 
						:key="index"
						@click="goToDetail(item)"
					>
						<!-- 上半部分：图片和内容 -->
						<view class="result-top">
							<!-- 左侧图片区域 -->
							<view class="result-image">
								<image :src="item.img" mode="aspectFill" class="item-img"></image>
								<!-- 位置信息覆盖在图片上 -->
								<view class="location-overlay" v-if="item.province || item.location">
									<up-icon name="map" size="14" color="#fff"></up-icon>
									<text class="location-text">
										{{ item.city || item.location }}
									</text>
								</view>
							</view>
							
							<!-- 右侧内容区域 -->
							<view class="result-content">
								<!-- 标题 -->
								<view class="result-title">{{ item.title }}</view>
								
								<!-- 详细信息 -->
								<view class="result-details" v-if="item.introduce">{{ item.introduce }}</view>
								
								<!-- 底部三个元素：金额、喜欢、收藏 -->
								<view class="result-actions">
									<view class="action-item">
										<text class="action-value price-value">¥{{ formatPrice(item.price) }}</text>
									</view>
									<view class="action-item">
										<up-icon name="heart-fill" size="16" color="#ff4757"></up-icon>
										<text class="action-value">{{ item.likes || 0 }}</text>
									</view>
									<view class="action-item">
										<up-icon name="star-fill" size="16" color="#ffa502"></up-icon>
										<text class="action-value">{{ item.supports || 0 }}</text>
									</view>
								</view>
							</view>
						</view>
						
						<!-- 底部用户信息区域 -->
						<view class="result-footer">
							<view class="result-avatar">
								<image :src="item.avatar || '/static/logo.png'" mode="aspectFill"></image>
							</view>
							<view class="result-username">{{ item.author || '用户' }}</view>
							<view class="result-views">
								<up-icon name="eye" size="14" color="#999"></up-icon>
								<text class="views-text">{{ item.viewCount || 0 }}</text>
							</view>
						</view>
					</view>
				</view>
			</view>

			<!-- 无搜索结果 -->
			<view class="no-results" v-if="searchKeyword && (!searchResults || searchResults.length === 0) && !isSearching">
				<view class="no-results-content">
					<up-icon name="search" size="48" color="#ccc"></up-icon>
					<text class="no-results-text">未找到相关结果</text>
					<text class="no-results-tip">试试其他关键词</text>
				</view>
			</view>

			<!-- 搜索中状态 -->
			<view class="searching" v-if="isSearching">
				<view class="searching-content">
					<up-loading-icon mode="circle" size="24" color="#667eea"></up-loading-icon>
					<text class="searching-text">搜索中...</text>
				</view>
			</view>
		</view>

	</view>
</template>

<script setup>
	/**
	 * 搜索页面组件
	 * 功能描述：提供搜索功能，包括历史搜索、推荐搜索、搜索结果展示
	 * 主要功能：搜索输入、历史记录、推荐标签、搜索结果展示
	 */

	// 导入API接口 - 使用新的统一API机制
	import { API } from '../../api'
	
	// 导入uni-app生命周期钩子
	import { onLoad, onShow } from '@dcloudio/uni-app'
	
	// 导入Vue响应式API
	import { ref, reactive, computed } from 'vue'
	
	// 导入防抖工具
	import { debounce } from '@/utils'
	
	// 导入Pinia stores - 使用新的模块化Store
	import { 
		useSearchStore,
		useSearchHistoryStore,
		useSearchSuggestionsStore
	} from '../../stores'
	
	// 导入价格格式化工具
	import { formatPrice } from '@/utils'

	// 使用新的模块化Store
	const searchStore = useSearchStore()
	const searchHistoryStore = useSearchHistoryStore()
	const searchSuggestionsStore = useSearchSuggestionsStore()
	
	// 响应式数据定义
	const isInputFocused = ref(false) // 输入框是否聚焦
	
	// 从store获取数据
	const searchKeyword = computed({
		get: () => searchStore.searchKeyword,
		set: (value) => searchStore.setSearchKeyword(value)
	})
	const isSearching = computed(() => searchStore.isSearching)
	const searchResults = computed(() => searchStore.searchResults)
	const historySearches = computed(() => {
		// 从 searchStore 获取历史搜索数据
		const searches = searchStore.searchHistory || []
		return Array.isArray(searches) ? searches : []
	})

	/**
	 * 页面加载时初始化
	 */
	onLoad(async (options) => {
		// 初始化searchStore
		await searchStore.initializeSearch()
		
		// 从首页传入的搜索关键词
		if (options.keyword) {
			searchKeyword.value = decodeURIComponent(options.keyword)
			handleSearch()
		}
		
		// 加载历史搜索记录
		loadHistorySearches()
	})

	/**
	 * 页面显示时刷新数据
	 */
	onShow(() => {
		// 如果有搜索结果，重新获取最新数据以更新浏览数、点赞数等
		if (searchKeyword.value && searchResults.value && searchResults.value.length > 0) {
			refreshSearchResults()
		}
	})

	/**
	 * 检查登录状态
	 */
	const checkLoginStatus = () => {
		const token = uni.getStorageSync('token')
		if (!token) {
			uni.showModal({
				title: '提示',
				content: '请先登录后再查看搜索历史',
				showCancel: false,
				confirmText: '去登录',
				success: () => {
					uni.switchTab({
						url: '/pages/my/my'
					})
				}
			})
			return false
		}
		return true
	}

	/**
	 * 加载历史搜索记录
	 */
	const loadHistorySearches = async () => {
		try {
			// 检查登录状态
			if (!checkLoginStatus()) {
				return
			}
			
			const result = await API.search.getSearchHistory()
			if (result && result.code === 1 && result.data) {
				searchStore.setSearchHistory(result.data.slice(0, 10))
			}
		} catch (error) {
			console.error('加载历史搜索失败:', error)
		}
	}

	/**
	 * 保存搜索历史
	 */
	const saveSearchHistory = (keyword) => {
		if (!keyword.trim()) return
		
		// 使用searchStore保存搜索历史
		searchStore.addToSearchHistory(keyword.trim())
	}


	/**
	 * 处理搜索输入 - 添加防抖优化
	 */
	const handleSearchInput = (e) => {
		const value = e.detail.value
		searchKeyword.value = value
		
		// 输入处理 - 使用防抖避免频繁调用
		if (value && value.length > 0) {
			debouncedSearchSuggestions(value)
		} else {
			searchStore.clearSearchSuggestions()
		}
	}
	
	// 防抖的搜索建议
	const debouncedSearchSuggestions = debounce((keyword) => {
		searchStore.getSearchSuggestions(keyword)
	}, 300)


	/**
	 * 处理输入框聚焦
	 */
	const handleInputFocus = () => {
		isInputFocused.value = true
	}

	/**
	 * 处理输入框失焦
	 */
	const handleInputBlur = () => {
		isInputFocused.value = false
	}

	/**
	 * 处理搜索
	 */
	const handleSearch = async () => {
		if (!searchKeyword.value.trim()) {
			uni.showToast({
				title: '请输入搜索关键词',
				icon: 'none',
				duration: 1500
			})
			return
		}

		try {
			// 使用searchStore执行搜索
			await searchStore.performSearch(searchKeyword.value.trim())
			
		} catch (error) {
			console.error('搜索失败:', error)
			uni.showToast({
				title: '搜索失败，请重试',
				icon: 'none',
				duration: 2000
			})
		}
	}

	/**
	 * 刷新搜索结果数据
	 * 用于从详情页返回时更新浏览数、点赞数等数据
	 */
	const refreshSearchResults = async () => {
		if (!searchKeyword.value.trim()) return
		
		try {
			console.log('🔄 刷新搜索结果数据...')
			
			// 使用searchStore重新执行搜索
			await searchStore.performSearch(searchKeyword.value.trim())
			console.log('✅ 搜索结果数据已刷新')
		} catch (error) {
			console.error('刷新搜索结果失败:', error)
		}
	}

	/**
	 * 选择历史搜索
	 */
	const selectHistorySearch = (keyword) => {
		searchKeyword.value = keyword
		handleSearch()
	}


	/**
	 * 清空搜索
	 */
	const clearSearch = () => {
		searchStore.setSearchKeyword('')
		searchStore.clearSearchResults()
	}

	/**
	 * 清空历史搜索
	 */
	const clearHistory = () => {
		// 检查登录状态
		if (!checkLoginStatus()) {
			return
		}
		
		uni.showModal({
			title: '确认清空',
			content: '确定要清空所有搜索历史吗？',
			success: async (res) => {
				if (res.confirm) {
					try {
						await API.search.clearSearchHistory()
						searchStore.clearSearchHistory()
						uni.showToast({
							title: '已清空历史',
							icon: 'success',
							duration: 1500
						})
					} catch (error) {
						console.error('清空历史搜索失败:', error)
						uni.showToast({
							title: '清空失败',
							icon: 'none',
							duration: 1500
						})
					}
				}
			}
		})
	}


	/**
	 * 跳转到详情页
	 */
	const goToDetail = (item) => {
		const itemData = JSON.stringify(item)
		uni.navigateTo({
			url: `/pages/detail/detail?item=${encodeURIComponent(itemData)}`
		})
	}


	/**
	 * 显示排序选项
	 */
	const showSortOptions = () => {
		uni.showActionSheet({
			itemList: ['综合排序', '价格从低到高', '价格从高到低', '最新发布'],
			success: (res) => {
				uni.showToast({
					title: '功能开发中',
					icon: 'none',
					duration: 1500
				})
			}
		})
	}

</script>

<style lang="scss" scoped>
	.search-page {
		background-color: #f8f9fa;
		min-height: 100vh;
	}

	/* 顶部搜索栏 */
	.search-header {
		background-color: #fff;
		box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
	}

	.search-container {
		padding: 30rpx 20rpx;
		width: 100%;
		box-sizing: border-box;
	}

	.search-input {
		display: flex;
		align-items: center;
		background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
		border-radius: 50rpx;
		padding: 0 30rpx;
		height: 80rpx;
		box-shadow: 0 4rpx 15rpx rgba(0, 0, 0, 0.08);
		border: 2rpx solid transparent;
		transition: all 0.3s ease;
		position: relative;
		overflow: hidden;
		flex: 1;
		width: 100%;
		max-width: 100%;
		box-sizing: border-box;

		&::before {
			content: '';
			position: absolute;
			top: 0;
			left: 0;
			right: 0;
			bottom: 0;
			background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
			border-radius: 50rpx;
			padding: 2rpx;
			mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
			mask-composite: exclude;
			opacity: 0;
			transition: opacity 0.3s ease;
		}

		&:focus-within {
			transform: translateY(-2rpx);
			box-shadow: 0 8rpx 25rpx rgba(102, 126, 234, 0.15);

			&::before {
				opacity: 1;
			}
		}
	}

	.search-field {
		flex: 1;
		background: transparent;
		border: none;
		outline: none;
		font-size: 28rpx;
		color: #333;
		margin-left: 15rpx;
		padding: 0;
		width: 100%;
		max-width: 100%;
		box-sizing: border-box;

		&::placeholder {
			color: #999;
			font-size: 26rpx;
		}
	}

	.search-clear {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 40rpx;
		height: 40rpx;
		margin-left: 15rpx;
		border-radius: 50%;
		background-color: rgba(0, 0, 0, 0.05);
		transition: all 0.2s ease;

		&:active {
			transform: scale(0.9);
			background-color: rgba(0, 0, 0, 0.1);
		}
	}


	/* 搜索内容区域 */
	.search-content {
		padding: 20rpx;
	}

	.search-section {
		margin-top: 40rpx;
		margin-bottom: 40rpx;
	}

	.section-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 20rpx;
	}

	.section-title {
		font-size: 32rpx;
		font-weight: 600;
		color: #333;
	}

	.clear-history, .refresh-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 40rpx;
		height: 40rpx;
		border-radius: 50%;
		background-color: #f8f9fa;
		transition: all 0.3s ease;

		&:active {
			transform: scale(0.95);
			background-color: #e9ecef;
		}
	}

	.search-tags {
		display: flex;
		flex-wrap: wrap;
		gap: 15rpx;
	}

	.search-tag {
		padding: 12rpx 24rpx;
		background-color: #fff;
		border-radius: 30rpx;
		font-size: 26rpx;
		color: #666;
		border: 1rpx solid #e9ecef;
		transition: all 0.3s ease;

		&:active {
			transform: scale(0.98);
			background-color: #f8f9fa;
		}

		&.suggestion-tag {
			background-color: #f8f9fa;
			color: #333;
			border-color: #dee2e6;
		}
	}

	.empty-history {
		text-align: center;
		padding: 40rpx 0;
	}

	.empty-text {
		font-size: 28rpx;
		color: #999;
	}

	/* 搜索结果 */
	.search-results {
		.results-header {
			display: flex;
			align-items: center;
			justify-content: space-between;
			margin-bottom: 20rpx;
		}

		.results-count {
			font-size: 28rpx;
			color: #666;
		}

		.sort-options {
			display: flex;
			align-items: center;
			gap: 8rpx;
			padding: 12rpx 20rpx;
			background-color: #fff;
			border-radius: 25rpx;
			border: 1rpx solid #e9ecef;
			transition: all 0.3s ease;

			&:active {
				transform: scale(0.98);
				background-color: #f8f9fa;
			}
		}

		.sort-text {
			font-size: 26rpx;
			color: #666;
		}
	}

	.results-list {
		display: flex;
		flex-direction: column;
		gap: 20rpx;
	}

	.result-item {
		background-color: #fff;
		border-radius: 20rpx;
		overflow: hidden;
		box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.08);
		transition: all 0.3s ease;

		&:active {
			transform: scale(0.98);
		}
	}

	.result-top {
		display: flex;
	}

	.result-image {
		width: 300rpx;
		height: 200rpx;
		overflow: hidden;
		flex-shrink: 0;
		position: relative;

		.item-img {
			width: 100%;
			height: 100%;
			object-fit: cover;
		}

		.location-overlay {
			position: absolute;
			bottom: 8rpx;
			left: 8rpx;
			display: flex;
			align-items: center;
			gap: 6rpx;
			background: rgba(0, 0, 0, 0.6);
			padding: 6rpx 12rpx;
			border-radius: 12rpx;
			backdrop-filter: blur(4rpx);
			max-width: calc(100% - 16rpx);

			.location-text {
				font-size: 22rpx;
				color: #fff;
				font-weight: 500;
				white-space: nowrap;
				overflow: hidden;
				text-overflow: ellipsis;
			}
		}
	}

	.result-content {
		flex: 1;
		padding: 20rpx;
		display: flex;
		flex-direction: column;
		justify-content: space-between;
	}

	.result-title {
		font-size: 32rpx;
		font-weight: 600;
		color: #333;
		margin-bottom: 8rpx;
		line-height: 1.4;
	}

	.result-details {
		font-size: 26rpx;
		color: #666;
		line-height: 1.5;
		margin-bottom: 16rpx;
		display: -webkit-box;
		-webkit-box-orient: vertical;
		-webkit-line-clamp: 2;
		overflow: hidden;
	}


	.result-actions {
		display: flex;
		justify-content: space-between;

		.action-item {
			display: flex;
			flex-direction: column;
			align-items: center;
			justify-content: center;
			flex: 1;
			gap: 8rpx;

			&:nth-child(2), &:nth-child(3) {
				flex-direction: row;
				gap: 6rpx;
			}

			.action-value {
				font-size: 26rpx;
				color: #333;
				font-weight: 600;
			}

			.price-value {
				color: #ff4757;
				font-weight: 700;
				font-size: 36rpx;
			}
		}
	}

	.result-footer {
		display: flex;
		align-items: center;
		padding: 20rpx;
		border-top: 1rpx solid #f5f5f5;
		background-color: #fafafa;

		.result-avatar {
			width: 40rpx;
			height: 40rpx;
			border-radius: 50%;
			overflow: hidden;
			margin-right: 12rpx;

			image {
				width: 100%;
				height: 100%;
			}
		}

		.result-username {
			flex: 1;
			font-size: 24rpx;
			color: #333;
			font-weight: 500;
		}

		.result-views {
			display: flex;
			align-items: center;
			gap: 4rpx;

			.views-text {
				font-size: 22rpx;
				color: #999;
			}
		}
	}

	/* 无搜索结果 */
	.no-results {
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 80rpx 0;
	}

	.no-results-content {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 20rpx;
	}

	.no-results-text {
		font-size: 32rpx;
		color: #999;
		font-weight: 500;
	}

	.no-results-tip {
		font-size: 26rpx;
		color: #ccc;
	}

	/* 搜索中状态 */
	.searching {
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 80rpx 0;
	}

	.searching-content {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 20rpx;
	}

	.searching-text {
		font-size: 28rpx;
		color: #666;
	}
</style>
