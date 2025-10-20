<template>
	<view class="container">
		<!-- 粉丝列表 -->
		<view class="fans-list" v-if="state.list.length > 0">
			<view class="fans-item" v-for="(fan, index) in state.list" :key="fan.followId || index">
				<view class="item-image" @click="goToUserProfile(fan)">
					<image 
						:src="fan.followUserAvatar || '/static/logo.png'" 
						mode="aspectFill"
						@error="handleImageError"
						:lazy-load="true"
					></image>
				</view>
				<view class="item-content" @click="goToUserProfile(fan)">
					<view class="item-info">
						<view class="item-title">{{ fan.followUserNickname || '未知用户' }}</view>
						<view class="item-fans">
							<text>粉丝数 {{ fan.fansCount || 0 }}</text>
						</view>
					</view>
				</view>
				<view class="item-actions">
					<view class="action-btn" @click.stop="removeFan(fan, index)">
						<text>移除粉丝</text>
					</view>
				</view>
			</view>
		</view>
		
		<!-- 空状态 -->
		<view class="empty-state" v-else-if="isEmpty">
			<image src="/static/logo.png" mode="aspectFit"></image>
			<text class="empty-text">暂无粉丝</text>
			<text class="empty-desc">发布优质内容来吸引更多粉丝吧</text>
			<button class="empty-btn" @click="refresh">刷新试试</button>
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
	</view>
</template>

<script setup>
	/**
	 * 粉丝列表页面
	 * 功能描述：展示当前用户的粉丝列表
	 * 主要功能：粉丝列表展示、关注/取消关注、时间格式化
	 */
	
	// 导入Vue响应式API
	import { ref, reactive, computed } from 'vue'
	
	// 导入uni-app生命周期钩子
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

// 去重移除中的请求集合（避免重复点击导致多次调用）
const removingPending = new Set()
	
	// 计算属性
	const isEmpty = computed(() => state.list.length === 0)
	const canLoadMore = computed(() => state.hasMore && !state.loading)
	const isFirstLoad = computed(() => state.page === 1)
	
	/**
	 * 加载粉丝列表
	 */
	const loadUserList = async () => {
		if (state.loading) return
		
		try {
			state.loading = true
			console.log('📱 加载粉丝列表，页码:', state.page)
			
			const response = await API.user.getFansList({
				page: state.page,
				size: state.size
			})
			
			if (response && response.code === 1) {
				const rawList = (response.data && response.data.list) ? response.data.list : []
				// 归一化字段，确保有 fanUserId、头像、昵称可用
				const newList = rawList.map(item => ({
					...item,
					fanUserId: item.fanUserId || item.userId || item.followerUserId || item.followUserId || item.id,
					followUserAvatar: item.followUserAvatar || item.avatar || item.avatarUrl || item.userAvatar,
					followUserNickname: item.followUserNickname || item.nickname || item.nickName || item.userNickname
				}))
				
				if (state.page === 1) {
					state.list = newList
				} else {
					state.list.push(...newList)
				}
				
				state.hasMore = newList.length === state.size
				console.log('📱 粉丝列表加载成功:', newList.length, '条')
			} else {
				console.error('📱 粉丝列表加载失败:', response)
				uni.showToast({
					title: '加载失败',
					icon: 'none'
				})
			}
		} catch (error) {
			console.error('📱 粉丝列表加载异常:', error)
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
	 * 移除粉丝
	 */
const removeFan = async (user) => {
        // 确认弹窗
        uni.showModal({
            title: '确认移除',
            content: '确定要移除此粉丝吗？',
            success: async (res) => {
                if (!res.confirm) return
                try {
                    // 优先取明确的粉丝来源ID，避免误用当前登录用户ID
                    const candidateIds = [user.fanUserId, user.followerUserId, user.userId, user.followUserId, user.id]
                    const targetId = candidateIds.find(id => !!id)

                    if (!targetId) {
                        uni.showToast({ title: '无效的粉丝ID', icon: 'none' })
                        return
                    }

                    if (removingPending.has(targetId)) {
                        return
                    }
                    removingPending.add(targetId)

                    await API.user.removeFan(targetId)
                    
                    // 从列表中移除
                    const index = state.list.findIndex(item => (item.fanUserId || item.followerUserId || item.userId || item.followUserId || item.id) === targetId)
                    if (index > -1) {
                        state.list.splice(index, 1)
                    }
                    
                    uni.showToast({
                        title: '移除成功',
                        icon: 'success'
                    })
                    // 强制刷新第一页数据，确保与后端同步
                    await refresh()
                } catch (error) {
                    console.error('移除粉丝失败:', error)
                    uni.showToast({
                        title: '操作失败',
                        icon: 'none'
                    })
                } finally {
                    const clearId = user.fanUserId || user.followerUserId || user.userId || user.followUserId || user.id
                    if (clearId) removingPending.delete(clearId)
                }
            }
        })
    }
	
	/**
	 * 跳转到用户资料页
	 */
	const goToUserProfile = (user) => {
		uni.navigateTo({
			url: `/pages/user-profile/user-profile?userId=${user.fanUserId || user.userId || user.followerUserId || user.followUserId || user.id}`
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
		console.log('📱 粉丝列表页面加载')
		await loadUserList()
	})
	
	/**
	 * 触底加载更多
	 */
onReachBottom(() => {
		if (canLoadMore.value) {
			loadMore()
		}
	})
	
	/**
	 * 下拉刷新
	 */
	onPullDownRefresh(async () => {
		console.log('📱 下拉刷新粉丝列表')
		await refresh()
		uni.stopPullDownRefresh()
	})
	
</script>

<style lang="scss" scoped>
	.container {
		// background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
		min-height: 100vh;
		padding: 24rpx;
	}
	
	.fans-list {
		display: flex;
		flex-direction: column;
		gap: 24rpx;
	}
	
	.fans-item {
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
</style>
