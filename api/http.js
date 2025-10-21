/**
 * HTTP请求封装
 * 功能描述：统一处理API请求，包含错误处理和token管理
 * 入参：url(请求地址), data(请求数据), method(请求方式)
 * 返回参数：Promise对象
 */

import { requestInterceptor, requestErrorInterceptor } from './interceptors/requestInterceptor'
import { responseInterceptor, responseErrorInterceptor } from './interceptors/responseInterceptor'
import { showLoading, hideLoading } from '@/utils'

import { config } from './config'

// 微信小程序环境检查
const isMiniprogram = typeof wx !== 'undefined'

// 使用配置文件中的API地址
const baseUrl = config.baseUrl

// 环境信息日志
if (process.env.NODE_ENV === 'development') {
	console.log('🔧 开发环境：使用本地后端 API', baseUrl)
	if (isMiniprogram) {
		console.log('📱 微信小程序环境：将使用本地后端 API')
		console.log('⚠️ 注意：微信小程序要求HTTPS，请使用内网穿透工具如ngrok将本地服务暴露为HTTPS')
	}
} else {
	console.log('🚀 生产环境：使用远程 API 服务器', baseUrl)
}

// 在开发环境中使用Mock数据，生产环境使用真实API

/**
 * 统一的HTTP请求方法
 * @param {string} url - 请求地址
 * @param {object} data - 请求数据
 * @param {string} method - 请求方式 GET/POST
 * @returns {Promise} 返回Promise对象
 */
export default function http(url, data = {}, method = 'GET') {
	return new Promise((resolve, reject) => {
		// 参数验证
		if (!url) {
			reject(new Error('请求地址不能为空'))
			return
		}
		
		// 构建请求配置
		let requestConfig = {
			url: baseUrl + url,
			data,
			method,
			timeout: config.timeout,
			header: {
				...config.common.headers
			}
		}
		
		// 应用请求拦截器
		try {
			requestConfig = requestInterceptor(requestConfig)
		} catch (error) {
			requestErrorInterceptor(error)
			return
		}
		
		// 显示加载提示（使用统一Loading管理）
		showLoading('加载中...', true)
		
		uni.request({
			...requestConfig,
			success: (res) => {
				// 隐藏加载提示
				hideLoading()
				
				// 应用响应拦截器
				try {
					const processedResponse = responseInterceptor(res)
					resolve(processedResponse)
				} catch (error) {
					responseErrorInterceptor(error)
					reject(error)
				}
			},
			fail: (error) => {
				// 隐藏加载提示
				hideLoading()
				
				// 应用响应错误拦截器
				responseErrorInterceptor(error)
				reject(error)
			}
		})
	})
}
