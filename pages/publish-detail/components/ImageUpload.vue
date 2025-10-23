<template>
	<view class="image-upload">
		<view class="image-list">
			<view 
				class="image-item" 
				v-for="(image, index) in modelValue" 
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
				v-if="modelValue.length < maxCount"
			>
				<up-icon name="plus" size="32" color="#999"></up-icon>
				<text class="add-text">添加图片</text>
			</view>
		</view>
		<view class="image-tip">
			最多上传{{ maxCount }}张图片，建议上传高质量照片
		</view>
	</view>
</template>

<script setup>
/**
 * 图片上传组件
 * 功能描述：支持多张图片上传，包含图片压缩、格式验证、删除功能
 * 主要功能：图片选择、压缩、上传、删除、格式验证
 */

import { ref } from 'vue'
import { API } from '@/api'
import { showLoading, hideLoading } from '@/utils'

// ==================== Props ====================
const props = defineProps({
	/**
	 * 图片列表（v-model）
	 */
	modelValue: {
		type: Array,
		default: () => []
	},
	/**
	 * 最大上传数量
	 */
	maxCount: {
		type: Number,
		default: 9
	},
	/**
	 * 是否启用压缩
	 */
	enableCompress: {
		type: Boolean,
		default: true
	},
	/**
	 * 压缩质量
	 */
	compressQuality: {
		type: Number,
		default: 80
	}
})

// ==================== Emits ====================
const emit = defineEmits(['update:modelValue', 'upload-success', 'upload-error'])

// ==================== 方法 ====================
/**
 * 验证图片格式和大小
 * @param {string} filePath - 文件路径
 * @returns {Promise<boolean>} 验证结果
 */
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

/**
 * 压缩图片
 * @param {string} filePath - 文件路径
 * @returns {Promise<string>} 压缩后的文件路径
 */
const compressImage = (filePath) => {
	return new Promise((resolve, reject) => {
		uni.compressImage({
			src: filePath,
			quality: props.compressQuality,
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

/**
 * 上传图片到服务器
 * @param {string} filePath - 文件路径
 * @returns {Promise<string>} 图片URL
 */
const uploadImageToServer = async (filePath) => {
	try {
		const imageUrl = await API.uploadImage(filePath)
		return imageUrl
	} catch (error) {
		console.error('图片上传失败:', error)
		throw new Error('图片上传失败: ' + error.message)
	}
}

/**
 * 选择图片
 */
const chooseImages = async () => {
	try {
		const result = await new Promise((resolve, reject) => {
			uni.chooseImage({
				count: props.maxCount - props.modelValue.length,
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
				
				// 压缩图片（如果启用）
				let processedPath = filePath
				if (props.enableCompress) {
					processedPath = await compressImage(filePath)
				}
				
				// 上传图片到服务器
				const imageUrl = await uploadImageToServer(processedPath)
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
			const newImages = [...props.modelValue, ...processedImages]
			emit('update:modelValue', newImages)
			emit('upload-success', processedImages)
			
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
		emit('upload-error', error)
	} finally {
		hideLoading()
	}
}

/**
 * 删除图片
 * @param {number} index - 图片索引
 */
const removeImage = (index) => {
	const newImages = [...props.modelValue]
	newImages.splice(index, 1)
	emit('update:modelValue', newImages)
}
</script>

<style lang="scss" scoped>
/* 图片上传样式 */
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
</style>
