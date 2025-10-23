/**
 * 用户列表页面Composable
 * 功能描述：提供用户列表页面的通用逻辑，包括生命周期管理
 * 主要功能：页面初始化、生命周期钩子、通用页面逻辑
 */

import { onLoad, onReachBottom, onPullDownRefresh } from '@dcloudio/uni-app'
import { useUserList } from './useUserList'

/**
 * 用户列表页面通用逻辑
 * @param {Object} options - 配置选项
 * @param {string} options.apiMethod - API方法名
 * @param {string} options.actionType - 操作类型
 * @param {Object} options.emptyConfig - 空状态配置
 * @param {string} options.pageName - 页面名称（用于日志）
 * @returns {Object} 页面逻辑和状态
 */
export function useUserListPage(options = {}) {
	const {
		apiMethod = 'getFollowList',
		actionType = 'follow',
		emptyConfig = {},
		pageName = '用户列表'
	} = options

	// 使用用户列表Composable
	const userListState = useUserList({
		apiMethod,
		actionType,
		emptyConfig
	})

	/**
	 * 页面加载时获取数据
	 */
	onLoad(async () => {
		console.log(`📱 ${pageName}页面加载`)
		await userListState.loadList()
	})

	/**
	 * 触底加载更多
	 */
	onReachBottom(() => {
		if (userListState.canLoadMore.value) {
			console.log(`📱 ${pageName}触底加载更多`)
			userListState.loadMore()
		}
	})

	/**
	 * 下拉刷新
	 */
	onPullDownRefresh(async () => {
		console.log(`📱 ${pageName}下拉刷新`)
		await userListState.refresh()
		uni.stopPullDownRefresh()
	})

	return {
		userListState
	}
}
