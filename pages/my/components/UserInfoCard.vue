<template>
	<!-- 用户信息卡片区域 -->
	<view class="users">
		<!-- 用户头像和昵称区域 -->
		<view class="u-top" @click="handleUserClick">
			<!-- 未登录状态：显示默认头像和登录提示 -->
			<template v-if="!userInfo.nickName">
				<image src='/static/unnamed.jpg' mode="aspectFill" />
				<view class="tit">
					注册 / 登录
				</view>
			</template>
			<!-- 已登录状态：显示用户头像和昵称 -->
			<template v-else>
				<image :src='safeAvatarUrl' mode="aspectFill" @error="onAvatarError" />
				<view class="tit">
					{{userInfo.nickName}}
				</view>
			</template>
		</view>
		<!-- 用户统计数据区域 -->
		<UserStatsDisplay 
			:user-stats="userStats"
			@item-click="handleStatsItemClick"
		/>
	</view>
</template>

<script setup>
/**
 * 用户信息卡片组件
 * 功能描述：展示用户头像、昵称和统计数据
 * 主要功能：
 * 1. 用户头像展示 - 支持默认头像和用户头像
 * 2. 用户昵称展示 - 显示用户昵称或登录提示
 * 3. 统计数据展示 - 集成UserStatsDisplay组件
 * 4. 点击事件处理 - 处理用户点击和统计项点击
 * 
 * 技术特点：
 * - 响应式数据绑定
 * - 智能头像处理
 * - 事件传递机制
 * - 样式封装
 */

// ==================== 导入依赖 ====================

import { computed } from 'vue'
import { convertToHttps } from '@/utils/security/urlConverter'  // URL协议转换
import { handleAvatarError } from '@/utils/ui/imageErrorHandler'  // 图片错误处理
import UserStatsDisplay from './UserStatsDisplay.vue'

// ==================== 组件属性 ====================

/**
 * 组件属性定义
 */
const props = defineProps({
	// 用户信息对象
	userInfo: {
		type: Object,
		default: () => ({
			nickName: '',
			avatarUrl: ''
		})
	},
	// 用户统计数据
	userStats: {
		type: Object,
		default: () => ({
			followers: 0,     // 粉丝数
			following: 0,     // 关注数
			likes: 0,         // 喜欢数
			collections: 0,   // 收藏数
			views: 0,         // 浏览数
			homestays: 0      // 发布数
		})
	}
})

// ==================== 事件定义 ====================

/**
 * 定义组件事件
 */
const emit = defineEmits(['userClick', 'statsItemClick'])

// ==================== 计算属性 ====================

/**
 * 安全的头像URL
 * 功能：处理协议转换和默认头像
 */
const safeAvatarUrl = computed(() => {
	if (!props.userInfo?.avatarUrl) return '/static/logo.png'
	return convertToHttps(props.userInfo.avatarUrl)
})

// ==================== 事件处理 ====================

/**
 * 处理用户点击事件
 * 功能：向父组件传递用户点击事件
 */
const handleUserClick = () => {
	console.log('用户信息卡片点击')
	emit('userClick')
}

/**
 * 处理统计项点击事件
 * 功能：向父组件传递统计项点击事件
 * @param {Object} item - 统计项对象
 */
const handleStatsItemClick = (item) => {
	console.log('统计项点击:', item.label, '操作:', item.action)
	emit('statsItemClick', item)
}

/**
 * 处理头像加载错误
 * 功能：使用工具函数处理头像加载错误
 * @param {Object} errorData - 错误数据对象
 */
const onAvatarError = (errorData) => {
	// 使用导入的工具函数处理头像错误
	handleAvatarError(errorData)
}
</script>

<style lang="scss" scoped>
/**
 * 用户信息卡片样式
 * 包含用户头像、昵称和统计数据的完整样式
 */

.users {
	margin-top: 80rpx;
	padding: 30rpx;
	box-sizing: border-box;
	height: 280rpx;
	background-color: #fff;
	box-shadow: 1px 10rpx 20rpx #ececec;
	border-radius: 16rpx;

	.u-top {
		display: flex;
		justify-content: flex-start;
		align-items: center;
		margin-bottom: 30rpx;

		image {
			width: 100rpx;
			height: 100rpx;
			border-radius: 50%;
			margin-right: 20rpx;
		}

		.tit {
			font-size: 30rpx;
			font-weight: 700;
			color: #333;
		}
	}
}
</style>