<template>
	<view class="container">
		<!-- 关注列表 -->
		<view class="follow-list" v-if="state.list && state.list.length > 0">
			<view class="follow-item" v-for="(follow, index) in state.list" :key="follow.followId || index">
				<view class="item-image" @click="goToUserProfile(follow)">
					<image 
						:src="follow.followUserAvatar || '/static/logo.png'" 
						mode="aspectFill"
						@error="handleImageError"
						:lazy-load="true"
					></image>
				</view>
				<view class="item-content" @click="goToUserProfile(follow)">
					<view class="item-info">
						<view class="item-title">{{ follow.followUserNickname || '未知用户' }}</view>
						<view class="item-fans">
							<text>粉丝数 {{ follow.fansCount || 0 }}</text>
						</view>
					</view>
				</view>
				<view class="item-actions">
					<view class="action-btn" @click.stop="toggleFollow(follow, index)">
						<text>取消关注</text>
					</view>
				</view>
			</view>
		</view>
		
		<!-- 空状态 -->
		<view class="empty-state" v-else-if="isEmpty">
			<image src="/static/logo.png" mode="aspectFit"></image>
			<text class="empty-text">暂无关注</text>
			<text class="empty-desc">去发现更多有趣的用户吧</text>
			<button class="empty-btn" @click="goToHome">去首页逛逛</button>
		</view>
		
		<!-- 加载状态 -->
		<view class="loading-state" v-if="state.loading">
			<up-loading-icon mode="circle"></up-loading-icon>
			<text>加载中...</text>
		</view>
		
		<!-- 加载更多状态 -->
		<view class="load-more-state" v-if="state.loadingMore">
			<up-loading-icon mode="circle" size="24"></up-loading-icon>
			<text>加载更多...</text>
		</view>
		
		<!-- 错误状态 -->
		<view class="error-state" v-if="state.hasError">
			<up-icon name="warning" size="48" color="#ff4757"></up-icon>
			<text class="error-text">{{ state.error }}</text>
			<button class="retry-btn" @click="refresh">重试</button>
		</view>
	</view>
</template>

<script setup>
	/**
	 * 关注列表页面
	 * 功能描述：展示当前用户关注的用户列表
	 * 主要功能：关注列表展示、取消关注、时间格式化、跳转用户资料
	 */
	
	// 导入Vue响应式API
	import { ref, reactive, computed } from 'vue'
	import { onLoad, onReachBottom, onPullDownRefresh } from '@dcloudio/uni-app'
	
	// 导入API接口 - 使用新的统一API
	import { API } from '../../api'
	
	// 响应式数据定义
	const state = reactive({
		list: [],
		loading: false,
		hasMore: true,
		page: 1,
		size: 10
	})
	
	// 计算属性
	const isEmpty = computed(() => !state.list || state.list.length === 0)
	const canLoadMore = computed(() => state.hasMore && !state.loading)
	const isFirstLoad = computed(() => state.page === 1)
	
	/**
	 * 加载关注列表
	 */
	const loadUserList = async () => {
		if (state.loading) return
		
		try {
			state.loading = true
			console.log('📱 加载关注列表，页码:', state.page)
			
			const response = await API.user.getFollowList({
				page: state.page,
				size: state.size
			})
			
			if (response && response.code === 1) {
				const rawList = (response.data && response.data.list) ? response.data.list : []
				// 归一化字段，确保有 followUserId、头像、昵称
				const newList = rawList.map(item => ({
					...item,
					followUserId: item.followUserId || item.userId || item.followeeUserId || item.fanUserId || item.id,
					followUserAvatar: item.followUserAvatar || item.avatar || item.avatarUrl || item.userAvatar,
					followUserNickname: item.followUserNickname || item.nickname || item.nickName || item.userNickname,
					isFollowing: true
				}))
				
				if (state.page === 1) {
					state.list = newList
				} else {
					state.list.push(...newList)
				}
				
				state.hasMore = newList && newList.length === state.size
				console.log('📱 关注列表加载成功:', newList ? newList.length : 0, '条')
			} else {
				console.error('📱 关注列表加载失败:', response)
				uni.showToast({
					title: '加载失败',
					icon: 'none'
				})
			}
		} catch (error) {
			console.error('📱 关注列表加载异常:', error)
			uni.showToast({
				title: '加载失败',
				icon: 'none'
			})
		} finally {
			state.loading = false
		}
	}
	
	/**
	 * 加载更多
	 */
	const loadMore = async () => {
		if (!canLoadMore.value) return
		
		state.page++
		await loadUserList()
	}
	
	/**
	 * 刷新列表
	 */
	const refresh = async () => {
		state.page = 1
		state.hasMore = true
		await loadUserList()
	}
	
	/**
	 * 切换关注状态
	 */
	const toggleFollow = async (user, idx) => {
		// 本页仅提供“取消关注”操作
		const action = 'unfollow'
		const confirmText = '确定要取消关注该用户吗？'
		
		uni.showModal({
			title: '请确认',
			content: confirmText,
			success: async (res) => {
				if (!res.confirm) return
				try {
					await API.user.toggleFollow(user.followUserId, action)
					
					if (action === 'unfollow') {
						// 从列表移除该项
						const index = typeof idx === 'number' ? idx : state.list.findIndex(it => (it.followUserId) === user.followUserId)
						if (index > -1) state.list.splice(index, 1)
					} else {
						user.isFollowing = true
					}
					
					uni.showToast({
						title: action === 'unfollow' ? '已取消关注' : '关注成功',
						icon: 'success'
					})
				} catch (error) {
					console.error('切换关注状态失败:', error)
					uni.showToast({
						title: '操作失败',
						icon: 'none'
					})
				}
			}
		})
	}
	
	/**
	 * 跳转到用户资料页
	 */
	const goToUserProfile = (user) => {
		uni.navigateTo({
			url: `/pages/user-profile/user-profile?userId=${user.followUserId}`
		})
	}
	
	/**
	 * 返回首页
	 */
	const goToHome = () => {
		uni.switchTab({
			url: '/pages/index/index'
		})
	}
	
	/**
	 * 页面加载时获取数据
	 */
	onLoad(async () => {
		console.log('📱 关注列表页面加载')
		await loadUserList()
	})
	
	/**
	 * 触底加载更多
	 */
	onReachBottom(() => {
		if (canLoadMore.value) {
			console.log('📱 触底加载更多')
			loadMore()
		}
	})
	
	/**
	 * 下拉刷新
	 */
	onPullDownRefresh(async () => {
		console.log('📱 下拉刷新')
		await refresh()
		uni.stopPullDownRefresh()
	})
	
	/**
	 * 处理图片加载错误
	 */
	const handleImageError = (e) => {
		console.log('图片加载失败:', e)
		// 可以设置默认头像
		e.target.src = '/static/logo.png'
	}
	
</script>

<style lang="scss" scoped>
	.container {
		// background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
		min-height: 100vh;
		padding: 24rpx;
	}
	
	.follow-list {
		display: flex;
		flex-direction: column;
		gap: 24rpx;
	}
	
	.follow-item {
		background: rgba(255, 255, 255, 0.95);
		backdrop-filter: blur(10rpx);
		border-radius: 24rpx;
		overflow: hidden;
		box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.12);
		display: flex;
		padding: 32rpx;
		align-items: center;
		gap: 24rpx;
		transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
		border: 1rpx solid rgba(255, 255, 255, 0.2);
		
		&:hover {
			transform: translateY(-4rpx);
			box-shadow: 0 12rpx 40rpx rgba(0, 0, 0, 0.15);
		}
		
		.item-image {
			width: 100rpx;
			height: 100rpx;
			border-radius: 50%;
			overflow: hidden;
			flex-shrink: 0;
			position: relative;
			border: 3rpx solid rgba(255, 255, 255, 0.8);
			box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.1);
			
			image {
				width: 100%;
				height: 100%;
				object-fit: cover;
			}
		}
		
		.item-content {
			flex: 1;
			display: flex;
			flex-direction: column;
			justify-content: center;
			padding: 0 16rpx;
			
			.item-info {
				display: flex;
				flex-direction: column;
				gap: 12rpx;
				
				.item-title {
					font-size: 32rpx;
					font-weight: 600;
					color: #2c3e50;
					line-height: 1.3;
					letter-spacing: 0.5rpx;
				}
				
				.item-fans {
					display: flex;
					align-items: center;
					gap: 8rpx;
					font-size: 24rpx;
					color: #7f8c8d;
					font-weight: 500;
				}
			}
		}
		
		.item-actions {
			display: flex;
			align-items: center;
			justify-content: center;
			
			.action-btn {
				display: flex;
				align-items: center;
				justify-content: center;
				width: 140rpx;
				height: 64rpx;
				background: linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%);
				border-radius: 32rpx;
				font-size: 24rpx;
				font-weight: 500;
				color: #fff;
				transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
				text-align: center;
				line-height: 1;
				box-shadow: 0 4rpx 16rpx rgba(255, 107, 107, 0.3);
				border: none;
				cursor: pointer;
				
				text {
					display: block;
					text-align: center;
					line-height: 1;
					font-weight: 500;
				}
				
				&:hover {
					transform: translateY(-2rpx);
					box-shadow: 0 6rpx 20rpx rgba(255, 107, 107, 0.4);
				}
				
				&:active {
					transform: scale(0.95);
					box-shadow: 0 2rpx 8rpx rgba(255, 107, 107, 0.3);
				}
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