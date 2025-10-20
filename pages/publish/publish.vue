<template>
	<view class="publish-container">
		<view class="publish-content">
			<view class="publish-item">
				<uni-list>
					<uni-list-item 
						:show-extra-icon="true" 
						:extra-icon="extraIcon1" 
						showArrow 
						title="发布民宿信息" 
						clickable 
						@click="goToPublishDetail"
					></uni-list-item>
				</uni-list>
			</view>
		</view>
	</view>
</template>

<script setup>
	/**
	 * 发布页面组件
	 * 功能描述：发布民宿转让信息入口
	 * 主要功能：跳转到发布详情页面
	 */
	
	// 导入Vue响应式API
	import { reactive } from 'vue'
	
	// 导入uni-app生命周期钩子
	import { onLoad } from '@dcloudio/uni-app'
	
	// 导入Loading管理工具
	import { showLoading, hideLoading } from '../../utils/loadingManager'
	
	/**
	 * 页面加载时初始化
	 */
	onLoad(() => {
		console.log('发布页面加载')
	})
	
	/**
	 * 检查登录状态
	 */
	const checkLoginStatus = () => {
		const token = uni.getStorageSync('token')
		if (!token) {
			uni.showModal({
				title: '提示',
				content: '请先登录后再发布民宿信息',
				showCancel: false,
				confirmText: '去登录',
				success: () => {
					uni.switchTab({
						url: '/pages/my/my'
					})
				}
			})
			return false
		}
		return true
	}

	/**
	 * 跳转到发布详情页面
	 */
	const goToPublishDetail = () => {
		// 检查登录状态
		if (!checkLoginStatus()) {
			return
		}
		
		// 显示加载状态
		showLoading({
			title: '正在跳转...'
		})
		
		uni.navigateTo({
			url: '/pages/publish-detail/publish-detail',
			success: () => {
				hideLoading()
			},
			fail: (error) => {
				hideLoading()
				console.error('页面跳转失败:', error)
				uni.showToast({
					title: '页面跳转失败，请重试',
					icon: 'none',
					duration: 2000
				})
			}
		})
	}

	// 功能菜单图标配置
	const extraIcon1 = reactive({
		color: '#666666',
		size: '28',
		type: 'home'
	})
</script>

<style lang="scss" scoped>
	.publish-container {
		height: 100vh;
		background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
		padding: 20rpx;
		display: flex;
		flex-direction: column;
		overflow: hidden;
	}

	.publish-content {
		margin-top: auto;
		margin-bottom: 50rpx;
		display: flex;
		flex-direction: column;
		gap: 20rpx;
	}

	.publish-item {
		background: #fff;
		border-radius: 16rpx;
		box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.1);
		overflow: hidden;
	}

	.publish-item :deep(.uni-list-item) {
		min-height: 100rpx;
		padding: 30rpx 20rpx;
	}

	.publish-item :deep(.uni-list-item__content) {
		line-height: 1.6;
		font-weight: 700;
		font-size: 40rpx;
	}
</style>
