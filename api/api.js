/**
 * @deprecated 此文件为兼容性文件，建议使用模块化API
 * 
 * 迁移指南：
 * 1. 新代码请使用：import { API } from '@/api'
 * 2. 将 getBanner() 改为 API.homestay.getBanner()
 * 3. 将 getUserInfo() 改为 API.user.getInfo()
 * 4. 详细迁移步骤请查看：./MIGRATION_GUIDE.md
 * 
 * 推荐使用方式：
 * import { API } from '@/api'
 * const banner = await API.homestay.getBanner()
 * const user = await API.user.getInfo()
 */

import http from "./http";

/**
 * 获取首页轮播图
 * 功能描述：获取首页展示的轮播图列表
 * 入参：无
 * 返回参数：轮播图列表
 * url地址：/banner/list
 * 请求方式：GET
 * @deprecated 请使用 API.homestay.getBanner()
 */
export const getBanner = () => {
	return http('/banner/list')
}

/**
 * 获取首页瀑布流数据
 * 功能描述：获取首页瀑布流展示的民宿列表
 * 入参：{ page: number, size: number }
 * 返回参数：民宿列表
 * url地址：/homestay/homeList
 * 请求方式：GET
 */
export const getFallList = (params = {}) => {
	return http('/homestay/homeList', params)
}

/**
 * 用户登录
 * 功能描述：用户微信登录，获取访问令牌
 * 入参：{ code: string, avatarUrl: string, nickName: string }
 * 返回参数：访问令牌
 * url地址：/auth/login
 * 请求方式：POST
 */
export const login = (code, avatarUrl, nickName) => {
	return http('/auth/login', {
		code,
		avatarUrl,
		nickName
	}, 'POST')
}

/**
 * 获取用户信息
 * 功能描述：根据token获取用户基本信息
 * 入参：无
 * 返回参数：用户信息
 * url地址：/user/info
 * 请求方式：GET
 */
export const getUserInfo = () => {
	return http('/user/info')
}

/**
 * 根据用户ID获取用户信息
 * 功能描述：根据用户ID获取指定用户的基本信息
 * 入参：{ userId: string (UUID格式) }
 * 返回参数：用户基本信息
 * url地址：/auth/user/info/{userId}
 * 请求方式：GET
 */
export const getUserInfoById = (userId) => {
	return http(`/auth/user/info/${userId}`)
}

/**
 * 获取民宿详情
 * 功能描述：获取指定民宿的详细信息
 * 入参：homestayId (民宿ID - UUID格式)
 * 返回参数：民宿详情信息
 * url地址：/homestay/detail/{homestayId}
 * 请求方式：GET
 */
export const getHomestayDetail = (homestayId) => {
	return http(`/homestay/detail/${homestayId}`)
}

/**
 * 获取详情页推荐项目
 * 功能描述：获取详情页推荐的项目列表
 * 入参：无
 * 返回参数：推荐项目列表
 * url地址：/detail/project
 * 请求方式：GET
 */
export const detailProject = () => {
	return http('/detail/project')
}

/**
 * 获取关注用户列表
 * 功能描述：获取当前用户关注的用户列表
 * 入参：{ page: number, size: number }
 * 返回参数：关注用户列表
 * url地址：/follow/list
 * 请求方式：GET
 */
export const getFollowList = (params = {}) => {
	return http('/follow/list', params)
}

/**
 * 关注/取消关注用户
 * 功能描述：关注或取消关注指定用户
 * 入参：{ userId: string (UUID格式), action: 'follow' | 'unfollow' }
 * 返回参数：操作结果
 * url地址：/follow/toggle
 * 请求方式：POST
 */
export const toggleFollow = (userId, action) => {
	return http('/follow/toggle', {
		userId,
		action
	}, 'POST')
}

/**
 * 获取关注用户的动态
 * 功能描述：获取关注用户的最新动态内容
 * 入参：无
 * 返回参数：关注用户动态列表
 * url地址：/follow/feed
 * 请求方式：GET
 */
export const getFollowFeed = () => {
	return http('/follow/feed')
}

/**
 * 获取关注用户发布的民宿列表
 * 功能描述：获取当前用户关注的用户发布的所有民宿信息
 * 入参：{ page: number, size: number }
 * 返回参数：关注用户发布的民宿列表
 * url地址：/homestay/followList
 * 请求方式：GET
 */
export const getFollowHomestayList = (params = {}) => {
	return http('/homestay/followList', params)
}

/**
 * 获取粉丝列表
 * 功能描述：获取当前用户的粉丝列表
 * 入参：{ page: number, size: number }
 * 返回参数：粉丝列表数据
 * url地址：/follow/fans
 * 请求方式：GET
 */
export const getFansList = (params = {}) => {
	return http('/follow/fans', params)
}

/**
 * 移除粉丝
 * 功能描述：移除指定的粉丝用户
 * 入参：{ userId: string (UUID格式) }
 * 返回参数：操作结果
 * url地址：/follow/remove-fan
 * 请求方式：POST
 */
export const removeFan = (userId) => {
    // 后端FollowDTO：放在JSON Body中
    return http('/follow/remove-fan', { userId, action: 'unfollow' }, 'POST')
}

/**
 * 检查关注状态
 * 功能描述：检查当前用户是否关注了指定用户
 * 入参：{ userId: string (UUID格式) }
 * 返回参数：{ isFollowing: boolean }
 * url地址：/follow/check
 * 请求方式：GET
 */
export const checkFollowStatus = (userId) => {
	return http('/follow/check', {
		userId: userId
	})
}

/**
 * 获取用户统计数据
 * 功能描述：获取当前用户的统计数据（粉丝数、关注数等）
 * 入参：无
 * 返回参数：用户统计数据
 * url地址：/user/stats
 * 请求方式：GET
 */
export const getUserStats = () => {
	return http('/user/stats')
}

/**
 * 点赞/取消点赞民宿
 * 功能描述：对指定民宿进行点赞或取消点赞操作
 * 入参：{ homestayId: string (UUID格式), action: string }
 * 返回参数：操作结果
 * url地址：/homestay/like
 * 请求方式：POST
 */
export const toggleLike = (homestayId, action) => {
	return http('/homestay/like', {
		homestayId,
		action
	}, 'POST')
}

/**
 * 收藏/取消收藏民宿
 * 功能描述：对指定民宿进行收藏或取消收藏操作
 * 入参：{ homestayId: string (UUID格式), action: string }
 * 返回参数：操作结果
 * url地址：/homestay/collect
 * 请求方式：POST
 */
export const toggleCollect = (homestayId, action) => {
	return http('/homestay/collect', {
		homestayId,
		action
	}, 'POST')
}

/**
 * 发布民宿信息
 * 功能描述：发布新的民宿转让信息
 * 入参：{ title: string, price: number, rooms: number, area: number, location: string, latitude: number, longitude: number, introduce: string, contact: string, wechat: string, tags: array, images: array }
 * 返回参数：发布结果
 * url地址：/homestay/publish
 * 请求方式：POST
 */
export const publishHomestay = (data) => {
	return http('/homestay/publish', data, 'POST')
}

/**
 * 获取用户收藏列表
 * 功能描述：获取当前用户收藏的民宿列表
 * 入参：{ page: number, size: number }
 * 返回参数：收藏列表数据
 * url地址：/user/collect/list
 * 请求方式：GET
 */
export const getCollectList = (params = {}) => {
	return http('/user/collect/list', params)
}

/**
 * 获取用户浏览历史
 * 功能描述：获取当前用户的浏览历史记录
 * 入参：{ page: number, size: number }
 * 返回参数：浏览历史数据
 * url地址：/user/history/list
 * 请求方式：GET
 */
export const getViewHistory = (params = {}) => {
	return http('/user/history/list', params)
}

/**
 * 删除浏览历史
 * 功能描述：删除指定的浏览历史记录
 * 入参：{ homestayId: string (UUID格式) }
 * 返回参数：删除结果
 * url地址：/user/history/remove
 * 请求方式：POST
 */
export const removeViewHistory = (homestayId) => {
	return http('/user/history/remove', { homestayId }, 'POST')
}

/**
 * 清除所有浏览历史
 * 功能描述：清除当前用户的所有浏览历史
 * 入参：无
 * 返回参数：清除结果
 * url地址：/user/history/clear
 * 请求方式：POST
 */
export const clearViewHistory = () => {
	return http('/user/history/clear', {}, 'POST')
}

/**
 * 添加浏览历史
 * 功能描述：记录用户浏览民宿的历史
 * 入参：{ homestayId: string (UUID格式) }
 * 返回参数：添加结果
 * url地址：/user/history/add
 * 请求方式：POST
 */
export const addViewHistory = (homestayId) => {
	return http('/user/history/add', homestayId, 'POST')
}

/**
 * 获取用户喜欢列表
 * 功能描述：获取当前用户喜欢的民宿列表
 * 入参：{ page: number, size: number }
 * 返回参数：喜欢列表数据
 * url地址：/user/like/list
 * 请求方式：GET
 */
export const getLikeList = (params = {}) => {
	return http('/user/like/list', params)
}

/**
 * 获取用户发布的民宿列表
 * 功能描述：获取当前用户发布的所有民宿列表
 * 入参：{ page: number, size: number }
 * 返回参数：用户发布列表数据
 * url地址：/homestay/myList
 * 请求方式：GET
 */
export const getMyHomestayList = (params = {}) => {
	return http('/homestay/myList', params)
}

/**
 * 更新用户信息
 * 功能描述：更新当前用户的基本信息（昵称、头像、手机号、微信号）
 * 入参：{ nickname: string, avatar: string, phone: string, wechat: string }
 * 返回参数：更新结果
 * url地址：/user/info
 * 请求方式：PUT
 */
export const updateUserInfo = (data) => {
	return http('/user/info', data, 'PUT')
}

/**
 * 搜索民宿
 * 功能描述：根据关键词搜索民宿信息
 * 入参：{ keyword: string, page: number, size: number }
 * 返回参数：搜索结果列表
 * url地址：/homestay/search
 * 请求方式：GET
 */
export const searchHomestay = (params = {}) => {
	return http('/homestay/search', params)
}

/**
 * 获取搜索建议
 * 功能描述：获取搜索关键词的建议
 * 入参：{ keyword: string }
 * 返回参数：搜索建议列表
 * url地址：/search/suggestions
 * 请求方式：GET
 */
export const getSearchSuggestions = (params = {}) => {
	return http('/search/suggestions', params)
}

/**
 * 获取热门搜索
 * 功能描述：获取当前热门搜索关键词
 * 入参：无
 * 返回参数：热门搜索列表
 * url地址：/search/hot
 * 请求方式：GET
 */
export const getHotSearches = () => {
	return http('/search/hot')
}

/**
 * 获取用户搜索历史
 * 功能描述：获取当前用户的搜索历史记录
 * 入参：无
 * 返回参数：搜索历史列表
 * url地址：/search/history
 * 请求方式：GET
 */
export const getUserSearchHistory = () => {
	return http('/search/history')
}

/**
 * 清除用户搜索历史
 * 功能描述：清除当前用户的所有搜索历史
 * 入参：无
 * 返回参数：清除结果
 * url地址：/search/history
 * 请求方式：DELETE
 */
export const clearUserSearchHistory = () => {
	return http('/search/history', {}, 'DELETE')
}


/**
 * 搜索地区
 * 功能描述：根据地区名称搜索地区信息
 * 入参：{ regionName: string }
 * 返回参数：地区列表
 * url地址：/region/search
 * 请求方式：GET
 */
export const searchRegions = (regionName) => {
	return http('/region/search', { regionName })
}

/**
 * 获取省市区树形结构
 * 功能描述：获取完整的省市区树形结构数据
 * 入参：无
 * 返回参数：省市区树形结构
 * url地址：/region/tree
 * 请求方式：GET
 */
export const getRegionTree = () => {
	return http('/region/tree')
}


/**
 * 获取城市列表
 * 功能描述：根据省份代码获取城市列表
 * 入参：{ provinceCode: string }
 * 返回参数：城市列表
 * url地址：/bnb/region/cities
 * 请求方式：GET
 */
export const getCities = (provinceCode) => {
	return http('/bnb/region/cities', { provinceCode })
}

/**
 * 获取区县列表
 * 功能描述：根据城市代码获取区县列表
 * 入参：{ cityCode: string }
 * 返回参数：区县列表
 * url地址：/bnb/region/districts
 * 请求方式：GET
 */
export const getDistricts = (cityCode) => {
	return http('/bnb/region/districts', { cityCode })
}

/**
 * 获取标签列表
 * 功能描述：获取所有启用的标签列表
 * 入参：无
 * 返回参数：标签列表
 * url地址：/bnb/tag/list
 * 请求方式：GET
 */
export const getTagList = () => {
	return http('/bnb/tag/list')
}

/**
 * 获取所有省份列表
 * 功能描述：获取所有省份数据用于筛选
 * 入参：无
 * 返回参数：省份列表
 * url地址：/bnb/region/provinces
 * 请求方式：GET
 */
export const getProvinces = () => {
	return http('/bnb/region/provinces', {}, 'GET')
}

/**
 * 根据省份代码获取城市列表
 * 功能描述：根据省份代码获取该省份下的所有城市
 * 入参：{ provinceCode: 省份代码 }
 * 返回参数：城市列表
 * url地址：/bnb/region/cities
 * 请求方式：GET
 */
export const getCitiesByProvince = (provinceCode) => {
	return http('/bnb/region/cities', { provinceCode }, 'GET')
}

/**
 * 根据地区筛选民宿列表
 * 功能描述：根据选择的省市筛选民宿数据
 * 入参：{ province: string, city: string, page: number, size: number }
 * 返回参数：筛选后的民宿列表
 * url地址：/homestay/filterByRegion
 * 请求方式：GET
 */
export const getFilteredHomestayList = (params = {}) => {
	return http('/homestay/filterByRegion', params, 'GET')
}

/**
 * 根据用户ID获取该用户发布的民宿列表
 * 功能描述：根据用户ID获取该用户发布的所有民宿
 * 入参：{ userId: string, page: number, size: number }
 * 返回参数：用户发布的民宿列表
 * url地址：/homestay/userList
 * 请求方式：GET
 */
export const getUserHomestays = (userId, page = 1, size = 20) => {
	return http('/homestay/userList', { userId, page, size })
}

/**
 * 上传图片
 * 功能描述：上传图片文件到服务器
 * 入参：file (图片文件)
 * 返回参数：图片访问URL
 * url地址：/upload/image
 * 请求方式：POST
 */
import { config } from './config'

export const uploadImage = (filePath) => {
	return new Promise((resolve, reject) => {
		uni.uploadFile({
			url: config.uploadUrl,
			filePath: filePath,
			name: 'file',
			header: {
				'Authorization': `Bearer ${uni.getStorageSync('token')}`
			},
			success: (res) => {
				try {
					const data = JSON.parse(res.data)
					if (data.code === 1) {
						resolve(data.data)
					} else {
						reject(new Error(data.message || '上传失败'))
					}
				} catch (e) {
					reject(new Error('解析响应失败'))
				}
			},
			fail: (error) => {
				reject(new Error('上传失败: ' + error.errMsg))
			}
		})
	})
}

/**
 * 下架民宿
 * 功能描述：将指定民宿下架，状态变为已下架
 * 入参：homestayId (UUID格式)
 * 返回参数：操作结果
 * url地址：/homestay/offline/{homestayId}
 * 请求方式：POST
 */
export const offlineHomestay = (homestayId) => {
	return http(`/homestay/offline/${homestayId}`, {}, 'POST')
}

/**
 * 上架民宿
 * 功能描述：将指定民宿上架，状态变为已上架
 * 入参：homestayId (UUID格式)
 * 返回参数：操作结果
 * url地址：/homestay/online/{homestayId}
 * 请求方式：POST
 */
export const onlineHomestay = (homestayId) => {
	return http(`/homestay/online/${homestayId}`, {}, 'POST')
}

/**
 * 删除民宿
 * 功能描述：永久删除指定的民宿信息
 * 入参：homestayId (UUID格式)
 * 返回参数：删除结果
 * url地址：/homestay/delete/{homestayId}
 * 请求方式：POST
 */
export const deleteHomestay = (homestayId) => {
	return http(`/homestay/delete/${homestayId}`, {}, 'POST')
}

/**
 * 更新民宿信息
 * 功能描述：更新指定民宿的详细信息
 * 入参：homestayId (UUID格式), data (民宿数据对象)
 * 返回参数：更新结果
 * url地址：/homestay/update/{homestayId}
 * 请求方式：PUT
 */
export const updateHomestay = (homestayId, data) => {
	return http(`/homestay/update/${homestayId}`, data, 'PUT')
}

// ==================== 聊天相关接口 ====================

/**
 * 创建或获取对话
 * 功能描述：用户联系房东时创建或获取对话
 * 入参：{ landlordId: number, homestayId: number }
 * 返回参数：对话信息
 * url地址：/chat/conversation
 * 请求方式：POST
 */
export const createConversation = (landlordId, homestayId) => {
	// 后端期望URL参数，不是POST body
	let url = `/chat/conversation?landlordId=${landlordId}`
	if (homestayId) {
		url += `&homestayId=${homestayId}`
	}
	
	console.log('🔗 创建对话API URL:', url)
	return http(url, {}, 'POST')
}

/**
 * 获取对话列表
 * 功能描述：获取当前用户的所有对话
 * 入参：无
 * 返回参数：对话列表
 * url地址：/chat/conversations
 * 请求方式：GET
 */
export const getConversations = () => {
	return http('/chat/conversations')
}

/**
 * 获取对话详情
 * 功能描述：根据对话ID获取对话信息
 * 入参：{ conversationId: string }
 * 返回参数：对话信息
 * url地址：/chat/conversation/{conversationId}
 * 请求方式：GET
 */
export const getConversation = (conversationId) => {
	return http(`/chat/conversation/${conversationId}`)
}

/**
 * 发送消息
 * 功能描述：在对话中发送消息
 * 入参：{ conversationId: string, content: string, messageType: string }
 * 返回参数：消息信息
 * url地址：/chat/send
 * 请求方式：POST
 */
export const sendMessage = (conversationId, content, messageType = 'text') => {
	return http('/chat/send', {
		conversationId,
		content,
		messageType
	}, 'POST')
}

/**
 * 获取消息列表
 * 功能描述：获取对话中的消息列表
 * 入参：{ conversationId: string, page: number, size: number }
 * 返回参数：消息列表
 * url地址：/chat/messages
 * 请求方式：GET
 */
export const getMessages = (conversationId, page = 0, size = 20) => {
	return http('/chat/messages', {
		conversationId,
		page,
		size
	})
}

/**
 * 标记消息为已读
 * 功能描述：标记对话中的消息为已读
 * 入参：{ conversationId: string }
 * 返回参数：操作结果
 * url地址：/chat/read
 * 请求方式：POST
 */
export const markMessagesAsRead = (conversationId) => {
	return http(`/chat/read?conversationId=${conversationId}`, {}, 'POST')
}

/**
 * 获取未读消息数量
 * 功能描述：获取当前用户的未读消息数量
 * 入参：无
 * 返回参数：未读消息数量
 * url地址：/chat/unread-count
 * 请求方式：GET
 */
export const getUnreadMessageCount = () => {
	return http('/chat/unread-count')
}

/**
 * 置顶对话
 * 功能描述：置顶指定对话
 * 入参：{ conversationId: string }
 * 返回参数：操作结果
 * url地址：/chat/pin
 * 请求方式：POST
 */
export const pinConversation = (conversationId) => {
	return http(`/chat/pin?conversationId=${conversationId}`, {}, 'POST')
}

/**
 * 取消置顶对话
 * 功能描述：取消置顶指定对话
 * 入参：{ conversationId: string }
 * 返回参数：操作结果
 * url地址：/chat/unpin
 * 请求方式：POST
 */
export const unpinConversation = (conversationId) => {
	return http(`/chat/unpin?conversationId=${conversationId}`, {}, 'POST')
}

/**
 * 删除对话
 * 功能描述：删除指定对话
 * 入参：{ conversationId: string }
 * 返回参数：操作结果
 * url地址：/chat/delete
 * 请求方式：POST
 */
export const deleteConversation = (conversationId) => {
	return http(`/chat/delete?conversationId=${conversationId}`, {}, 'POST')
}

/**
 * 获取房东联系信息
 * 功能描述：获取房东的手机号和微信号
 * 入参：{ landlordId: string (UUID格式) }
 * 返回参数：房东联系信息
 * url地址：/user/contact/{landlordId}
 * 请求方式：GET
 */
export const getLandlordContact = (landlordId) => {
	return http(`/user/contact/${landlordId}`)
}

/**
 * 自动发送房东联系信息
 * 功能描述：系统自动发送房东的联系信息给用户
 * 入参：{ conversationId: string, landlordId: string, homestayId: string }
 * 返回参数：发送结果
 * url地址：/chat/auto-send-contact
 * 请求方式：POST
 */
export const autoSendLandlordContact = (conversationId, landlordId, homestayId) => {
	// 构建URL查询参数（兼容微信小程序环境）
	let queryParams = `conversationId=${encodeURIComponent(conversationId)}&landlordId=${encodeURIComponent(landlordId)}`
	if (homestayId && homestayId !== 'undefined') {
		queryParams += `&homestayId=${encodeURIComponent(homestayId)}`
	}
	
	return http(`/chat/auto-send-contact?${queryParams}`, {}, 'POST')
}
