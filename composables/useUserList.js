/**
 * 用户列表Composable
 * 功能描述：提供用户列表的通用状态管理和操作方法
 * 主要功能：数据加载、分页、操作处理、状态管理
 */

import { reactive, computed } from 'vue'
import { useUserStore } from '@/stores/modules/user'
import { showLoading, hideLoading } from '@/utils'

/**
 * 用户列表状态管理
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
		emptyConfig = {}
	} = options

	// 使用Store管理状态
	const userStore = useUserStore()

	// 页面级状态（不重复Store的全局状态）
	const pageState = reactive({
		loading: false,
		loadingMore: false,
		hasMore: true,
		hasError: false,
		errorMessage: '',
		page: 1,
		size: 10
	})

	// 去重操作集合（避免重复点击）
	const pendingOperations = new Set()

	// 计算属性 - 使用Store的数据，避免重复状态
	const isEmpty = computed(() => userStore.getUserList(apiMethod).length === 0)
	const canLoadMore = computed(() => pageState.hasMore && !pageState.loading && !pageState.loadingMore)

	/**
	 * 加载用户列表 - 使用Store统一管理，避免重复状态
	 */
	const loadUserList = async () => {
		if (pageState.loading) return

		try {
			pageState.loading = true
			pageState.hasError = false
			console.log(`📱 加载用户列表，页码: ${pageState.page}`)

			// 使用Store的方法，避免重复API调用
			let rawList = []
			if (apiMethod === 'getFollowList') {
				rawList = await userStore.fetchFollowList(pageState.page, pageState.size)
			} else if (apiMethod === 'getFansList') {
				rawList = await userStore.fetchFansList(pageState.page, pageState.size)
			} else {
				throw new Error(`不支持的API方法: ${apiMethod}`)
			}
			
			// 归一化字段，确保数据一致性
			const newList = rawList.map(item => normalizeUserData(item, actionType))

			// 使用Store管理列表数据，避免重复状态
			const listType = apiMethod === 'getFollowList' ? 'followList' : 'fansList'
			console.log(`📱 设置用户列表 - 类型: ${listType}, 新数据:`, newList)
			if (pageState.page === 1) {
				userStore.setUserList(listType, newList)
			} else {
				const currentList = userStore.getUserList(listType)
				userStore.setUserList(listType, [...currentList, ...newList])
			}
			console.log(`📱 设置后的列表:`, userStore.getUserList(listType))

			pageState.hasMore = newList.length === pageState.size
			console.log(`📱 用户列表加载成功: ${newList.length} 条`)
		} catch (error) {
			console.error(`📱 用户列表加载异常:`, error)
			pageState.hasError = true
			pageState.errorMessage = error.message || '加载失败'
			
			// 如果是网络错误，提供更友好的提示
			if (error.message.includes('网络') || error.message.includes('连接')) {
				pageState.errorMessage = '网络连接失败，请检查网络设置'
			}
			
			uni.showToast({
				title: pageState.errorMessage,
				icon: 'none',
				duration: 3000
			})
		} finally {
			pageState.loading = false
		}
	}

	/**
	 * 加载更多
	 */
	const loadMore = async () => {
		if (!canLoadMore.value) return

		try {
			pageState.loadingMore = true
			pageState.page++
			await loadUserList()
		} finally {
			pageState.loadingMore = false
		}
	}

	/**
	 * 刷新列表
	 */
	const refresh = async () => {
		pageState.page = 1
		pageState.hasMore = true
		pageState.hasError = false
		await loadUserList()
	}

	/**
	 * 处理用户操作
	 */
	const handleUserAction = async (user, index) => {
		const userId = getUserIdentifier(user)
		if (!userId) {
			uni.showToast({ title: '无效的用户ID', icon: 'none' })
			return
		}

		// 防重复操作
		if (pendingOperations.has(userId)) {
			return
		}

		try {
			pendingOperations.add(userId)
			showLoading({ title: '处理中...' })

			if (actionType === 'follow') {
				await handleFollowAction(user, userId)
			} else if (actionType === 'remove') {
				await handleRemoveAction(user, userId, index)
			}

		} catch (error) {
			console.error('用户操作失败:', error)
			uni.showToast({
				title: '操作失败',
				icon: 'none'
			})
		} finally {
			pendingOperations.delete(userId)
			hideLoading()
		}
	}

	/**
	 * 处理关注操作 - 使用Store统一管理
	 */
	const handleFollowAction = async (user, userId) => {
		const action = user.isFollowing ? 'unfollow' : 'follow'
		const confirmText = action === 'unfollow' ? '确定要取消关注该用户吗？' : '确定要关注该用户吗？'

		return new Promise((resolve, reject) => {
			uni.showModal({
				title: '请确认',
				content: confirmText,
				success: async (res) => {
					if (!res.confirm) {
						reject(new Error('用户取消操作'))
						return
					}

					try {
						// 使用Store的方法，避免重复API调用
						await userStore.toggleFollowUser(userId, action)
						
						if (action === 'unfollow') {
							// 从Store缓存中移除
							const listType = apiMethod === 'getFollowList' ? 'followList' : 'fansList'
							const currentList = userStore.getUserList(listType)
							const filteredList = currentList.filter(item => getUserIdentifier(item) !== userId)
							userStore.setUserList(listType, filteredList)
						} else {
							// 更新关注状态
							user.isFollowing = true
						}

						uni.showToast({
							title: action === 'unfollow' ? '已取消关注' : '关注成功',
							icon: 'success'
						})
						resolve()
					} catch (error) {
						reject(error)
					}
				}
			})
		})
	}

	/**
	 * 处理移除操作 - 使用Store统一管理
	 * @param {Object} user - 用户对象
	 * @param {string} userId - 用户ID
	 * @param {number} index - 用户索引
	 * @returns {Promise} 操作结果
	 */
	const handleRemoveAction = async (user, userId, index) => {
		return new Promise((resolve, reject) => {
			uni.showModal({
				title: '确认移除',
				content: '确定要移除此粉丝吗？',
				success: async (res) => {
					if (!res.confirm) {
						reject(new Error('用户取消操作'))
						return
					}

					try {
						// 使用Store的方法，避免重复API调用
						await userStore.removeUserFan(userId)
						
						// 从Store缓存中移除
						const listType = apiMethod === 'getFollowList' ? 'followList' : 'fansList'
						const currentList = userStore.getUserList(listType)
						const filteredList = currentList.filter(item => getUserIdentifier(item) !== userId)
						userStore.setUserList(listType, filteredList)

						uni.showToast({
							title: '移除成功',
							icon: 'success'
						})
						
						// 刷新第一页数据确保同步
						await refresh()
						resolve()
					} catch (error) {
						reject(error)
					}
				}
			})
		})
	}

	/**
	 * 跳转到用户资料页
	 */
	const goToUserProfile = (user) => {
		const userId = getUserIdentifier(user)
		if (!userId) {
			uni.showToast({ title: '无效的用户ID', icon: 'none' })
			return
		}

		uni.navigateTo({
			url: `/pages/user-profile/user-profile?userId=${userId}`
		})
	}

	/**
	 * 返回首页
	 */
	const goToHome = () => {
		uni.switchTab({
			url: '/pages/index/index'
		})
	}

	/**
	 * 处理图片加载错误
	 */
	const handleImageError = (event) => {
		console.log('图片加载失败:', event)
		if (event.target) {
			event.target.src = '/static/logo.png'
		}
	}

	/**
	 * 重试操作
	 */
	const retry = () => {
		pageState.hasError = false
		refresh()
	}

	// 响应式状态对象 - 使用computed()的.value自动解包
	const state = reactive({
		list: computed(() => {
			const listType = apiMethod === 'getFollowList' ? 'followList' : 'fansList'
			const result = userStore.getUserList(listType)
			console.log(`📱 获取用户列表 - 类型: ${listType}, 数据:`, result)
			return result || []
		}),
		loading: computed(() => pageState.loading),
		loadingMore: computed(() => pageState.loadingMore),
		hasMore: computed(() => pageState.hasMore),
		hasError: computed(() => pageState.hasError),
		errorMessage: computed(() => pageState.errorMessage)
	})

	return {
		// 状态 - reactive对象会自动解包computed
		state,
		isEmpty,
		canLoadMore,

		// 方法
		loadUserList,
		loadMore,
		refresh,
		handleUserAction,
		goToUserProfile,
		goToHome,
		handleImageError,
		retry
	}
}

/**
 * 归一化用户数据
 * @param {Object} item - 原始数据项
 * @param {string} actionType - 操作类型
 * @returns {Object} 归一化后的数据
 */
function normalizeUserData(item, actionType) {
	const baseData = {
		...item,
		userId: item.followUserId || item.fanUserId || item.userId || item.followeeUserId || item.followerUserId || item.id,
		avatar: item.followUserAvatar || item.fanUserAvatar || item.avatar || item.avatarUrl || item.userAvatar,
		nickname: item.followUserNickname || item.fanUserNickname || item.nickname || item.nickName || item.userNickname,
		fansCount: item.fansCount || item.followerCount || 0
	}

	if (actionType === 'follow') {
		baseData.isFollowing = true
	}

	return baseData
}

/**
 * 获取用户标识符
 * @param {Object} user - 用户对象
 * @returns {string} 用户ID
 */
function getUserIdentifier(user) {
	return user.followUserId || user.fanUserId || user.userId || user.followeeUserId || user.followerUserId || user.id
}
