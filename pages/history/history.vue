<template>
	<view class="container">
		<!-- 浏览历史列表 -->
		<view class="history-list" v-if="historyList.length > 0">
			<view class="history-item" v-for="(item, index) in historyList" :key="item.homestayId" @click="goToDetail(item)">
				<view class="item-image">
					<image :src="item.images && item.images.length > 0 ? item.images[0] : '/static/logo.png'" mode="aspectFill"></image>
				</view>
				<view class="item-content">
					<view class="item-title">{{ item.title }}</view>
					<view class="item-location">
						<up-icon name="map" size="14" color="#999"></up-icon>
						<text>{{ getLocationText(item) }}</text>
					</view>
					<view class="item-info">
						<view class="item-price">
							<text class="price-symbol">¥</text>
							<text class="price-number">{{ formatPrice(item.price) }}</text>
						</view>
						<view class="item-time">
							<up-icon name="clock" size="12" color="#999"></up-icon>
							<text>{{ formatTime(item.viewTime) }}</text>
						</view>
					</view>
					<view class="item-actions">
						<view class="action-btn" @click.stop="toggleCollectAction(item, index)" :class="{ 'collected': item.isCollected }">
							<up-icon :name="item.isCollected ? 'star-fill' : 'star'" size="16" color="#ffa502"></up-icon>
							<text>{{ item.isCollected ? '已收藏' : '收藏' }}</text>
						</view>
						<view class="action-btn" @click.stop="removeHistory(item, index)">
							<up-icon name="trash" size="16" color="#fff"></up-icon>
							<text>删除</text>
						</view>
					</view>
				</view>
			</view>
		</view>
		
		<!-- 空状态 -->
		<view class="empty-state" v-else-if="!loading">
			<image src="/static/logo.png" mode="aspectFit"></image>
			<text class="empty-text">暂无浏览记录</text>
			<text class="empty-desc">去首页看看有什么好房源吧</text>
			<button class="empty-btn" @click="goToHome">去首页逛逛</button>
		</view>
		
		<!-- 加载状态 -->
		<view class="loading-state" v-if="loading">
			<up-loading-icon mode="circle"></up-loading-icon>
			<text>加载中...</text>
		</view>
		
		<!-- 清除历史按钮 - 固定在底部 -->
		<view class="clear-history-fixed" v-if="historyList.length > 0">
			<button class="clear-btn" @click="clearAllHistory">清除所有历史</button>
		</view>
	</view>
</template>

<script setup>
	/**
	 * 浏览历史页面组件
	 * 功能描述：展示用户浏览过的民宿历史记录
	 * 主要功能：浏览历史展示、收藏、删除、清除历史
	 */

	// 导入Vue响应式API
	import { ref } from 'vue'
	
	// 导入uni-app生命周期钩子
	import { onLoad, onShow, onPullDownRefresh } from '@dcloudio/uni-app'
	
	// 导入API接口 - 使用新的统一API机制
	import { API } from '../../api'
	
	// 导入价格格式化工具
	import { formatPrice } from '@/utils'
	
	// 导入状态管理
	import { useUserStore, useCacheStore } from '../../stores'

	// ==================== 状态管理 ====================
	/** @type {import('pinia').Store} 用户状态管理 */
	const userStore = useUserStore()
	
	/** @type {import('pinia').Store} 缓存状态管理 */
	const cacheStore = useCacheStore()

	// ==================== 响应式数据 ====================
	/** @type {import('vue').Ref<Array>} 浏览历史列表数据 */
	const historyList = ref([])
	
	/** @type {import('vue').Ref<boolean>} 加载状态 */
	const loading = ref(false)
	
	/** @type {import('vue').Ref<number>} 当前页码 */
	const page = ref(1)
	
	/** @type {import('vue').Ref<number>} 每页数据量 */
	const pageSize = ref(10)

	// ==================== 工具函数 ====================
	/**
	 * 统一的错误处理函数
	 * @param {Error} error - 错误对象
	 * @param {string} defaultMessage - 默认错误消息
	 * @param {string} operation - 操作名称
	 */
	const handleError = (error, defaultMessage = '操作失败', operation = '') => {
		console.error(`❌ ${operation}失败:`, error)
		uni.showToast({
			title: error.message || defaultMessage,
			icon: 'none'
		})
	}

	/**
	 * 显示成功提示
	 * @param {string} message - 成功消息
	 */
	const showSuccess = (message) => {
		uni.showToast({
			title: message,
			icon: 'success'
		})
	}

	// ==================== 生命周期钩子 ====================
	/**
	 * 页面加载时获取浏览历史
	 */
	onLoad(() => {
		loadViewHistory()
	})

	/**
	 * 页面显示时刷新数据
	 */
	onShow(() => {
		// 如果从详情页返回，刷新浏览历史
		if (historyList.value.length > 0) {
			loadViewHistory()
		}
	})

	/**
	 * 下拉刷新
	 */
	onPullDownRefresh(async () => {
		console.log('📱 浏览历史页面下拉刷新')
		page.value = 1
		hasMore.value = true
		await loadViewHistory()
		uni.stopPullDownRefresh()
	})

	/**
	 * 加载浏览历史数据
	 * @description 从服务器获取用户的浏览历史记录，支持分页加载
	 * @param {boolean} isRefresh - 是否为刷新操作，默认false
	 */
	const loadViewHistory = async (isRefresh = false) => {
		try {
			loading.value = true
			
			// 如果是刷新操作，重置页码
			if (isRefresh) {
				page.value = 1
			}
			
			console.log(`📱 加载浏览历史 - 页码: ${page.value}, 每页: ${pageSize.value}`)
			
			const res = await API.user.getViewHistory({
				page: page.value,
				size: pageSize.value
			})
			
			// 验证API响应格式
			if (res.code === 1 && res.data) {
				const newList = res.data.list || []
				
				// 根据页码决定是替换还是追加数据
				if (page.value === 1) {
					historyList.value = newList
				} else {
					historyList.value.push(...newList)
				}
				
				console.log('✅ 浏览历史加载成功:', historyList.value.length, '条记录')
			} else {
				console.warn('⚠️ 浏览历史数据格式异常:', res)
				handleError(new Error('数据格式异常'), '加载失败，请重试', '加载浏览历史')
			}
		} catch (error) {
			handleError(error, '加载失败，请重试', '加载浏览历史')
		} finally {
			loading.value = false
		}
	}

	/**
	 * 切换收藏状态
	 * @description 在浏览历史页面中切换民宿的收藏状态
	 * @param {Object} item - 民宿数据对象
	 * @param {string} item.homestayId - 民宿ID
	 * @param {boolean} item.isCollected - 当前收藏状态
	 * @param {number} index - 在列表中的索引位置
	 */
	const toggleCollectAction = async (item, index) => {
		try {
			const action = item.isCollected ? 'uncollect' : 'collect'
			console.log(`📱 切换收藏状态 - 民宿ID: ${item.homestayId}, 操作: ${action}`)
			
			const result = await API.homestay.toggleCollect(item.homestayId, action)
			
			if (result.code === 1) {
				// 更新本地状态
				historyList.value[index].isCollected = !item.isCollected
				
				const message = item.isCollected ? '已取消收藏' : '收藏成功'
				showSuccess(message)
				
				console.log('✅ 收藏状态切换成功')
			} else {
				throw new Error(result.message || '操作失败')
			}
		} catch (error) {
			handleError(error, '操作失败，请重试', '切换收藏状态')
		}
	}

	/**
	 * 删除单条浏览历史记录
	 * @description 删除用户指定的浏览历史记录，需要用户确认
	 * @param {Object} item - 民宿数据对象
	 * @param {string} item.homestayId - 民宿ID
	 * @param {string} item.title - 民宿标题
	 * @param {number} index - 在列表中的索引位置
	 */
	const removeHistory = async (item, index) => {
		try {
			uni.showModal({
				title: '确认删除',
				content: `确定要删除"${item.title}"的浏览记录吗？`,
				success: async (res) => {
					if (res.confirm) {
						console.log(`📱 删除浏览历史 - 民宿ID: ${item.homestayId}`)
						
						const result = await API.user.removeViewHistory(item.homestayId)
						
						if (result.code === 1) {
							// 从列表中移除
							historyList.value.splice(index, 1)
							showSuccess('删除成功')
							console.log('✅ 浏览历史删除成功')
						} else {
							throw new Error(result.message || '删除失败')
						}
					}
				}
			})
		} catch (error) {
			handleError(error, '删除失败，请重试', '删除浏览历史')
		}
	}

	/**
	 * 清除所有浏览历史记录
	 * @description 清空用户的所有浏览历史记录，需要用户确认，操作不可恢复
	 */
	const clearAllHistory = () => {
		uni.showModal({
			title: '确认清除',
			content: '确定要清除所有浏览历史吗？此操作不可恢复。',
			success: async (res) => {
				if (res.confirm) {
					try {
						console.log('📱 清除所有浏览历史')
						
						const result = await API.user.clearViewHistory()
						
						if (result.code === 1) {
							historyList.value = []
							showSuccess('清除成功')
							console.log('✅ 所有浏览历史清除成功')
						} else {
							throw new Error(result.message || '清除失败')
						}
					} catch (error) {
						handleError(error, '清除失败，请重试', '清除所有浏览历史')
					}
				}
			}
		})
	}

	// ==================== 工具函数 ====================
	/**
	 * 获取位置显示文本
	 * @description 根据民宿数据生成位置显示文本，优先级：省+市 > 位置字段 > 默认文本
	 * @param {Object} item - 民宿数据对象
	 * @param {string} [item.province] - 省份
	 * @param {string} [item.city] - 城市
	 * @param {string} [item.location] - 位置信息
	 * @returns {string} 格式化的位置文本
	 */
	const getLocationText = (item) => {
		if (item.province && item.city) {
			return `${item.province}${item.city}`
		} else if (item.location) {
			return item.location
		} else {
			return '位置未知'
		}
	}

	/**
	 * 格式化时间显示
	 * @description 将时间字符串转换为相对时间显示，支持iOS兼容性处理
	 * @param {string} timeStr - 时间字符串，格式如 "yyyy-MM-dd HH:mm:ss"
	 * @returns {string} 格式化后的时间显示文本
	 * @example
	 * formatTime('2024-01-15 14:30:00') // 返回 "2小时前" 或 "刚刚" 等
	 */
	const formatTime = (timeStr) => {
		if (!timeStr) return ''
		
		// 修复iOS日期格式兼容性问题
		let time
		try {
			// 将 "yyyy-MM-dd HH:mm:ss" 格式转换为 iOS 兼容的 ISO 格式
			const isoStr = timeStr.replace(' ', 'T')
			time = new Date(isoStr)
		} catch (error) {
			// 如果转换失败，尝试其他格式
			time = new Date(timeStr)
		}
		
		// 检查日期是否有效
		if (isNaN(time.getTime())) {
			return '时间格式错误'
		}
		
		const now = new Date()
		const diff = now - time
		
		// 小于1分钟
		if (diff < 60000) {
			return '刚刚'
		}
		// 小于1小时
		else if (diff < 3600000) {
			return `${Math.floor(diff / 60000)}分钟前`
		}
		// 小于1天
		else if (diff < 86400000) {
			return `${Math.floor(diff / 3600000)}小时前`
		}
		// 小于7天
		else if (diff < 604800000) {
			return `${Math.floor(diff / 86400000)}天前`
		}
		// 超过7天，显示具体日期
		else {
			return time.toLocaleDateString()
		}
	}

	// ==================== 导航方法 ====================
	/**
	 * 跳转到民宿详情页
	 * @description 点击浏览历史项时跳转到对应的民宿详情页
	 * @param {Object} item - 民宿数据对象
	 * @param {string} item.homestayId - 民宿ID
	 */
	const goToDetail = (item) => {
		console.log(`📱 跳转民宿详情页 - ID: ${item.homestayId}`)
		uni.navigateTo({
			url: `/pages/detail/detail?id=${item.homestayId}`
		})
	}

	/**
	 * 跳转到首页
	 * @description 从空状态页面跳转到首页浏览更多民宿
	 */
	const goToHome = () => {
		console.log('📱 跳转首页')
		uni.switchTab({
			url: '/pages/index/index'
		})
	}
</script>

<style lang="scss" scoped>
	/* ==================== 页面容器样式 ==================== */
	.container {
		min-height: 100vh;
		position: relative;
		
		/* 背景渐变装饰 */
		&::before {
			content: '';
			position: fixed;
			top: 0;
			left: 0;
			right: 0;
			bottom: 0;
			background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
			opacity: 0.05;
			z-index: -1;
		}
	}

	/* ==================== 浏览历史列表样式 ==================== */
	.history-list {
		padding: 30rpx 20rpx 120rpx 20rpx; /* 底部增加间距，为固定按钮留出空间 */
		max-width: 750rpx;
		margin: 0 auto;
	}

	/* ==================== 历史记录项样式 ==================== */
	.history-item {
		background: #fff;
		border-radius: 20rpx;
		margin-bottom: 30rpx;
		overflow: hidden;
		box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.08);
		display: flex;
		align-items: stretch;
		transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
		position: relative;
		border: 1rpx solid rgba(255, 255, 255, 0.8);
		min-height: 200rpx;
		
		&:hover {
			transform: translateY(-4rpx);
			box-shadow: 0 16rpx 48rpx rgba(0, 0, 0, 0.12);
		}
		
		&:active {
			transform: scale(0.98);
		}
		
		&::before {
			content: '';
			position: absolute;
			top: 0;
			left: 0;
			right: 0;
			height: 4rpx;
			background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
			opacity: 0;
			transition: opacity 0.3s ease;
		}
		
		&:hover::before {
			opacity: 1;
		}
	}

	.item-image {
		width: 300rpx;
		flex-shrink: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		position: relative;
		overflow: hidden;

		image {
			width: 100%;
			height: 100%;
			object-fit: cover;
			transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
			border-radius: 20rpx;
		}
		
		&::after {
			content: '';
			position: absolute;
			top: 0;
			left: 0;
			right: 0;
			bottom: 0;
			background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
			opacity: 0;
			transition: opacity 0.3s ease;
		}
		
		&:hover::after {
			opacity: 1;
		}
		
		&:hover image {
			transform: scale(1.05);
		}
	}

	.item-content {
		flex: 1;
		padding: 10rpx 15rpx 10rpx 25rpx;
		display: flex;
		flex-direction: column;
		justify-content: flex-start;
		min-height: 200rpx;
		position: relative;
		gap: 15rpx;
	}

	.item-title {
		font-size: 32rpx;
		font-weight: 700;
		color: #2d3748;
		line-height: 1.4;
		display: -webkit-box;
		-webkit-box-orient: vertical;
		-webkit-line-clamp: 2;
		line-clamp: 2;
		overflow: hidden;
		letter-spacing: 0.5rpx;
	}

	.item-location {
		display: flex;
		align-items: center;
		gap: 8rpx;
		padding: 6rpx 10rpx;
		border-radius: 10rpx;
		width: fit-content;

		text {
			font-size: 24rpx;
			color: #999;
			font-weight: 500;
		}
	}

	.item-info {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 15rpx;
	}

	.item-price {
		display: flex;
		align-items: baseline;
		background: linear-gradient(135deg, #ff6b35 0%, #f7931e 100%);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
		font-size: 36rpx;
		font-weight: 800;

		.price-symbol {
			font-size: 24rpx;
			font-weight: 700;
			margin-right: 2rpx;
		}

		.price-number {
			font-size: 36rpx;
			font-weight: 800;
		}
	}

	.item-time {
		display: flex;
		align-items: center;
		gap: 4rpx;

		text {
			font-size: 22rpx;
			color: #999;
		}
	}

	.item-actions {
		display: flex;
		gap: 12rpx;
		justify-content: space-between;
	}

	.action-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 6rpx;
		padding: 12rpx 18rpx;
		border-radius: 20rpx;
		background-color: #f8f9fa;
		transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
		border: 1rpx solid #e9ecef;
		position: relative;
		overflow: hidden;

		text {
			font-size: 24rpx;
			color: #666;
			font-weight: 500;
			position: relative;
			z-index: 2;
			text-align: center;
		}

		&::before {
			content: '';
			position: absolute;
			top: 0;
			left: -100%;
			width: 100%;
			height: 100%;
			background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
			transition: left 0.5s ease;
		}

		&:active {
			transform: scale(0.95);
		}
		
		&:hover::before {
			left: 100%;
		}
		
		&.collected {
			background-color: #ffa502;
			border-color: #ffa502;
			box-shadow: 0 4rpx 12rpx rgba(255, 165, 2, 0.3);
			
			text {
				color: #fff;
				font-weight: 600;
			}
			
			&:hover {
				background-color: #ff9500;
				transform: translateY(-2rpx);
				box-shadow: 0 6rpx 16rpx rgba(255, 165, 2, 0.4);
			}
		}
		
		&:first-child {
			background-color: #ff4757;
			// border-color: #ff4757;
			box-shadow: 0 4rpx 12rpx rgba(255, 71, 87, 0.3);
			
			text {
				color: #fff;
				font-weight: 600;
			}
			
			&:hover {
				background-color: #ff3742;
				transform: translateY(-2rpx);
				box-shadow: 0 6rpx 16rpx rgba(255, 71, 87, 0.4);
			}
		}
		
		&:last-child {
			background-color: #007AFF;
			border-color: #007AFF;
			box-shadow: 0 4rpx 12rpx rgba(0, 122, 255, 0.3);
			
			text {
				color: #fff;
				font-weight: 600;
			}
			
			&:hover {
				background-color: #0056b3;
				transform: translateY(-2rpx);
				box-shadow: 0 6rpx 16rpx rgba(0, 122, 255, 0.4);
			}
		}
	}

	/* ==================== 空状态样式 ==================== */
	.empty-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 120rpx 40rpx;
		
		image {
			width: 140rpx;
			height: 140rpx;
			margin-bottom: 32rpx;
			opacity: 0.8;
		}
		
		.empty-text {
			font-size: 36rpx;
			color: #2c3e50;
			margin-bottom: 16rpx;
			font-weight: 600;
			letter-spacing: 0.5rpx;
		}
		
		.empty-desc {
			font-size: 28rpx;
			color: #7f8c8d;
			margin-bottom: 48rpx;
			text-align: center;
			line-height: 1.5;
		}
		
		.empty-btn {
			padding: 24rpx 48rpx;
			background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
			color: #fff;
			border-radius: 48rpx;
			font-size: 28rpx;
			font-weight: 500;
			border: none;
			box-shadow: 0 6rpx 20rpx rgba(102, 126, 234, 0.3);
			transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
			
			&:hover {
				transform: translateY(-2rpx);
				box-shadow: 0 8rpx 24rpx rgba(102, 126, 234, 0.4);
			}
			
			&:active {
				transform: scale(0.95);
			}
		}
	}
	
	/* ==================== 加载状态样式 ==================== */
	.loading-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 80rpx 40rpx;
		background: rgba(255, 255, 255, 0.95);
		backdrop-filter: blur(10rpx);
		border-radius: 32rpx;
		box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.12);
		border: 1rpx solid rgba(255, 255, 255, 0.2);
		
		text {
			font-size: 28rpx;
			color: #7f8c8d;
			margin-top: 24rpx;
			font-weight: 500;
		}
	}
	
	/* ==================== 固定清除按钮样式 ==================== */
	.clear-history-fixed {
		position: fixed;
		bottom: 0;
		left: 0;
		right: 0;
		padding: 20rpx;
		background: #fff;
		border-top: 1rpx solid #f0f0f0;
		box-shadow: 0 -8rpx 32rpx rgba(0, 0, 0, 0.08);
		z-index: 100;

		.clear-btn {
			width: 100%;
			background: linear-gradient(135deg, #ff4757 0%, #ff3742 100%);
			color: #fff;
			border: none;
			border-radius: 48rpx;
			padding: 24rpx;
			font-size: 28rpx;
			font-weight: 500;
			box-shadow: 0 6rpx 20rpx rgba(255, 71, 87, 0.3);
			transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
			
			&:hover {
				transform: translateY(-2rpx);
				box-shadow: 0 8rpx 24rpx rgba(255, 71, 87, 0.4);
			}
			
			&:active {
				transform: scale(0.95);
			}
		}
	}
</style>
