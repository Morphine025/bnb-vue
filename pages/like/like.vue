<template>
	<PageContainer 
		:enable-pull-refresh="true" 
		background-type="gradient"
		@pull-refresh="onPullRefresh"
	>
		<!-- 喜欢列表 -->
		<view class="like-list" v-if="list.length > 0">
			<HomestayListItem
				v-for="(item, index) in list"
				:key="item.homestayId"
				:item="item"
				:button-config="buttonConfig"
				@item-click="goToDetail"
				@primary-action="(item) => removeItem(item, index)"
				@secondary-action="shareItem"
				@image-error="handleImageError"
			/>
		</view>
		
		<!-- 空状态 -->
		<view class="empty-state" v-else-if="!loading">
			<image src="/static/logo.png" mode="aspectFit"></image>
			<text class="empty-text">暂无喜欢内容</text>
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
	</PageContainer>
</template>

<script setup>
	/**
	 * 喜欢页面组件
	 * 功能描述：展示用户喜欢的民宿列表
	 * 主要功能：喜欢列表展示、取消喜欢、分享、跳转详情
	 */

	// 导入API接口
	import { API } from '../../api'
	
	// 导入分享工具
	import { showShareOptions } from '@/utils'
	
	// 导入公共组件
	import PageContainer from '../../components/Common/PageContainer.vue'
	import HomestayListItem from '../../components/HomestayList/HomestayListItem.vue'
	
	// 导入通用Hook
	import { useHomestayList } from '../../composables/useHomestayList'

	// 使用通用Hook
	const {
		list,
		loading,
		loadingMore,
		hasError,
		errorMessage,
		buttonConfig,
		removeItem: removeItemBase,
		shareItem: shareItemBase,
		goToDetail,
		goToHome,
		retryLoad,
		handleImageError,
		onPullRefresh
	} = useHomestayList({
		loadListApi: API.user.getLikeList,
		removeItemApi: API.homestay.toggleLike,
		cacheKey: 'like_list',
		cacheTTL: 3 * 60 * 1000, // 3分钟缓存
		buttonConfig: {
			primary: {
				text: '取消喜欢',
				icon: 'heart',
				class: 'primary-btn'
			},
			secondary: {
				text: '分享',
				icon: 'share',
				class: 'secondary-btn'
			}
		}
	})

	/**
	 * 移除喜欢项
	 */
	const removeItem = async (item, index) => {
		await removeItemBase(item, index)
	}

	/**
	 * 分享房源
	 */
	const shareItem = async (item) => {
		// 直接使用Hook中的分享功能，已经集成了统一的错误处理
		await shareItemBase(item)
	}
</script>

<style lang="scss" scoped>
	.like-list {
		padding: 30rpx 20rpx;
		max-width: 750rpx;
		margin: 0 auto;
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