<template>
	<view class="page-container">
		<!-- 页面内容插槽 -->
		<slot></slot>
	</view>
</template>

<script setup>
	/**
	 * 页面容器组件
	 * 功能描述：提供统一的页面布局和样式
	 * 主要功能：页面背景、容器样式、下拉刷新
	 */

	// 导入uni-app生命周期钩子
	import { onPullDownRefresh } from '@dcloudio/uni-app'

	// Props定义
	const props = defineProps({
		// 是否启用下拉刷新
		enablePullRefresh: {
			type: Boolean,
			default: true
		},
		// 背景样式类型
		backgroundType: {
			type: String,
			default: 'gradient', // gradient, solid, none
			validator: (value) => ['gradient', 'solid', 'none'].includes(value)
		},
		// 自定义背景色
		backgroundColor: {
			type: String,
			default: ''
		}
	})

	// Emits定义
	const emit = defineEmits([
		'pull-refresh'
	])

	/**
	 * 下拉刷新处理
	 */
	onPullDownRefresh(async () => {
		if (props.enablePullRefresh) {
			console.log('📱 页面下拉刷新')
			emit('pull-refresh')
			// 延迟停止刷新，确保数据加载完成
			setTimeout(() => {
				uni.stopPullDownRefresh()
			}, 500)
		} else {
			uni.stopPullDownRefresh()
		}
	})
</script>

<style lang="scss" scoped>
	.page-container {
		min-height: 100vh;
		position: relative;
		
		// 渐变背景
		&.gradient-bg::before {
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
		
		// 纯色背景
		&.solid-bg {
			background-color: var(--background-color, #f5f5f5);
		}
		
		// 无背景
		&.no-bg {
			background: transparent;
		}
	}
</style>
