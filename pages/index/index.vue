<template>
	<view class="social-forum">
		<!-- 顶部搜索区域 -->
		<view class="header-section">
			<view class="search-container">
				<view class="search-wrapper">
					<!-- 项目图标 -->
					<view class="project-icon">
						<image src="/static/unnamed.jpg" mode="aspectFill" class="icon-image"></image>
					</view>
					
					<view class="search-input" @click="goToSearch">
						<up-icon name="search" size="18" color="#999"></up-icon>
						<input 
							type="text" 
							placeholder="搜索帖子/用户/圈子" 
							:value="keyword"
							class="search-field"
							@confirm="handleSearch"
							@input="handleSearchInput"
							:disabled="true"
						/>
						<view class="search-clear" v-if="keyword" @click.stop="clearSearch">
							<up-icon name="close-circle-fill" size="16" color="#ccc"></up-icon>
						</view>
					</view>
				</view>
			</view>
		</view>

		<!-- 内容区域 -->
		<scroll-view 
			class="content-area" 
			scroll-y="true"
			:refresher-enabled="true"
			:refresher-triggered="isRefreshing"
			@refresherrefresh="onRefresherRefresh"
		>
			<!-- 轮播图 -->
			<view class="banner-container" v-if="bannerList.length > 0">
				<swiper 
					class="banner-swiper" 
					:indicator-dots="bannerList.length > 1" 
					:autoplay="bannerList.length > 1" 
					:interval="3000" 
					:duration="500"
					indicator-color="rgba(255, 255, 255, 0.5)"
					indicator-active-color="#667eea"
					:circular="bannerList.length > 1"
				>
					<swiper-item v-for="(banner, index) in bannerList" :key="banner.bannerId || banner.banner_id || banner.id || `banner_${index}`">
						<view class="banner-item" @click="handleBannerClick(banner)">
							<image 
								:src="getImageUrl(banner.imageUrl || banner.image_url || banner.image || banner.img)" 
								mode="aspectFill" 
								class="banner-image"
								@error="handleBannerImageError"
							></image>
							<view class="banner-overlay">
								<view class="banner-title">{{ banner.title || '暂无标题' }}</view>
								<view class="banner-subtitle" v-if="banner.subtitle">{{ banner.subtitle }}</view>
							</view>
						</view>
					</swiper-item>
				</swiper>
			</view>
			
			<!-- 轮播图加载失败时的占位符 -->
			<view class="banner-placeholder" v-else>
				<view class="placeholder-content">
					<up-icon name="image" size="48" color="#ccc"></up-icon>
					<text class="placeholder-text">暂无轮播图</text>
				</view>
			</view>
			
			<!-- 筛选栏 -->
			<view class="filter-bar">
				<view class="filter-item address-filter" @click="showAddressPicker">
					<up-icon name="arrow-down" size="12" color="#999"></up-icon>
					<text class="filter-text">{{ selectedAddress || '选择地址' }}</text>
				</view>
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
		
		<!-- 回到顶部按钮 -->
		<view v-if="showTopBtn" @click="toTop" class="back-to-top">
			<up-icon name="arrow-upward" color="#fff" size="28"></up-icon>
		</view>

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
 * 首页组件 - 原始未拆分版本
 * 所有功能都集中在一个文件中
 */

// 导入API接口
import { API } from '../../api'
import { showLoading, hideLoading } from '@/utils'

// 导入uni-app生命周期钩子
import {
	onLoad,
	onShow,
	onReachBottom,
	onPageScroll,
	onPullDownRefresh
} from '@dcloudio/uni-app'

// 导入Vue响应式API
import {
	ref,
	reactive,
	computed,
	nextTick
} from 'vue'

// 导入Pinia stores
import { 
	useHomestayStore,
	useHomestayFilterStore,
	useUserProfileStore
} from '../../stores'

// 导入价格格式化工具
import { formatPrice } from '@/utils'

// 导入URL转换工具
import { convertToHttps, createImageErrorHandler } from '@/utils/security/urlConverter'

// 使用模块化Store
const homestayListStore = useHomestayStore()
const homestayFilterStore = useHomestayFilterStore()
const userProfileStore = useUserProfileStore()

// 响应式数据定义
const keyword = ref('')
const bannerList = ref([])
const showTopBtn = ref(0)
const selectedAddress = ref('')
const showAddressPickerPopup = ref(false)
const currentUserId = ref(null)
const isSingleColumn = ref(false)
const isPageLoaded = ref(false)
const isRefreshing = ref(false)

// 省市数据
const provinceList = ref([])
const cityList = ref([])
const selectedProvince = ref(null)
const selectedCity = ref(null)
const loadingProvinces = ref(false)

// 从Store获取数据
const fallList = computed(() => {
	const data = homestayListStore.processedHomestayList || []
	console.log('🔄 首页 fallList computed 计算，数据长度:', data.length)
	return data
})
const isLoading = computed(() => homestayListStore.isLoading)
const hasMore = computed(() => homestayListStore.hasMore)
const currentPage = computed(() => homestayListStore.currentPage)

// 安全的轮播图列表
const safeBannerList = computed(() => {
	return bannerList.value || []
})

// 从本地存储读取布局偏好
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

// 保存布局偏好到本地存储
const saveLayoutPreference = () => {
	try {
		uni.setStorageSync('layout_preference', isSingleColumn.value)
	} catch (error) {
		console.error('保存布局偏好失败:', error)
	}
}

// 切换布局
const toggleLayout = () => {
	isSingleColumn.value = !isSingleColumn.value
	saveLayoutPreference()
}

// 搜索相关方法
const goToSearch = () => {
	uni.navigateTo({
		url: '/pages/search/search'
	})
}

const handleSearch = (searchKeyword) => {
	console.log('搜索关键词:', searchKeyword)
	// 实现搜索逻辑
}

const handleSearchInput = (e) => {
	keyword.value = e.detail.value
}

const clearSearch = () => {
	keyword.value = ''
}

// 轮播图相关方法
const handleBannerClick = (banner) => {
	console.log('点击轮播图:', banner)
	// 实现轮播图点击逻辑
}

const handleBannerImageError = () => {
	console.log('轮播图加载失败')
}

// 地址选择相关方法
const showAddressPicker = () => {
	showAddressPickerPopup.value = true
	loadProvinces()
}

const closeAddressPicker = () => {
	showAddressPickerPopup.value = false
}

const selectProvince = (province) => {
    selectedProvince.value = province
    loadCities(province.code)
}

const selectCity = (city) => {
	selectedCity.value = city
	selectedAddress.value = `${selectedProvince.value.name} ${city.name}`
	closeAddressPicker()
	loadHomestayList()
}

// 加载省份数据
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

// 加载城市数据
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

// 加载民宿列表
const loadHomestayList = async () => {
	try {
		await homestayListStore.loadMoreHomestays()
	} catch (error) {
		console.error('加载民宿列表失败:', error)
	}
}

// 加载更多数据
const loadMore = async () => {
	if (isLoading.value || !hasMore.value) return
	
	try {
		await homestayListStore.loadMoreHomestays()
	} catch (error) {
		console.error('加载更多数据失败:', error)
	}
}

// 智能图片URL处理
const getImageUrl = (url) => {
	if (!url) return '/static/logo.png'
	return convertToHttps(url)
}

// 图片错误处理
const handleImageError = (errorData) => {
	console.log('图片加载失败:', errorData)
	
	// 使用智能错误处理
	if (errorData && errorData.target && errorData.target.src) {
		const currentSrc = errorData.target.src
		
		// 如果是HTTPS失败，尝试降级到HTTP（仅限本地开发环境）
		if (currentSrc.includes('https://localhost:8081')) {
			const httpSrc = currentSrc.replace('https://', 'http://')
			console.log('🔄 尝试降级到HTTP协议:', httpSrc)
			console.warn('⚠️ 注意：微信小程序可能仍会显示HTTP协议警告')
			console.warn('💡 建议：在微信开发者工具中关闭"不校验合法域名"选项')
			// 更新图片源
			errorData.target.src = httpSrc
		} else if (currentSrc.includes('http://localhost:8081')) {
			// 如果HTTP也失败，使用默认图片
			console.log('🔄 使用默认图片作为降级方案')
			errorData.target.src = '/static/logo.png'
		}
	}
}

// 跳转到详情页
const goDetail = (item) => {
	uni.navigateTo({
		url: `/pages/detail/detail?id=${item.id}`
	})
}

// 回到顶部
const toTop = () => {
	uni.pageScrollTo({
		scrollTop: 0,
		duration: 300
	})
}

// 页面滚动处理
const onPageScrollHandler = (e) => {
	showTopBtn.value = e.scrollTop > 500
}

// 下拉刷新
const onPullDownRefreshHandler = async () => {
	try {
		await homestayListStore.refreshHomestayList()
		uni.stopPullDownRefresh()
	} catch (error) {
		console.error('下拉刷新失败:', error)
		uni.stopPullDownRefresh()
	}
}

// scroll-view 下拉刷新
const onRefresherRefresh = async () => {
    if (isRefreshing.value) return
    isRefreshing.value = true
    try {
        await homestayListStore.refreshHomestayList()
    } catch (e) {
        console.error('refresher 刷新失败:', e)
    } finally {
        isRefreshing.value = false
    }
}

// 生命周期钩子
onLoad(async (options) => {
	console.log('首页加载，参数:', options)
	loadLayoutPreference()
	
	try {
		// 加载轮播图
		const bannerResponse = await API.homestay.getBanner()
		if (bannerResponse && bannerResponse.data) {
			bannerList.value = bannerResponse.data
		}
		
		// 加载民宿列表
		await loadHomestayList()
		isPageLoaded.value = true
	} catch (error) {
		console.error('首页初始化失败:', error)
	}
})

onShow(() => {
	console.log('首页显示')
})

onReachBottom(() => {
	console.log('触底加载更多')
	loadMore()
})

onPageScroll(onPageScrollHandler)

onPullDownRefresh(onPullDownRefreshHandler)
</script>

<style scoped>
.social-forum {
	background: #f8f9fa;
	min-height: 100vh;
}

/* 头部搜索区域样式 */
.header-section {
    background: transparent;
    padding: 20rpx 30rpx;
    box-shadow: none;
}

.search-container {
	width: 100%;
}

.search-wrapper {
    display: flex;
    align-items: center;
    background: transparent;
    border-radius: 50rpx;
    padding: 20rpx 30rpx;
}

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

.search-input {
	flex: 1;
	display: flex;
	align-items: center;
	background: #fff;
	border-radius: 40rpx;
	padding: 15rpx 25rpx;
	position: relative;
}

.search-field {
	flex: 1;
	font-size: 28rpx;
	color: #333;
	margin-left: 15rpx;
}

.search-clear {
	position: absolute;
	right: 15rpx;
	top: 50%;
	transform: translateY(-50%);
}

/* 轮播图样式 */
.banner-container {
    width: 100%;
    height: 320rpx;
    padding: 0 20rpx;
    box-sizing: border-box;
    margin-bottom: 10rpx;
}

.banner-swiper {
    width: 100%;
    height: 100%;
    overflow: hidden;
}

.banner-item {
	position: relative;
	width: 100%;
	height: 100%;
}

.banner-image {
	width: 100%;
	height: 100%;
	border-radius: 20rpx;
}

.banner-overlay {
	position: absolute;
	bottom: 0;
	left: 0;
	right: 0;
	background: linear-gradient(transparent, rgba(0, 0, 0, 0.6));
	padding: 40rpx 30rpx 30rpx;
	border-radius: 0 0 20rpx 20rpx;
}

.banner-title {
	color: #fff;
	font-size: 32rpx;
	font-weight: bold;
	margin-bottom: 10rpx;
}

.banner-subtitle {
	color: rgba(255, 255, 255, 0.8);
	font-size: 24rpx;
}

.banner-placeholder {
	width: 100%;
	height: 400rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	background: #f8f9fa;
	border-radius: 20rpx;
	margin-bottom: 20rpx;
}

.placeholder-content {
	text-align: center;
}

.placeholder-text {
	color: #999;
	font-size: 28rpx;
	margin-top: 20rpx;
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

/* 回到顶部按钮 */
.back-to-top {
	position: fixed;
	bottom: 100rpx;
	right: 30rpx;
	width: 80rpx;
	height: 80rpx;
	background: #667eea;
	border-radius: 50%;
	display: flex;
	align-items: center;
	justify-content: center;
	box-shadow: 0 4rpx 20rpx rgba(102, 126, 234, 0.3);
	z-index: 100;
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