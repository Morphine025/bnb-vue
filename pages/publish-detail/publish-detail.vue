<template>
	<view class="publish-detail-container">
		<!-- 免责声明弹框 -->
		<view class="disclaimer-modal" v-if="showDisclaimer" @click="preventClose">
			<view class="modal-content">
				<view class="modal-header">
					<view class="modal-title">免责声明</view>
				</view>
				<view class="modal-body">
					<view class="disclaimer-text">
						您即将发布房源信息。平台仅提供信息发布服务，无法对每一条房源的权属、真实性和准确性进行核实。所有因房源信息不实或交易纠纷产生的责任，均由信息发布者自行承担。
					</view>
				</view>
				<view class="modal-footer">
					<button 
						class="confirm-btn" 
						:class="{ 'disabled': countdown > 0 }"
						:disabled="countdown > 0"
						@click="confirmDisclaimer"
					>
						{{ countdown > 0 ? `请阅读免责声明（${countdown}秒）` : '我已知晓，确认' }}
					</button>
				</view>
			</view>
		</view>


		<!-- 表单内容 -->
		<view class="form-container">
			<!-- 基本信息 -->
			<view class="form-section">
				<view class="section-title">基本信息</view>
				
				<!-- 民宿标题 -->
				<view class="form-item">
					<view class="form-label">民宿标题 <text class="required">*</text></view>
					<input 
						v-model="formData.title" 
						placeholder="请输入民宿标题"
						class="form-input"
						:class="{ 'error-input': validationErrors.title }"
						maxlength="20"
						@input="handleTitleInput"
					/>
					<view class="char-count">{{ formData.title.length }}/20</view>
					<view v-if="validationErrors.title" class="error-tip">{{ validationErrors.title }}</view>
				</view>

				<!-- 价格 -->
				<view class="form-item">
					<view class="form-label">售价 <text class="required">*</text></view>
					<view class="price-input-wrapper" :class="{ 'error-wrapper': validationErrors.price }">
						<text class="price-symbol">¥</text>
							<input 
								v-model="formData.price" 
								placeholder="请输入售价"
								class="form-input price-input"
								:class="{ 'error-input': validationErrors.price }"
								type="digit"
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
							class="form-input"
							:class="{ 'error-input': validationErrors.rooms }"
							type="digit"
							@input="handleRoomsInput"
						/>
						<view v-if="validationErrors.rooms" class="error-tip">{{ validationErrors.rooms }}</view>
					</view>
					<view class="form-item half">
						<view class="form-label">面积 <text class="required">*</text></view>
						<view class="area-input-wrapper" :class="{ 'error-wrapper': validationErrors.area }">
							<input 
								v-model="formData.area" 
								placeholder="面积" 
								class="form-input area-input"
								:class="{ 'error-input': validationErrors.area }"
								type="digit"
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
					<input 
						v-model="formData.detailAddress" 
						placeholder="请输入详细地址（如：XX街道XX号）" 
						class="form-input detail-address-input"
						:disabled="!isRegionSelected"
						:class="{ 'disabled-input': !isRegionSelected }"
						maxlength="100"
					/>
					
				</view>
				</view>
			</view>

			<!-- 详细信息 -->
			<view class="form-section">
				<view class="section-title">详细信息</view>
				
				<!-- 民宿介绍 -->
				<view class="form-item">
					<view class="form-label">民宿介绍 <text class="required">*</text></view>
					<textarea 
						v-model="formData.introduce" 
						placeholder="请详细介绍您的民宿特色、设施、周边环境等..."
						class="form-textarea"
						:class="{ 'error-input': validationErrors.introduce }"
						maxlength="500"
						@input="handleIntroduceInput"
					></textarea>
					<view class="char-count">{{ formData.introduce.length }}/500</view>
					<view v-if="validationErrors.introduce" class="error-tip">{{ validationErrors.introduce }}</view>
				</view>

				<!-- 联系方式 -->
				<view class="form-item">
					<view class="form-label">联系方式 <text class="required">*</text></view>
					<input 
						v-model="formData.contact" 
						placeholder="请输入手机号码" 
						class="form-input"
						:class="{ 'error-input': validationErrors.contact }"
						type="number"
						maxlength="11"
						@input="handleContactInput"
					/>
					<view v-if="validationErrors.contact" class="error-tip">{{ validationErrors.contact }}</view>
				</view>
				
				<!-- 微信号 -->
				<view class="form-item">
					<view class="form-label">微信号</view>
					<input 
						v-model="formData.wechat" 
						placeholder="请输入微信号（选填）" 
						class="form-input"
						:class="{ 'error-input': validationErrors.wechat }"
						maxlength="20"
						@input="handleWechatInput"
					/>
					<view v-if="validationErrors.wechat" class="error-tip">{{ validationErrors.wechat }}</view>
				</view>

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
				
				<view class="image-upload">
					<view class="image-list">
						<view 
							class="image-item" 
							v-for="(image, index) in formData.images" 
							:key="index"
						>
							<image :src="image" mode="aspectFill" class="uploaded-image"></image>
							<view class="image-delete" @click="removeImage(index)">
								<up-icon name="close" size="16" color="#fff"></up-icon>
							</view>
						</view>
						<view 
							class="image-add" 
							@click="chooseImages"
							v-if="formData.images.length < 9"
						>
							<up-icon name="plus" size="32" color="#999"></up-icon>
							<text class="add-text">添加图片</text>
						</view>
					</view>
						<view class="image-tip">
							最多上传9张图片，建议上传高质量照片
						</view>
				</view>
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
		
		<!-- 地址选择器 -->
		<AddressPicker 
			ref="addressPickerRef"
			@confirm="handleAddressConfirm"
		/>
	</view>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { API } from '@/api'
import { showLoading, hideLoading } from '@/utils'

// 响应式数据
const loading = ref(false)
const showDisclaimer = ref(true)
const countdown = ref(5)
const isDraftMode = ref(false)

// 编辑模式相关
const isEditMode = ref(false)
const homestayId = ref('')
const pageTitle = ref('发布民宿')

// 表单数据
const formData = reactive({
	title: '',
	price: '',
	rooms: '',
	area: '',
	location: '',
	province: '',
	city: '',
	district: '',
	detailAddress: '',
	latitude: null,
	longitude: null,
	introduce: '',
	contact: '',
	wechat: '',
	tags: [],
	images: []
})

// 省市区数据
const provinceList = ref([])
const cityList = ref([])
const districtList = ref([])
const provinceIndex = ref(0)
const cityIndex = ref(0)
const districtIndex = ref(0)
const selectedProvince = ref({})
const selectedCity = ref({})
const selectedDistrict = ref({})

// 特色标签选项
const availableTags = ref([])

// 地址选择器引用
const addressPickerRef = ref(null)

// 计算属性
const isRegionSelected = computed(() => {
	return formData.province && formData.city && formData.district
})

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

// 表单验证状态
const validationErrors = reactive({
	title: '',
	price: '',
	rooms: '',
	area: '',
	contact: '',
	wechat: '',
	introduce: ''
})

// 页面加载时初始化
onMounted(() => {
	// 延迟加载数据，提升页面响应速度
	setTimeout(() => {
		initRegionData()
		loadTagData()
		
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

// 初始化省市区数据
const initRegionData = async () => {
	try {
		const result = await API.region.getProvinces()
		if (result.code === 1) {
			provinceList.value = result.data
		} else {
			uni.showToast({
				title: '获取省份数据失败',
				icon: 'none'
			})
		}
	} catch (error) {
		console.error('获取省份数据失败:', error)
		uni.showToast({
			title: '网络错误，请重试',
			icon: 'none'
		})
	}
}

// 加载标签数据
const loadTagData = async () => {
	try {
		const result = await API.region.getTagList()
		if (result.code === 1) {
			// 将后端返回的标签数据转换为前端需要的格式
			// label用于显示，value用于提交（tag_id）
			availableTags.value = result.data.map(tag => ({
				label: tag.tagName,
				value: tag.tagId
			}))
		} else {
			uni.showToast({
				title: '获取标签数据失败',
				icon: 'none'
			})
		}
	} catch (error) {
		console.error('获取标签数据失败:', error)
		uni.showToast({
			title: '网络错误，请重试',
			icon: 'none'
		})
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

// 开始倒计时
const startCountdown = () => {
	const timer = setInterval(() => {
		countdown.value--
		if (countdown.value <= 0) {
			clearInterval(timer)
		}
	}, 1000)
}

// 防止弹框关闭
const preventClose = (e) => {
	e.stopPropagation()
}

// 确认免责声明
const confirmDisclaimer = () => {
	if (countdown.value > 0) return
	showDisclaimer.value = false
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
		startCountdown()
	} else {
		// 默认模式（可能是从草稿进入），显示免责声明，加载草稿
		isEditMode.value = false
		pageTitle.value = '发布民宿'
		showDisclaimer.value = true
		startCountdown()
	}
}

// 加载民宿数据用于编辑
const loadHomestayData = async (id) => {
	try {
		showLoading({
			title: '加载中...'
		})
		
		const result = await API.homestay.getDetail(id)
		if (result && result.code === 1) {
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
			throw new Error(result?.msg || '加载民宿数据失败')
		}
	} catch (error) {
		console.error('加载民宿数据失败:', error)
		uni.showToast({
			title: error.message || '加载失败，请重试',
			icon: 'none'
		})
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

// 实时验证函数
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

const validatePrice = (value) => {
	const price = parseFloat(value)
	if (!value) {
		setFieldError('price', '价格不能为空')
		return false
	} else if (isNaN(price) || price <= 0) {
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
	const rooms = parseInt(value)
	if (!value) {
		setFieldError('rooms', '房间数不能为空')
		return false
	} else if (isNaN(rooms) || rooms <= 0) {
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
	const area = parseFloat(value)
	if (!value) {
		setFieldError('area', '面积不能为空')
		return false
	} else if (isNaN(area) || area <= 0) {
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
const handleTitleInput = (e) => {
	formData.title = e.detail.value
	debouncedValidateTitle(e.detail.value)
}

// 处理价格输入
const handlePriceInput = (e) => {
	formData.price = e.detail.value
	debouncedValidatePrice(e.detail.value)
}

// 处理房间数输入
const handleRoomsInput = (e) => {
	formData.rooms = e.detail.value
	debouncedValidateRooms(e.detail.value)
}

// 处理面积输入
const handleAreaInput = (e) => {
	formData.area = e.detail.value
	debouncedValidateArea(e.detail.value)
}

// 处理介绍输入
const handleIntroduceInput = (e) => {
	formData.introduce = e.detail.value
	validateIntroduce(e.detail.value)
}

// 处理联系方式输入
const handleContactInput = (e) => {
	formData.contact = e.detail.value
	validateContact(e.detail.value)
}

// 处理微信号输入
const handleWechatInput = (e) => {
	formData.wechat = e.detail.value
	validateWechat(e.detail.value)
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

// 加载城市数据
const loadCityData = async (provinceCode) => {
	try {
		const result = await API.region.getCitiesByProvince(provinceCode)
		if (result.code === 1) {
			cityList.value = result.data
		} else {
			uni.showToast({
				title: '获取城市数据失败',
				icon: 'none'
			})
		}
	} catch (error) {
		console.error('获取城市数据失败:', error)
		uni.showToast({
			title: '网络错误，请重试',
			icon: 'none'
		})
	}
}

// 加载区县数据
const loadDistrictData = async (cityCode) => {
	try {
		const result = await API.region.getDistrictsByCity(cityCode)
		if (result.code === 1) {
			districtList.value = result.data
		} else {
			uni.showToast({
				title: '获取区县数据失败',
				icon: 'none'
			})
		}
	} catch (error) {
		console.error('获取区县数据失败:', error)
		uni.showToast({
			title: '网络错误，请重试',
			icon: 'none'
		})
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

// 上传图片到服务器
const uploadImageToServer = async (filePath) => {
	try {
		const imageUrl = await API.uploadImage(filePath)
		console.log('图片上传成功:', imageUrl)
		return imageUrl
	} catch (error) {
		console.error('图片上传失败:', error)
		throw new Error('图片上传失败: ' + error.message)
	}
}

// 图片压缩函数
const compressImage = (filePath) => {
	return new Promise((resolve, reject) => {
		uni.compressImage({
			src: filePath,
			quality: 80, // 压缩质量 0-100
			success: (res) => {
				resolve(res.tempFilePath)
			},
			fail: (error) => {
				console.error('图片压缩失败:', error)
				reject(error)
			}
		})
	})
}

// 验证图片格式和大小
const validateImage = (filePath) => {
	return new Promise((resolve, reject) => {
		uni.getFileInfo({
			filePath: filePath,
			success: (res) => {
				// 检查文件大小 (5MB = 5 * 1024 * 1024 bytes)
				const maxSize = 5 * 1024 * 1024
				if (res.size > maxSize) {
					reject(new Error('图片大小不能超过5MB'))
					return
				}
				
				// 检查文件扩展名
				const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp']
				const extension = filePath.toLowerCase().substring(filePath.lastIndexOf('.'))
				if (!allowedExtensions.includes(extension)) {
					reject(new Error('只支持jpg、png、webp格式的图片'))
					return
				}
				
				resolve(true)
			},
			fail: (error) => {
				reject(new Error('获取图片信息失败'))
			}
		})
	})
}

// 选择图片
const chooseImages = async () => {
	try {
		const result = await new Promise((resolve, reject) => {
			uni.chooseImage({
				count: 9 - formData.images.length,
				sizeType: ['original'], // 先选择原图
				sourceType: ['album', 'camera'],
				success: resolve,
				fail: reject
			})
		})
		
		// 显示加载提示
		showLoading({
			title: '处理图片中...'
		})
		
		const processedImages = []
		
		// 逐个处理图片
		for (const filePath of result.tempFilePaths) {
			try {
				// 验证图片格式和大小
				await validateImage(filePath)
				
				// 压缩图片
				const compressedPath = await compressImage(filePath)
				
				// 上传图片到服务器
				const imageUrl = await uploadImageToServer(compressedPath)
				processedImages.push(imageUrl)
			} catch (error) {
				console.error('处理图片失败:', error)
				uni.showToast({
					title: error.message || '图片处理失败',
					icon: 'none'
				})
				// 如果某个图片处理失败，继续处理其他图片
				continue
			}
		}
		
		// 添加处理成功的图片
		if (processedImages.length > 0) {
			formData.images.push(...processedImages)
			uni.showToast({
				title: `成功添加${processedImages.length}张图片`,
				icon: 'success'
			})
		}
		
	} catch (error) {
		console.error('选择图片失败:', error)
		uni.showToast({
			title: error.message || '选择图片失败',
			icon: 'none'
		})
	} finally {
		hideLoading()
	}
}

// 删除图片
const removeImage = (index) => {
	formData.images.splice(index, 1)
}

// 地址确认
const handleAddressConfirm = (address) => {
	formData.detailAddress = address
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
		
		if (result.code === 1) {
			// 清除草稿
			uni.removeStorageSync('homestay_draft')
			
			uni.showToast({
				title: isEditMode.value ? '更新成功' : '发布成功',
				icon: 'success'
			})
			
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
		} else {
			throw new Error(result.msg || (isEditMode.value ? '更新失败' : '发布失败'))
		}
		
	} catch (error) {
		console.error('发布失败:', error)
		uni.showToast({
			title: error.message || '发布失败，请重试',
			icon: 'none'
		})
	} finally {
		loading.value = false
	}
}
</script>

<style lang="scss" scoped>
	/* 免责声明弹框样式 */
	.disclaimer-modal {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: rgba(0, 0, 0, 0.6);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 9999;
		
		.modal-content {
			background: #fff;
			border-radius: 20rpx;
			margin: 40rpx;
			max-width: 600rpx;
			width: 100%;
			box-shadow: 0 20rpx 60rpx rgba(0, 0, 0, 0.3);
			
			.modal-header {
				padding: 40rpx 40rpx 20rpx;
				text-align: center;
				border-bottom: 1rpx solid #f0f0f0;
				
				.modal-title {
					font-size: 36rpx;
					font-weight: 600;
					color: #333;
				}
			}
			
			.modal-body {
				padding: 30rpx 40rpx;
				
				.disclaimer-text {
					font-size: 28rpx;
					line-height: 1.6;
					color: #666;
					text-align: justify;
				}
			}
			
			.modal-footer {
				padding: 20rpx 40rpx 40rpx;
				text-align: center;
				
				.confirm-btn {
					width: 100%;
					height: 80rpx;
					background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
					color: #fff;
					border: none;
					border-radius: 40rpx;
					font-size: 28rpx;
					font-weight: 600;
					transition: all 0.3s ease;
					
					&.disabled {
						background: #ccc;
						color: #999;
						cursor: not-allowed;
					}
					
					&:not(.disabled):active {
						transform: scale(0.95);
					}
				}
			}
		}
	}

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

	/* 表单项目 */
	.form-item {
		margin-bottom: 30rpx;

		&:last-child {
			margin-bottom: 0;
		}

		.form-label {
			font-size: 28rpx;
			color: #333;
			margin-bottom: 15rpx;
			font-weight: 500;

			.required {
				color: #ff4757;
				margin-left: 5rpx;
			}
		}

		.form-input {
			width: 100%;
			height: 80rpx;
			padding: 0 20rpx;
			border: 2rpx solid #e9ecef;
			border-radius: 12rpx;
			font-size: 28rpx;
			color: #333;
			background: #f8f9fa;
			transition: all 0.3s ease;
			box-sizing: border-box;

			&:focus {
				border-color: #667eea;
				background: #fff;
			}
		}

		.form-textarea {
			width: 100%;
			min-height: 200rpx;
			padding: 20rpx;
			border: 2rpx solid #e9ecef;
			border-radius: 12rpx;
			font-size: 28rpx;
			color: #333;
			background: #f8f9fa;
			transition: all 0.3s ease;
			resize: none;
			box-sizing: border-box;

			&:focus {
				border-color: #667eea;
				background: #fff;
			}
		}

		.char-count {
			text-align: right;
			font-size: 24rpx;
			color: #999;
			margin-top: 10rpx;
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

	/* 价格输入 */
	.price-input-wrapper {
		display: flex;
		align-items: center;
		background: #f8f9fa;
		border: 2rpx solid #e9ecef;
		border-radius: 12rpx;
		transition: all 0.3s ease;

		&:focus-within {
			border-color: #667eea;
			background: #fff;
		}

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

			&:focus {
				background: transparent;
			}
		}

		.price-unit {
			font-size: 24rpx;
			color: #999;
			padding: 0 15rpx;
		}
	}

	/* 面积输入 */
	.area-input-wrapper {
		display: flex;
		align-items: center;
		background: #f8f9fa;
		border: 2rpx solid #e9ecef;
		border-radius: 12rpx;
		transition: all 0.3s ease;

		&:focus-within {
			border-color: #667eea;
			background: #fff;
		}

		.area-input {
			flex: 1;
			border: none;
			background: transparent;
			height: 80rpx;
			padding: 0 20rpx;

			&:focus {
				background: transparent;
			}
		}

		.area-unit {
			font-size: 24rpx;
			color: #999;
			padding: 0 15rpx;
		}
	}

	/* 地址选择器 */
	.address-selector {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 24rpx;
		background: #fff;
		border: 2rpx solid #e0e0e0;
		border-radius: 12rpx;
		transition: all 0.3s ease;
		cursor: pointer;

		&:active {
			border-color: #667eea;
			box-shadow: 0 0 0 4rpx rgba(102, 126, 234, 0.1);
		}

		.address-display {
			flex: 1;
			
			.address-text {
				font-size: 28rpx;
				color: #333;
				line-height: 1.4;
			}
			
			.address-placeholder {
				font-size: 28rpx;
				color: #999;
			}
		}
	}

	/* 图片上传 */
	.image-upload {
		.image-list {
			display: flex;
			flex-wrap: wrap;
			gap: 20rpx;
		}

		.image-item {
			position: relative;
			width: 200rpx;
			height: 200rpx;
			border-radius: 12rpx;
			overflow: hidden;

			.uploaded-image {
				width: 100%;
				height: 100%;
			}

			.image-delete {
				position: absolute;
				top: 10rpx;
				right: 10rpx;
				width: 40rpx;
				height: 40rpx;
				background: rgba(0, 0, 0, 0.6);
				border-radius: 50%;
				display: flex;
				align-items: center;
				justify-content: center;
			}
		}

		.image-add {
			width: 200rpx;
			height: 200rpx;
			border: 2rpx dashed #ccc;
			border-radius: 12rpx;
			display: flex;
			flex-direction: column;
			align-items: center;
			justify-content: center;
			background: #f8f9fa;
			transition: all 0.3s ease;

			&:active {
				background: #e9ecef;
			}

			.add-text {
				font-size: 24rpx;
				color: #999;
				margin-top: 10rpx;
			}
		}

		.image-tip {
			font-size: 24rpx;
			color: #999;
			margin-top: 20rpx;
			text-align: center;
		}
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
	
	/* 省市区选择器样式 - 横向排列 */
	.location-selector-horizontal {
		display: flex;
		flex-direction: row;
		gap: 16rpx;
		margin-top: 20rpx;
		align-items: center;
	}
	
	.selector-item-horizontal {
		flex: 1;
		min-width: 0;
	}
	
	.picker-display-horizontal {
		display: flex;
		align-items: center;
		justify-content: space-between;
		background: #f8f9fa;
		border: 2rpx solid #e9ecef;
		border-radius: 8rpx;
		padding: 16rpx 20rpx;
		transition: all 0.3s ease;
		height: 45rpx;
		
		&:active {
			background: #e9ecef;
			border-color: #667eea;
		}
	}
	
	.picker-text {
		font-size: 26rpx;
		color: #333;
		font-weight: 500;
		flex: 1;
		text-align: center;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	
	.picker-placeholder {
		font-size: 26rpx;
		color: #999;
		flex: 1;
		text-align: center;
	}
	
	/* 省市区选择器样式 */
	.region-selector {
		// margin-top: 20rpx;
		// background: #f8f9fa;
		// border: 2rpx solid #e9ecef;
		// border-radius: 12rpx;
		// padding: 20rpx;
		
		.region-row {
			display: flex;
			flex-direction: row;
			gap: 16rpx;
			align-items: flex-start;
		}
		
		.region-item {
			flex: 1;
			min-width: 0;
			
			.region-label {
				font-size: 24rpx;
				color: #666;
				margin-bottom: 8rpx;
				text-align: center;
				font-weight: 500;
			}
			
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
	
	/* 区域提示样式 */
	.region-tip {
		font-size: 24rpx;
		color: #ff4d4f;
		margin-top: 10rpx;
		text-align: center;
	}
	
	/* 错误输入框样式 */
	.error-input {
		border-color: #ff4d4f !important;
		background: #fff2f0 !important;
	}
	
	.error-wrapper {
		border-color: #ff4d4f !important;
		background: #fff2f0 !important;
	}
	
	/* 错误提示样式 */
	.error-tip {
		font-size: 24rpx;
		color: #ff4d4f;
		margin-top: 10rpx;
		line-height: 1.4;
	}
</style>
