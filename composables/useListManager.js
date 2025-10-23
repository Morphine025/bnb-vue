/**
 * 统一列表管理Hook
 * 功能描述：提供统一的列表数据管理逻辑，支持民宿、用户等各类列表
 * 主要功能：数据加载、分页、错误处理、状态管理、缓存管理
 */

import { ref, computed, toRef } from 'vue'
import { onLoad, onShow } from '@dcloudio/uni-app'

// 导入Stores
import { useUserStore } from '../stores/modules/user'
import { useCacheStore } from '../stores/modules/cache'
import { useLoadingStore } from '../stores/modules/loading'

// 导入Utils工具函数
import { 
	showShareOptions,
	handleError,
	showSuccess,
	showError
} from '../utils'

/**
 * 统一列表管理Hook
 * @param {Object} options 配置选项
 * @param {Function} options.loadListApi 加载列表的API方法
 * @param {Function} options.removeItemApi 移除项目的API方法
 * @param {string} options.listType 列表类型 'homestay' | 'user' | 'follow' | 'fans'
 * @param {string} options.cacheKey 缓存键名
 * @param {number} options.cacheTTL 缓存时间（毫秒）
 * @param {Object} options.pageConfig 分页配置
 * @param {Object} options.buttonConfig 按钮配置
 * @param {Object} options.emptyConfig 空状态配置
 * @returns {Object} 返回状态和方法
 */
export function useListManager(options = {}) {
	const {
		loadListApi,
		removeItemApi,
		listType = 'homestay',
		cacheKey = 'list_data',
		cacheTTL = 5 * 60 * 1000, // 5分钟缓存
		pageConfig = {
			pageSize: 10,
			initialPage: 1
		},
		buttonConfig = {
			primary: {
				text: '操作',
				icon: 'trash',
				class: 'primary-btn'
			},
			secondary: {
				text: '分享',
				icon: 'share',
				class: 'secondary-btn'
			}
		},
		emptyConfig = {
			image: '/static/logo.png',
			title: '暂无数据',
			description: '去首页看看有什么好内容吧',
			buttonText: '去首页逛逛'
		}
	} = options

	// 初始化Stores
	const userStore = useUserStore()
	const cacheStore = useCacheStore()
	const loadingStore = useLoadingStore()

	// 页面级状态（仅管理页面特有的状态）
	const pageState = ref({
		page: pageConfig.initialPage,
		pageSize: pageConfig.pageSize,
		hasMore: true,
		hasLoaded: false
	})

	// 列表数据（使用Store管理）
	const list = computed(() => {
		switch (listType) {
			case 'homestay':
				return userStore.homestayList || []
			case 'user':
			case 'follow':
			case 'fans':
				const userList = userStore.getUserList(listType)
				// 确保返回原始数组，不是响应式对象
				return Array.isArray(userList) ? userList : []
			default:
				return []
		}
	})

	// 加载状态（使用Store管理）
	const loading = computed(() => {
		const isLoading = loadingStore.isLoading(`${cacheKey}_loading`)
		return typeof isLoading === 'boolean' ? isLoading : false
	})
	const loadingMore = computed(() => {
		const isLoadingMore = loadingStore.isLoading(`${cacheKey}_loading_more`)
		return typeof isLoadingMore === 'boolean' ? isLoadingMore : false
	})
	const hasError = computed(() => {
		const isError = loadingStore.isLoading(`${cacheKey}_error`)
		return typeof isError === 'boolean' ? isError : false
	})
	const errorMessage = computed(() => {
		const error = loadingStore.getError(`${cacheKey}_error`)
		return typeof error === 'string' ? error : ''
	})
	
	// 是否可以加载更多
	const canLoadMore = computed(() => {
		return !loading.value && !loadingMore.value && pageState.value.hasMore
	})

	/**
	 * 加载列表数据
	 */
	const loadList = async (isRefresh = false) => {
		// 请求去重：如果正在加载中，直接返回
		if (loading.value && !isRefresh) {
			console.log(`📱 ${listType}列表正在加载中，跳过重复请求`)
			return
		}

		try {
			if (isRefresh) {
				pageState.value.page = pageConfig.initialPage
				pageState.value.hasMore = true
				pageState.value.hasLoaded = false
			}

			// 使用Store统一管理Loading状态
			loadingStore.setLoading(`${cacheKey}_loading`, true)
			loadingStore.setError(`${cacheKey}_error`, null)

			console.log(`📱 开始加载${listType}列表数据`)
			console.log(`📱 请求参数:`, {
				page: pageState.value.page,
				size: pageState.value.pageSize
			})
			
			// 检查缓存 - 只在首次加载且非刷新时检查缓存
			const cacheKeyWithPage = `${cacheKey}_page_${pageState.value.page}`
			if (!isRefresh && pageState.value.page === pageConfig.initialPage && !pageState.value.hasLoaded) {
				const cachedData = cacheStore.getCache(cacheKeyWithPage)
				console.log(`📱 检查缓存: ${cacheKeyWithPage}`, {
					hasCache: !!cachedData,
					cacheType: typeof cachedData,
					isArray: Array.isArray(cachedData),
					length: Array.isArray(cachedData) ? cachedData.length : 'N/A'
				})
				
				if (cachedData && Array.isArray(cachedData) && cachedData.length > 0) {
					console.log('📱 使用缓存数据:', cachedData.length, '条记录')
					updateListData(cachedData, isRefresh)
					pageState.value.hasLoaded = true
					loadingStore.setLoading(`${cacheKey}_loading`, false)
					return
				} else if (cachedData && Array.isArray(cachedData)) {
					console.log('📱 缓存数据为空数组:', cachedData.length, '条记录')
					// 缓存为空数组时，也使用缓存数据，避免重复请求
					updateListData(cachedData, isRefresh)
					pageState.value.hasLoaded = true
					loadingStore.setLoading(`${cacheKey}_loading`, false)
					return
				} else if (cachedData) {
					console.log('📱 缓存数据格式无效:', typeof cachedData)
				} else {
					console.log('📱 无缓存数据，将从服务器获取')
				}
			}
			
			const response = await loadListApi({
				page: pageState.value.page,
				size: pageState.value.pageSize
			})

			console.log(`📱 API响应数据:`, response)

			// 检查响应结构
			if (!response) {
				throw new Error('API响应为空')
			}

			if (response.code !== 1) {
				throw new Error(`API响应错误: code=${response.code}, message=${response.message || '未知错误'}`)
			}

			if (!response.data) {
				throw new Error('API响应数据为空')
			}

			console.log(`📱 API响应数据结构:`, {
				code: response.code,
				message: response.message,
				data: response.data,
				dataKeys: Object.keys(response.data || {}),
				list: response.data?.list,
				listType: typeof response.data?.list,
				listLength: Array.isArray(response.data?.list) ? response.data.list.length : 'not array'
			})

			const newList = response.data?.list || []
			console.log(`📱 解析后的列表数据:`, newList.length, '条记录')
			
			// 更新Store中的数据
			updateListData(newList, isRefresh)
			
			// 缓存第一页数据
			if (pageState.value.page === pageConfig.initialPage) {
				cacheStore.setCache(cacheKeyWithPage, newList, {
					dataType: 'shortTerm',
					maxAge: cacheTTL
				})
			}
			
			pageState.value.hasMore = newList.length === pageState.value.pageSize
			pageState.value.hasLoaded = true
			console.log(`📱 ${listType}列表数据加载成功:`, newList.length)
			
			// 更新用户统计（如果有相关数据）
			if (userStore.userInfo && response.data?.total) {
				updateUserStats(response.data)
			}
		} catch (error) {
			console.error(`📱 加载${listType}列表数据失败:`, error)
			
			// 使用Store统一管理错误状态
			loadingStore.setError(`${cacheKey}_error`, error.message || '加载失败，请重试')
			
			// 使用统一的错误处理
			handleError(error, `加载${listType}列表数据失败`)
		} finally {
			loadingStore.setLoading(`${cacheKey}_loading`, false)
		}
	}

	/**
	 * 更新列表数据到Store
	 */
	const updateListData = (newList, isRefresh) => {
		console.log(`📱 更新列表数据到Store - 类型: ${listType}, 数据:`, newList.length, '条记录')
		
		switch (listType) {
			case 'homestay':
				if (isRefresh || pageState.value.page === pageConfig.initialPage) {
					userStore.setHomestayList(newList)
				} else {
					userStore.appendHomestayList(newList)
				}
				break
			case 'user':
			case 'follow':
			case 'fans':
				if (isRefresh || pageState.value.page === pageConfig.initialPage) {
					userStore.setUserList(listType, newList)
				} else {
					userStore.appendUserList(listType, newList)
				}
				break
		}
	}

	/**
	 * 更新用户统计
	 */
	const updateUserStats = (responseData) => {
		if (responseData.total) {
			const stats = {
				[listType === 'homestay' ? 'homestays' : listType]: responseData.total
			}
			userStore.setUserStats(stats)
		}
	}

	/**
	 * 加载更多数据
	 */
	const loadMore = async () => {
		if (loadingMore.value || !pageState.value.hasMore) return
		
		try {
			loadingStore.setLoading(`${cacheKey}_loading_more`, true)
			pageState.value.page += 1
			await loadList()
		} finally {
			loadingStore.setLoading(`${cacheKey}_loading_more`, false)
		}
	}

	/**
	 * 移除列表项（调用API并更新本地状态）
	 */
	const removeItem = async (item, index) => {
		try {
			console.log(`📱 移除${listType}列表项:`, item.title || item.nickName)
			
			// 调用后端API取消收藏/喜欢
			if (removeItemApi) {
				console.log(`📱 调用API取消${listType}:`, item.homestayId || item.userId)
				
				// 根据列表类型确定操作类型
				let action
				if (listType === 'homestay') {
					// 民宿列表：根据cacheKey确定是收藏还是喜欢
					if (cacheKey.includes('collect')) {
						action = 'uncollect'
					} else if (cacheKey.includes('like')) {
						action = 'unlike'
					} else {
						action = 'uncollect' // 默认取消收藏
					}
				} else {
					// 用户列表：取消关注
					action = 'unfollow'
				}
				
				const response = await removeItemApi(item.homestayId || item.userId, action)
				
				if (response && response.code === 1) {
					console.log(`📱 API调用成功，从Store中移除数据`)
					
					// API调用成功后，从Store中移除数据
					removeFromStore(item, index)
					
					// 清除相关缓存 - 清除所有相关页面的缓存
					const cacheKeyWithPage = `${cacheKey}_page_${pageState.value.page}`
					cacheStore.removeCache(cacheKeyWithPage)
					
					// 清除所有相关页面的缓存，确保重新加载时获取最新数据
					cacheStore.clearCacheByCondition(key => key.includes(cacheKey))
					
					// 更新用户统计
					updateUserStatsAfterRemove()
					
					// 显示成功提示
					showSuccess(`取消${listType === 'homestay' ? (cacheKey.includes('collect') ? '收藏' : '喜欢') : '关注'}成功`)
					
					console.log(`📱 ${listType}列表项移除成功`)
				} else {
					throw new Error(response?.message || response?.msg || '操作失败')
				}
			} else {
				// 如果没有提供API，只从本地移除（兼容旧代码）
				console.log(`📱 未提供API，仅从本地移除数据`)
				removeFromStore(item, index)
				cacheStore.clearCacheByCondition(key => key.includes(cacheKey))
				updateUserStatsAfterRemove()
			}
		} catch (error) {
			console.error(`📱 移除${listType}列表项失败:`, error)
			handleError(error, `移除${listType}列表项失败`)
		}
	}

	/**
	 * 从Store中移除数据
	 */
	const removeFromStore = (item, index) => {
		switch (listType) {
			case 'homestay':
				userStore.removeHomestayItem(item.homestayId)
				break
			case 'user':
			case 'follow':
			case 'fans':
				userStore.removeUserItem(listType, item.userId)
				break
		}
	}

	/**
	 * 移除后更新用户统计
	 */
	const updateUserStatsAfterRemove = () => {
		if (userStore.userInfo) {
			const stats = {}
			switch (listType) {
				case 'homestay':
					stats.collections = Math.max(0, (userStore.userStats.collections || 0) - 1)
					break
				case 'follow':
					stats.following = Math.max(0, (userStore.userStats.following || 0) - 1)
					break
				case 'fans':
					stats.followers = Math.max(0, (userStore.userStats.followers || 0) - 1)
					break
			}
			if (Object.keys(stats).length > 0) {
				userStore.setUserStats(stats)
			}
		}
	}

	/**
	 * 分享项目
	 */
	const shareItem = async (item) => {
		try {
			console.log(`📱 分享${listType}项目:`, item.title || item.nickName)
			
			// 使用统一的分享工具
			await showShareOptions(item)
			
			// 可以记录分享行为到用户统计
			if (userStore.userInfo) {
				// 可以在这里记录分享行为
			}
		} catch (error) {
			console.error(`📱 分享${listType}失败:`, error)
			
			// 使用统一的错误处理
			handleError(error, `分享${listType}失败`)
		}
	}

	/**
	 * 跳转到详情页
	 */
	const goToDetail = (item) => {
		console.log(`📱 跳转${listType}详情页:`, item.title || item.nickName)
		
		let url = ''
		switch (listType) {
			case 'homestay':
				url = `/pages/detail/detail?id=${item.homestayId}`
				break
			case 'user':
			case 'follow':
			case 'fans':
				url = `/pages/user-profile/user-profile?id=${item.userId}`
				break
		}
		
		if (url) {
			uni.navigateTo({ url })
		}
	}

	/**
	 * 跳转到用户资料页（用户列表专用）
	 */
	const goToUserProfile = (item) => {
		// 获取用户昵称，支持多种字段名
		const nickName = item.nickName || item.followUserNickname || item.fanUserNickname || item.nickname || '未知用户'
		console.log(`📱 跳转用户资料页:`, nickName)
		console.log(`📱 用户数据:`, item)
		
		// 获取用户ID，支持多种字段名
		const userId = item.userId || item.followUserId || item.fanUserId || item.id
		console.log(`📱 用户ID:`, userId)
		
		if (!userId) {
			console.error('📱 用户ID为空，无法跳转')
			uni.showToast({
				title: '用户信息错误',
				icon: 'error'
			})
			return
		}
		
		// 构建用户信息对象
		const userInfo = {
			userId: userId,
			nickname: nickName,
			avatar: item.followUserAvatar || item.fanUserAvatar || item.avatar || item.avatarUrl || '/static/logo.png'
		}
		
		// 将用户信息编码后传递
		const encodedUserInfo = encodeURIComponent(JSON.stringify(userInfo))
		const url = `/pages/user-profile/user-profile?userInfo=${encodedUserInfo}`
		console.log(`📱 跳转URL:`, url)
		console.log(`📱 用户信息:`, userInfo)
		
		// 使用setTimeout来避免跳转超时
		setTimeout(() => {
			uni.navigateTo({ 
				url,
				success: () => {
					console.log('📱 页面跳转成功')
				},
				fail: (err) => {
					console.error('📱 页面跳转失败:', err)
					// 尝试使用redirectTo作为备选方案
					uni.redirectTo({
						url,
						fail: (err2) => {
							console.error('📱 重定向也失败:', err2)
							uni.showToast({
								title: '页面跳转失败',
								icon: 'error'
							})
						}
					})
				}
			})
		}, 100)
	}

	/**
	 * 处理用户操作（关注/取消关注/移除）
	 */
	const handleUserAction = async (params) => {
		// 兼容不同的参数格式
		let item, action
		if (params && typeof params === 'object' && params.user) {
			// 新格式：{ user, index }
			item = params.user
			action = listType === 'follow' ? 'follow' : 'remove'
		} else {
			// 旧格式：(item, action)
			item = params
			action = arguments[1] || (listType === 'follow' ? 'follow' : 'remove')
		}
		
		console.log(`📱 处理用户操作:`, action, item.nickName || item.followUserNickname || item.fanUserNickname || item.nickname || '未知用户')
		
		try {
			// 根据操作类型调用相应的API
			let result
			switch (action) {
				case 'follow':
					result = await removeItemApi(item.userId, 'unfollow')
					break
				case 'remove':
					result = await removeItemApi(item.userId, 'remove')
					break
				default:
					result = await removeItemApi(item.userId, 'unfollow')
			}
			
			if (result && result.code === 1) {
				// 操作成功，从列表中移除
				await removeItem(item, -1)
				
				// 显示成功提示
				showSuccess(`${action === 'follow' ? '取消关注' : '移除'}成功`)
			} else {
				throw new Error(result?.message || result?.msg || '操作失败')
			}
		} catch (error) {
			console.error(`📱 处理用户操作失败:`, error)
			handleError(error, `处理用户操作失败`)
		}
	}

	/**
	 * 跳转到首页
	 */
	const goToHome = () => {
		console.log('📱 跳转首页')
		uni.switchTab({
			url: '/pages/index/index'
		})
	}

	/**
	 * 重试加载
	 */
	const retryLoad = () => {
		loadingStore.setError(`${cacheKey}_error`, null)
		
		// 清除缓存，强制重新加载
		const cacheKeyWithPage = `${cacheKey}_page_${pageState.value.page}`
		cacheStore.deleteCache(cacheKeyWithPage)
		
		loadList(true)
	}

	/**
	 * 重试（别名方法）
	 */
	const retry = () => {
		retryLoad()
	}

	/**
	 * 处理图片加载错误
	 */
	const handleImageError = (e) => {
		console.warn('图片加载失败:', e)
	}

	/**
	 * 下拉刷新
	 */
	const onPullRefresh = async () => {
		console.log(`📱 ${listType}下拉刷新，清除相关缓存`)
		// 清除所有相关缓存
		cacheStore.clearCacheByCondition(key => key.includes(cacheKey))
		
		// 重置页面状态
		pageState.value.hasLoaded = false
		
		await loadList(true)
	}

	/**
	 * 刷新数据（与下拉刷新相同逻辑）
	 */
	const refresh = async () => {
		console.log(`📱 ${listType}刷新数据`)
		
		// 清除所有相关缓存
		cacheStore.clearCacheByCondition(key => key.includes(cacheKey))
		
		// 重置页面状态
		pageState.value.hasLoaded = false
		
		await loadList(true)
	}

	// 页面生命周期 - 移除自动加载，由页面级Composable控制
	onLoad(() => {
		console.log(`📱 ${listType}页面加载`)
		// 不在这里自动加载数据，避免与页面级Composable重复
	})

	onShow(() => {
		console.log(`📱 ${listType}页面显示`)
		// 页面显示时不自动加载数据，避免重复请求
	})

	return {
		// 状态 - 直接返回计算属性的值
		list,
		loading,
		loadingMore,
		hasError,
		errorMessage,
		pageState,
		canLoadMore,
		
		// 方法
		loadList,
		loadMore,
		removeItem,
		shareItem,
		goToDetail,
		goToUserProfile,
		handleUserAction,
		goToHome,
		retryLoad,
		retry,
		handleImageError,
		onPullRefresh,
		refresh,
		
		// 配置
		buttonConfig,
		emptyConfig
	}
}
