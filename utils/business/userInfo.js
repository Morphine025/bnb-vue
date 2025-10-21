/**
 * 用户信息管理工具
 * 提供统一的用户信息刷新和更新功能
 */

// 导入API接口 - 使用新的统一API
import { API } from '../../api'

/**
 * 刷新用户信息
 * 从后端获取最新的用户信息并更新本地存储
 */
export const refreshUserInfo = async () => {
	try {
		const userInfoResponse = await API.user.getInfo()
		console.log('refreshUserInfo 响应:', userInfoResponse)
		
		// 从响应中正确获取用户信息 (数据在data字段中)
		const { userId, avatarUrl, nickName, stats } = userInfoResponse.data || userInfoResponse
		console.log('refreshUserInfo 解析数据:', { userId, avatarUrl, nickName, stats })
		
		// 检查数据是否有效
		if (!avatarUrl && !nickName) {
			console.warn('⚠️ 用户信息为空，可能是接口返回数据格式不正确')
			throw new Error('用户信息为空')
		}
		
		// 更新本地存储
		const userData = {
			userId,
			avatarUrl,
			nickName,
			stats
		}
		uni.setStorageSync('userInfo', JSON.stringify(userData))
		console.log('用户信息已保存到本地存储:', userData)
		
		return userData
	} catch (error) {
		console.error('刷新用户信息失败:', error)
		throw error
	}
}

/**
 * 获取本地用户信息
 * 如果本地没有信息，则从后端获取
 */
export const getLocalUserInfo = async () => {
	const localUserInfo = uni.getStorageSync('userInfo')
	if (localUserInfo) {
		return JSON.parse(localUserInfo)
	}
	
	// 本地没有信息，从后端获取
	return await refreshUserInfo()
}

/**
 * 更新用户信息到本地存储
 * @param {Object} userInfo - 用户信息对象
 */
export const updateLocalUserInfo = (userInfo) => {
	uni.setStorageSync('userInfo', JSON.stringify(userInfo))
}
