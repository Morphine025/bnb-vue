/**
 * 认证工具函数
 * 功能描述：提供用户认证相关的工具函数，包括登录状态检查、权限验证等
 */

/**
 * 检查用户登录状态
 * @returns {boolean} true-已登录，false-未登录
 * @description 检查本地存储中的token，如果未登录则提示用户去登录页面
 * 
 * @example
 * if (checkLoginStatus()) {
 *   // 用户已登录，执行相关操作
 * }
 */
export const checkLoginStatus = () => {
  const token = uni.getStorageSync('token');
  if (!token) {
    uni.showModal({
      title: '提示',
      content: '请先登录后再查看消息',
      showCancel: false,
      confirmText: '去登录',
      success: () => {
        uni.switchTab({
          url: '/pages/my/my'
        });
      }
    });
    return false;
  }
  return true;
};

/**
 * 获取用户token
 * @returns {string|null} 用户token，未登录返回null
 * @description 从本地存储中获取用户token
 * 
 * @example
 * const token = getUserToken();
 * if (token) {
 *   // 使用token进行API调用
 * }
 */
export const getUserToken = () => {
  return uni.getStorageSync('token') || null;
};

/**
 * 获取用户ID
 * @returns {string|null} 用户ID，未登录返回null
 * @description 从本地存储中获取用户ID
 * 
 * @example
 * const userId = getUserId();
 * if (userId) {
 *   // 使用用户ID进行相关操作
 * }
 */
export const getUserId = () => {
  return uni.getStorageSync('userId') || null;
};

/**
 * 获取用户信息
 * @returns {Object|null} 用户信息对象，未登录返回null
 * @description 从本地存储中获取完整的用户信息
 * 
 * @example
 * const userInfo = getUserInfo();
 * if (userInfo) {
 *   console.log('用户名:', userInfo.username);
 * }
 */
export const getUserInfo = () => {
  const userInfo = uni.getStorageSync('userInfo');
  return userInfo ? JSON.parse(userInfo) : null;
};

/**
 * 保存用户信息
 * @param {Object} userInfo - 用户信息对象
 * @description 将用户信息保存到本地存储
 * 
 * @example
 * const userInfo = { userId: '123', username: '张三', avatar: 'avatar.jpg' };
 * saveUserInfo(userInfo);
 */
export const saveUserInfo = (userInfo) => {
  if (userInfo && typeof userInfo === 'object') {
    uni.setStorageSync('userInfo', JSON.stringify(userInfo));
    if (userInfo.userId) {
      uni.setStorageSync('userId', userInfo.userId);
    }
  }
};

/**
 * 清除用户信息
 * @description 清除本地存储中的用户信息，用于用户登出
 * 
 * @example
 * clearUserInfo(); // 用户登出时调用
 */
export const clearUserInfo = () => {
  uni.removeStorageSync('token');
  uni.removeStorageSync('userId');
  uni.removeStorageSync('userInfo');
};

/**
 * 检查用户权限
 * @param {string} permission - 权限名称
 * @returns {boolean} 是否有权限
 * @description 检查用户是否具有指定权限
 * 
 * @example
 * if (hasPermission('admin')) {
 *   // 用户有管理员权限
 * }
 */
export const hasPermission = (permission) => {
  const userInfo = getUserInfo();
  if (!userInfo || !userInfo.permissions) {
    return false;
  }
  
  return userInfo.permissions.includes(permission);
};

/**
 * 检查用户角色
 * @param {string} role - 角色名称
 * @returns {boolean} 是否具有指定角色
 * @description 检查用户是否具有指定角色
 * 
 * @example
 * if (hasRole('landlord')) {
 *   // 用户是房东
 * }
 */
export const hasRole = (role) => {
  const userInfo = getUserInfo();
  if (!userInfo || !userInfo.role) {
    return false;
  }
  
  return userInfo.role === role;
};

/**
 * 需要登录的操作包装器
 * @param {Function} callback - 需要登录后执行的回调函数
 * @param {string} message - 未登录时的提示信息
 * @description 包装需要登录才能执行的操作，如果未登录则提示用户登录
 * 
 * @example
 * requireLogin(() => {
 *   // 需要登录才能执行的操作
 *   console.log('用户已登录，执行操作');
 * }, '请先登录后再执行此操作');
 */
export const requireLogin = (callback, message = '请先登录后再执行此操作') => {
  if (checkLoginStatus()) {
    callback();
  } else {
    uni.showToast({
      title: message,
      icon: 'none',
      duration: 2000
    });
  }
};

/**
 * 跳转到登录页面
 * @param {string} redirectUrl - 登录成功后的跳转地址
 * @description 跳转到登录页面，登录成功后可以跳转到指定页面
 * 
 * @example
 * goToLogin('/pages/message/message'); // 登录后跳转到消息页面
 */
export const goToLogin = (redirectUrl = '/pages/my/my') => {
  const url = redirectUrl ? `/pages/login/login?redirect=${encodeURIComponent(redirectUrl)}` : '/pages/login/login';
  uni.navigateTo({
    url: url
  });
};
