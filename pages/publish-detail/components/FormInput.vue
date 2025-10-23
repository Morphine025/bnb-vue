<template>
	<view class="form-item">
		<view class="form-label">
			{{ label }}
			<text v-if="required" class="required">*</text>
		</view>
		<input 
			:value="modelValue"
			:placeholder="placeholder"
			:type="type"
			:maxlength="maxlength"
			:disabled="disabled"
			class="form-input"
			:class="{ 
				'error-input': error,
				'disabled-input': disabled 
			}"
			@input="handleInput"
			@blur="handleBlur"
			@focus="handleFocus"
		/>
		<view v-if="showCharCount && maxlength" class="char-count">
			{{ modelValue?.length || 0 }}/{{ maxlength }}
		</view>
		<view v-if="error" class="error-tip">{{ error }}</view>
	</view>
</template>

<script setup>
/**
 * 基础表单输入框组件
 * 
 * 功能描述：
 * - 提供统一的表单输入框样式和行为
 * - 支持实时验证和错误提示
 * - 支持字符计数和必填标识
 * - 兼容微信小程序和H5环境
 * 
 * 使用场景：
 * - 民宿标题输入
 * - 联系方式输入
 * - 微信号输入
 * - 其他文本输入场景
 * 
 * 主要功能：
 * - 输入验证：实时验证用户输入
 * - 字符计数：显示当前字符数和最大限制
 * - 错误提示：显示验证错误信息
 * - 必填标识：显示必填字段的红色星号
 */

import { computed } from 'vue'

// ==================== Props ====================
const props = defineProps({
	/**
	 * 输入框值（v-model）
	 */
	modelValue: {
		type: [String, Number],
		default: ''
	},
	/**
	 * 标签文本
	 */
	label: {
		type: String,
		required: true
	},
	/**
	 * 占位符文本
	 */
	placeholder: {
		type: String,
		default: ''
	},
	/**
	 * 输入框类型
	 */
	type: {
		type: String,
		default: 'text'
	},
	/**
	 * 最大字符长度
	 */
	maxlength: {
		type: [String, Number],
		default: null
	},
	/**
	 * 是否必填
	 */
	required: {
		type: Boolean,
		default: false
	},
	/**
	 * 是否禁用
	 */
	disabled: {
		type: Boolean,
		default: false
	},
	/**
	 * 错误信息
	 */
	error: {
		type: String,
		default: ''
	},
	/**
	 * 是否显示字符计数
	 */
	showCharCount: {
		type: Boolean,
		default: false
	}
})

// ==================== Emits ====================
const emit = defineEmits(['update:modelValue', 'input', 'blur', 'focus'])

// ==================== 方法 ====================
/**
 * 处理输入事件
 * @param {Event} e - 输入事件
 */
const handleInput = (e) => {
	const value = e.detail ? e.detail.value : e.target.value
	emit('update:modelValue', value)
	emit('input', value)
}

/**
 * 处理失焦事件
 * @param {Event} e - 失焦事件
 */
const handleBlur = (e) => {
	emit('blur', e)
}

/**
 * 处理聚焦事件
 * @param {Event} e - 聚焦事件
 */
const handleFocus = (e) => {
	emit('focus', e)
}
</script>

<style lang="scss" scoped>
/* 表单项目样式 */
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
		border-radius: 8rpx;
		font-size: 28rpx;
		color: #333;
		background: #fff;
		box-sizing: border-box;
	}

	.char-count {
		text-align: right;
		font-size: 24rpx;
		color: #999;
		margin-top: 10rpx;
	}

	.error-tip {
		font-size: 24rpx;
		color: #ff4d4f;
		margin-top: 10rpx;
		line-height: 1.4;
	}
}
</style>
