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
			:empty-text="'暂无粉丝'"
			:empty-desc="'发布优质内容来吸引更多粉丝吧'"
			:empty-action-text="'刷新试试'"
			action-type="remove"
			@user-click="userListState.goToUserProfile"
			@action-click="userListState.handleUserAction"
			@empty-action="userListState.refresh"
			@retry="userListState.retry"
			@image-error="userListState.handleImageError"
		/>
	</view>
</template>

<script setup>
	/**
	 * 粉丝列表页面
	 * 功能描述：展示当前用户的粉丝列表
	 * 主要功能：粉丝列表展示、移除粉丝、跳转用户资料
	 */
	
	
	// 导入通用用户列表组件和页面级Composable
	import UserList from '../../components/UserList/index.vue'
	import { useUserListPage } from '../../composables/useUserListPage'
	
	// 使用用户列表页面Composable，自动处理生命周期
	const { userListState } = useUserListPage({
		apiMethod: 'getFansList',
		actionType: 'remove',
		emptyConfig: {
			text: '暂无粉丝',
			desc: '发布优质内容来吸引更多粉丝吧',
			actionText: '刷新试试'
		},
		pageName: '粉丝列表'
	})
</script>

<style lang="scss" scoped>
	.container {
		min-height: 100vh;
		padding: 24rpx;
	}
</style>
