<template>
	<!-- 设置弹窗：显示退出登录选项 -->
	<up-popup :show="show" @close="handleClose" closeable round="20">
		<view class="popup">
			<view class="settings-content">
				<!-- 退出登录按钮（仅登录用户可见） -->
				<view class="setting-item" @click="handleLogout" v-if="isLoggedIn">
					<view class="setting-icon">🚪</view>
					<view class="setting-text">退出登录</view>
				</view>
			</view>
		</view>
	</up-popup>
</template>

<script setup>
	/**
	 * 用户设置弹窗组件
	 * 功能描述：提供用户设置相关的弹窗功能
	 * 主要功能：退出登录、弹窗控制
	 */

	// ==================== 组件属性 ====================
	
	/**
	 * 组件属性定义
	 */
	const props = defineProps({
		// 控制弹窗显示状态
		show: {
			type: Boolean,
			default: false
		},
		// 用户登录状态
		isLoggedIn: {
			type: Boolean,
			default: false
		}
	})

	// ==================== 事件定义 ====================
	
	/**
	 * 定义组件事件
	 */
	const emit = defineEmits(['close', 'logout'])

	// ==================== 事件处理 ====================
	
	/**
	 * 处理弹窗关闭事件
	 * 功能：向父组件传递关闭事件
	 */
	const handleClose = () => {
		console.log('设置弹窗关闭')
		emit('close')
	}
	
	/**
	 * 处理退出登录事件
	 * 功能：向父组件传递退出登录事件
	 */
	const handleLogout = () => {
		console.log('用户点击退出登录')
		emit('logout')
	}
</script>

<style lang="scss" scoped>
	.settings-content {
		padding: 20rpx 0;
		
		.setting-item {
			display: flex;
			align-items: center;
			padding: 30rpx 40rpx;
			border-bottom: 1px solid #f5f5f5;
			cursor: pointer;
			transition: background-color 0.3s;
			
			&:last-child {
				border-bottom: none;
			}
			
			&:active {
				background-color: #f5f5f5;
			}
			
			.setting-icon {
				font-size: 40rpx;
				margin-right: 20rpx;
			}
			
			.setting-text {
				flex: 1;
				font-size: 30rpx;
				color: #333;
			}
			
			.setting-arrow {
				font-size: 28rpx;
				color: #999;
			}
		}
	}
</style>
