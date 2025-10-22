/**
 * 应用入口文件
 * 功能描述：应用启动入口，配置Vue应用和UI组件库
 * 主要功能：应用初始化、UI组件库配置、全局错误处理、全局样式
 */

import App from './App'
import { handleError } from '@/utils' // 引入全局错误处理

// 全局样式已移除，各页面使用独立样式

// #ifndef VUE3
// Vue2配置
import Vue from 'vue'
import './uni.promisify.adaptor'
import uviewUi from '@/uni_modules/uview-ui'  // Vue2使用uview-ui

Vue.config.productionTip = false
Vue.use(uviewUi)
App.mpType = 'app'
const app = new Vue({
  ...App
})
app.$mount()
// #endif

// #ifdef VUE3
// Vue3配置
import { createSSRApp } from 'vue'
import uviewPlus from '@/uni_modules/uview-plus'  // Vue3使用uview-plus
import { pinia } from './stores'  // 引入Pinia状态管理

/**
 * 创建Vue3应用实例
 * @returns {object} 应用实例
 */
export function createApp() {
  const app = createSSRApp(App)
  app.use(uviewPlus) // 使用uview-plus组件库
  app.use(pinia) // 使用Pinia状态管理
  
  // 配置uview-plus主题
  app.config.globalProperties.$u = uviewPlus
  
  // 配置全局错误处理
  app.config.errorHandler = (err, vm, info) => {
    handleError(err, 'Vue Global Error', { info })
  }
  
  return {
    app
  }
}
// #endif