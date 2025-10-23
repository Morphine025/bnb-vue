<template>
	<view class="container">
		<!-- 页面标题 -->
		<view class="header">
			<view class="subtitle">管理您发布的民宿信息</view>
		</view>
		
		<!-- 加载状态 -->
		<view v-if="loading" class="loading-container">
			<view class="loading-spinner">
				<up-loading-icon mode="circle" size="32"></up-loading-icon>
			</view>
			<text class="loading-text">正在加载您的发布内容...</text>
			<text class="loading-desc">请稍候</text>
		</view>
		
		<!-- 空状态 -->
		<view v-else-if="homestayList.length === 0" class="empty-container">
			<view class="empty-icon">
				<u-icon name="home" size="80" color="#ccc"></u-icon>
			</view>
			<view class="empty-text">暂无发布内容</view>
			<view class="empty-desc">您还没有发布任何民宿信息<br/>快来发布您的第一个房源吧！</view>
			<button class="publish-btn" @click="goToPublish">
				<u-icon name="plus" size="16" color="#fff" style="margin-right: 8rpx;"></u-icon>
				立即发布
			</button>
		</view>
		
		<!-- 发布列表 -->
		<view v-else class="list-container">
			<view class="list-header">
				<text class="list-count">共 {{ total }} 条发布</text>
			</view>
			
			<view class="homestay-list">
				<view 
					v-for="(item, index) in homestayList" 
					:key="item.homestayId || index"
					class="homestay-item"
					@click="goToDetail(item)"
				>
					<view class="item-image">
						<image 
							:src="item.images && item.images.length > 0 ? item.images[0] : '/static/logo.png'" 
							mode="aspectFill"
							class="homestay-image"
							lazy-load
							@error="handleImageError"
						></image>
						<view class="status-tag" :class="getStatusClass(item.status)" :style="{ backgroundColor: getStatusColor(item.status) }">
							{{ getStatusText(item.status) }}
						</view>
					</view>
					
					<view class="item-content">
						<view class="item-title">{{ item.title }}</view>
						<view class="item-info">
							<text class="price">¥{{ item.price }}</text>
							<text class="rooms">{{ item.rooms }}间房</text>
							<text class="area">{{ item.area }}㎡</text>
						</view>
						<view class="item-location">
							<text class="location-text">{{ formatLocation(item.location) }}</text>
						</view>
						<view class="item-stats">
							<view class="stat-item">
								<text class="stat-label">浏览</text>
								<text class="stat-value">{{ item.viewCount || 0 }}</text>
							</view>
							<view class="stat-item">
								<text class="stat-label">点赞</text>
								<text class="stat-value">{{ item.likeCount || 0 }}</text>
							</view>
							<view class="stat-item">
								<text class="stat-label">收藏</text>
								<text class="stat-value">{{ item.collectCount || 0 }}</text>
							</view>
						</view>
						<view class="item-time">
							<text class="time-text">发布时间：{{ formatTime(item.createTime) }}</text>
						</view>
					</view>
					
					<view class="item-actions">
						<button 
							v-if="getAvailableActions(item.status).includes('edit')"
							class="action-btn edit-btn" 
							@click.stop="editHomestay(item)"
						>
							编辑
						</button>
						<button 
							v-if="getAvailableActions(item.status).includes('offline')"
							class="action-btn offline-btn" 
							@click.stop="offlineHomestayAction(item)"
						>
							下架
						</button>
						<button 
							v-if="getAvailableActions(item.status).includes('online')"
							class="action-btn online-btn" 
							@click.stop="onlineHomestayAction(item)"
						>
							上架
						</button>
						<button 
							v-if="getAvailableActions(item.status).includes('delete')"
							class="action-btn delete-btn" 
							@click.stop="deleteHomestayAction(item)"
						>
							删除
						</button>
					</view>
				</view>
			</view>
			
			<!-- 加载更多 -->
			<view v-if="hasMore" class="load-more" @click="loadMore">
				<up-loading-icon v-if="loadingMore" mode="circle" size="16"></up-loading-icon>
				<text v-else>加载更多</text>
			</view>
			
			<view v-else-if="homestayList.length > 0" class="no-more">
				<text>没有更多了</text>
			</view>
		</view>
	</view>
</template>

<script setup>
	/**
	 * 我的发布页面组件
	 * 功能描述：展示用户发布的所有民宿信息
	 * 主要功能：列表展示、编辑、删除、状态管理
	 */
	
	// 导入Vue响应式API
	import { ref } from 'vue'
	
	// 导入uni-app生命周期钩子
	import { onLoad, onReachBottom, onPullDownRefresh, onShow, onUnload } from '@dcloudio/uni-app'
	
	// 导入API接口 - 使用新的统一API
	import { API } from '../../api'
	
	// 导入Loading管理工具
	import { showLoading, hideLoading } from '@/utils'
	
	// 导入状态管理工具
	import { 
		getStatusText, 
		getStatusClass, 
		getStatusColor,
		getAvailableActions,
		HOMESTAY_STATUS 
	} from '@/utils'
	
	// 导入状态管理
	import { useUserStore, useCacheStore } from '../../stores'

	// ==================== 状态管理 ====================
	/** @type {import('pinia').Store} 用户状态管理 */
	const userStore = useUserStore()
	
	/** @type {import('pinia').Store} 缓存状态管理 */
	const cacheStore = useCacheStore()

	// ==================== 响应式数据 ====================
	/** @type {import('vue').Ref<boolean>} 加载状态 */
	const loading = ref(false)
	
	/** @type {import('vue').Ref<boolean>} 加载更多状态 */
	const loadingMore = ref(false)
	
	/** @type {import('vue').Ref<Array>} 民宿列表数据 */
	const homestayList = ref([])
	
	/** @type {import('vue').Ref<number>} 总数量 */
	const total = ref(0)
	
	/** @type {import('vue').Ref<boolean>} 是否有更多数据 */
	const hasMore = ref(true)
	
	/** @type {import('vue').Ref<number>} 当前页码 */
	const currentPage = ref(1)
	
	/** @type {number} 每页数据量 */
	const pageSize = 10
	
	/** @type {import('vue').Ref<boolean>} 导航防抖状态 */
	const isNavigating = ref(false)

	// ==================== 工具函数 ====================
	/**
	 * 统一的错误处理函数
	 * @param {Error} error - 错误对象
	 * @param {string} defaultMessage - 默认错误消息
	 * @param {string} operation - 操作名称
	 */
	const handleError = (error, defaultMessage = '操作失败', operation = '') => {
		console.error(`❌ ${operation}失败:`, error)
		uni.showToast({
			title: error.message || defaultMessage,
			icon: 'none'
		})
	}

	/**
	 * 显示成功提示
	 * @param {string} message - 成功消息
	 */
	const showSuccess = (message) => {
		uni.showToast({
			title: message,
			icon: 'success'
		})
	}

	// ==================== 数据管理方法 ====================
	/**
	 * 加载数据
	 * @description 从服务器获取用户的发布列表数据
	 */
	const loadData = async () => {
		if (loading.value) return
		
		try {
			loading.value = true
			currentPage.value = 1
			
			console.log(`📱 加载我的发布列表 - 页码: ${currentPage.value}, 每页: ${pageSize}`)
			
			const response = await API.user.getMyList({
				page: currentPage.value,
				size: pageSize
			})
			
			if (response && response.code === 1) {
				const pageData = response.data || {}
				homestayList.value = pageData.list || []
				total.value = pageData.total || 0
				hasMore.value = homestayList.value.length < total.value
				console.log('✅ 我的发布列表加载成功:', homestayList.value.length, '条')
			} else {
				throw new Error(response?.message || '数据格式异常')
			}
		} catch (error) {
			handleError(error, '加载失败，请重试', '加载我的发布列表')
		} finally {
			loading.value = false
		}
	}
	
	/**
	 * 加载更多数据
	 * @description 分页加载更多发布列表数据
	 */
	const loadMore = async () => {
		if (loadingMore.value || !hasMore.value) return
		
		try {
			loadingMore.value = true
			currentPage.value++
			
			console.log(`📱 加载更多 - 页码: ${currentPage.value}`)
			
			const response = await API.user.getMyList({
				page: currentPage.value,
				size: pageSize
			})
			
			if (response && response.code === 1) {
				const pageData = response.data || {}
				const newList = pageData.list || []
				homestayList.value.push(...newList)
				total.value = pageData.total || total.value
				hasMore.value = homestayList.value.length < total.value
				console.log('✅ 加载更多成功:', newList.length, '条')
			} else {
				throw new Error(response?.message || '加载更多失败')
			}
		} catch (error) {
			handleError(error, '加载更多失败，请重试', '加载更多数据')
		} finally {
			loadingMore.value = false
		}
	}
	
	/**
	 * 刷新数据
	 * @description 重新加载第一页数据
	 */
	const refreshData = async () => {
		await loadData()
	}
	
	/**
	 * 从列表中移除指定项目
	 * @param {string} homestayId - 民宿ID
	 */
	const removeItem = (homestayId) => {
		const index = homestayList.value.findIndex(item => item.homestayId === homestayId)
		if (index > -1) {
			homestayList.value.splice(index, 1)
			total.value--
			console.log(`📱 移除项目成功 - ID: ${homestayId}`)
		}
	}
	
	/**
	 * 更新项目状态
	 * @param {string} homestayId - 民宿ID
	 * @param {string} status - 新状态
	 */
	const updateItemStatus = (homestayId, status) => {
		const item = homestayList.value.find(item => item.homestayId === homestayId)
		if (item) {
			item.status = status
			console.log(`📱 更新项目状态 - ID: ${homestayId}, 状态: ${status}`)
		}
	}
	
	// ==================== 生命周期钩子 ====================
	/**
	 * 页面加载时获取数据
	 * @description 页面初始化时加载发布列表数据
	 */
	onLoad(() => {
		// 延迟加载，提升页面响应速度
		setTimeout(() => {
			loadData()
		}, 100)
		
		// 预加载详情页面，减少跳转时间
		preloadDetailPage()
	})

	// ==================== 事件监听 ====================
	/**
	 * 监听民宿更新事件
	 * @description 当从编辑页面返回时，精准更新对应的民宿数据
	 * @param {Object} params - 事件参数
	 * @param {string} params.homestayId - 民宿ID
	 * @param {Object} params.data - 更新后的数据
	 */
	const onHomestayUpdated = ({ homestayId, data }) => {
		try {
			if (!homestayId || !data) return
			console.log(`📱 接收民宿更新事件 - ID: ${homestayId}`)
			
			const index = homestayList.value.findIndex(item => item.homestayId === homestayId)
			if (index > -1) {
				homestayList.value[index] = { ...homestayList.value[index], ...data }
				console.log('✅ 精准更新民宿数据成功')
			} else {
				// 当前页未找到该项，保守起见刷新第一页
				console.log('⚠️ 当前页未找到对应项目，刷新整页数据')
				loadData()
			}
		} catch (e) {
			console.warn('应用更新数据失败，回退整页刷新:', e)
			loadData()
		}
	}

	/**
	 * 页面显示时绑定事件监听
	 */
	onShow(() => {
		// 确保事件只绑定一次
		uni.$off && uni.$off('homestay-updated', onHomestayUpdated)
		uni.$on && uni.$on('homestay-updated', onHomestayUpdated)
		console.log('📱 绑定民宿更新事件监听')
	})

	/**
	 * 页面卸载时解绑事件监听
	 */
	onUnload(() => {
		uni.$off && uni.$off('homestay-updated', onHomestayUpdated)
		console.log('📱 解绑民宿更新事件监听')
	})
	
	// ==================== 页面预加载 ====================
	/**
	 * 预加载详情页面
	 * @description 预加载详情页面以提升用户体验，减少跳转时间
	 */
	const preloadDetailPage = () => {
		// 某些平台（如微信小程序）不支持 preloadPage，做能力检测
		try {
			const canPreload = typeof uni.preloadPage === 'function'
			if (canPreload) {
				uni.preloadPage({
					url: '/pages/detail/detail'
				})
				console.log('✅ 详情页面预加载成功')
			} else {
				console.log('⚠️ 当前平台不支持页面预加载，已跳过')
			}
		} catch (error) {
			console.warn('详情页面预加载失败:', error)
		}
	}
	
	/**
	 * 触底加载更多
	 * @description 当用户滚动到页面底部时自动加载更多数据
	 */
	onReachBottom(() => {
		if (hasMore.value && !loadingMore.value) {
			console.log('📱 触底加载更多')
			loadMore()
		}
	})
	
	/**
	 * 下拉刷新
	 * @description 用户下拉页面时刷新数据
	 */
	onPullDownRefresh(async () => {
		try {
			console.log('📱 下拉刷新数据')
			await refreshData()
		} finally {
			uni.stopPullDownRefresh()
		}
	})
	
	// ==================== 导航方法 ====================
	/**
	 * 跳转到民宿详情页
	 * @description 点击民宿项时跳转到对应的详情页，包含状态检查和预加载
	 * @param {Object} item - 民宿数据对象
	 * @param {string} item.homestayId - 民宿ID
	 * @param {string} item.status - 民宿状态
	 * @param {string} item.title - 民宿标题
	 */
	const goToDetail = async (item) => {
		if (!item || !item.homestayId) {
			uni.showToast({
				title: '房源信息无效',
				icon: 'none'
			})
			return
		}
		
		// 检查房源状态，已下架和已删除的房源不能进入详情页
		if (item.status === '3') {
			uni.showModal({
				title: '房源已下架',
				content: '该房源已下架，无法查看详情。您可以重新上架或编辑房源信息。',
				showCancel: false,
				confirmText: '知道了'
			})
			return
		}
		
		if (item.status === '4') {
			uni.showModal({
				title: '房源已删除',
				content: '该房源已删除，无法查看详情。',
				showCancel: false,
				confirmText: '知道了'
			})
			return
		}
		
		// 防抖处理
		if (isNavigating.value) {
			return
		}
		
		isNavigating.value = true
		
		// 显示加载提示
		showLoading('加载详情中...')
		
		try {
			// 先预加载详情数据，确保数据可用
			await preloadDetailData(item.homestayId)
			
			// 数据预加载成功后，进行页面跳转
			attemptNavigation(item.homestayId)
		} catch (error) {
			console.error('预加载详情数据失败:', error)
			hideLoading()
			isNavigating.value = false
			
			uni.showToast({
				title: '数据加载失败，请重试',
				icon: 'none'
			})
		}
	}
	
	/**
	 * 预加载详情数据
	 */
	const preloadDetailData = async (homestayId) => {
		// 预加载详情数据
		const result = await API.homestay.getDetail(homestayId)
		
		if (result && result.code === 1) {
			console.log('详情数据预加载成功:', result.data)
			// 将数据存储到全局状态或本地存储，供详情页使用
			uni.setStorageSync('preloadedDetailData', result.data)
			return result.data
		} else {
			throw new Error(result?.msg || '获取详情数据失败')
		}
	}
	
	/**
	 * 尝试多种导航方式
	 */
	const attemptNavigation = (homestayId) => {
		const url = `/pages/detail/detail?id=${homestayId}`
		
		// 首先尝试navigateTo
		uni.navigateTo({
			url: url,
			success: () => {
				console.log('navigateTo跳转成功')
				hideLoading()
				isNavigating.value = false
			},
			fail: (err) => {
				console.error('navigateTo失败:', err)
				
				// 如果navigateTo失败，尝试redirectTo
				uni.redirectTo({
					url: url,
					success: () => {
						console.log('redirectTo跳转成功')
						hideLoading()
						isNavigating.value = false
					},
					fail: (redirectErr) => {
						console.error('redirectTo也失败:', redirectErr)
						hideLoading()
						isNavigating.value = false
						
						// 显示错误信息并提供重试选项
						showNavigationError(err, homestayId)
					}
				})
			}
		})
	}
	
	/**
	 * 显示导航错误信息
	 */
	const showNavigationError = (err, homestayId) => {
		let errorMsg = '页面跳转失败'
		if (err.errMsg && err.errMsg.includes('timeout')) {
			errorMsg = '页面加载超时，可能是网络问题或页面过于复杂'
		} else if (err.errMsg && err.errMsg.includes('fail')) {
			errorMsg = '页面不存在或配置错误'
		}
		
		uni.showModal({
			title: '跳转失败',
			content: errorMsg + '，是否重试？',
			confirmText: '重试',
			cancelText: '取消',
			success: (res) => {
				if (res.confirm) {
					// 重置状态并重试
					isNavigating.value = false
					setTimeout(() => {
						// 重试时需要重新获取item对象
						const retryItem = homestayList.value.find(item => item.homestayId === homestayId)
						if (retryItem) {
							goToDetail(retryItem)
						}
					}, 1000)
				}
			}
		})
	}
	
	/**
	 * 跳转到发布页面
	 * @description 从空状态页面跳转到发布新民宿的页面
	 */
	const goToPublish = () => {
		// 防抖处理
		if (isNavigating.value) {
			return
		}
		
		isNavigating.value = true
		
		// 显示加载提示
		showLoading({
			title: '跳转中...'
		})
		
		// 使用setTimeout避免快速连续点击
		setTimeout(() => {
			uni.navigateTo({
				url: '/pages/publish/publish',
				success: () => {
					console.log('跳转发布页成功')
					hideLoading()
					isNavigating.value = false
				},
				fail: (err) => {
					console.error('跳转发布页失败:', err)
					hideLoading()
					isNavigating.value = false
					uni.showToast({
						title: '页面跳转失败，请重试',
						icon: 'none',
						duration: 2000
					})
				}
			})
		}, 100)
	}
	
	// ==================== 操作方法 ====================
	/**
	 * 编辑民宿
	 * @description 编辑指定的民宿信息，包含状态检查和权限验证
	 * @param {Object} item - 民宿数据对象
	 * @param {string} item.homestayId - 民宿ID
	 * @param {string} item.status - 民宿状态
	 */
	const editHomestay = (item) => {
		// 检查民宿状态是否允许编辑
		if (!getAvailableActions(item.status).includes('edit')) {
			uni.showToast({
				title: '该状态不允许编辑',
				icon: 'none'
			})
			return
		}
		
		// 如果是审核通过状态，需要先下架才能编辑
		if (item.status === '1') {
			uni.showModal({
				title: '编辑提示',
				content: '先下架商品后才能编辑。请先点击"下架"按钮，然后再进行编辑。',
				confirmText: '我知道了',
				showCancel: false,
				success: (res) => {
					// 用户点击确认后不跳转，停留在当前页面
					console.log('用户已了解编辑规则')
				}
			})
		} else {
			// 其他状态直接跳转
			navigateToEdit(item.homestayId)
		}
	}
	
	/**
	 * 跳转到编辑页面
	 */
	const navigateToEdit = (homestayId) => {
		// 显示加载提示
		showLoading({
			title: '跳转中...'
		})
		
		// 跳转到编辑页面
		uni.navigateTo({
			url: `/pages/publish-detail/publish-detail?mode=edit&id=${homestayId}`,
			success: () => {
				hideLoading()
				console.log('跳转编辑页成功')
			},
			fail: (err) => {
				hideLoading()
				console.error('跳转编辑页失败:', err)
				uni.showToast({
					title: '页面跳转失败，请重试',
					icon: 'none',
					duration: 2000
				})
			}
		})
	}
	
	/**
	 * 删除民宿
	 * @description 删除指定的民宿，需要用户确认
	 * @param {Object} item - 民宿数据对象
	 * @param {string} item.homestayId - 民宿ID
	 * @param {string} item.title - 民宿标题
	 */
	const deleteHomestayAction = async (item) => {
		uni.showModal({
			title: '确认删除',
			content: '确定要删除这条发布吗？删除后不可恢复。',
			success: async (res) => {
				if (res.confirm) {
					try {
						showLoading({
							title: '删除中...'
						})
						
						console.log(`📱 删除民宿 - ID: ${item.homestayId}`)
						
						const result = await API.homestay.delete(item.homestayId)
						
						if (result && result.code === 1) {
							// 从列表中移除该项目
							removeItem(item.homestayId)
							showSuccess('删除成功')
							console.log('✅ 民宿删除成功')
						} else {
							throw new Error(result?.msg || '删除失败')
						}
					} catch (error) {
						handleError(error, '删除失败，请重试', '删除民宿')
					} finally {
						hideLoading()
					}
				}
			}
		})
	}
	
	/**
	 * 下架民宿
	 * @description 将民宿从上线状态改为下架状态
	 * @param {Object} item - 民宿数据对象
	 * @param {string} item.homestayId - 民宿ID
	 * @param {string} item.title - 民宿标题
	 */
	const offlineHomestayAction = async (item) => {
		uni.showModal({
			title: '确认下架',
			content: '确定要下架这条发布吗？下架后用户将无法看到此房源。',
			success: async (res) => {
				if (res.confirm) {
					try {
						showLoading({
							title: '下架中...'
						})
						
						console.log(`📱 下架民宿 - ID: ${item.homestayId}`)
						
						const result = await API.homestay.offline(item.homestayId)
						
						if (result && result.code === 1) {
							// 更新项目状态
							updateItemStatus(item.homestayId, '3')
							showSuccess('下架成功')
							console.log('✅ 民宿下架成功')
						} else {
							throw new Error(result?.msg || '下架失败')
						}
					} catch (error) {
						handleError(error, '下架失败，请重试', '下架民宿')
					} finally {
						hideLoading()
					}
				}
			}
		})
	}
	
	/**
	 * 上架民宿
	 * @description 将民宿从下架状态改为上线状态，需要重新审核
	 * @param {Object} item - 民宿数据对象
	 * @param {string} item.homestayId - 民宿ID
	 * @param {string} item.title - 民宿标题
	 */
	const onlineHomestayAction = async (item) => {
		uni.showModal({
			title: '确认上架',
			content: '确定要重新上架这条发布吗？',
			success: async (res) => {
				if (res.confirm) {
					try {
						showLoading({
							title: '上架中...'
						})
						
						console.log(`📱 上架民宿 - ID: ${item.homestayId}`)
						
						const result = await API.homestay.online(item.homestayId)
						
						if (result && result.code === 1) {
							// 更新项目状态为审核中
							updateItemStatus(item.homestayId, '0')
							showSuccess('上架成功，等待审核')
							console.log('✅ 民宿上架成功')
						} else {
							throw new Error(result?.msg || '上架失败')
						}
					} catch (error) {
						handleError(error, '上架失败，请重试', '上架民宿')
					} finally {
						hideLoading()
					}
				}
			}
		})
	}
	
	// ==================== 工具函数 ====================
	/**
	 * 处理图片加载错误
	 * @description 当图片加载失败时的错误处理
	 * @param {Event} e - 图片加载错误事件
	 */
	const handleImageError = (e) => {
		console.warn('图片加载失败:', e)
		// 可以设置默认图片或显示占位符
	}
	
	/**
	 * 格式化位置信息
	 * @description 将详细地址格式化为省-市-区县格式
	 * @param {string} location - 原始位置信息
	 * @returns {string} 格式化后的位置信息
	 */
	const formatLocation = (location) => {
		if (!location) return ''
		
		// 如果包含详细地址，只取省市区部分
		const parts = location.split(/[省市区县]/)
		if (parts.length >= 3) {
			// 提取省市区
			const province = parts[0] + '省'
			const city = parts[1] + '市'
			const district = parts[2] + '区'
			return `${province}${city}${district}`
		}
		
		// 如果没有详细地址，直接返回
		return location
	}
	
	
	/**
	 * 格式化时间显示
	 * @description 将时间字符串转换为相对时间显示，支持iOS兼容性处理
	 * @param {string} timeStr - 时间字符串，格式如 "yyyy-MM-dd HH:mm:ss"
	 * @returns {string} 格式化后的时间显示文本
	 * @example
	 * formatTime('2024-01-15 14:30:00') // 返回 "2小时前" 或 "刚刚" 等
	 */
	const formatTime = (timeStr) => {
		if (!timeStr) return ''
		
		// 修复iOS兼容性问题：将 "2025-10-15 21:50:42" 格式转换为iOS兼容的格式
		let date
		try {
			// 如果是 "YYYY-MM-DD HH:mm:ss" 格式，转换为 "YYYY/MM/DD HH:mm:ss" 格式
			if (timeStr.includes(' ') && timeStr.includes('-')) {
				const isoFormat = timeStr.replace(/-/g, '/')
				date = new Date(isoFormat)
			} else {
				date = new Date(timeStr)
			}
			
			// 检查日期是否有效
			if (isNaN(date.getTime())) {
				console.warn('Invalid date format:', timeStr)
				return timeStr // 如果解析失败，返回原始字符串
			}
		} catch (error) {
			console.error('Date parsing error:', error, 'Input:', timeStr)
			return timeStr // 如果解析失败，返回原始字符串
		}
		
		const now = new Date()
		const diff = now - date
		
		// 小于1分钟
		if (diff < 60000) {
			return '刚刚'
		}
		// 小于1小时
		if (diff < 3600000) {
			return Math.floor(diff / 60000) + '分钟前'
		}
		// 小于1天
		if (diff < 86400000) {
			return Math.floor(diff / 3600000) + '小时前'
		}
		// 小于7天
		if (diff < 604800000) {
			return Math.floor(diff / 86400000) + '天前'
		}
		// 超过7天显示具体日期
		return date.toLocaleDateString()
	}
</script>

<style lang="scss" scoped>
	/* ==================== 页面容器样式 ==================== */
	.container {
		min-height: 100vh;
		background-color: #f5f5f5;
	}
	
	.header {
		padding: 40rpx 30rpx 20rpx;
		background-color: #fff;
		
		.subtitle {
			font-size: 28rpx;
			color: #666;
		}
	}
	
	/* ==================== 加载状态样式 ==================== */
	.loading-container {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 120rpx 0;
		background-color: #f8f9fa;
		border-radius: 20rpx;
		margin: 20rpx 30rpx;
		
		.loading-spinner {
			margin-bottom: 30rpx;
			animation: spin 1s linear infinite;
		}
		
		.loading-text {
			font-size: 32rpx;
			font-weight: 500;
			color: #333;
			margin-bottom: 10rpx;
		}
		
		.loading-desc {
			font-size: 26rpx;
			color: #666;
		}
	}
	
	@keyframes spin {
		0% { transform: rotate(0deg); }
		100% { transform: rotate(360deg); }
	}
	
	/* ==================== 空状态样式 ==================== */
	.empty-container {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 120rpx 30rpx;
		background-color: #f8f9fa;
		border-radius: 20rpx;
		margin: 20rpx 30rpx;
		
		.empty-icon {
			margin-bottom: 40rpx;
			opacity: 0.6;
		}
		
		.empty-text {
			font-size: 36rpx;
			font-weight: 600;
			color: #333;
			margin-bottom: 20rpx;
		}
		
		.empty-desc {
			font-size: 28rpx;
			color: #666;
			line-height: 1.5;
			text-align: center;
			margin-bottom: 50rpx;
		}
		
		.publish-btn {
			background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
			color: #fff;
			border: none;
			border-radius: 50rpx;
			padding: 20rpx 40rpx;
			font-size: 28rpx;
			font-weight: 500;
			position: relative;
			overflow: hidden;
			transition: all 0.3s ease;
			box-shadow: 0 4rpx 12rpx rgba(102, 126, 234, 0.3);
			
			&:active {
				transform: translateY(2rpx);
				box-shadow: 0 2rpx 8rpx rgba(102, 126, 234, 0.4);
			}
			
			&::before {
				content: '';
				position: absolute;
				top: 0;
				left: -100%;
				width: 100%;
				height: 100%;
				background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
				transition: left 0.5s;
			}
			
			&:hover::before {
				left: 100%;
			}
		}
	}
	
	/* ==================== 列表容器样式 ==================== */
	.list-container {
		padding: 20rpx 30rpx;
		
		.list-header {
			margin-bottom: 20rpx;
			
			.list-count {
				font-size: 28rpx;
				color: #666;
			}
		}
		
		.homestay-list {
			.homestay-item {
				background-color: #fff;
				border-radius: 16rpx;
				margin-bottom: 20rpx;
				overflow: hidden;
				box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.1);
				
				.item-image {
					position: relative;
					height: 300rpx;
					
					.homestay-image {
						width: 100%;
						height: 100%;
					}
					
					.status-tag {
						position: absolute;
						top: 20rpx;
						right: 20rpx;
						padding: 8rpx 16rpx;
						border-radius: 20rpx;
						font-size: 24rpx;
						color: #fff;
						/* 状态类：与 utils/homestayStatus.js 对齐，便于样式覆盖 */
						&.status-pending { background-color: #faad14; }
						&.status-approved { background-color: #52c41a; }
						&.status-rejected { background-color: #ff4d4f; }
						&.status-offline { background-color: #8c8c8c; }
						&.status-deleted { background-color: #d9d9d9; color: #555; }
						&.status-unknown { background-color: #8c8c8c; }
					}
				}
				
				.item-content {
					padding: 30rpx;
					
					.item-title {
						font-size: 32rpx;
						font-weight: 600;
						color: #333;
						margin-bottom: 20rpx;
						line-height: 1.4;
					}
					
					.item-info {
						display: flex;
						align-items: center;
						margin-bottom: 15rpx;
						
						.price {
							font-size: 36rpx;
							font-weight: 700;
							color: #ff4d4f;
							margin-right: 20rpx;
						}
						
						.rooms, .area {
							font-size: 26rpx;
							color: #666;
							margin-right: 20rpx;
						}
					}
					
					.item-location {
						margin-bottom: 20rpx;
						
						.location-text {
							font-size: 26rpx;
							color: #999;
						}
					}
					
					.item-stats {
						display: flex;
						align-items: center;
						margin-bottom: 20rpx;
						
						.stat-item {
							display: flex;
							align-items: center;
							margin-right: 30rpx;
							
							.stat-label {
								font-size: 24rpx;
								color: #999;
								margin-right: 8rpx;
							}
							
							.stat-value {
								font-size: 24rpx;
								color: #333;
								font-weight: 600;
							}
						}
					}
					
					.item-time {
						.time-text {
							font-size: 24rpx;
							color: #999;
						}
					}
				}
				
				.item-actions {
					display: flex;
					padding: 0 30rpx 30rpx;
					gap: 20rpx;
					
					.action-btn {
						flex: 1;
						height: 70rpx;
						border-radius: 35rpx;
						font-size: 28rpx;
						font-weight: 500;
						border: none;
						position: relative;
						overflow: hidden;
						transition: all 0.3s ease;
						box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
						display: flex;
						align-items: center;
						justify-content: center;
						
						&:active {
							transform: translateY(2rpx);
							box-shadow: 0 1rpx 4rpx rgba(0, 0, 0, 0.2);
						}
						
						&::before {
							content: '';
							position: absolute;
							top: 0;
							left: -100%;
							width: 100%;
							height: 100%;
							background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
							transition: left 0.5s;
						}
						
						&:hover::before {
							left: 100%;
						}
						
						&.edit-btn {
							background: linear-gradient(135deg, #1890ff 0%, #40a9ff 100%);
							color: #fff;
							
							&:hover {
								background: linear-gradient(135deg, #40a9ff 0%, #1890ff 100%);
							}
						}
						
						&.delete-btn {
							background: linear-gradient(135deg, #ff4d4f 0%, #ff7875 100%);
							color: #fff;
							
							&:hover {
								background: linear-gradient(135deg, #ff7875 0%, #ff4d4f 100%);
							}
						}
						
						&.offline-btn {
							background: linear-gradient(135deg, #faad14 0%, #ffc53d 100%);
							color: #fff;
							
							&:hover {
								background: linear-gradient(135deg, #ffc53d 0%, #faad14 100%);
							}
						}
						
						&.online-btn {
							background: linear-gradient(135deg, #52c41a 0%, #73d13d 100%);
							color: #fff;
							
							&:hover {
								background: linear-gradient(135deg, #73d13d 0%, #52c41a 100%);
							}
						}
					}
				}
			}
		}
		
		.load-more, .no-more {
			display: flex;
			align-items: center;
			justify-content: center;
			padding: 40rpx 0;
			font-size: 28rpx;
			color: #666;
		}
		
		.load-more {
			background-color: #fff;
			border-radius: 16rpx;
			margin-top: 20rpx;
			cursor: pointer;
			transition: all 0.3s ease;
			box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
			
			&:active {
				transform: translateY(1rpx);
				box-shadow: 0 1rpx 4rpx rgba(0, 0, 0, 0.15);
			}
			
			&:hover {
				background-color: #f8f9fa;
			}
		}
	}
</style>




