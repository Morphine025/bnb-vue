/**
 * 用户信息管理Store（简化版）
 * 功能描述：专注于用户信息相关的特定功能，避免与主user store重复
 * 主要功能：用户资料编辑、头像上传、信息验证等
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { API } from '../../../api'
import { useLoadingStore } from '../loading'
import { validate, validateApiResponse, sanitizeInput } from '../../../utils/security/dataValidator'

export const useUserProfileStore = defineStore('userProfile', () => {
  // 使用统一的loading管理
  const loadingStore = useLoadingStore()
  // 验证功能已合并到工具函数中
  
  // 用户资料编辑状态
  const isEditing = ref(false)
  const editForm = ref({
    nickname: '',
    avatar: '',
    bio: '',
    location: ''
  })
  
  // 头像上传状态
  const isUploadingAvatar = computed(() => loadingStore.isLoading('upload-avatar'))
  
  // 资料验证状态
  const validationErrors = ref({})
  
  // 用户输入验证规则
  const inputValidationRules = {
    nickname: { required: true, type: 'string', maxLength: 20, minLength: 1 },
    avatar: { type: 'string', pattern: /^https?:\/\/.+/ },
    bio: { type: 'string', maxLength: 200 },
    location: { type: 'string', maxLength: 50 }
  }
  
  // 验证用户输入
  const validateInput = (field, value) => {
    try {
      const rule = inputValidationRules[field]
      if (!rule) return { isValid: true, error: null }
      
      const result = validate({ [field]: value }, { [field]: rule })
      if (result.isValid) {
        return { isValid: true, error: null }
      } else {
        return { isValid: false, error: result.errors[0] }
      }
    } catch (error) {
      return { isValid: false, error: error.message }
    }
  }
  
  // 验证整个表单
  const validateForm = (formData) => {
    const errors = {}
    let isValid = true
    
    for (const [field, value] of Object.entries(formData)) {
      const result = validateInput(field, value)
      if (!result.isValid) {
        errors[field] = result.error
        isValid = false
      }
    }
    
    validationErrors.value = errors
    return { isValid, errors }
  }
  
  // Actions
  const setEditing = (editing) => {
    isEditing.value = editing
  }
  
  const setEditForm = (form) => {
    editForm.value = { ...editForm.value, ...form }
  }
  
  const clearEditForm = () => {
    editForm.value = {
      nickname: '',
      avatar: '',
      bio: '',
      location: ''
    }
    validationErrors.value = {}
  }

  // 验证用户资料
  const validateProfile = (form) => {
    const errors = {}
    
    if (!form.nickname || form.nickname.trim().length < 2) {
      errors.nickname = '昵称至少需要2个字符'
    }
    
    if (form.bio && form.bio.length > 200) {
      errors.bio = '个人简介不能超过200个字符'
    }
    
    validationErrors.value = errors
    return Object.keys(errors).length === 0
  }
  
  // 上传头像
  const uploadAvatar = async (filePath) => {
    loadingStore.setLoading('upload-avatar', true)
    try {
      const response = await API.user.uploadAvatar(filePath)
      if (response && response.data) {
        setEditForm({ avatar: response.data.url })
        return response.data
      } else {
        throw new Error('头像上传失败')
      }
    } catch (error) {
      console.error('头像上传失败:', error)
      throw error
    } finally {
      loadingStore.setLoading('upload-avatar', false)
    }
  }
  
  // 保存用户资料
  const saveProfile = async () => {
    // 验证表单数据
    const validationResult = validateForm(editForm.value)
    if (!validationResult.isValid) {
      console.error('表单验证失败:', validationResult.errors)
      return false
    }
    
    loadingStore.setLoading('save-profile', true)
    try {
      // 验证并清洗数据
      const sanitizedData = sanitizeInput(editForm.value)
      
      const response = await API.user.updateProfile(sanitizedData)
      // 验证API响应
      const apiValidationResult = validateApiResponse(response)
      
      if (apiValidationResult.isValid) {
        // 清除编辑状态
        setEditing(false)
        clearEditForm()
        console.log('✅ 用户资料保存并验证成功')
        return apiValidationResult.data
      } else {
        throw new Error('保存资料失败')
      }
    } catch (error) {
      console.error('保存资料失败:', error)
      throw error
    } finally {
      loadingStore.setLoading('save-profile', false)
    }
  }
  
  // 取消编辑
  const cancelEdit = () => {
    setEditing(false)
    clearEditForm()
  }
  
  // 开始编辑
  const startEdit = (userInfo) => {
    setEditing(true)
    setEditForm({
      nickname: userInfo.nickname || '',
      avatar: userInfo.avatar || '',
      bio: userInfo.bio || '',
      location: userInfo.location || ''
    })
  }

  return {
    // State
    isEditing,
    editForm,
    validationErrors,
    inputValidationRules,
    
    // Computed
    isUploadingAvatar,
    
    // Actions
    setEditing,
    setEditForm,
    clearEditForm,
    validateProfile,
    validateInput,
    validateForm,
    uploadAvatar,
    saveProfile,
    cancelEdit,
    startEdit
  }
})

