<template>
	<!-- 首页主容器 -->
	<view class="social-forum">
		<!-- 头部搜索组件 -->
		<HeaderSearch />

		<!-- 内容区域 - 支持下拉刷新 -->
		<scroll-view 
			class="content-area" 
			scroll-y="true"
			:refresher-enabled="true"
			:refresher-triggered="isRefreshing"
			@refresherrefresh="onRefresherRefresh"
		>
			<!-- 轮播图组件 -->
			<BannerCarousel :bannerList="bannerList" />
			
			<!-- 筛选栏 - 地址选择和布局切换 -->
			<view class="filter-bar">
				<!-- 地址选择器 -->
				<view class="filter-item address-filter" @click="showAddressPicker">
					<up-icon name="arrow-down" size="12" color="#999"></up-icon>
					<text class="filter-text">{{ selectedAddress || '选择地址' }}</text>
				</view>
				<!-- 布局切换按钮 -->
				<view class="filter-item layout-toggle" @click="toggleLayout">
					<up-icon :name="isSingleColumn ? 'grid' : 'list'" size="24" color="#999"></up-icon>
				</view>
			</view>
			
			<!-- 民宿列表 -->
			<view class="homestay-list-container">
				<!-- 双排瀑布流布局 -->
				<up-waterfall 
					v-if="!isSingleColumn && fallList.length > 0" 
					v-model="fallList"
					ref="uWaterfallRef" 
					:add-time="100" 
					:column-count="2"
					:column-width="320"
					:column-gap="20"
					:show-scrollbar="false"
					@loadmore="loadMore"
				>
					<template v-slot:left="{ leftList }">
						<view class="post-card" v-for="(item, index) in leftList" :key="index" @click="goDetail(item)">
							<view class="post-image">
								<image :src="getImageUrl(item.img)" mode="widthFix" class="post-img" @error="handleImageError"></image>
								<view class="location-overlay" v-if="item.city || item.location">
									<up-icon name="map" size="14" color="#fff"></up-icon>
									<text class="location-text">{{ item.city || item.location }}</text>
								</view>
							</view>
								<view class="post-content">
									<view class="post-title">{{ item.title }}</view>
									<view class="post-summary" v-if="item.introduce">{{ item.introduce }}</view>
									
									<!-- 价格与点赞收藏，与关注页保持一致 -->
									<view class="post-info">
										<view class="price-tag">
											<text class="price-symbol">¥</text>
											<text class="price-number">{{ formatPrice(item.price) }}</text>
										</view>
										<view class="interaction-stats">
											<view class="stat-item">
												<up-icon name="heart-fill" size="14" color="#ff4757"></up-icon>
												<text class="stat-count">{{ item.likes || 0 }}</text>
											</view>
											<view class="stat-item">
												<up-icon name="star-fill" size="14" color="#ffa502"></up-icon>
												<text class="stat-count">{{ item.supports || 0 }}</text>
											</view>
										</view>
									</view>
								
								<!-- 用户信息和互动 -->
								<view class="post-footer">
									<view class="user-info">
										<view class="avatar">
											<image :src="getImageUrl(item.avatar)" mode="aspectFill"></image>
										</view>
										<view class="user-details">
											<text class="username">{{ item.author || 'Asuka' }}</text>
										</view>
									</view>
								</view>
							</view>
						</view>
					</template>
					<template v-slot:right="{ rightList }">
						<view class="post-card" v-for="(item, index) in rightList" :key="index" @click="goDetail(item)">
							<view class="post-image">
								<image :src="getImageUrl(item.img)" mode="widthFix" class="post-img" @error="handleImageError"></image>
								<view class="location-overlay" v-if="item.city || item.location">
									<up-icon name="map" size="14" color="#fff"></up-icon>
									<text class="location-text">{{ item.city || item.location }}</text>
								</view>
							</view>
							<view class="post-content">
								<view class="post-title">{{ item.title }}</view>
								<view class="post-summary" v-if="item.introduce">{{ item.introduce }}</view>
								
								<!-- 价格与点赞收藏，与关注页保持一致 -->
								<view class="post-info">
									<view class="price-tag">
										<text class="price-symbol">¥</text>
										<text class="price-number">{{ formatPrice(item.price) }}</text>
									</view>
									<view class="interaction-stats">
										<view class="stat-item">
											<up-icon name="heart-fill" size="14" color="#ff4757"></up-icon>
											<text class="stat-count">{{ item.likes || 0 }}</text>
										</view>
										<view class="stat-item">
											<up-icon name="star-fill" size="14" color="#ffa502"></up-icon>
											<text class="stat-count">{{ item.supports || 0 }}</text>
										</view>
									</view>
								</view>
								
								<!-- 用户信息和互动 -->
								<view class="post-footer">
									<view class="user-info">
										<view class="avatar">
											<image :src="getImageUrl(item.avatar)" mode="aspectFill"></image>
										</view>
										<view class="user-details">
											<text class="username">{{ item.author || 'Asuka' }}</text>
										</view>
									</view>
								</view>
							</view>
						</view>
					</template>
				</up-waterfall>
				
				<!-- 单排列表布局 -->
				<view v-else-if="isSingleColumn && fallList.length > 0" class="single-column-list">
					<view class="single-card" v-for="(item, index) in fallList" :key="index" @click="goDetail(item)">
						<!-- 上半部分：图片和内容 -->
						<view class="single-top">
							<!-- 左侧图片区域 -->
							<view class="single-image">
								<image :src="getImageUrl(item.img)" mode="aspectFill" class="single-img" @error="handleImageError($event, item, index)"></image>
								<!-- 位置信息覆盖在图片上 -->
								<view class="location-overlay" v-if="item.city || item.location">
									<up-icon name="map" size="14" color="#fff"></up-icon>
									<text class="location-text">{{ item.city || item.location }}</text>
								</view>
							</view>
							
							<!-- 右侧内容区域 -->
							<view class="single-content">
								<!-- 标题 -->
								<view class="single-title">{{ item.title }}</view>
								
								<!-- 详细信息 -->
								<view class="single-details" v-if="item.introduce">{{ item.introduce }}</view>
								
								<!-- 底部三个元素：金额、喜欢、收藏 -->
								<view class="single-actions">
									<view class="action-item">
										<text class="action-value price-value">¥{{ formatPrice(item.price) }}</text>
									</view>
									<view class="action-item">
										<up-icon name="heart-fill" size="16" color="#ff4757"></up-icon>
										<text class="action-value">{{ item.likes || 0 }}</text>
									</view>
									<view class="action-item">
										<up-icon name="star-fill" size="16" color="#ffa502"></up-icon>
										<text class="action-value">{{ item.supports || 0 }}</text>
									</view>
								</view>
							</view>
						</view>
						
						<!-- 底部用户信息区域 -->
						<view class="single-footer">
							<view class="single-avatar">
								<image :src="item.avatar || '/static/logo.png'" mode="aspectFill"></image>
							</view>
							<view class="single-username">{{ item.author || 'Asuka' }}</view>
							<view class="single-views">
								<up-icon name="eye" size="14" color="#999"></up-icon>
								<text class="views-text">{{ item.viewCount || 0 }}</text>
							</view>
						</view>
					</view>
				</view>
				
				<!-- 空状态 -->
				<view v-if="fallList.length === 0 && !isLoading" class="empty-state">
					<up-icon name="inbox" size="80" color="#ccc"></up-icon>
					<text class="empty-text">暂无数据</text>
				</view>
				
				<!-- 加载状态 -->
				<view v-if="isLoading" class="loading-state">
					<up-loading-icon mode="circle" size="40" color="#667eea"></up-loading-icon>
					<text class="loading-text">加载中...</text>
				</view>
			</view>
		</scroll-view>
		

		<!-- 双列选择器 -->
		<view v-if="showAddressPickerPopup" class="region-picker-overlay" @click="closeAddressPicker">
			<view class="region-picker-modal" @click.stop>
				<!-- 双列选择区域 -->
				<view class="picker-content">
					<!-- 左侧省份列表 -->
				<view class="left-column">
						<template v-if="provinceList.length > 0">
							<view class="region-option" 
								v-for="province in provinceList" 
								:key="province.code"
								:class="{ active: selectedProvince && selectedProvince.code === province.code }"
								@click="selectProvince(province)"
							>
								<text class="region-text">{{ province.name }}</text>
							</view>
						</template>
					</view>
					
					<!-- 右侧城市/区县列表 -->
					<view class="right-column">
						<template v-if="cityList.length > 0">
							<view class="region-option" 
								v-for="city in cityList" 
								:key="city.code"
								:class="{ active: selectedCity && selectedCity.code === city.code }"
								@click="selectCity(city)"
							>
								<text class="region-text">{{ city.name }}</text>
							</view>
						</template>
						<view v-else-if="!selectedProvince" class="region-option">
							<text class="region-text">请选择省份</text>
						</view>
					</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script setup>
/**
 * 首页组件 - 民宿展示首页
 * 
 * 主要功能：
 * 1. 轮播图展示
 * 2. 民宿列表展示（支持瀑布流和单列布局）
 * 3. 地址筛选
 * 4. 搜索功能
 * 5. 下拉刷新和上拉加载
 * 6. 缓存管理
 */

// ==================== 导入模块 ====================

// 导入API接口
import { API } from '../../api'

// 导入uni-app生命周期钩子
import {
	onLoad,      // 页面加载
	onShow,       // 页面显示
	onReachBottom, // 触底加载
	onPageScroll,  // 页面滚动
} from '@dcloudio/uni-app'

// 导入Vue响应式API
import {
	ref,        // 响应式引用
	computed    // 计算属性
} from 'vue'

// 导入Pinia状态管理
import { 
	useHomestayStore,  // 民宿数据管理
	useCacheStore      // 缓存管理
} from '../../stores'

// 导入工具函数
import { formatPrice } from '@/utils'  // 价格格式化
import { convertToHttps } from '@/utils/security/urlConverter'  // URL安全转换

// 导入组件
import HeaderSearch from './components/HeaderSearch.vue'
import BannerCarousel from './components/BannerCarousel.vue'


// ==================== 状态管理 ====================

// 使用模块化Store
const homestayListStore = useHomestayStore()  // 民宿数据管理
const cacheStore = useCacheStore()            // 缓存管理


// ==================== 响应式数据定义 ====================

// 搜索相关 - 仅保留跳转功能

// 轮播图相关
const bannerList = ref([])                    // 轮播图数据

// UI状态
const isSingleColumn = ref(false)            // 是否为单列布局
const isPageLoaded = ref(false)              // 页面是否已加载
const isRefreshing = ref(false)              // 是否正在刷新

// 地址选择相关
const selectedAddress = ref('')               // 选中的地址
const showAddressPickerPopup = ref(false)    // 是否显示地址选择器
const provinceList = ref([])                 // 省份列表
const cityList = ref([])                     // 城市列表
const selectedProvince = ref(null)           // 选中的省份
const selectedCity = ref(null)               // 选中的城市
const loadingProvinces = ref(false)          // 是否正在加载省份数据

// ==================== 计算属性 ====================

// 从Store获取民宿数据
const fallList = computed(() => {
	const data = homestayListStore.processedHomestayList || []
	return data
})

// 加载状态
const isLoading = computed(() => homestayListStore.isLoading)    // 是否正在加载
const hasMore = computed(() => homestayListStore.hasMore)        // 是否还有更多数据
const currentPage = computed(() => homestayListStore.currentPage) // 当前页码


// ==================== 布局管理 ====================

/**
 * 从本地存储读取布局偏好
 * 用户可以选择单列或双列瀑布流布局
 */
const loadLayoutPreference = () => {
	try {
		const saved = uni.getStorageSync('layout_preference')
		if (saved !== null && saved !== undefined) {
			isSingleColumn.value = saved
		}
	} catch (error) {
		console.error('读取布局偏好失败:', error)
	}
}

/**
 * 保存布局偏好到本地存储
 * 记住用户的选择，下次打开时恢复
 */
const saveLayoutPreference = () => {
	try {
		uni.setStorageSync('layout_preference', isSingleColumn.value)
	} catch (error) {
		console.error('保存布局偏好失败:', error)
	}
}

/**
 * 切换布局模式
 * 在单列列表和双列瀑布流之间切换
 */
const toggleLayout = () => {
	isSingleColumn.value = !isSingleColumn.value
	saveLayoutPreference()
}


// ==================== 地址选择功能 ====================

/**
 * 显示地址选择器
 * 打开省市区选择弹窗
 */
const showAddressPicker = () => {
	showAddressPickerPopup.value = true
	loadProvinces()
}

/**
 * 关闭地址选择器
 */
const closeAddressPicker = () => {
	showAddressPickerPopup.value = false
}

/**
 * 选择省份
 * @param {Object} province - 省份对象
 */
const selectProvince = (province) => {
    selectedProvince.value = province
    loadCities(province.code)
}

/**
 * 选择城市
 * @param {Object} city - 城市对象
 */
const selectCity = (city) => {
	selectedCity.value = city
	selectedAddress.value = `${selectedProvince.value.name} ${city.name}`
	closeAddressPicker()
	loadHomestayList()
}

// ==================== 数据加载功能 ====================

/**
 * 加载省份数据
 * 从API获取省份列表，避免重复加载
 */
const loadProvinces = async () => {
	if (loadingProvinces.value || provinceList.value.length > 0) return
	
	loadingProvinces.value = true
	try {
		const response = await API.region.getProvinces()
		if (response && response.data) {
			provinceList.value = response.data
		}
	} catch (error) {
		console.error('加载省份数据失败:', error)
	} finally {
		loadingProvinces.value = false
	}
}

/**
 * 加载城市数据
 * @param {string} provinceCode - 省份代码
 */
const loadCities = async (provinceCode) => {
	try {
		const response = await API.region.getCitiesByProvince(provinceCode)
		if (response && response.data) {
			cityList.value = response.data
		}
	} catch (error) {
		console.error('加载城市数据失败:', error)
	}
}

/**
 * 加载民宿列表
 * 从Store加载民宿数据
 */
const loadHomestayList = async () => {
	try {
		await homestayListStore.loadMoreHomestays()
	} catch (error) {
		console.error('加载民宿列表失败:', error)
	}
}

/**
 * 加载更多数据
 * 触底加载更多民宿数据
 */
const loadMore = async () => {
	if (isLoading.value || !hasMore.value) return
	
	try {
		await homestayListStore.loadMoreHomestays()
	} catch (error) {
		console.error('加载更多数据失败:', error)
	}
}

// ==================== 图片处理功能 ====================

/**
 * 智能图片URL处理
 * 将HTTP转换为HTTPS，处理默认图片
 * @param {string} url - 原始图片URL
 * @returns {string} 处理后的安全URL
 */
const getImageUrl = (url) => {
	if (!url) return '/static/logo.png'
	return convertToHttps(url)
}

/**
 * 图片加载错误处理
 * 智能降级处理，支持HTTP/HTTPS协议切换
 * @param {Object} errorData - 错误数据对象
 */
const handleImageError = (errorData) => {
	// 使用智能错误处理
	if (errorData && errorData.target && errorData.target.src) {
		const currentSrc = errorData.target.src
		
		// 如果是HTTPS失败，尝试降级到HTTP（仅限本地开发环境）
		if (currentSrc.includes('https://localhost:8081')) {
			const httpSrc = currentSrc.replace('https://', 'http://')
			console.log('图片协议降级:', httpSrc)
			// 更新图片源
			errorData.target.src = httpSrc
		} else if (currentSrc.includes('http://localhost:8081')) {
			// 如果HTTP也失败，使用默认图片
			console.log('使用默认图片')
			errorData.target.src = '/static/logo.png'
		}
	}
}

// ==================== 页面导航功能 ====================

/**
 * 跳转到民宿详情页
 * @param {Object} item - 民宿数据对象
 */
const goDetail = (item) => {
	uni.navigateTo({
		url: `/pages/detail/detail?id=${item.id}`
	})
}


// ==================== 滚动和刷新功能 ====================



/**
 * scroll-view 下拉刷新处理
 * 清除缓存并重新加载数据
 */
const onRefresherRefresh = async () => {
    if (isRefreshing.value) return
    isRefreshing.value = true
    
    try {
        // 强制清除所有相关缓存
        cacheStore.clearCacheByDataType('homestay-list')
        cacheStore.clearCacheByDataType('banner')
        
        // 刷新数据
        await homestayListStore.refreshHomestayList()
        
        // 重新加载轮播图
        const bannerResponse = await API.homestay.getBanner()
        if (bannerResponse && bannerResponse.data) {
            bannerList.value = bannerResponse.data
        }
        
        console.log('下拉刷新完成')
    } catch (e) {
        console.error('下拉刷新失败:', e)
    } finally {
        isRefreshing.value = false
    }
}

// ==================== 生命周期钩子 ====================

/**
 * 页面加载时触发
 * 初始化页面数据，处理缓存逻辑
 * @param {Object} options - 页面参数
 */
onLoad(async (options) => {
	loadLayoutPreference()
	
	// 检查是否需要强制刷新
	const forceRefresh = options.forceRefresh === 'true'
	const cacheAge = cacheStore.getCacheAge('homestay-list-1-{}')
	
	try {
		// 加载轮播图
		const bannerResponse = await API.homestay.getBanner()
		if (bannerResponse && bannerResponse.data) {
			bannerList.value = bannerResponse.data
		}
		
		// 根据缓存年龄和强制刷新参数决定是否使用缓存
		if (forceRefresh || !cacheAge || cacheAge > 2 * 60 * 1000) {
			// 强制刷新或缓存过期，清除缓存
			await homestayListStore.clearCache()
			await loadHomestayList()
		} else {
			// 使用缓存
			await loadHomestayList()
		}
		
		isPageLoaded.value = true
	} catch (error) {
		console.error('首页初始化失败:', error)
	}
})

/**
 * 页面显示时触发
 * 启动数据同步检查，确保数据最新
 */
onShow(() => {
	// 启动数据同步检查
	try {
		cacheStore.startDataSyncCheck()
	} catch (error) {
		console.error('启动数据同步检查失败:', error)
	}
})

/**
 * 触底加载更多
 * 当用户滚动到底部时自动加载更多数据
 */
onReachBottom(() => {
	loadMore()
})


</script>

<style scoped>
/* ==================== 主容器样式 ==================== */

/* 首页主容器 */
.social-forum {
	background: #f8f9fa;
	min-height: 100vh;
}



/* 筛选栏样式 */
.filter-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10rpx 20rpx;
    background: transparent;
    border-bottom: 1rpx solid #f0f0f0;
}

.filter-item {
    display: flex;
    align-items: center;
    padding: 12rpx 16rpx;
    border-radius: 30rpx;
    background: transparent;
}

.address-filter {
	flex: 1;
	margin-right: 20rpx;
}

.filter-text {
	font-size: 28rpx;
	color: #333;
	margin-left: 10rpx;
}

.layout-toggle {
    width: 80rpx;
    height: 60rpx;
    justify-content: center;
    background: transparent;
}

/* 民宿列表样式 */
.content-area {
	height: calc(100vh - 120rpx);
	padding: 20rpx;
	box-sizing: border-box;
}

.homestay-list-container {
	width: 100%;
}

.single-column-list {
	padding: 20rpx;
	width: 100%;
	box-sizing: border-box;
}

.single-card {
	background: #fff;
	border-radius: 20rpx;
	margin-bottom: 20rpx;
	overflow: hidden;
	box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.08);
	transition: all 0.3s ease;
	width: 100%;
	box-sizing: border-box;
}

.single-top {
	display: flex;
	width: 100%;
	box-sizing: border-box;
}

.single-image {
	width: 300rpx;
	min-height: 200rpx;
	border-radius: 12rpx;
	overflow: hidden;
	position: relative;
	flex-shrink: 0;
	display: flex;
	align-items: stretch;
}

.single-img {
	width: 100%;
	height: 100%;
}

.single-content {
	flex: 1;
	padding: 20rpx;
	display: flex;
	flex-direction: column;
	justify-content: space-between;
	min-width: 0;
	overflow: hidden;
}

.single-title {
	font-size: 32rpx;
	font-weight: 600;
	color: #333;
	line-height: 1.4;
	margin-bottom: 8rpx;
	display: -webkit-box;
	line-clamp: 2;
	-webkit-line-clamp: 2;
	-webkit-box-orient: vertical;
	overflow: hidden;
	word-break: break-word;
	width: 100%;
}

.single-details {
	font-size: 24rpx;
	color: #666;
	line-height: 1.5;
	margin-bottom: 16rpx;
	display: -webkit-box;
	line-clamp: 2;
	-webkit-line-clamp: 2;
	-webkit-box-orient: vertical;
	overflow: hidden;
	word-break: break-word;
	width: 100%;
}

.single-actions {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-top: auto;
	width: 100%;
	box-sizing: border-box;
}

.single-footer {
	display: flex;
	align-items: center;
	padding: 20rpx;
	border-top: 1rpx solid #f5f5f5;
	background-color: #fafafa;
	width: 100%;
	box-sizing: border-box;
}

.single-avatar {
	width: 40rpx;
	height: 40rpx;
	border-radius: 50%;
	overflow: hidden;
	margin-right: 12rpx;
}

.single-avatar image {
	width: 100%;
	height: 100%;
}

.single-username {
	flex: 1;
	font-size: 24rpx;
	color: #333;
	font-weight: 500;
}

.single-views {
	display: flex;
	align-items: center;
}

.views-text {
	font-size: 22rpx;
	color: #999;
}

/* 瀑布流卡片样式 */
.post-card {
    background: #fff;
    border-radius: 16rpx;
    overflow: hidden;
    box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.08);
    margin-bottom: 20rpx;
    transition: all 0.3s ease;
}

.post-image {
    position: relative;
    width: 100%;
    overflow: hidden;
}

.post-img {
    width: 100%;
    display: block;
}

.location-overlay {
    position: absolute;
    bottom: 12rpx;
    left: 12rpx;
    background: rgba(0, 0, 0, 0.6);
    padding: 6rpx 12rpx;
    border-radius: 20rpx;
    display: flex;
    align-items: center;
    gap: 6rpx;
}

.location-text {
	color: #fff;
	font-size: 24rpx;
	margin-left: 8rpx;
}

.post-content {
	padding: 24rpx;
}

.post-title {
	font-size: 32rpx;
	font-weight: bold;
	color: #333;
	margin-bottom: 15rpx;
	line-height: 1.4;
}

.post-details {
	font-size: 28rpx;
	color: #666;
	line-height: 1.5;
	margin-bottom: 20rpx;
}

/* 关注页命名保持一致 */
.post-summary {
	font-size: 24rpx;
	color: #666;
	line-height: 1.5;
	margin-bottom: 16rpx;
	display: -webkit-box;
	line-clamp: 2;
	-webkit-line-clamp: 2;
	-webkit-box-orient: vertical;
	overflow: hidden;
}

.post-actions {
	display: flex;
	align-items: center;
	justify-content: space-between;
	margin-bottom: 20rpx;
}

/* 关注页一致的价格/统计布局 */
.post-info {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 16rpx;
}

.price-tag {
	display: flex;
	align-items: baseline;
	color: #ff4757;
	font-weight: 600;
}

.price-symbol {
	font-size: 24rpx;
	margin-right: 4rpx;
}

.price-number {
	font-size: 32rpx;
	font-weight: 700;
}

.interaction-stats {
	display: flex;
	gap: 16rpx;
}

.stat-item {
	display: flex;
	align-items: center;
	gap: 6rpx;
}

.stat-count {
	font-size: 22rpx;
	color: #666;
}

.action-item {
	display: flex;
	align-items: center;
	gap: 6rpx;
	flex-shrink: 0;
}

.action-value {
	font-size: 22rpx;
	color: #666;
}

.price-value {
	font-size: 28rpx;
	font-weight: 700;
	color: #ff4757;
}

.post-footer {
	display: flex;
	align-items: center;
	justify-content: space-between;
}

.user-info {
	display: flex;
	align-items: center;
}

.avatar {
	width: 60rpx;
	height: 60rpx;
	border-radius: 50%;
	overflow: hidden;
	margin-right: 15rpx;
}

.avatar image {
	width: 100%;
	height: 100%;
}

.user-details {
	flex: 1;
}

.username {
	font-size: 28rpx;
	color: #333;
}

/* 空状态和加载状态 */
.empty-state {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	padding: 100rpx 0;
}

.empty-text {
	color: #999;
	font-size: 28rpx;
	margin-top: 20rpx;
}

.loading-state {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	padding: 100rpx 0;
}

.loading-text {
	color: #999;
	font-size: 28rpx;
	margin-top: 20rpx;
}


/* 地址选择器样式 */
.region-picker-overlay {
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background: rgba(0, 0, 0, 0.5);
	z-index: 1000;
	display: flex;
	align-items: flex-end;
}

.region-picker-modal {
	width: 100%;
	background: #fff;
	border-radius: 20rpx 20rpx 0 0;
	max-height: 80vh;
}

.picker-content {
	display: flex;
	height: 500rpx;
}

.left-column, .right-column {
	flex: 1;
	overflow-y: auto;
}

.region-option {
	padding: 25rpx 30rpx;
	border-bottom: 1rpx solid #f0f0f0;
}

.region-option.active {
	background: #667eea;
}

.region-option.active .region-text {
	color: #fff;
}

.region-text {
	font-size: 28rpx;
	color: #333;
}
</style>