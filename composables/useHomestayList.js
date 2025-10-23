/**
 * 民宿列表通用逻辑Hook（重构版）
 * 功能描述：基于统一列表管理Hook的民宿列表逻辑
 * 主要功能：数据加载、分页、错误处理、状态管理
 */

import { useListManager } from './useListManager'

/**
 * 民宿列表Hook（基于统一列表管理）
 * @param {Object} options 配置选项
 * @param {Function} options.loadListApi 加载列表的API方法
 * @param {Function} options.removeItemApi 移除项目的API方法
 * @param {Object} options.pageConfig 分页配置
 * @param {Object} options.buttonConfig 按钮配置
 * @returns {Object} 返回状态和方法
 */
export function useHomestayList(options = {}) {
	const {
		loadListApi,
		removeItemApi,
		pageConfig = {
			pageSize: 10,
			initialPage: 1
		},
		buttonConfig = {
			primary: {
				text: '取消收藏',
				icon: 'trash',
				class: 'primary-btn'
			},
			secondary: {
				text: '分享',
				icon: 'share',
				class: 'secondary-btn'
			}
		},
		cacheKey = 'homestay_list',
		cacheTTL = 5 * 60 * 1000 // 5分钟缓存
	} = options

	// 使用统一列表管理Hook
	return useListManager({
		loadListApi,
		removeItemApi,
		listType: 'homestay',
		cacheKey,
		cacheTTL,
		pageConfig,
		buttonConfig,
		emptyConfig: {
			image: '/static/logo.png',
			title: '暂无民宿数据',
			description: '去首页看看有什么好房源吧',
			buttonText: '去首页逛逛'
		}
	})

}
