/**
 * 简化用户信息管理工具
 * 功能描述：提供基础的用户信息管理功能，避免过度设计
 */

// 导入API接口 - 使用新的统一API
import { UserAPI } from "../../api/modules/UserAPI.js";

/**
 * 参数验证工具
 * @param {any} value - 要验证的值
 * @param {string} name - 参数名
 * @param {string} type - 期望类型
 * @throws {Error} 参数验证失败时抛出错误
 */
const validateParam = (value, name, type) => {
  if (value === null || value === undefined) {
    throw new Error(`参数 ${name} 不能为空`);
  }

  if (
    type === "object" &&
    (typeof value !== "object" || Array.isArray(value))
  ) {
    throw new Error(`参数 ${name} 必须是对象类型`);
  }

  if (type === "string" && typeof value !== "string") {
    throw new Error(`参数 ${name} 必须是字符串类型`);
  }

  if (type === "function" && typeof value !== "function") {
    throw new Error(`参数 ${name} 必须是函数类型`);
  }
};

/**
 * 创建简化用户信息管理器
 * @param {Object} apiClient - API客户端
 * @param {string} storageKey - 本地存储键名
 * @returns {Object} 用户信息管理器
 * @throws {Error} 参数验证失败时抛出错误
 * @example
 * // 创建用户信息管理器
 * const userInfoManager = createSimpleUserInfoManager({
 *   getInfo: UserAPI.getInfo,
 *   updateInfo: UserAPI.updateInfo
 * }, 'userInfo')
 * const userInfo = await userInfoManager.refreshUserInfo()
 */
export const createSimpleUserInfoManager = (
  apiClient,
  storageKey = "userInfo"
) => {
  // 参数验证
  validateParam(apiClient, "apiClient", "object");
  validateParam(storageKey, "storageKey", "string");

  if (!apiClient.getInfo || typeof apiClient.getInfo !== "function") {
    throw new Error("apiClient 必须包含 getInfo 静态方法");
  }

  if (!apiClient.updateInfo || typeof apiClient.updateInfo !== "function") {
    throw new Error("apiClient 必须包含 updateInfo 静态方法");
  }
  // 公共错误处理方法
  const handleError = (error, operation) => {
    console.error(`${operation}失败:`, error);
    throw error;
  };

  // 公共数据验证方法
  const validateUserData = (userData) => {
    if (!userData) {
      throw new Error("用户信息为空");
    }
    return userData;
  };

  // 公共API调用方法
  const callApi = async (apiMethod, operation) => {
    try {
      const response = await apiMethod();
      return response.data || response;
    } catch (error) {
      handleError(error, operation);
    }
  };

  return {
    /**
     * 刷新用户信息
     * @returns {Promise<Object>} 用户信息
     */
    async refreshUserInfo() {
      const userData = await callApi(() => apiClient.getInfo(), "获取用户信息");
      validateUserData(userData);
      this.saveToStorage(userData);
      return userData;
    },

    /**
     * 获取本地用户信息
     * @returns {Promise<Object>} 用户信息
     */
    async getLocalUserInfo() {
      try {
        const localData = uni.getStorageSync(storageKey);
        if (localData) {
          return JSON.parse(localData);
        }

        // 本地没有信息，从服务器获取
        return await this.refreshUserInfo();
      } catch (error) {
        console.error("获取本地用户信息失败:", error);
        throw error;
      }
    },

    /**
     * 更新用户信息
     * @param {Object} userInfo - 用户信息
     * @returns {Promise<Object>} 更新后的用户信息
     */
    async updateUserInfo(userInfo) {
      validateParam(userInfo, "userInfo", "object");
      const updatedData = await callApi(
        () => apiClient.updateInfo(userInfo),
        "更新用户信息"
      );
      this.saveToStorage(updatedData);
      console.log("用户信息已更新:", updatedData);
      return updatedData;
    },

    /**
     * 保存用户信息到本地存储
     * @param {Object} userInfo - 用户信息
     */
    saveToStorage(userInfo) {
      try {
        uni.setStorageSync(storageKey, JSON.stringify(userInfo));
      } catch (error) {
        console.error("保存用户信息到本地存储失败:", error);
        throw error;
      }
    },

    /**
     * 清除本地用户信息
     */
    clearUserInfo() {
      try {
        uni.removeStorageSync(storageKey);
        console.log("本地用户信息已清除");
      } catch (error) {
        console.error("清除本地用户信息失败:", error);
        throw error;
      }
    },

    /**
     * 检查用户是否已登录
     * @returns {boolean} 是否已登录
     */
    isLoggedIn() {
      try {
        const localData = uni.getStorageSync(storageKey);
        return !!localData;
      } catch (error) {
        console.error("检查登录状态失败:", error);
        return false;
      }
    },
  };
};

// 创建默认的用户信息管理器
const userInfoManager = createSimpleUserInfoManager(
  {
    getInfo: UserAPI.getInfo,
    updateInfo: UserAPI.updateInfo,
  },
  "userInfo"
);

// 为了保持向后兼容，导出原有的函数（内部使用新的管理器）
export const refreshUserInfo = () => userInfoManager.refreshUserInfo();
export const getLocalUserInfo = () => userInfoManager.getLocalUserInfo();
export const updateLocalUserInfo = (userInfo) =>
  userInfoManager.saveToStorage(userInfo);

// 导出新的管理器
export { userInfoManager };
