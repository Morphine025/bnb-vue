<template>
	<!-- 顶部搜索区域 -->
	<view class="header-section">
		<view class="search-container">
			<view class="search-wrapper">
				<!-- 项目图标 -->
				<view class="project-icon">
					<image src="/static/unnamed.jpg" mode="aspectFill" class="icon-image"></image>
				</view>
				
				<!-- 搜索框（点击跳转到搜索页面） -->
				<view class="search-input" @click="goToSearch">
					<up-icon name="search" size="18" color="#999"></up-icon>
					<text class="search-placeholder">搜索帖子/用户/圈子</text>
				</view>
			</view>
		</view>
	</view>
</template>

<script setup>
/**
 * 头部搜索组件
 * 功能描述：提供项目图标和搜索入口
 * 主要功能：搜索页面跳转
 */

// ==================== 搜索功能 ====================

/**
 * 跳转到搜索页面
 * 点击搜索框时触发（搜索框为纯点击跳转功能）
 */
const goToSearch = () => {
	uni.navigateTo({
		url: '/pages/search/search'
	})
}
</script>

<style scoped>
/* ==================== 头部搜索区域样式 ==================== */

/* 头部搜索区域 */
.header-section {
    background: transparent;
    padding: 20rpx 30rpx;
    box-shadow: none;
}

/* 搜索容器 */
.search-container {
	width: 100%;
}

/* 搜索包装器 */
.search-wrapper {
    display: flex;
    align-items: center;
    background: transparent;
    border-radius: 50rpx;
    padding: 20rpx 30rpx;
}

/* 项目图标 */
.project-icon {
	width: 60rpx;
	height: 60rpx;
	margin-right: 20rpx;
}

.icon-image {
	width: 100%;
	height: 100%;
	border-radius: 50%;
}

/* 搜索输入框 */
.search-input {
	flex: 1;
	display: flex;
	align-items: center;
	background: #fff;
	border-radius: 40rpx;
	padding: 15rpx 25rpx;
	position: relative;
}

/* 搜索占位文本 */
.search-placeholder {
	flex: 1;
	font-size: 28rpx;
	color: #999;
	margin-left: 15rpx;
}
</style>
