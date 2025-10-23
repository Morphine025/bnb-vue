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
		onPullDownRefresh
	} from '@dcloudio/uni-app'
	
	// 导入Vue响应式API
	import {
		ref,
		nextTick
	} from 'vue'
	
	// 导入回到顶部组件
	import ToTop from '../../components/ToTop.vue'
	
	// 导入HomestayList组件
	import HomestayList from '../../components/HomestayList/index.vue'

	// ==================== 响应式数据定义 ====================
	
	/**
	 * 关注用户发布的民宿列表数据
	 * @type {Array} 包含民宿信息的数组
	 */
	const followList = ref([])
	
	/**
	 * 是否为单列布局模式
	 * @type {boolean} true-单列布局，false-双列瀑布流布局
	 */
	const isSingleColumn = ref(false)
	
	/**
	 * 回到顶部组件引用
	 * @type {Object} ToTop组件的引用，用于控制回到顶部功能
	 */
	const toTopRef = ref(null)
	
	// ==================== 分页和状态管理 ====================
	
	/**
	 * 当前页码
	 * @type {number} 从1开始的页码
	 */
	const currentPage = ref(1)
	
	/**
	 * 每页数据数量
	 * @type {number} 每页加载的民宿数量
	 */
	const pageSize = ref(10)
	
	/**
	 * 是否还有更多数据可加载
	 * @type {boolean} true-有更多数据，false-已加载完所有数据
	 */
	const hasMore = ref(true)
	
	/**
	 * 是否正在加载数据
	 * @type {boolean} true-正在加载，false-加载完成
	 */
	const isLoading = ref(false)
	
	/**
	 * 当前排序类型
	 * @type {string} 排序方式：'综合排序'、'价格从低到高'、'价格从高到低'、'最新发布'
	 */
	const currentSortType = ref('综合排序')
	
	// ==================== 布局偏好管理 ====================
	
	/**
	 * 从本地存储读取用户布局偏好设置
	 * 读取用户之前保存的布局模式（单列/双列）
	 */
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
	
	/**
	 * 保存用户布局偏好到本地存储
	 * @param {boolean} isSingle - 是否为单列布局
	 */
	const saveLayoutPreference = (isSingle) => {
		try {
			uni.setStorageSync('layoutPreference', isSingle ? 'single' : 'double')
		} catch (error) {
			console.error('保存布局偏好失败:', error)
		}
	}

	// ==================== 用户认证管理 ====================
	
	/**
	 * 检查用户登录状态
	 * @returns {boolean} true-已登录，false-未登录
	 * @description 检查本地存储中的token，如果未登录则提示用户去登录页面
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
	
	// ==================== 数据处理工具函数 ====================
	
	/**
	 * 处理民宿数据，统一数据格式
	 * @param {Array} rawData - 原始民宿数据数组
	 * @returns {Array} 处理后的标准化民宿数据数组
	 * @description 将后端返回的民宿数据转换为前端组件需要的统一格式
	 */
	const processHomestayData = (rawData) => {
		return rawData.map(item => ({
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
	}
	
	// ==================== 数据加载管理 ====================
	
	/**
	 * 加载关注用户的民宿数据
	 * @description 获取当前用户关注的用户发布的民宿信息，支持分页加载
	 */
	const loadFollowData = async () => {
		try {
			console.log('🔄 开始加载关注数据...')
			
			// 重置分页状态
			currentPage.value = 1
			hasMore.value = true
			followList.value = []
			
			// 调用API获取关注用户的民宿数据
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
				const processedData = processHomestayData(homestayList)
				
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
	 * 加载更多关注数据
	 * @description 分页加载更多关注用户的民宿数据，支持无限滚动
	 */
	const loadMore = async () => {
		// 防止重复加载
		if (!hasMore.value || isLoading.value) {
			return
		}
		
		try {
			isLoading.value = true
			currentPage.value++
			
			console.log('🔄 加载更多关注数据，页码:', currentPage.value)
			
			// 调用API获取下一页数据
			const homestayResult = await API.user.getFollowHomestayList({ 
				page: currentPage.value, 
				size: pageSize.value
			})
			
			if (homestayResult && homestayResult.code === 1) {
				const homestayData = homestayResult.data || {}
				const homestayList = homestayData.list || []
				
				if (homestayList.length > 0) {
					// 使用统一的数据处理函数
					const processedData = processHomestayData(homestayList)
					
					// 追加到现有数据
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
	
	// ==================== 用户交互管理 ====================
	
	/**
	 * 切换布局模式
	 * @description 在单列和双列布局之间切换，并保存用户偏好
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
	 * 显示排序选项弹窗
	 * @description 显示排序选项列表，让用户选择排序方式
	 */
	const showSortOptions = () => {
		const sortOptions = ['综合排序', '价格从低到高', '价格从高到低', '最新发布']
		
		uni.showActionSheet({
			itemList: sortOptions,
			success: (res) => {
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
	 * 应用排序规则
	 * @description 根据用户选择的排序方式对民宿列表进行排序
	 */
	const applySorting = () => {
		if (!followList.value || followList.value.length === 0) {
			return
		}
		
		const sortedList = [...followList.value]
		
		switch (currentSortType.value) {
			case '价格从低到高':
				// 按价格升序排序
				sortedList.sort((a, b) => (a.price || 0) - (b.price || 0))
				break
			case '价格从高到低':
				// 按价格降序排序
				sortedList.sort((a, b) => (b.price || 0) - (a.price || 0))
				break
			case '最新发布':
				// 按发布时间降序排序
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
	
	// ==================== 页面导航管理 ====================
	
	/**
	 * 跳转到民宿详情页
	 * @param {Object} item - 民宿数据对象
	 * @description 点击民宿卡片时跳转到详情页，传递民宿数据
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
	
	// ==================== 错误处理管理 ====================
	
	/**
	 * 处理图片加载错误
	 * @param {Event} event - 图片加载错误事件
	 * @param {Object} item - 民宿数据对象
	 * @param {number} index - 图片在列表中的索引
	 * @description 当图片加载失败时，设置默认图片
	 */
	const handleImageError = (event, item, index) => {
		console.warn('⚠️ 图片加载失败:', item.img, '索引:', index)
		// 设置默认图片
		event.target.src = '/static/logo.png'
	}
	
	// ==================== 滚动监听管理 ====================
	
	/**
	 * scroll-view滚动监听
	 * @param {Event} e - 滚动事件对象
	 * @description 监听滚动事件，传递给ToTop组件处理回到顶部功能
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

	/* 注意：具体的卡片样式已移至HomestayList组件中，这里只保留页面级别的样式 */
</style>