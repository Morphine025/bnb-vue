/**
 * API统一入口文件
 * 功能描述：统一导出所有API模块，提供便捷的API调用方式
 * 主要功能：模块化管理、统一错误处理、类型安全
 */

// 导入核心模块
export { BaseAPI, createAPI, createBatchAPI } from './core/BaseAPI'
export { 
  ErrorHandler, 
  globalErrorHandler, 
  handleError, 
  ErrorTypes,
  ErrorLevels 
} from './core/ErrorHandler'

// 导入业务API模块
import { HomestayAPI } from './modules/HomestayAPI'
import { UserAPI } from './modules/UserAPI'
import { SearchAPI } from './modules/SearchAPI'
import { RegionAPI } from './modules/RegionAPI'
import { ChatAPI } from './modules/ChatAPI'

// 导出业务API模块
export { HomestayAPI, UserAPI, SearchAPI, RegionAPI, ChatAPI }

// 导入配置文件
import { config } from './config'

// 导入HTTP请求封装
export { default as http } from './http'

/**
 * 图片上传功能
 */
const uploadImage = (filePath) => {
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
 * 统一API对象 - 提供所有API的便捷访问
 */
export const API = {
  // 民宿相关API
  homestay: HomestayAPI,
  
  // 用户相关API
  user: UserAPI,
  
  // 搜索相关API
  search: SearchAPI,
  
  // 地区相关API
  region: RegionAPI,
  
  // 聊天相关API
  chat: ChatAPI,
  
  // 图片上传API
  uploadImage: uploadImage
}

/**
 * 便捷API方法 - 保持向后兼容
 * 注意：建议新代码直接使用 API.homestay.xxx 的方式调用
 */
export const getBanner = () => API.homestay.getBanner()
export const getFallList = (params) => API.homestay.getHomeList(params)
export const getHomestayDetail = (id) => API.homestay.getDetail(id)
export const publishHomestay = (data) => API.homestay.publish(data)
export const updateHomestay = (id, data) => API.homestay.update(id, data)
export const deleteHomestay = (id) => API.homestay.delete(id)
export const onlineHomestay = (id) => API.homestay.online(id)
export const offlineHomestay = (id) => API.homestay.offline(id)
export const toggleLike = (id, action) => API.homestay.toggleLike(id, action)
export const toggleCollect = (id, action) => API.homestay.toggleCollect(id, action)
export const getMyHomestayList = (params) => API.homestay.getMyList(params)
export const getFilteredHomestayList = (params) => API.homestay.filterByRegion(params)
export const getUserHomestays = (userId, page, size) => API.homestay.getUserList(userId, { page, size })
export const searchHomestay = (params) => API.homestay.search(params)

// 用户相关
export const login = (code, avatarUrl, nickName) => API.user.login({ code, avatarUrl, nickName })
export const getUserInfo = () => API.user.getInfo()
export const getUserInfoById = (id) => API.user.getInfoById(id)
export const updateUserInfo = (data) => API.user.updateInfo(data)
export const getUserStats = () => API.user.getStats()
export const getFollowList = (params) => API.user.getFollowList(params)
export const getFansList = (params) => API.user.getFansList(params)
export const toggleFollow = (userId, action) => API.user.toggleFollow(userId, action)
export const checkFollowStatus = (userId) => API.user.checkFollowStatus(userId)
export const removeFan = (userId) => API.user.removeFan(userId)
export const getFollowFeed = () => API.user.getFollowFeed()
export const getFollowHomestayList = (params) => API.user.getFollowHomestayList(params)
export const getCollectList = (params) => API.user.getCollectList(params)
export const getLikeList = (params) => API.user.getLikeList(params)
export const getViewHistory = (params) => API.user.getViewHistory(params)
export const addViewHistory = (id) => API.user.addViewHistory(id)
export const removeViewHistory = (id) => API.user.removeViewHistory(id)
export const clearViewHistory = () => API.user.clearViewHistory()
export const getLandlordContact = (id) => API.user.getLandlordContact(id)

// 搜索相关
export const getSearchSuggestions = (params) => API.search.getSuggestions(params)
export const getHotSearches = () => API.search.getHotSearches()
export const getUserSearchHistory = () => API.search.getSearchHistory()
export const clearUserSearchHistory = () => API.search.clearSearchHistory()
export const searchRegions = (name) => API.search.searchRegions(name)
export const getRegionTree = () => API.search.getRegionTree()

// 地区相关
export const getProvinces = () => API.region.getProvinces()
export const getCitiesByProvince = (code) => API.region.getCitiesByProvince(code)
export const getDistricts = (code) => API.region.getDistrictsByCity(code)
export const getTagList = () => API.region.getTagList()

// 聊天相关
export const createConversation = (landlordId, homestayId) => API.chat.createConversation(landlordId, homestayId)
export const getConversations = () => API.chat.getConversations()
export const getConversation = (id) => API.chat.getConversation(id)
export const sendMessage = (conversationId, content, messageType) => API.chat.sendMessage(conversationId, content, messageType)
export const getMessages = (conversationId, page, size) => API.chat.getMessages(conversationId, page, size)
export const markMessagesAsRead = (conversationId) => API.chat.markMessagesAsRead(conversationId)
export const getUnreadMessageCount = () => API.chat.getUnreadMessageCount()
export const pinConversation = (id) => API.chat.pinConversation(id)
export const unpinConversation = (id) => API.chat.unpinConversation(id)
export const deleteConversation = (id) => API.chat.deleteConversation(id)
export const autoSendLandlordContact = (conversationId, landlordId, homestayId) => API.chat.autoSendLandlordContact(conversationId, landlordId, homestayId)

// 导出uploadImage函数（用于向后兼容）
export { uploadImage }

// 默认导出API对象
export default API
