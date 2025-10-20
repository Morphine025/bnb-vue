<template>
	<view class="container">
		<!-- 收藏列表 -->
		<view class="collect-list" v-if="collectList.length > 0">
			<view class="collect-item" v-for="(item, index) in collectList" :key="item.homestayId" @click="goToDetail(item)">
				<view class="item-image">
					<image 
						:src="item.images && item.images.length > 0 ? item.images[0] : '/static/logo.png'" 
						mode="aspectFill"
						@error="handleImageError"
						:lazy-load="true"
					></image>
				</view>
				<view class="item-content">
					<!-- 标题 -->
					<view class="item-title">{{ item.title }}</view>
					
					<!-- 位置 -->
					<view class="item-location">
						<up-icon name="map" size="14" color="#999"></up-icon>
						<text>{{ item.city }}</text>
					</view>
					
					<!-- 金额 -->
					<view class="item-price">
						<text class="price-symbol">¥</text>
						<text class="price-number">{{ formatPrice(item.price) }}</text>
					</view>
					
					<!-- 按钮 -->
					<view class="item-actions">
						<view class="action-btn" @click.stop="removeCollect(item, index)">
							<up-icon name="trash" size="16" color="#fff"></up-icon>
							<text>取消收藏</text>
						</view>
						<view class="action-btn" @click.stop="shareItem(item)">
							<up-icon name="share" size="16" color="#fff"></up-icon>
							<text>分享</text>
						</view>
					</view>
				</view>
			</view>
		</view>
		
		<!-- 空状态 -->
		<view class="empty-state" v-else-if="!loading">
			<image src="/static/logo.png" mode="aspectFit"></image>
			<text class="empty-text">暂无收藏内容</text>
			<text class="empty-desc">去首页看看有什么好房源吧</text>
			<button class="empty-btn" @click="goToHome">去首页逛逛</button>
		</view>
		
		<!-- 加载状态 -->
		<view class="loading-state" v-if="loading">
			<up-loading-icon mode="circle"></up-loading-icon>
			<text>加载中...</text>
		</view>
		
		<!-- 加载更多状态 -->
		<view class="load-more-state" v-if="loadingMore">
			<up-loading-icon mode="circle" size="24"></up-loading-icon>
			<text>加载更多...</text>
		</view>
		
		<!-- 错误状态 -->
		<view class="error-state" v-if="hasError">
			<up-icon name="warning" size="48" color="#ff4757"></up-icon>
			<text class="error-text">{{ errorMessage }}</text>
			<button class="retry-btn" @click="retryLoad">重试</button>
		</view>
	</view>
</template>

<script setup>
	/**
	 * 收藏页面组件
	 * 功能描述：展示用户收藏的民宿列表
	 * 主要功能：收藏列表展示、取消收藏、分享、跳转详情
	 */

	// 导入Vue响应式API
	import { ref, reactive, onMounted } from 'vue'
	
	// 导入uni-app生命周期钩子
	import { onLoad, onShow, onPullDownRefresh } from '@dcloudio/uni-app'
	
	// 导入API接口 - 使用新的统一API机制
	import { API } from '../../api'
	
	// 导入价格格式化工具
	import { formatPrice } from '../../utils/priceFormatter.js'
	
	// 导入分享工具
	import { showShareOptions } from '../../utils/shareUtils.js'

	// 响应式数据
	const collectList = ref([])
	const loading = ref(false)
	const loadingMore = ref(false)
	const hasError = ref(false)
	const errorMessage = ref('')
	const page = ref(1)
	const pageSize = ref(10)
	const hasMore = ref(true)
	const hasLoaded = ref(false) // 添加加载标志

	/**
	 * 页面加载时获取收藏列表
	 */
	onLoad(() => {
		console.log('📱 收藏页面加载')
		loadCollectList()
	})

	/**
	 * 页面显示时刷新数据
	 */
	onShow(() => {
		console.log('📱 收藏页面显示')
		// 页面显示时不自动加载数据，避免重复请求
		// 如需刷新数据，请使用下拉刷新功能
	})

	/**
	 * 下拉刷新
	 */
	onPullDownRefresh(async () => {
		console.log('📱 收藏页面下拉刷新')
		page.value = 1
		hasMore.value = true
		hasLoaded.value = false // 重置加载标志
		await loadCollectList()
		uni.stopPullDownRefresh()
	})

	/**
	 * 加载收藏列表
	 */
	const loadCollectList = async () => {
		try {
			loading.value = true
			hasError.value = false
			errorMessage.value = ''

			console.log('📱 开始加载收藏列表')
			
			const response = await API.user.getCollectList({
				page: page.value,
				size: pageSize.value
			})

			if (response && response.code === 1) {
				if (page.value === 1) {
					collectList.value = response.data?.list || []
				} else {
					collectList.value = [...collectList.value, ...(response.data?.list || [])]
				}
				
				hasMore.value = response.data?.list && response.data.list.length === pageSize.value
				hasLoaded.value = true // 标记已加载
				console.log('📱 收藏列表加载成功:', collectList.value.length)
			} else {
				throw new Error(response?.msg || '加载失败')
			}
		} catch (error) {
			console.error('📱 加载收藏列表失败:', error)
			hasError.value = true
			errorMessage.value = error.message || '加载失败，请重试'
		} finally {
			loading.value = false
		}
	}

	/**
	 * 取消收藏
	 */
	const removeCollect = async (item, index) => {
		try {
			console.log('📱 取消收藏:', item.title)
			
			const response = await API.homestay.toggleCollect(item.homestayId, 'uncollect')
			
			if (response && response.code === 1) {
				collectList.value.splice(index, 1)
				uni.showToast({
					title: '已取消收藏',
					icon: 'success'
				})
			} else {
				throw new Error(response?.msg || '操作失败')
			}
		} catch (error) {
			console.error('📱 取消收藏失败:', error)
			uni.showToast({
				title: error.message || '操作失败',
				icon: 'error'
			})
		}
	}

	/**
	 * 分享房源
	 */
	const shareItem = async (item) => {
		try {
			console.log('📱 分享房源:', item.title)
			await showShareOptions(item)
		} catch (error) {
			console.error('📱 分享失败:', error)
			uni.showToast({
				title: error.message || '分享失败',
				icon: 'error'
			})
		}
	}

	/**
	 * 跳转到详情页
	 */
	const goToDetail = (item) => {
		console.log('📱 跳转详情页:', item.title)
		uni.navigateTo({
			url: `/pages/detail/detail?id=${item.homestayId}`
		})
	}

	/**
	 * 跳转到首页
	 */
	const goToHome = () => {
		console.log('📱 跳转首页')
		uni.switchTab({
			url: '/pages/index/index'
		})
	}

	/**
	 * 重试加载
	 */
	const retryLoad = () => {
		hasError.value = false
		errorMessage.value = ''
		loadCollectList()
	}
	
	/**
	 * 处理图片加载错误
	 */
	const handleImageError = (e) => {
		console.warn('图片加载失败:', e)
		// 可以设置默认图片或显示占位符
	}
</script>

<style lang="scss" scoped>
	.container {
		min-height: 100vh;
		position: relative;
		
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

	.collect-list {
		padding: 30rpx 20rpx;
		max-width: 750rpx;
		margin: 0 auto;
	}

	.collect-item {
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
		
		&:first-child {
			background-color: #ff4757;
			border-color: #ff4757;
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
	
	.load-more-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 48rpx;
		background: rgba(255, 255, 255, 0.95);
		backdrop-filter: blur(10rpx);
		margin: 24rpx;
		border-radius: 32rpx;
		box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.12);
		border: 1rpx solid rgba(255, 255, 255, 0.2);
		
		text {
			font-size: 24rpx;
			color: #7f8c8d;
			margin-top: 16rpx;
			font-weight: 500;
		}
	}
	
	.error-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 100rpx 40rpx;
		background: rgba(255, 255, 255, 0.95);
		backdrop-filter: blur(10rpx);
		border-radius: 32rpx;
		box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.12);
		border: 1rpx solid rgba(255, 255, 255, 0.2);
		margin: 24rpx;
		
		.error-text {
			font-size: 28rpx;
			color: #e74c3c;
			margin: 24rpx 0;
			text-align: center;
			font-weight: 500;
			line-height: 1.5;
		}
		
		.retry-btn {
			padding: 24rpx 48rpx;
			background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
			color: #fff;
			border-radius: 48rpx;
			font-size: 28rpx;
			font-weight: 500;
			border: none;
			margin-top: 24rpx;
			box-shadow: 0 6rpx 20rpx rgba(102, 126, 234, 0.3);
			transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
			
			&:hover:not(:disabled) {
				transform: translateY(-2rpx);
				box-shadow: 0 8rpx 24rpx rgba(102, 126, 234, 0.4);
			}
			
			&:active:not(:disabled) {
				transform: scale(0.95);
			}
			
			&:focus {
				outline: none;
				box-shadow: 0 0 0 2rpx rgba(102, 126, 234, 0.3);
			}
			
			&:disabled {
				opacity: 0.6;
				cursor: not-allowed;
				transform: none;
			}
		}
	}
</style>