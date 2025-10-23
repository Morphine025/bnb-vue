<template>
	<view class="publish-detail-container">
		<!-- 免责声明弹框组件 -->
		<DisclaimerModal 
			:show="showDisclaimer"
			:countdown-seconds="5"
			@confirm="confirmDisclaimer"
		/>


		<!-- 表单内容 -->
		<view class="form-container">
			<!-- 基本信息 -->
			<view class="form-section">
				<view class="section-title">基本信息</view>
				
				<!-- 民宿标题 -->
				<FormInput
					v-model="formData.title"
					label="民宿标题"
					placeholder="请输入民宿标题"
					:maxlength="20"
					:required="true"
					:show-char-count="true"
					:error="validationErrors.title"
					@input="handleTitleInput"
				/>

				<!-- 价格 -->
				<view class="form-item">
					<view class="form-label">售价 <text class="required">*</text></view>
					<view class="price-input-wrapper">
						<text class="price-symbol">¥</text>
						<input 
							v-model="formData.price"
							placeholder="请输入售价"
							class="price-input"
							@input="handlePriceInput"
						/>
					</view>
					<view v-if="validationErrors.price" class="error-tip">{{ validationErrors.price }}</view>
				</view>

				<!-- 房间数和面积 -->
				<view class="form-row">
					<view class="form-item half">
						<view class="form-label">房间数 <text class="required">*</text></view>
						<input 
							v-model="formData.rooms"
							placeholder="房间数"
							class="rooms-input"
							@input="handleRoomsInput"
						/>
						<view v-if="validationErrors.rooms" class="error-tip">{{ validationErrors.rooms }}</view>
					</view>
					<view class="form-item half">
						<view class="form-label">面积 <text class="required">*</text></view>
						<view class="area-input-wrapper">
							<input 
								v-model="formData.area"
								placeholder="面积"
								class="area-input"
								@input="handleAreaInput"
							/>
							<text class="area-unit">㎡</text>
						</view>
						<view v-if="validationErrors.area" class="error-tip">{{ validationErrors.area }}</view>
					</view>
				</view>

				<!-- 位置选择 -->
				<view class="form-item">
					<view class="form-label">位置 <text class="required">*</text></view>
					
					<!-- 省市区三级联动选择器 -->
					<view class="region-selector">
						<view class="region-row">
							<view class="region-item">
								<!-- <view class="region-label">省份</view> -->
								<picker 
									:value="provinceIndex" 
									:range="provinceList" 
									range-key="name"
									@change="onProvinceChange"
									class="region-picker"
								>
									<view class="picker-display">
										{{ selectedProvince.name || '请选择省份' }}
									</view>
								</picker>
							</view>
							
							<view class="region-item">
								<!-- <view class="region-label">城市</view> -->
								<picker 
									:value="cityIndex" 
									:range="cityList" 
									range-key="name"
									@change="onCityChange"
									class="region-picker"
									:disabled="!selectedProvince.name"
								>
									<view class="picker-display" :class="{ disabled: !selectedProvince.name }">
										{{ selectedCity.name || '请选择城市' }}
									</view>
								</picker>
							</view>
							
							<view class="region-item">
								<!-- <view class="region-label">区县</view> -->
								<picker 
									:value="districtIndex" 
									:range="districtList" 
									range-key="name"
									@change="onDistrictChange"
									class="region-picker"
									:disabled="!selectedCity.name"
								>
									<view class="picker-display" :class="{ disabled: !selectedCity.name }">
										{{ selectedDistrict.name || '请选择区县' }}
									</view>
								</picker>
							</view>
						</view>
					</view>
					
				<!-- 详细地址输入 -->
				<view class="detail-address-container">
					<FormInput
						v-model="formData.detailAddress"
						label="详细地址"
						placeholder="请输入详细地址（如：XX街道XX号）"
						:maxlength="100"
						:disabled="!isRegionSelected"
					/>
				</view>
				</view>
			</view>

			<!-- 详细信息 -->
			<view class="form-section">
				<view class="section-title">详细信息</view>
				
				<!-- 民宿介绍 -->
				<FormTextarea
					v-model="formData.introduce"
					label="民宿介绍"
					placeholder="请详细介绍您的民宿特色、设施、周边环境等..."
					:maxlength="500"
					:required="true"
					:show-char-count="true"
					:error="validationErrors.introduce"
					@input="handleIntroduceInput"
				/>

				<!-- 联系方式 -->
				<FormInput
					v-model="formData.contact"
					label="联系方式"
					placeholder="请输入手机号码"
					type="number"
					:maxlength="11"
					:required="true"
					:error="validationErrors.contact"
					@input="handleContactInput"
				/>
				
				<!-- 微信号 -->
				<FormInput
					v-model="formData.wechat"
					label="微信号"
					placeholder="请输入微信号（选填）"
					:maxlength="20"
					:error="validationErrors.wechat"
					@input="handleWechatInput"
				/>

				<!-- 特色标签 -->
				<view class="form-item">
					<view class="form-label">特色标签</view>
					<view class="tag-container">
						<view 
							class="tag-item" 
							v-for="tag in availableTags" 
							:key="tag.value"
							:class="{ active: formData.tags.includes(tag.value) }"
							@click="toggleTag(tag.value)"
						>
							<text class="tag-text">{{ tag.label }}</text>
						</view>
					</view>
				</view>
			</view>

			<!-- 图片上传 -->
			<view class="form-section">
				<view class="section-title">民宿图片</view>
				
				<ImageUpload 
					v-model="formData.images"
					:max-count="9"
					:enable-compress="true"
					:compress-quality="80"
					@upload-success="handleImageUploadSuccess"
					@upload-error="handleImageUploadError"
				/>
			</view>
		</view>

		<!-- 底部按钮 -->
		<view class="form-footer">
			<view class="button-group">
						<button class="btn-reset" @click="saveDraft">暂存草稿</button>
				<button 
					class="btn-submit" 
					@click="submitForm"
					:disabled="loading"
					:class="{ 'btn-loading': loading }"
				>
					<up-loading-icon v-if="loading" mode="circle" size="16"></up-loading-icon>
					<text v-if="!loading">{{ isEditMode ? '更新民宿' : '发布出售' }}</text>
					<text v-else>{{ isEditMode ? '更新中...' : '发布中...' }}</text>
				</button>
			</view>
		</view>
		
	</view>
</template>

<script setup>
/**
 * 民宿发布详情页面
 * 功能描述：支持新建和编辑民宿信息，包含完整的表单验证和图片上传功能
 * 主要功能：表单数据管理、省市区选择、图片上传、草稿保存、数据验证
 */

import { ref, reactive, onMounted, computed } from 'vue'
import { API } from '@/api'
import { showLoading, hideLoading } from '@/utils'
import DisclaimerModal from './components/DisclaimerModal.vue'
import ImageUpload from './components/ImageUpload.vue'
import FormInput from './components/FormInput.vue'
import FormTextarea from './components/FormTextarea.vue'
// FormInputWithUnit 组件已不再使用，可以删除

// ==================== 响应式数据 ====================
/**
 * 页面状态管理
 * 控制页面整体的显示状态和交互行为
 */
const loading = ref(false) // 提交按钮loading状态，防止重复提交
const showDisclaimer = ref(true) // 免责声明弹框显示状态，首次进入时显示
const isDraftMode = ref(false) // 草稿模式标识，区分新建和草稿编辑

/**
 * 编辑模式相关
 * 处理新建和编辑两种不同的业务场景
 */
const isEditMode = ref(false) // 是否为编辑模式，影响页面标题和提交逻辑
const homestayId = ref('') // 编辑的民宿ID，编辑模式下使用
const pageTitle = ref('发布民宿') // 页面标题，根据模式动态变化

/**
 * 表单数据 - 使用reactive确保深层响应性
 * 包含民宿发布所需的所有字段信息
 */
const formData = reactive({
	// 基本信息
	title: '', // 民宿标题，必填，最大20字符
	price: '', // 售价，必填，数字类型
	rooms: '', // 房间数，必填，整数类型
	area: '', // 面积，必填，数字类型
	
	// 位置信息
	location: '', // 完整地址，由省市区+详细地址组成
	province: '', // 省份，必填
	city: '', // 城市，必填
	district: '', // 区县，必填
	detailAddress: '', // 详细地址，必填
	latitude: null, // 纬度，可选，用于地图定位
	longitude: null, // 经度，可选，用于地图定位
	
	// 详细信息
	introduce: '', // 民宿介绍，必填，最大500字符
	contact: '', // 联系方式，必填，手机号格式
	wechat: '', // 微信号，可选，最大20字符
	tags: [], // 特色标签，可选，最多5个
	images: [] // 图片列表，可选，最多9张
})

// 省市区数据管理
const provinceList = ref([]) // 省份列表
const cityList = ref([]) // 城市列表
const districtList = ref([]) // 区县列表
const provinceIndex = ref(0) // 当前选中的省份索引
const cityIndex = ref(0) // 当前选中的城市索引
const districtIndex = ref(0) // 当前选中的区县索引
const selectedProvince = ref({}) // 选中的省份对象
const selectedCity = ref({}) // 选中的城市对象
const selectedDistrict = ref({}) // 选中的区县对象

// 特色标签选项
const availableTags = ref([]) // 可选择的标签列表


// ==================== 计算属性 ====================
/**
 * 检查是否已选择完整的地区信息
 * @returns {boolean} 是否已选择省市区
 */
const isRegionSelected = computed(() => {
	return formData.province && formData.city && formData.district
})

/**
 * 检查表单是否完整有效
 * @returns {boolean} 表单是否有效
 */
const isFormValid = computed(() => {
	return formData.title.trim() &&
		formData.price &&
		formData.rooms &&
		formData.area &&
		formData.province &&
		formData.city &&
		formData.district &&
		formData.detailAddress.trim() &&
		formData.introduce.trim() &&
		formData.contact.trim()
})

// 表单验证错误状态
const validationErrors = reactive({
	title: '', // 标题验证错误
	price: '', // 价格验证错误
	rooms: '', // 房间数验证错误
	area: '', // 面积验证错误
	contact: '', // 联系方式验证错误
	wechat: '', // 微信号验证错误
	introduce: '' // 介绍验证错误
})

// ==================== 生命周期 ====================
/**
 * 页面加载时初始化
 * 功能：初始化省市区数据、标签数据，检测页面模式，加载草稿数据
 */
onMounted(() => {
	// 延迟加载数据，提升页面响应速度
	setTimeout(() => {
		initRegionData() // 初始化省市区数据
		loadTagData() // 加载标签数据
		
		// 检查页面参数
		const pages = getCurrentPages()
		const currentPage = pages[pages.length - 1]
		const options = currentPage.options || {}
		
		// 检测编辑模式
		checkEditMode(options)
		
		// 如果不是编辑模式且不是新建模式，加载草稿数据
		if (!isEditMode.value && options.mode !== 'new') {
			loadDraftData()
		}
	}, 150)
})

// ==================== 错误处理机制 ====================
/**
 * 统一错误处理函数
 * @param {Error} error - 错误对象
 * @param {string} defaultMessage - 默认错误消息
 * @param {string} context - 错误上下文（用于日志记录）
 */
const handleError = (error, defaultMessage = '操作失败，请重试', context = '') => {
	console.error(`${context}失败:`, error)
	uni.showToast({
		title: error.message || defaultMessage,
		icon: 'none'
	})
}

/**
 * API响应错误处理
 * @param {Object} result - API响应结果
 * @param {string} successMessage - 成功消息
 * @param {string} errorContext - 错误上下文
 * @returns {boolean} 是否成功
 */
const handleApiResponse = (result, successMessage = '', errorContext = '') => {
	if (result.code === 1) {
		if (successMessage) {
			uni.showToast({
				title: successMessage,
				icon: 'success'
			})
		}
		return true
	} else {
		handleError(new Error(result.msg || `${errorContext}失败`), `${errorContext}失败，请重试`, errorContext)
		return false
	}
}

/**
 * 网络请求错误处理
 * @param {Error} error - 网络错误
 * @param {string} context - 错误上下文
 */
const handleNetworkError = (error, context = '') => {
	handleError(error, '网络错误，请检查网络连接后重试', context)
}

// ==================== 数据初始化 ====================
/**
 * 初始化省市区数据
 * 功能：获取省份列表数据
 */
const initRegionData = async () => {
	try {
		const result = await API.region.getProvinces()
		if (handleApiResponse(result, '', '获取省份数据')) {
			provinceList.value = result.data
		}
	} catch (error) {
		handleNetworkError(error, '获取省份数据')
	}
}

/**
 * 加载标签数据
 * 功能：获取特色标签列表，转换数据格式
 */
const loadTagData = async () => {
	try {
		const result = await API.region.getTagList()
		if (handleApiResponse(result, '', '获取标签数据')) {
			// 将后端返回的标签数据转换为前端需要的格式
			// label用于显示，value用于提交（tag_id）
			availableTags.value = result.data.map(tag => ({
				label: tag.tagName,
				value: tag.tagId
			}))
		}
	} catch (error) {
		handleNetworkError(error, '获取标签数据')
	}
}

// 加载草稿数据
const loadDraftData = () => {
	const draftData = uni.getStorageSync('homestay_draft')
	if (draftData) {
		Object.assign(formData, draftData)
		isDraftMode.value = true
        // 从“我的草稿”进入时，跳过免责声明
        showDisclaimer.value = false
	}
}

// ==================== 组件事件处理 ====================
/**
 * 确认免责声明
 */
const confirmDisclaimer = () => {
	showDisclaimer.value = false
}

/**
 * 图片上传成功处理
 * @param {Array} images - 上传成功的图片列表
 */
const handleImageUploadSuccess = (images) => {
	console.log('图片上传成功:', images)
}

/**
 * 图片上传失败处理
 * @param {Error} error - 错误对象
 */
const handleImageUploadError = (error) => {
	console.error('图片上传失败:', error)
}

// 页面加载时检测编辑模式
const checkEditMode = (options) => {
	if (options.mode === 'edit' && options.id) {
		// 编辑模式
		isEditMode.value = true
		homestayId.value = options.id
		pageTitle.value = '编辑民宿'
		// 编辑模式下不显示免责声明
		showDisclaimer.value = false
		// 加载民宿数据
		loadHomestayData(options.id)
	} else if (options.mode === 'new') {
		// 新建模式（从发布页进入），显示免责声明，不加载草稿
		isEditMode.value = false
		pageTitle.value = '发布民宿'
		showDisclaimer.value = true
	} else {
		// 默认模式（可能是从草稿进入），显示免责声明，加载草稿
		isEditMode.value = false
		pageTitle.value = '发布民宿'
		showDisclaimer.value = true
	}
}

/**
 * 加载民宿数据用于编辑
 * @param {string} id - 民宿ID
 */
const loadHomestayData = async (id) => {
	try {
		showLoading({
			title: '加载中...'
		})
		
		const result = await API.homestay.getDetail(id)
		if (handleApiResponse(result, '', '加载民宿数据')) {
			const data = result.data
			
			// 预填充表单数据
			formData.title = data.title || ''
			formData.price = data.price ? data.price.toString() : ''
			formData.rooms = data.rooms ? data.rooms.toString() : ''
			formData.area = data.area ? data.area.toString() : ''
			formData.introduce = data.introduce || ''
			formData.contact = data.contact || ''
			formData.wechat = data.wechat || ''
			formData.images = data.images || []
			formData.tags = data.tags || []
			
			// 处理省市区信息
			if (data.province) {
				formData.province = data.province
			}
			if (data.city) {
				formData.city = data.city
			}
			if (data.district) {
				formData.district = data.district
			}
			if (data.detailAddress) {
				formData.detailAddress = data.detailAddress
			}
			
			// 延迟设置省市区选择，确保数据加载完成
			setTimeout(() => {
				if (data.province) {
					setProvinceSelection(data.province)
				}
				if (data.city) {
					setTimeout(() => {
						setCitySelection(data.city)
					}, 500)
				}
				if (data.district) {
					setTimeout(() => {
						setDistrictSelection(data.district)
					}, 1000)
				}
			}, 1000)
			
			// 处理经纬度
			formData.latitude = data.latitude || ''
			formData.longitude = data.longitude || ''
		} else {
			// 加载失败，返回上一页
			setTimeout(() => {
				uni.navigateBack()
			}, 1500)
		}
	} catch (error) {
		handleNetworkError(error, '加载民宿数据')
		// 加载失败，返回上一页
		setTimeout(() => {
			uni.navigateBack()
		}, 1500)
	} finally {
		hideLoading()
	}
}

// 设置省份选择
const setProvinceSelection = (provinceName) => {
	if (provinceList.value && provinceList.value.length > 0) {
		const index = provinceList.value.findIndex(p => p.name === provinceName)
		if (index !== -1) {
			provinceIndex.value = index
			selectedProvince.value = provinceList.value[index]
			// 加载城市数据
			loadCityData(selectedProvince.value.code)
		}
	}
}

// 设置城市选择
const setCitySelection = (cityName) => {
	if (cityList.value && cityList.value.length > 0) {
		const index = cityList.value.findIndex(c => c.name === cityName)
		if (index !== -1) {
			cityIndex.value = index
			selectedCity.value = cityList.value[index]
			// 加载区县数据
			loadDistrictData(selectedCity.value.code)
		}
	}
}

// 设置区县选择
const setDistrictSelection = (districtName) => {
	if (districtList.value && districtList.value.length > 0) {
		const index = districtList.value.findIndex(d => d.name === districtName)
		if (index !== -1) {
			districtIndex.value = index
			selectedDistrict.value = districtList.value[index]
		}
	}
}



// 通用验证函数
const setFieldError = (field, message) => {
	validationErrors[field] = message
}

const clearFieldError = (field) => {
	validationErrors[field] = ''
}

// 防抖函数，用于优化输入验证性能
const debounce = (func, delay) => {
	let timeoutId
	return (...args) => {
		clearTimeout(timeoutId)
		timeoutId = setTimeout(() => func.apply(null, args), delay)
	}
}

/**
 * 表单验证函数集合
 * 提供各种字段的验证逻辑，确保数据完整性和正确性
 */

/**
 * 验证民宿标题
 * @param {string} value - 标题内容
 * @returns {boolean} 验证是否通过
 */
const validateTitle = (value) => {
	if (!value.trim()) {
		setFieldError('title', '标题不能为空')
		return false
	} else if (value.length > 20) {
		setFieldError('title', '标题不能超过20个字符')
		return false
	} else {
		clearFieldError('title')
		return true
	}
}

/**
 * 验证售价
 * @param {string} value - 价格字符串
 * @returns {boolean} 验证是否通过
 */
const validatePrice = (value) => {
	// 如果值为空，不显示错误，只清除之前的错误
	if (!value || value.trim() === '') {
		clearFieldError('price')
		return false
	}
	
	const price = parseFloat(value)
	if (isNaN(price) || price <= 0) {
		setFieldError('price', '价格必须大于0')
		return false
	} else if (price > 999999) {
		setFieldError('price', '价格不能超过999999')
		return false
	} else {
		clearFieldError('price')
		return true
	}
}

const validateRooms = (value) => {
	// 如果值为空，不显示错误，只清除之前的错误
	if (!value || value.trim() === '') {
		clearFieldError('rooms')
		return false
	}
	
	const rooms = parseInt(value)
	if (isNaN(rooms) || rooms <= 0) {
		setFieldError('rooms', '房间数必须大于0')
		return false
	} else if (rooms > 99) {
		setFieldError('rooms', '房间数不能超过99')
		return false
	} else {
		clearFieldError('rooms')
		return true
	}
}

const validateArea = (value) => {
	// 如果值为空，不显示错误，只清除之前的错误
	if (!value || value.trim() === '') {
		clearFieldError('area')
		return false
	}
	
	const area = parseFloat(value)
	if (isNaN(area) || area <= 0) {
		setFieldError('area', '面积必须大于0')
		return false
	} else if (area > 99999) {
		setFieldError('area', '面积不能超过99999平方米')
		return false
	} else {
		clearFieldError('area')
		return true
	}
}

const validateContact = (value) => {
	const phoneRegex = /^1[3-9]\d{9}$/
	if (!value) {
		validationErrors.contact = '联系方式不能为空'
		return false
	} else if (!phoneRegex.test(value)) {
		validationErrors.contact = '请输入正确的手机号'
		return false
	} else {
		validationErrors.contact = ''
		return true
	}
}

const validateWechat = (value) => {
	if (value && value.length > 20) {
		validationErrors.wechat = '微信号不能超过20个字符'
		return false
	} else {
		validationErrors.wechat = ''
		return true
	}
}

const validateIntroduce = (value) => {
	if (!value.trim()) {
		validationErrors.introduce = '民宿介绍不能为空'
		return false
	} else if (value.length > 500) {
		validationErrors.introduce = '介绍不能超过500个字符'
		return false
	} else {
		validationErrors.introduce = ''
		return true
	}
}

// 创建防抖验证函数
const debouncedValidateTitle = debounce(validateTitle, 300)
const debouncedValidatePrice = debounce(validatePrice, 300)
const debouncedValidateRooms = debounce(validateRooms, 300)
const debouncedValidateArea = debounce(validateArea, 300)

// 处理标题输入
const handleTitleInput = (value) => {
	formData.title = value
	debouncedValidateTitle(value)
}

// 处理价格输入
const handlePriceInput = (e) => {
	const value = e.detail ? e.detail.value : e.target.value
	formData.price = value
	validatePrice(value)
}

// 处理房间数输入
const handleRoomsInput = (e) => {
	const value = e.detail ? e.detail.value : e.target.value
	formData.rooms = value
	validateRooms(value)
}

// 处理面积输入
const handleAreaInput = (e) => {
	const value = e.detail ? e.detail.value : e.target.value
	formData.area = value
	validateArea(value)
}

// 处理介绍输入
const handleIntroduceInput = (value) => {
	formData.introduce = value
	validateIntroduce(value)
}

// 处理联系方式输入
const handleContactInput = (value) => {
	formData.contact = value
	validateContact(value)
}

// 处理微信号输入
const handleWechatInput = (value) => {
	formData.wechat = value
	validateWechat(value)
}

// 省份选择
const onProvinceChange = (e) => {
	provinceIndex.value = e.detail.value
	selectedProvince.value = provinceList.value[provinceIndex.value]
	formData.province = selectedProvince.value.name
	
	// 重置城市和区县
	cityList.value = []
	districtList.value = []
	selectedCity.value = {}
	selectedDistrict.value = {}
	formData.city = ''
	formData.district = ''
	
	// 模拟加载城市数据
	loadCityData(selectedProvince.value.code)
}

// 城市选择
const onCityChange = (e) => {
	cityIndex.value = e.detail.value
	selectedCity.value = cityList.value[cityIndex.value]
	formData.city = selectedCity.value.name
	
	// 重置区县
	districtList.value = []
	selectedDistrict.value = {}
	formData.district = ''
	
	// 模拟加载区县数据
	loadDistrictData(selectedCity.value.code)
}

// 区县选择
const onDistrictChange = (e) => {
	districtIndex.value = e.detail.value
	selectedDistrict.value = districtList.value[districtIndex.value]
	formData.district = selectedDistrict.value.name
}

/**
 * 加载城市数据
 * @param {string} provinceCode - 省份代码
 */
const loadCityData = async (provinceCode) => {
	try {
		const result = await API.region.getCitiesByProvince(provinceCode)
		if (handleApiResponse(result, '', '获取城市数据')) {
			cityList.value = result.data
		}
	} catch (error) {
		handleNetworkError(error, '获取城市数据')
	}
}

/**
 * 加载区县数据
 * @param {string} cityCode - 城市代码
 */
const loadDistrictData = async (cityCode) => {
	try {
		const result = await API.region.getDistrictsByCity(cityCode)
		if (handleApiResponse(result, '', '获取区县数据')) {
			districtList.value = result.data
		}
	} catch (error) {
		handleNetworkError(error, '获取区县数据')
	}
}

// 切换标签
const toggleTag = (tagValue) => {
	const index = formData.tags.indexOf(tagValue)
	if (index > -1) {
		formData.tags.splice(index, 1)
	} else {
		if (formData.tags.length < 5) {
			formData.tags.push(tagValue)
		} else {
			uni.showToast({
				title: '最多选择5个标签',
				icon: 'none'
			})
		}
	}
}



// 保存草稿
const saveDraft = () => {
	uni.setStorageSync('homestay_draft', formData)
	uni.showToast({
		title: '草稿已保存',
		icon: 'success'
	})
	
	// 保存草稿后跳转到首页
	setTimeout(() => {
		uni.switchTab({
			url: '/pages/index/index'
		})
	}, 1500) // 延迟1.5秒让用户看到保存成功的提示
}

// 提交表单
const submitForm = async () => {
	// 表单验证
	if (!isFormValid.value) {
		uni.showToast({
			title: '请填写完整信息',
			icon: 'none'
		})
		return
	}
	
	// 验证手机号格式
	const phoneRegex = /^1[3-9]\d{9}$/
	if (!phoneRegex.test(formData.contact)) {
		uni.showToast({
			title: '请输入正确的手机号',
			icon: 'none'
		})
		return
	}
	
	loading.value = true
	
	try {
		// 构建提交数据
		const submitData = {
			title: formData.title.trim(),
			price: parseFloat(formData.price),
			rooms: parseInt(formData.rooms),
			area: parseFloat(formData.area),
			location: `${formData.province}${formData.city}${formData.district}${formData.detailAddress}`,
			province: formData.province,
			city: formData.city,
			district: formData.district,
			detailAddress: formData.detailAddress.trim(),
			latitude: formData.latitude,
			longitude: formData.longitude,
			introduce: formData.introduce.trim(),
			contact: formData.contact.trim(),
			wechat: formData.wechat.trim(),
			tags: formData.tags,
			images: formData.images
		}
		
		console.log('提交数据:', submitData)
		
		let result
		if (isEditMode.value) {
			// 编辑模式：调用更新接口
			result = await API.homestay.update(homestayId.value, submitData)
		} else {
			// 新建模式：调用发布接口
			result = await API.homestay.publish(submitData)
		}
		
		if (handleApiResponse(result, isEditMode.value ? '更新成功' : '发布成功', isEditMode.value ? '更新民宿' : '发布民宿')) {
			// 清除草稿
			uni.removeStorageSync('homestay_draft')
			
			// 设置首页刷新标记
			uni.setStorageSync('needRefreshHomePage', true)
			
			// 编辑模式下，向上一页发送精准更新事件，避免整页刷新
			if (isEditMode.value) {
				try {
					uni.$emit && uni.$emit('homestay-updated', {
						homestayId: homestayId.value,
						data: {
							title: submitData.title,
							price: submitData.price,
							rooms: submitData.rooms,
							area: submitData.area,
							location: submitData.location,
							province: submitData.province,
							city: submitData.city,
							district: submitData.district,
							detailAddress: submitData.detailAddress,
							introduce: submitData.introduce,
							contact: submitData.contact,
							wechat: submitData.wechat,
							tags: submitData.tags,
							images: submitData.images
						}
					})
				} catch (e) {
					console.warn('发送 homestay-updated 事件失败:', e)
				}
			}
			
			// 延迟跳转
			setTimeout(() => {
				if (isEditMode.value) {
					// 编辑成功后返回上一页
					uni.navigateBack()
				} else {
					// 新建成功后跳转到首页
					uni.switchTab({
						url: '/pages/index/index'
					})
				}
			}, 1500)
		}
		
	} catch (error) {
		handleError(error, isEditMode.value ? '更新失败，请重试' : '发布失败，请重试', isEditMode.value ? '更新民宿' : '发布民宿')
	} finally {
		loading.value = false
	}
}
</script>

<style lang="scss" scoped>

	.publish-detail-container {
		background-color: #f8f9fa;
		min-height: 100vh;
		padding-bottom: 120rpx;
		box-sizing: border-box;
	}




	/* 表单容器 */
	.form-container {
		padding: 20rpx;
		box-sizing: border-box;
	}

	/* 表单分组 */
	.form-section {
		background: #fff;
		border-radius: 20rpx;
		padding: 30rpx;
		margin-bottom: 20rpx;
		box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.08);
		box-sizing: border-box;

		.section-title {
			font-size: 32rpx;
			font-weight: 600;
			color: #333;
			margin-bottom: 30rpx;
			padding-bottom: 15rpx;
			border-bottom: 2rpx solid #f0f0f0;
		}
	}


	/* 标签容器 */
	.tag-container {
		display: flex;
		flex-wrap: wrap;
		gap: 15rpx;
		margin-top: 15rpx;
	}

	.tag-item {
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 12rpx 20rpx;
		border: 2rpx solid #e9ecef;
		border-radius: 30rpx;
		background: #f8f9fa;
		transition: all 0.3s ease;
		font-size: 26rpx;
		font-weight: 500;

		&.active {
			border-color: #667eea;
			background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
			color: #fff;
		}

		&:active {
			transform: scale(0.95);
		}
	}

	/* 表单行 */
	.form-row {
		display: flex;
		gap: 20rpx;

		.form-item {
			flex: 1;
		}
	}

	/* 价格输入框样式 */
	.price-input-wrapper {
		display: flex;
		align-items: center;
		background: #fff;
		border: 2rpx solid #e9ecef;
		border-radius: 8rpx;
		height: 80rpx;

		.price-symbol {
			font-size: 28rpx;
			color: #333;
			font-weight: 600;
			padding: 0 15rpx;
		}

		.price-input {
			flex: 1;
			border: none;
			background: transparent;
			height: 80rpx;
			padding: 0 10rpx;
			font-size: 28rpx;
			color: #333;
		}
	}

	/* 房间数输入框样式 */
	.rooms-input {
		width: 100%;
		height: 80rpx;
		padding: 0 20rpx;
		border: 2rpx solid #e9ecef;
		border-radius: 8rpx;
		font-size: 28rpx;
		color: #333;
		background: #fff;
		box-sizing: border-box;
	}

	/* 面积输入框样式 */
	.area-input-wrapper {
		display: flex;
		align-items: center;
		background: #fff;
		border: 2rpx solid #e9ecef;
		border-radius: 8rpx;
		height: 80rpx;

		.area-input {
			flex: 1;
			border: none;
			background: transparent;
			height: 80rpx;
			padding: 0 10rpx;
			font-size: 28rpx;
			color: #333;
		}

		.area-unit {
			font-size: 24rpx;
			color: #999;
			padding: 0 15rpx;
		}
	}

	/* 错误提示样式 */
	.error-tip {
		font-size: 24rpx;
		color: #ff4d4f;
		margin-top: 10rpx;
		line-height: 1.4;
	}




	/* 底部按钮 */
	.form-footer {
		position: fixed;
		bottom: 0;
		left: 0;
		right: 0;
		background: #fff;
		padding: 20rpx 30rpx;
		border-top: 1rpx solid #eee;
		box-shadow: 0 -4rpx 20rpx rgba(0, 0, 0, 0.1);
		z-index: 9999;

		.button-group {
			display: flex;
			gap: 20rpx;

			button {
				flex: 1;
				height: 80rpx;
				border-radius: 40rpx;
				font-size: 28rpx;
				font-weight: 500;
				border: none;
				display: flex;
				align-items: center;
				justify-content: center;
				transition: all 0.3s ease;

				&:active {
					transform: scale(0.98);
				}
			}

			.btn-reset {
				background: #f8f9fa;
				color: #666;
				border: 2rpx solid #e9ecef;

				&:active {
					background: #e9ecef;
				}
			}

			.btn-submit {
				background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
				color: #fff;

				&:disabled {
					opacity: 0.6;
				}

				&.btn-loading {
					opacity: 0.8;
				}
			}
		}
	}
	
	
	/* 省市区选择器样式 */
	.region-selector {
		.region-row {
			display: flex;
			flex-direction: row;
			gap: 16rpx;
			align-items: flex-start;
		}
		
		.region-item {
			flex: 1;
			min-width: 0;
			
			.region-picker {
				.picker-display {
					display: flex;
					align-items: center;
					justify-content: center;
					background: #fff;
					border: 2rpx solid #e9ecef;
					border-radius: 8rpx;
					padding: 16rpx 12rpx;
					font-size: 26rpx;
					color: #333;
					transition: all 0.3s ease;
					height: 45rpx;
					text-align: center;
					
					&.disabled {
						background: #f5f5f5;
						color: #999;
						border-color: #ddd;
					}
					
					&:not(.disabled):active {
						background: #e9ecef;
						border-color: #667eea;
					}
				}
			}
		}
	}
	
	/* 详细地址容器样式 */
	.detail-address-container {
		margin-top: 20rpx;
	}
	
	/* 详细地址输入框样式 */
	.detail-address-input {
		width: 100%;
		background: #fff;
		border: 2rpx solid #e9ecef;
		border-radius: 8rpx;
		padding: 20rpx 24rpx;
		font-size: 28rpx;
		color: #333;
		transition: all 0.3s ease;
		box-sizing: border-box;
		
		&:focus {
			border-color: #667eea;
			background: #fff;
			box-shadow: 0 0 0 4rpx rgba(102, 126, 234, 0.1);
		}
		
		&.disabled-input {
			background: #f5f5f5;
			color: #999;
			cursor: not-allowed;
		}
	}
	
	
</style>
