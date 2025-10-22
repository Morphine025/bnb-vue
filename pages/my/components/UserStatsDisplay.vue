<template>
	<!-- 用户统计数据区域 -->
	<view class="u-bottom">
		<view 
			v-for="(item, index) in statsItems" 
			:key="index"
			class="u-item" 
			@click="handleItemClick(item)"
		>
			<view class="num">{{ item.value }}</view>
			<view class="u-tit">{{ item.label }}</view>
		</view>
	</view>
</template>

<script setup>
	/**
	 * 用户统计数据展示组件
	 * 功能描述：展示用户统计数据，支持点击跳转
	 * 主要功能：统计数据展示、点击事件处理、样式封装
	 */

	// ==================== 导入依赖 ====================
	
	import { computed } from 'vue'

	// ==================== 组件属性 ====================
	
	/**
	 * 组件属性定义
	 */
	const props = defineProps({
		// 统计数据对象
		userStats: {
			type: Object,
			default: () => ({
				followers: 0,     // 粉丝数
				following: 0,     // 关注数
				likes: 0,         // 喜欢数
				collections: 0,   // 收藏数
				views: 0          // 浏览数
			})
		}
	})

	// ==================== 事件定义 ====================
	
	/**
	 * 定义组件事件
	 */
	const emit = defineEmits(['itemClick'])

	// ==================== 计算属性 ====================
	
	/**
	 * 统计数据项配置
	 * 功能：将统计数据转换为展示配置
	 */
	const statsItems = computed(() => {
		console.log('🔍 UserStatsDisplay - props.userStats:', props.userStats)
		return [
			{
				key: 'followers',
				label: '粉丝',
				value: props.userStats.followers || 0,
				action: 'goToFansList'
			},
			{
				key: 'following',
				label: '关注',
				value: props.userStats.following || 0,
				action: 'goToFollowList'
			},
			{
				key: 'likes',
				label: '喜欢',
				value: props.userStats.likes || 0,
				action: 'goToLikeList'
			},
			{
				key: 'collections',
				label: '收藏',
				value: props.userStats.collections || 0,
				action: 'goToCollectList'
			},
			{
				key: 'views',
				label: '浏览',
				value: props.userStats.views || 0,
				action: 'goToViewHistory'
			}
		]
	})

	// ==================== 事件处理 ====================
	
	/**
	 * 处理统计项点击事件
	 * 功能：向父组件传递点击事件
	 * @param {Object} item - 统计项对象
	 */
	const handleItemClick = (item) => {
		console.log('统计项点击:', item.label, '操作:', item.action)
		emit('itemClick', item)
	}
</script>

<style lang="scss" scoped>
	.u-bottom {
		display: flex;
		justify-content: space-around;
		align-items: center;

		.u-item {
			text-align: center;

			.u-tit {
				color: #757575;
				font-size: 26rpx;
				margin-top: 10rpx;
			}

			.num {
				color: #000;
				font-size: 33rpx;
				font-weight: 700;
			}
		}
	}
</style>
