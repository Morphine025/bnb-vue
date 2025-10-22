<template>
	<view class="follow-container">
		<!-- 筛选栏 -->
		<view class="filter-bar">
			<view class="filter-item sort-options" @click="showSortOptions">
				<up-icon name="arrow-down" size="14" color="#666"></up-icon>
				<text class="sort-text">排序</text>
			</view>
			<view class="filter-item layout-toggle" @click="toggleLayout">
				<up-icon :name="isSingleColumn ? 'grid' : 'list'" size="24" color="#999"></up-icon>
			</view>
		</view>

		<!-- 内容区域 -->
		<scroll-view 
			class="content-area" 
			scroll-y="true"
			:scroll-top="toTopRef?.scrollTop || 0"
			@scrolltolower="loadMore"
			@scroll="onScrollViewScroll"
		>
			<!-- 民宿列表 -->
			<HomestayList 
				:list="followList"
				:is-single-column="isSingleColumn"
				:is-loading="isLoading"
				empty-text="暂无关注用户"
				@loadmore="loadMore"
				@item-click="goDetail"
				@image-error="handleImageError"
			/>
		</scroll-view>
		
		<!-- 回到顶部组件 -->
		<ToTop ref="toTopRef" />
	</view>
</template>

<script setup>
	/**
	 * 关注页面组件
	 * 功能描述：展示当前用户关注的用户发布信息
	 * 主要功能：瀑布流布局、无限滚动、回到顶部
	 */

	// 导入API接口 - 使用新的统一API机制
	import { API } from '../../api'
	
	// 导入uni-app生命周期钩子
	import {
		onLoad,
		onShow,
		onReachBottom,
		onPullDownRefresh
	} from '@dcloudio/uni-app'
	
	// 导入Vue响应式API
	import {
		ref,
		reactive,
		computed,
		nextTick
	} from 'vue'
	
	// 导入价格格式化工具
	import { formatPrice } from '@/utils'
	
	// 导入回到顶部组件
	import ToTop from '../../components/ToTop.vue'
	
	// 导入HomestayList组件
	import HomestayList from '../../components/HomestayList/index.vue'

	// 响应式数据定义
	const followList = ref([]) // 关注用户发布信息列表
	const uWaterfallRef = ref(null) // 瀑布流组件引用
	const isSingleColumn = ref(false) // 是否为单列布局
	// 回到顶部功能已移至ToTop组件
	const toTopRef = ref(null)  // ToTop组件引用
	
	// 从本地存储读取布局偏好
	const loadLayoutPreference = () => {
		try {
			const savedLayout = uni.getStorageSync('layoutPreference')
			if (savedLayout !== null && savedLayout !== undefined) {
				isSingleColumn.value = savedLayout === 'single'
			}
		} catch (error) {
			console.error('读取布局偏好失败:', error)
		}
	}
	
	// 保存布局偏好到本地存储
	const saveLayoutPreference = (isSingle) => {
		try {
			uni.setStorageSync('layoutPreference', isSingle ? 'single' : 'double')
		} catch (error) {
			console.error('保存布局偏好失败:', error)
		}
	}
	
	// 分页状态管理
	const currentPage = ref(1) // 当前页码
	const pageSize = ref(10) // 每页数量
	const hasMore = ref(true) // 是否还有更多数据
	const isLoading = ref(false) // 是否正在加载
	
	// 排序状态管理
	const currentSortType = ref('综合排序') // 当前排序类型

	/**
	 * 检查登录状态
	 */
	const checkLoginStatus = () => {
		const token = uni.getStorageSync('token')
		if (!token) {
			uni.showModal({
				title: '提示',
				content: '请先登录后再查看关注内容',
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
	 * 页面加载时获取数据
	 */
	onLoad(async () => {
		// 检查登录状态
		if (!checkLoginStatus()) {
			return
		}
		
		// 加载布局偏好
		loadLayoutPreference()
		
		// 确保初始数据安全
		followList.value = []
		
		await loadFollowData()
	})
	
	/**
	 * 页面显示时刷新数据
	 */
	onShow(async () => {
		// 每次显示都检查登录状态
		if (!checkLoginStatus()) {
			return
		}
		
		// 检查是否需要刷新数据
		const needRefresh = uni.getStorageSync('needRefreshFollowPage')
		if (needRefresh) {
			console.log('🔄 检测到需要刷新关注页面数据')
			// 清除刷新标记
			uni.removeStorageSync('needRefreshFollowPage')
			// 重新加载数据
			await loadFollowData()
		}
	})
	
	/**
	 * 下拉刷新处理
	 */
	onPullDownRefresh(async () => {
		console.log('🔄 用户触发下拉刷新')
		try {
			// 重新加载页面数据
			await loadFollowData()
			
			// 显示刷新成功提示
			uni.showToast({
				title: '刷新成功',
				icon: 'success',
				duration: 1500
			})
			
		} catch (error) {
			console.error('❌ 下拉刷新失败:', error)
			uni.showToast({
				title: '刷新失败，请重试',
				icon: 'none',
				duration: 2000
			})
		} finally {
			// 停止下拉刷新动画
			uni.stopPullDownRefresh()
		}
	})
	
	/**
	 * 加载关注数据
	 */
	const loadFollowData = async () => {
		try {
			console.log('🔄 开始加载关注数据...')
			
			// 重置分页状态
			currentPage.value = 1
			hasMore.value = true
			followList.value = []
			
			// 使用新的关注用户民宿接口
			const homestayResult = await API.user.getFollowHomestayList({ 
				page: currentPage.value, 
				size: pageSize.value
			})
			
			console.log('📊 关注用户民宿响应:', homestayResult)
			
			if (homestayResult && homestayResult.code === 1) {
				const homestayData = homestayResult.data || {}
				const homestayList = homestayData.list || []
				
				console.log('✅ 关注用户民宿数据获取成功，民宿数量:', homestayList.length)
				
				// 处理民宿数据，确保数据完整性
				const processedData = homestayList.map(item => ({
					id: item.homestayId || item.id,
					title: item.title || '暂无标题',
					introduce: item.introduce || item.description || '',
					price: item.price || 0,
					img: (item.images && item.images.length > 0) ? item.images[0] : '/static/logo.png',
					location: item.location || '未知位置',
					likes: item.likeCount || item.likes || 0,
					supports: item.collectCount || item.supports || 0,
					viewCount: item.viewCount || item.views || 0,
					author: item.author || item.authorName || '未知用户',
					avatar: item.avatar || item.authorAvatar || '/static/logo.png',
					createTime: item.createTime || item.publishTime || ''
				}))
				
				followList.value = processedData
				hasMore.value = processedData.length >= pageSize.value
				
				console.log('✅ 关注用户民宿数据处理完成，民宿数量:', processedData.length)
			} else {
				console.warn('⚠️ 关注用户民宿数据获取失败:', homestayResult)
				followList.value = []
			}
			
		} catch (error) {
			console.error('❌ 加载关注数据失败:', error)
			uni.showToast({
				title: '加载失败，请重试',
				icon: 'none',
				duration: 2000
			})
			followList.value = []
		}
	}
	
	/**
	 * 加载更多数据
	 */
	const loadMore = async () => {
		if (!hasMore.value || isLoading.value) {
			return
		}
		
		try {
			isLoading.value = true
			currentPage.value++
			
			console.log('🔄 加载更多关注数据，页码:', currentPage.value)
			
			// 使用新的关注用户民宿接口
			const homestayResult = await API.user.getFollowHomestayList({ 
				page: currentPage.value, 
				size: pageSize.value
			})
			
			if (homestayResult && homestayResult.code === 1) {
				const homestayData = homestayResult.data || {}
				const homestayList = homestayData.list || []
				
				if (homestayList.length > 0) {
					// 处理民宿数据，确保数据完整性
					const processedData = homestayList.map(item => ({
						id: item.homestayId || item.id,
						title: item.title || '暂无标题',
						introduce: item.introduce || item.description || '',
						price: item.price || 0,
						img: (item.images && item.images.length > 0) ? item.images[0] : '/static/logo.png',
						location: item.location || '未知位置',
						likes: item.likeCount || item.likes || 0,
						supports: item.collectCount || item.supports || 0,
						viewCount: item.viewCount || item.views || 0,
						author: item.author || item.authorName || '未知用户',
						avatar: item.avatar || item.authorAvatar || '/static/logo.png',
						createTime: item.createTime || item.publishTime || ''
					}))
					
					followList.value = [...followList.value, ...processedData]
					console.log('✅ 更多关注民宿数据加载成功，新增:', processedData.length, '总数据量:', followList.value.length)
				} else {
					hasMore.value = false
					console.log('📊 没有更多关注民宿数据了')
				}
				
				// 检查是否还有更多数据
				if (homestayList.length < pageSize.value) {
					hasMore.value = false
				}
			} else {
				hasMore.value = false
				console.log('⚠️ 没有更多关注民宿数据')
			}
			
		} catch (error) {
			console.error('❌ 加载更多关注数据失败:', error)
			hasMore.value = false
		} finally {
			isLoading.value = false
		}
	}
	
	/**
	 * 切换布局
	 */
	const toggleLayout = () => {
		isSingleColumn.value = !isSingleColumn.value
		saveLayoutPreference(isSingleColumn.value)
		
		// 延迟执行，确保布局切换完成
		nextTick(() => {
			console.log('🔄 布局已切换为:', isSingleColumn.value ? '单列' : '双列')
		})
	}
	
	/**
	 * 显示排序选项
	 */
	const showSortOptions = () => {
		uni.showActionSheet({
			itemList: ['综合排序', '价格从低到高', '价格从高到低', '最新发布'],
			success: (res) => {
				const sortOptions = ['综合排序', '价格从低到高', '价格从高到低', '最新发布']
				const selectedSort = sortOptions[res.tapIndex]
				
				if (selectedSort !== currentSortType.value) {
					currentSortType.value = selectedSort
					applySorting()
					
					uni.showToast({
						title: `已切换到${selectedSort}`,
						icon: 'none',
						duration: 1500
					})
				}
			}
		})
	}
	
	/**
	 * 应用排序
	 */
	const applySorting = () => {
		if (!followList.value || followList.value.length === 0) {
			return
		}
		
		const sortedList = [...followList.value]
		
		switch (currentSortType.value) {
			case '价格从低到高':
				sortedList.sort((a, b) => (a.price || 0) - (b.price || 0))
				break
			case '价格从高到低':
				sortedList.sort((a, b) => (b.price || 0) - (a.price || 0))
				break
			case '最新发布':
				sortedList.sort((a, b) => {
					const timeA = new Date(a.createTime || 0).getTime()
					const timeB = new Date(b.createTime || 0).getTime()
					return timeB - timeA
				})
				break
			case '综合排序':
			default:
				// 综合排序：按点赞数+收藏数+浏览量综合排序
				sortedList.sort((a, b) => {
					const scoreA = (a.likes || 0) + (a.supports || 0) + (a.viewCount || 0)
					const scoreB = (b.likes || 0) + (b.supports || 0) + (b.viewCount || 0)
					return scoreB - scoreA
				})
				break
		}
		
		followList.value = sortedList
		console.log('🔄 已应用排序:', currentSortType.value)
	}
	
	/**
	 * 跳转到详情页
	 */
	const goDetail = (item) => {
		try {
			if (!item || !item.id) {
				uni.showToast({
					title: '数据异常',
					icon: 'none'
				})
				return
			}
			
			console.log('🔗 跳转到详情页:', item)
			const itemData = JSON.stringify(item)
			uni.navigateTo({
				url: `/pages/detail/detail?item=${encodeURIComponent(itemData)}`,
				fail: (error) => {
					console.error('页面跳转失败:', error)
					uni.showToast({
						title: '页面跳转失败',
						icon: 'none'
					})
				}
			})
		} catch (error) {
			console.error('跳转详情页失败:', error)
			uni.showToast({
				title: '跳转失败',
				icon: 'none'
			})
		}
	}
	
	/**
	 * 处理图片加载错误
	 */
	const handleImageError = (event, item, index) => {
		console.warn('⚠️ 图片加载失败:', item.img, '索引:', index)
		// 可以设置默认图片
		event.target.src = '/static/logo.png'
	}
	
	// 回到顶部功能已移至ToTop组件
	/**
	 * scroll-view滚动监听
	 */
	const onScrollViewScroll = (e) => {
		if (toTopRef.value && toTopRef.value.onScrollViewScroll) {
			toTopRef.value.onScrollViewScroll(e)
		}
	}
</script>

<style lang="scss" scoped>
	.follow-container {
		min-height: 100vh;
		background: #f8f9fa;
	}

	/* 筛选栏样式 */
	.filter-bar {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 15rpx 30rpx;
		background: #fff;
		border-bottom: 1rpx solid #f0f0f0;
	}

	.filter-item {
		display: flex;
		align-items: center;
		padding: 12rpx 20rpx;
		border-radius: 8rpx;
		transition: all 0.3s ease;
	}

	.filter-item:active {
		background: #e9ecef;
		transform: scale(0.95);
	}

	.layout-toggle {
		display: flex;
		align-items: center;
		padding: 12rpx 20rpx;
		border-radius: 8rpx;
		transition: all 0.3s ease;
	}
	
	.layout-toggle:active {
		background: #e9ecef;
		transform: scale(0.95);
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
	}
	
	.sort-options:active {
		transform: scale(0.98);
		background-color: #f8f9fa;
	}
	
	.sort-text {
		font-size: 26rpx;
		color: #666;
	}

	/* 内容区域样式 */
	.content-area {
		height: calc(100vh - 120rpx);
		padding: 20rpx;
		width: 100%;
		box-sizing: border-box;
	}

	/* 瀑布流卡片样式 */
	.post-card {
		background: #fff;
		border-radius: 16rpx;
		overflow: hidden;
		margin-bottom: 20rpx;
		box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.08);
		transition: all 0.3s ease;
	}

	.post-card:active {
		transform: scale(0.98);
		box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.12);
	}

	.post-image {
		position: relative;
		width: 100%;
		overflow: hidden;
	}

	.post-img {
		width: 100%;
		display: block;
	}

	.location-overlay {
		position: absolute;
		bottom: 12rpx;
		left: 12rpx;
		background: rgba(0, 0, 0, 0.6);
		color: #fff;
		padding: 6rpx 12rpx;
		border-radius: 20rpx;
		font-size: 22rpx;
		display: flex;
		align-items: center;
		gap: 6rpx;
	}

	.location-text {
		font-size: 22rpx;
		color: #fff;
	}

	.post-content {
		padding: 24rpx;
	}

	.post-title {
		font-size: 28rpx;
		font-weight: 600;
		color: #333;
		line-height: 1.4;
		margin-bottom: 12rpx;
		display: -webkit-box;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}

	.post-summary {
		font-size: 24rpx;
		color: #666;
		line-height: 1.5;
		margin-bottom: 16rpx;
		display: -webkit-box;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}

	.post-info {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 16rpx;
	}

	.price-tag {
		display: flex;
		align-items: baseline;
		color: #ff4757;
		font-weight: 600;
	}

	.price-symbol {
		font-size: 24rpx;
		margin-right: 4rpx;
	}

	.price-number {
		font-size: 32rpx;
		font-weight: 700;
	}

	.interaction-stats {
		display: flex;
		gap: 16rpx;
	}

	.stat-item {
		display: flex;
		align-items: center;
		gap: 6rpx;
	}

	.stat-count {
		font-size: 22rpx;
		color: #666;
	}

	.post-footer {
		border-top: 1rpx solid #f0f0f0;
		padding-top: 16rpx;
	}

	.user-info {
		display: flex;
		align-items: center;
		gap: 12rpx;
	}

	.avatar {
		width: 48rpx;
		height: 48rpx;
		border-radius: 50%;
		overflow: hidden;
	}

	.avatar image {
		width: 100%;
		height: 100%;
	}

	.user-details {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: 4rpx;
	}

	.username {
		font-size: 24rpx;
		color: #333;
		font-weight: 500;
	}

	.user-title {
		font-size: 20rpx;
		color: #667eea;
		background: rgba(102, 126, 234, 0.1);
		padding: 2rpx 8rpx;
		border-radius: 10rpx;
		width: fit-content;
	}

	/* 单列布局样式 */
	.single-column-list {
		padding: 20rpx;
		width: 100%;
		box-sizing: border-box;
	}

	.single-card {
		background: #fff;
		border-radius: 20rpx;
		margin-bottom: 20rpx;
		overflow: hidden;
		box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.08);
		transition: all 0.3s ease;
		width: 100%;
		box-sizing: border-box;
	}

	.single-card:active {
		transform: scale(0.98);
		box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.12);
	}

	.single-top {
		display: flex;
		width: 100%;
		box-sizing: border-box;
	}

	.single-image {
		width: 300rpx;
		min-height: 200rpx;
		border-radius: 12rpx;
		overflow: hidden;
		position: relative;
		flex-shrink: 0;
		display: flex;
		align-items: stretch;
	}

	.single-img {
		width: 100%;
		height: 100%;
	}

	.single-content {
		flex: 1;
		padding: 20rpx;
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		min-width: 0; /* 防止flex子元素溢出 */
		overflow: hidden;
	}

	.single-title {
		font-size: 32rpx;
		font-weight: 600;
		color: #333;
		line-height: 1.4;
		margin-bottom: 8rpx;
		display: -webkit-box;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
		word-break: break-word;
		width: 100%;
	}

	.single-details {
		font-size: 24rpx;
		color: #666;
		line-height: 1.5;
		margin-bottom: 16rpx;
		display: -webkit-box;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
		word-break: break-word;
		width: 100%;
	}

	.single-actions {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-top: auto;
		width: 100%;
		box-sizing: border-box;
	}

	.action-item {
		display: flex;
		align-items: center;
		gap: 6rpx;
		flex-shrink: 0;
	}

	.price-value {
		font-size: 28rpx;
		font-weight: 700;
		color: #ff4757;
	}

	.action-value {
		font-size: 22rpx;
		color: #666;
	}

	.single-footer {
		display: flex;
		align-items: center;
		padding: 20rpx;
		border-top: 1rpx solid #f5f5f5;
		background-color: #fafafa;
		width: 100%;
		box-sizing: border-box;
	}

	.single-avatar {
		width: 40rpx;
		height: 40rpx;
		border-radius: 50%;
		overflow: hidden;
		margin-right: 12rpx;
	}

	.single-avatar image {
		width: 100%;
		height: 100%;
	}

	.single-username {
		flex: 1;
		font-size: 24rpx;
		color: #333;
		font-weight: 500;
	}

	.single-views {
		display: flex;
		align-items: center;
		gap: 6rpx;
	}

	.views-text {
		font-size: 22rpx;
		color: #999;
	}

	/* 空状态样式 */
	.empty-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 120rpx 40rpx;
		text-align: center;
	}

	.empty-icon {
		font-size: 120rpx;
		margin-bottom: 30rpx;
		opacity: 0.6;
	}

	.empty-title {
		font-size: 32rpx;
		font-weight: 600;
		color: #333;
		margin-bottom: 16rpx;
	}

	.empty-desc {
		font-size: 26rpx;
		color: #666;
		line-height: 1.5;
	}

	/* 加载状态样式 */
	.loading-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 60rpx 40rpx;
		gap: 20rpx;
	}

	.loading-text {
		font-size: 26rpx;
		color: #666;
	}

	/* 回到顶部按钮样式已移至ToTop组件 */
</style>