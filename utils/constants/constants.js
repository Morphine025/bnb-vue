/**
 * 应用常量定义
 * 功能描述：统一管理应用中的常量和配置
 * 主要功能：常量定义、配置管理、枚举值
 */

// 表单验证常量
export const FORM_CONSTANTS = {
  // 昵称限制
  NICKNAME_MAX_LENGTH: 20,
  
  // 手机号限制
  PHONE_PATTERN: /^1[3-9]\d{9}$/,
  PHONE_MAX_LENGTH: 11,
  
  // 微信号限制
  WECHAT_MAX_LENGTH: 20,
  
  // 头像限制
  AVATAR_MAX_SIZE: 5 * 1024 * 1024, // 5MB
  AVATAR_ALLOWED_TYPES: ['jpg', 'jpeg', 'png', 'gif']
}

// 用户信息字段
export const USER_INFO_FIELDS = {
  NICKNAME: 'nickName',
  AVATAR: 'avatarUrl',
  PHONE: 'phone',
  WECHAT: 'wechat'
}

// 字段显示名称映射
export const FIELD_LABELS = {
  [USER_INFO_FIELDS.NICKNAME]: '昵称',
  [USER_INFO_FIELDS.AVATAR]: '头像',
  [USER_INFO_FIELDS.PHONE]: '手机号',
  [USER_INFO_FIELDS.WECHAT]: '微信号'
}

// 字段验证规则
export const FIELD_VALIDATION = {
  [USER_INFO_FIELDS.NICKNAME]: {
    required: true,
    maxLength: FORM_CONSTANTS.NICKNAME_MAX_LENGTH,
    message: {
      required: '请输入昵称',
      maxLength: `昵称不能超过${FORM_CONSTANTS.NICKNAME_MAX_LENGTH}个字符`
    }
  },
  [USER_INFO_FIELDS.PHONE]: {
    pattern: FORM_CONSTANTS.PHONE_PATTERN,
    maxLength: FORM_CONSTANTS.PHONE_MAX_LENGTH,
    message: '请输入正确的手机号'
  },
  [USER_INFO_FIELDS.WECHAT]: {
    maxLength: FORM_CONSTANTS.WECHAT_MAX_LENGTH,
    message: `微信号不能超过${FORM_CONSTANTS.WECHAT_MAX_LENGTH}个字符`
  }
}

// 防抖延迟时间
export const DEBOUNCE_DELAY = {
  SAVE: 1000,        // 保存防抖
  SEARCH: 300,       // 搜索防抖
  INPUT: 500         // 输入防抖
}

// 提示信息
export const TIPS_MESSAGES = {
  NICKNAME: '昵称最多20个字符',
  PHONE: '手机号用于接收重要通知',
  WECHAT: '微信号用于联系沟通',
  AVATAR: '建议上传清晰的头像照片'
}

// 成功消息
export const SUCCESS_MESSAGES = {
  SAVE_SUCCESS: '保存成功',
  AVATAR_UPLOAD_SUCCESS: '头像上传成功',
  PROFILE_UPDATE_SUCCESS: '个人信息更新成功'
}

// 错误消息
export const ERROR_MESSAGES = {
  NETWORK_ERROR: '网络连接失败',
  SAVE_FAILED: '保存失败',
  LOAD_FAILED: '加载失败',
  AVATAR_UPLOAD_FAILED: '头像上传失败',
  INVALID_PHONE: '请输入正确的手机号',
  INVALID_NICKNAME: '昵称格式不正确'
}

// 加载状态文本
export const LOADING_TEXT = {
  SAVING: '保存中...',
  LOADING: '加载中...',
  UPLOADING: '上传中...'
}

// 页面配置
export const PAGE_CONFIG = {
  SAVE_SUCCESS_DELAY: 1500,  // 保存成功后延迟返回时间
  TOAST_DURATION: 2000,      // 提示显示时间
  DEBOUNCE_TIMEOUT: 1000     // 防抖超时时间
}
