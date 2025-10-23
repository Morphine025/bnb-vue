/**
 * 用户列表Composable（重构版）
 * 功能描述：基于统一列表管理Hook的用户列表逻辑
 * 主要功能：数据加载、分页、操作处理、状态管理
 */

import { useListManager } from './useListManager'
import { API } from '../api'

/**
 * 用户列表Hook（基于统一列表管理）
 * @param {Object} options - 配置选项
 * @param {string} options.apiMethod - API方法名
 * @param {string} options.actionType - 操作类型 'follow' | 'remove'
 * @param {Object} options.emptyConfig - 空状态配置
 * @returns {Object} 状态和方法
 */
export function useUserList(options = {}) {
	const {
		apiMethod = 'getFollowList',
		actionType = 'follow',
		emptyConfig = {},
		pageConfig = {
			pageSize: 10,
			initialPage: 1
		},
		buttonConfig = {
			primary: {
				text: actionType === 'follow' ? '取消关注' : '移除',
				icon: actionType === 'follow' ? 'heart' : 'trash',
				class: 'primary-btn'
			},
			secondary: {
				text: '查看',
				icon: 'eye',
				class: 'secondary-btn'
			}
		},
		cacheKey = `${apiMethod}_list`,
		cacheTTL = 3 * 60 * 1000 // 3分钟缓存
	} = options

	// 使用统一列表管理Hook
	return useListManager({
		loadListApi: (params) => {
			// 根据apiMethod调用相应的API
			switch (apiMethod) {
				case 'getFollowList':
					return API.user.getFollowList(params)
				case 'getFansList':
					return API.user.getFansList(params)
				default:
					return API.user.getFollowList(params)
			}
		},
		removeItemApi: (userId, action) => {
			// 根据actionType调用相应的API
			switch (actionType) {
				case 'follow':
					return API.user.toggleFollow(userId, 'unfollow')
				case 'remove':
					return API.user.removeFan(userId)
				default:
					return API.user.toggleFollow(userId, 'unfollow')
			}
		},
		listType: apiMethod === 'getFansList' ? 'fans' : 'follow',
		cacheKey,
		cacheTTL,
		pageConfig,
		buttonConfig,
		emptyConfig: {
			image: '/static/logo.png',
			title: actionType === 'follow' ? '暂无关注用户' : '暂无粉丝',
			description: '去首页看看有什么好内容吧',
			buttonText: '去首页逛逛',
			...emptyConfig
		}
	})
}