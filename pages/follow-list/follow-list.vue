<template>
	<view class="container">
		<!-- 使用通用用户列表组件 -->
		<UserList
			:list="userListState.state.list"
			:is-loading="userListState.state.loading"
			:is-loading-more="userListState.state.loadingMore"
			:has-error="userListState.state.hasError"
			:error-message="userListState.state.errorMessage"
			:show-fans-count="true"
			:empty-image="'/static/logo.png'"
			:empty-text="'暂无关注'"
			:empty-desc="'去发现更多有趣的用户吧'"
			:empty-action-text="'去首页逛逛'"
			action-type="follow"
			@user-click="userListState.goToUserProfile"
			@action-click="userListState.handleUserAction"
			@empty-action="userListState.goToHome"
			@retry="userListState.retry"
			@image-error="userListState.handleImageError"
		/>
	</view>
</template>

<script setup>
	/**
	 * 关注列表页面
	 * 功能描述：展示当前用户关注的用户列表
	 * 主要功能：关注列表展示、取消关注、跳转用户资料
	 */
	
	// 导入通用用户列表组件和页面级Composable
	import UserList from '../../components/UserList/index.vue'
	import { useUserListPage } from '../../composables/useUserListPage'
	
	// 使用用户列表页面Composable，自动处理生命周期
	const { userListState } = useUserListPage({
		apiMethod: 'getFollowList',
		actionType: 'follow',
		emptyConfig: {
			text: '暂无关注',
			desc: '去发现更多有趣的用户吧',
			actionText: '去首页逛逛'
		},
		pageName: '关注列表'
	})
</script>

<style lang="scss" scoped>
	.container {
		min-height: 100vh;
		padding: 24rpx;
	}
</style>