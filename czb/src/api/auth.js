import request from '@/utils/request'

export const authAPI = {
    // 用户登录
    login: (data) => request.post('/api/auth/login', data),

    // 用户注册
    register: (data) => request.post('/api/auth/register', data),

    // 获取用户信息
    getUserInfo: () => request.get('/api/user/info'),

    // 刷新token
    refreshToken: () => request.post('/api/auth/refresh'),

    // 退出登录
    logout: () => request.post('/api/auth/logout')
}