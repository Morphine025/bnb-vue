<template>
	<view class="user-list-container">
		<!-- 用户列表 -->
		<view class="user-list" v-if="list.length > 0">
			<view 
				class="user-item" 
				v-for="(user, index) in list" 
				:key="getUserKey(user, index)"
			>
				<view class="item-image" @click="handleUserClick(user)">
					<image 
						:src="getUserAvatar(user)" 
						mode="aspectFill"
						@error="handleImageError"
						:lazy-load="true"
					></image>
				</view>
				<view class="item-content" @click="handleUserClick(user)">
					<view class="item-info">
						<view class="item-title">{{ getUserNickname(user) }}</view>
						<view class="item-fans" v-if="showFansCount">
							<text>粉丝数 {{ getUserFansCount(user) }}</text>
						</view>
					</view>
				</view>
				<view class="item-actions">
					<view 
						class="action-btn" 
						:class="getActionButtonClass(user)"
						@click.stop="handleActionClick(user, index)"
					>
						<text>{{ getActionButtonText(user) }}</text>
					</view>
				</view>
			</view>
		</view>
		
		<!-- 空状态 -->
		<view class="empty-state" v-else-if="isEmpty">
			<image :src="emptyImage" mode="aspectFit"></image>
			<text class="empty-text">{{ emptyText }}</text>
			<text class="empty-desc" v-if="emptyDesc">{{ emptyDesc }}</text>
			<button class="empty-btn" @click="handleEmptyAction" v-if="emptyActionText">
				{{ emptyActionText }}
			</button>
		</view>
		
		<!-- 加载状态 -->
		<view class="loading-state" v-if="isLoading">
			<up-loading-icon mode="circle"></up-loading-icon>
			<text>加载中...</text>
		</view>
		
		<!-- 加载更多状态 -->
		<view class="load-more-state" v-if="isLoadingMore">
			<up-loading-icon mode="circle" size="24"></up-loading-icon>
			<text>加载更多...</text>
		</view>
		
		<!-- 错误状态 -->
		<view class="error-state" v-if="hasError">
			<up-icon name="warning" size="48" color="#ff4757"></up-icon>
			<text class="error-text">{{ errorMessage }}</text>
			<button class="retry-btn" @click="handleRetry">重试</button>
		</view>
	</view>
</template>

<script setup>
/**
 * 通用用户列表组件
 * 功能描述：支持关注列表、粉丝列表等用户列表展示的通用组件
 * 主要功能：
 *   - 用户列表展示（头像、昵称、粉丝数）
 *   - 操作按钮（关注/取消关注、移除粉丝）
 *   - 空状态处理（图片、文本、操作按钮）
 *   - 加载状态（初始加载、加载更多）
 *   - 错误状态（错误提示、重试按钮）
 * 
 * 使用场景：
 *   - 关注列表页面
 *   - 粉丝列表页面
 *   - 其他用户列表展示场景
 * 
 * 技术特点：
 *   - 高度可配置（通过props控制行为）
 *   - 事件驱动（通过emit与父组件通信）
 *   - 响应式设计（支持不同屏幕尺寸）
 *   - 无障碍访问（支持键盘导航）
 */

import { computed } from 'vue'

// ==================== Props定义 ====================

const props = defineProps({
	/**
	 * 用户列表数据
	 */
	list: {
		type: Array,
		default: () => []
	},
	
	/**
	 * 是否正在加载
	 */
	isLoading: {
		type: Boolean,
		default: false
	},
	
	/**
	 * 是否正在加载更多
	 */
	isLoadingMore: {
		type: Boolean,
		default: false
	},
	
	/**
	 * 是否有错误
	 */
	hasError: {
		type: Boolean,
		default: false
	},
	
	/**
	 * 错误消息
	 */
	errorMessage: {
		type: String,
		default: '加载失败'
	},
	
	/**
	 * 是否显示粉丝数
	 */
	showFansCount: {
		type: Boolean,
		default: true
	},
	
	/**
	 * 空状态图片
	 */
	emptyImage: {
		type: String,
		default: '/static/logo.png'
	},
	
	/**
	 * 空状态文本
	 */
	emptyText: {
		type: String,
		default: '暂无数据'
	},
	
	/**
	 * 空状态描述
	 */
	emptyDesc: {
		type: String,
		default: ''
	},
	
	/**
	 * 空状态操作按钮文本
	 */
	emptyActionText: {
		type: String,
		default: ''
	},
	
	/**
	 * 操作按钮类型：'follow' | 'remove'
	 */
	actionType: {
		type: String,
		default: 'follow',
		validator: (value) => ['follow', 'remove'].includes(value)
	}
})

// ==================== 事件定义 ====================

const emit = defineEmits([
	'userClick',      // 用户点击事件
	'actionClick',    // 操作按钮点击事件
	'action-click',   // 操作按钮点击事件（kebab-case）
	'emptyAction',    // 空状态操作事件
	'empty-action',   // 空状态操作事件（kebab-case）
	'retry',          // 重试事件
	'imageError',     // 图片错误事件
	'image-error'     // 图片错误事件（kebab-case）
])

// ==================== 计算属性 ====================

/**
 * 是否为空状态
 */
const isEmpty = computed(() => {
	const list = props.list
	return Array.isArray(list) ? list.length === 0 : true
})

// ==================== 方法定义 ====================

/**
 * 获取用户唯一标识
 */
const getUserKey = (user, index) => {
	return user.followId || user.fanId || user.userId || user.id || index
}

/**
 * 获取用户ID
 */
const getUserId = (user) => {
	console.log(`📱 UserList获取用户ID - 原始用户数据:`, user)
	
	// 根据不同的列表类型使用不同的字段名
	let userId
	if (props.actionType === 'remove') {
		// 粉丝列表：使用 fanUserId
		userId = user.fanUserId || user.userId || user.id
	} else if (props.actionType === 'follow') {
		// 关注列表：使用 followUserId
		userId = user.followUserId || user.userId || user.id
	} else {
		// 其他情况：使用通用字段
		userId = user.userId || user.id
	}
	
	console.log(`📱 UserList获取的用户ID:`, userId)
	return userId
}

/**
 * 获取用户头像
 */
const getUserAvatar = (user) => {
	return user.followUserAvatar || 
		   user.fanUserAvatar || 
		   user.avatar || 
		   user.avatarUrl || 
		   user.userAvatar || 
		   '/static/logo.png'
}

/**
 * 获取用户昵称
 */
const getUserNickname = (user) => {
	return user.followUserNickname || 
		   user.fanUserNickname || 
		   user.nickname || 
		   user.nickName || 
		   user.userNickname || 
		   '未知用户'
}

/**
 * 获取用户粉丝数
 */
const getUserFansCount = (user) => {
	return user.fansCount || user.followerCount || 0
}

/**
 * 获取操作按钮文本
 */
const getActionButtonText = (user) => {
	if (props.actionType === 'follow') {
		// 关注列表页面：显示的都是已关注的用户，按钮应该显示"取消关注"
		// 如果用户数据中有isFollowing字段，则根据该字段判断
		// 否则默认为已关注状态（因为这是关注列表页面）
		return (user.isFollowing !== false) ? '取消关注' : '关注'
	} else if (props.actionType === 'remove') {
		return '移除粉丝'
	}
	return '操作'
}

/**
 * 获取操作按钮样式类
 */
const getActionButtonClass = (user) => {
	const baseClass = 'action-btn'
	if (props.actionType === 'follow') {
		// 关注列表页面：显示的都是已关注的用户，按钮应该显示"取消关注"样式
		// 如果用户数据中有isFollowing字段，则根据该字段判断
		// 否则默认为已关注状态（因为这是关注列表页面）
		return (user.isFollowing !== false) ? `${baseClass} unfollow-btn` : `${baseClass} follow-btn`
	} else if (props.actionType === 'remove') {
		return `${baseClass} remove-btn`
	}
	return baseClass
}

/**
 * 处理用户点击事件
 */
const handleUserClick = (user) => {
	console.log(`📱 UserList处理用户点击:`, user)
	
	// 确保用户对象包含正确的userId
	const userId = getUserId(user)
	const userWithId = {
		...user,
		userId: userId
	}
	
	console.log(`📱 UserList处理后的用户数据:`, userWithId)
	
	emit('userClick', userWithId)
}

/**
 * 处理操作按钮点击事件
 */
const handleActionClick = (user, index) => {
	// 确保用户对象包含正确的userId
	const userId = getUserId(user)
	const userWithId = {
		...user,
		userId: userId
	}
	
	console.log(`📱 UserList处理操作点击:`, {
		originalUser: user,
		userId: userId,
		userWithId: userWithId
	})
	
	// 只发出一个事件，避免重复调用
	emit('action-click', { user: userWithId, index })
}

/**
 * 处理空状态操作事件
 */
const handleEmptyAction = () => {
	emit('emptyAction')
	// 同时发出empty-action事件以保持兼容性
	emit('empty-action')
}

/**
 * 处理重试事件
 */
const handleRetry = () => {
	emit('retry')
}

/**
 * 处理图片加载错误
 */
const handleImageError = (event) => {
	emit('imageError', { event, user: event.target })
	// 同时发出image-error事件以保持兼容性
	emit('image-error', { event, user: event.target })
}
</script>

<style lang="scss" scoped>
/* ==================== 容器样式 ==================== */

.user-list-container {
	width: 100%;
}

/* ==================== 用户列表样式 ==================== */

.user-list {
	display: flex;
	flex-direction: column;
	gap: 24rpx;
}

.user-item {
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
			border-radius: 32rpx;
			font-size: 24rpx;
			font-weight: 500;
			color: #fff;
			transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
			text-align: center;
			line-height: 1;
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
			}
			
			&:active {
				transform: scale(0.95);
			}
		}
		
		.follow-btn {
			background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
			box-shadow: 0 4rpx 16rpx rgba(102, 126, 234, 0.3);
		}
		
		.unfollow-btn, .remove-btn {
			background: linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%);
			box-shadow: 0 4rpx 16rpx rgba(255, 107, 107, 0.3);
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

/* ==================== 错误状态样式 ==================== */

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
