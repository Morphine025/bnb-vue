<template>
	<!-- 功能菜单区域 -->
	<view class="tools-section">
		<view class="tools-title">{{ title }}</view>
		<view class="tools-card">
			<uni-list>
				<uni-list-item 
					v-for="(item, index) in menuItems" 
					:key="index"
					:show-extra-icon="true" 
					:extra-icon="item.icon" 
					showArrow 
					:title="item.title" 
					clickable 
					@click="handleItemClick(item)"
				></uni-list-item>
			</uni-list>
		</view>
	</view>
</template>

<script setup>
	/**
	 * 用户工具菜单组件
	 * 功能描述：提供用户功能菜单的统一组件
	 * 主要功能：
	 * 1. 菜单项展示 - 使用uni-list组件展示菜单项
	 * 2. 点击事件处理 - 处理菜单项的点击事件
	 * 3. 图标配置 - 支持自定义图标和样式
	 * 4. 数据驱动 - 通过props配置菜单项
	 * 
	 * 技术特点：
	 * - 组件化设计
	 * - 事件传递机制
	 * - 样式封装
	 * - 可配置性
	 */

	// ==================== 导入依赖 ====================
	
	// 此组件不需要导入Vue API，只使用defineProps和defineEmits

	// ==================== 组件属性 ====================
	
	/**
	 * 组件属性定义
	 */
	const props = defineProps({
		// 菜单标题
		title: {
			type: String,
			default: '常用工具'
		},
		// 菜单项配置
		menuItems: {
			type: Array,
			default: () => []
		}
	})

	// ==================== 事件定义 ====================
	
	/**
	 * 定义组件事件
	 */
	const emit = defineEmits(['itemClick'])

	// ==================== 事件处理 ====================
	
	/**
	 * 处理菜单项点击事件
	 * 功能：向父组件传递点击事件
	 * @param {Object} item - 菜单项对象
	 */
	const handleItemClick = (item) => {
		console.log('菜单项点击:', item.title)
		emit('itemClick', item)
	}
</script>

<style lang="scss" scoped>
	.tools-section {
		margin: 0rpx 20rpx 0;
		
		.tools-title {
			font-size: 32rpx;
			font-weight: 700;
			color: #333;
			margin-bottom: 20rpx;
			padding-left: 10rpx;
		}
		
		.tools-card {
			padding: 20rpx;
			box-sizing: border-box;
			border-radius: 16rpx;
			background-color: #fff;
			box-shadow: 1px 10rpx 20rpx #ececec;
		}
	}
</style>
