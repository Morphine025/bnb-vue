<template>
	<!-- 地址选择器弹窗 -->
	<view v-if="show" class="region-picker-overlay" @click="handleClose">
		<view class="region-picker-modal" @click.stop>
			<!-- 双列选择区域 -->
			<view class="picker-content">
				<!-- 左侧省份列表 -->
				<view class="left-column">
					<template v-if="provinceList.length > 0">
						<view 
							class="region-option" 
							v-for="province in provinceList" 
							:key="province.code"
							:class="{ 
								active: selectedProvince && selectedProvince.code === province.code
							}"
							@click="selectProvince(province)"
						>
							<text class="region-text">{{ province.name }}</text>
						</view>
					</template>
					<!-- 加载状态 -->
					<view v-if="loadingProvinces" class="loading-option">
						<up-loading-icon mode="circle" size="20" color="#999"></up-loading-icon>
						<text class="loading-text">加载中...</text>
					</view>
				</view>
				
				<!-- 右侧城市/区县列表 -->
				<view class="right-column">
					<template v-if="cityList.length > 0">
						<view 
							class="region-option" 
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
					<view v-else-if="loadingCities" class="loading-option">
						<up-loading-icon mode="circle" size="20" color="#999"></up-loading-icon>
						<text class="loading-text">加载中...</text>
					</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script setup>
/**
 * 地址选择器组件
 * 功能描述：提供省市区选择功能，支持双列联动选择
 * 主要功能：
 * 1. 省份列表展示 - 支持全国选项和各省份
 * 2. 城市列表联动 - 根据省份动态加载城市
 * 3. 双列选择界面 - 左侧省份，右侧城市
 * 4. 选择确认 - 支持全国和具体城市选择
 * 5. 加载状态管理 - 显示加载动画和状态
 * 6. 弹窗动画 - 平滑的弹出和收起动画
 * 
 * 技术特点：
 * - 支持三级联动选择
 * - 智能数据加载和缓存
 * - 响应式双列布局
 * - 优雅的动画效果
 * - 完善的错误处理
 */

import { ref, watch, onMounted } from 'vue'
import { API } from '../../../api'

// ==================== 组件属性 ====================

/**
 * 组件属性定义
 */
const props = defineProps({
	// 是否显示地址选择器
	show: {
		type: Boolean,
		default: false
	},
	// 当前选中的地址
	selectedAddress: {
		type: String,
		default: ''
	}
})

// ==================== 组件事件 ====================

/**
 * 组件事件定义
 */
const emit = defineEmits(['confirm', 'close'])

// ==================== 响应式数据 ====================

// 省份和城市数据
const provinceList = ref([])                 // 省份列表
const cityList = ref([])                     // 城市列表

// 选择状态
const selectedProvince = ref(null)           // 选中的省份
const selectedCity = ref(null)               // 选中的城市

// 加载状态
const loadingProvinces = ref(false)          // 是否正在加载省份数据
const loadingCities = ref(false)             // 是否正在加载城市数据

// ==================== 数据加载功能 ====================

/**
 * 加载省份数据
 * 从API获取省份列表，避免重复加载，支持全国选项
 */
const loadProvinces = async () => {
	// 防重复加载：如果正在加载或已有数据，则跳过
	if (loadingProvinces.value || provinceList.value.length > 0) return
	
	loadingProvinces.value = true
	try {
		const response = await API.region.getProvinces()
		if (response && response.data) {
			// 在省份列表前面添加"全国"选项
			const allCountryOption = {
				code: 'all',
				name: '全国',
				type: 'country'
			}
			provinceList.value = [allCountryOption, ...response.data]
		}
	} catch (error) {
		console.error('加载省份数据失败:', error)
		uni.showToast({
			title: '加载省份数据失败',
			icon: 'none'
		})
	} finally {
		loadingProvinces.value = false
	}
}

/**
 * 加载城市数据
 * 根据省份代码获取对应的城市列表
 * @param {string} provinceCode - 省份代码
 */
const loadCities = async (provinceCode) => {
	loadingCities.value = true
	try {
		const response = await API.region.getCitiesByProvince(provinceCode)
		if (response && response.data) {
			cityList.value = response.data
		}
	} catch (error) {
		console.error('加载城市数据失败:', error)
		uni.showToast({
			title: '加载城市数据失败',
			icon: 'none'
		})
	} finally {
		loadingCities.value = false
	}
}

// ==================== 选择功能 ====================

/**
 * 选择省份
 * 处理省份选择逻辑，支持全国选项和具体省份
 * @param {Object} province - 省份对象，包含code、name等字段
 */
const selectProvince = (province) => {
	selectedProvince.value = province
	selectedCity.value = null // 清空城市选择
	
	// 如果选择的是"全国"，直接确认选择
	if (province.code === 'all') {
		emit('confirm', {
			province: province,
			city: null,
			address: '全国'
		})
		return
	}
	
	// 加载对应省份的城市列表
	loadCities(province.code)
}

/**
 * 选择城市
 * 处理城市选择逻辑，触发确认事件
 * @param {Object} city - 城市对象，包含code、name等字段
 */
const selectCity = (city) => {
	selectedCity.value = city
	const address = `${selectedProvince.value.name} ${city.name}`
	
	// 触发确认事件，传递完整的地址信息
	emit('confirm', {
		province: selectedProvince.value,
		city: city,
		address: address,
		cityName: city.name  // 添加城市名称字段，便于父组件使用
	})
}

/**
 * 关闭地址选择器
 * 处理弹窗关闭事件，触发关闭事件
 */
const handleClose = () => {
	emit('close')
}

// ==================== 监听器 ====================

/**
 * 监听显示状态变化
 * 当组件显示时自动加载省份数据，重置选择状态
 */
watch(() => props.show, (newVal) => {
	if (newVal) {
		// 重置选择状态，确保每次打开都是全新状态
		selectedProvince.value = null
		selectedCity.value = null
		cityList.value = []
		
		// 加载省份数据
		loadProvinces()
	}
})

// ==================== 生命周期 ====================

/**
 * 组件挂载时的初始化
 * 记录组件挂载状态，用于调试
 */
onMounted(() => {
	console.log('🎯 AddressPicker组件已挂载')
})
</script>

<style scoped>
/* ==================== 地址选择器样式 ==================== */

/**
 * 遮罩层样式
 * 固定定位，覆盖整个屏幕，半透明黑色背景
 */
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

/**
 * 弹窗容器样式
 * 白色背景，圆角设计，支持最大高度限制
 */
.region-picker-modal {
	width: 100%;
	background: #fff;
	border-radius: 20rpx 20rpx 0 0;
	max-height: 80vh;
	animation: slideUp 0.3s ease-out;
}

/**
 * 弹窗动画效果
 * 从底部滑入的动画效果
 */
@keyframes slideUp {
	from {
		transform: translateY(100%);
	}
	to {
		transform: translateY(0);
	}
}

/**
 * 选择器内容区域样式
 * 双列布局，固定高度
 */
.picker-content {
	display: flex;
	height: 500rpx;
}

/**
 * 左右列通用样式
 * 等宽分布，支持垂直滚动
 */
.left-column, .right-column {
	flex: 1;
	overflow-y: auto;
}

/**
 * 选项基础样式
 * 内边距、边框、过渡效果
 */
.region-option {
	padding: 25rpx 30rpx;
	border-bottom: 1rpx solid #f0f0f0;
	transition: all 0.2s ease;
}

/**
 * 选项激活状态样式
 * 浅灰色背景，提供触觉反馈
 */
.region-option:active {
	background: #f5f5f5;
}

/**
 * 选项选中状态样式
 * 主题色背景，突出显示
 */
.region-option.active {
	background: #667eea;
}

/**
 * 选中状态下的文本样式
 * 白色文字，与背景形成对比
 */
.region-option.active .region-text {
	color: #fff;
}

/**
 * 选项文本样式
 * 标准字体大小和颜色
 */
.region-text {
	font-size: 28rpx;
	color: #333;
	transition: color 0.2s ease;
}

/**
 * 加载状态样式
 * 居中显示加载图标和文本
 */
.loading-option {
	display: flex;
	align-items: center;
	justify-content: center;
	padding: 25rpx 30rpx;
	gap: 10rpx;
}

/**
 * 加载文本样式
 * 小号灰色文字
 */
.loading-text {
	font-size: 24rpx;
	color: #999;
}
</style>
