import axios from 'axios'
import { ElMessage } from 'element-plus'
import router from '@/router'

// 创建axios实例
const request = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || '',
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json'
    }
})

// 请求拦截器
request.interceptors.request.use(
    (config) => {
        // 添加token
        const token = localStorage.getItem('user-token')
        if (token) {
            config.headers.Authorization = `Bearer ${token}`
        }
        return config
    },
    (error) => {
        return Promise.reject(error)
    }
)

// 响应拦截器
request.interceptors.response.use(
    (response) => {
        return response.data
    },
    (error) => {
        // 统一错误处理
        if (error.response?.status === 401) {
            // 清除token和用户信息
            localStorage.removeItem('user-token')
            localStorage.removeItem('user-info')
            // 重新加载页面，确保store状态重置
            window.location.href = '/login'
            ElMessage.error('登录已过期，请重新登录')
        } else if (error.response?.status === 500) {
            ElMessage.error('服务器错误，请稍后重试')
        } else {
            ElMessage.error(error.response?.data?.message || '网络错误')
        }
        return Promise.reject(error)
    }
)

export default request