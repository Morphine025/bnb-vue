<template>
	<view class="form-item">
		<view class="form-label">
			{{ label }}
			<text v-if="required" class="required">*</text>
		</view>
		<textarea 
			:value="modelValue"
			:placeholder="placeholder"
			:maxlength="maxlength"
			:disabled="disabled"
			class="form-textarea"
			:class="{ 
				'error-input': error,
				'disabled-input': disabled 
			}"
			@input="handleInput"
			@blur="handleBlur"
			@focus="handleFocus"
		></textarea>
		<view v-if="showCharCount && maxlength" class="char-count">
			{{ modelValue?.length || 0 }}/{{ maxlength }}
		</view>
		<view v-if="error" class="error-tip">{{ error }}</view>
	</view>
</template>

<script setup>
/**
 * 表单文本域组件
 * 功能描述：统一的多行文本输入框，支持验证、字符计数、错误提示
 * 主要功能：多行文本输入、字符计数、错误提示、必填标识
 */

import { computed } from 'vue'

// ==================== Props ====================
const props = defineProps({
	/**
	 * 文本域值（v-model）
	 */
	modelValue: {
		type: String,
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
		default: true
	},
	/**
	 * 最小高度
	 */
	minHeight: {
		type: [String, Number],
		default: 200
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

	.form-textarea {
		width: 100%;
		min-height: v-bind(minHeight + 'rpx');
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

		&.error-input {
			border-color: #ff4d4f !important;
			background: #fff2f0 !important;
		}

		&.disabled-input {
			background: #f5f5f5;
			color: #999;
			cursor: not-allowed;
		}
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
