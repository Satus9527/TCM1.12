// import request from '@/utils/request'
//
// export const userAPI = {
//     // 获取收藏列表
//     getFavorites: (params) => request.get('/api/user/favorites', { params }),
//
//     // 添加收藏
//     addFavorite: (data) => request.post('/api/user/favorites', data),
//
//     // 取消收藏
//     removeFavorite: (id) => request.delete(`/api/user/favorites/${id}`),
//
//     // 获取学习记录
//     getLearningHistory: (params) => request.get('/api/user/learning-history', { params }),
//
//     // 添加学习记录
//     addLearningRecord: (data) => request.post('/api/user/learning-history', data),
//
//     // 获取用户统计
//     getStats: () => request.get('/api/user/stats')
// }

import { mockAPI } from '@/mock'

export const userAPI = {
    // 获取收藏列表
    getFavorites: (params) => {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    code: 200,
                    data: {
                        list: [],
                        total: 0
                    }
                })
            }, 300)
        })
    },

    // 获取学习记录
    getLearningHistory: (params) => {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    code: 200,
                    data: {
                        list: []
                    }
                })
            }, 300)
        })
    },

    // 获取用户统计
    getStats: () => {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    code: 200,
                    data: {
                        prescriptions: 8,
                        favorites: 23,
                        learningHours: 156
                    }
                })
            }, 300)
        })
    },

    // 获取用户信息
    getInfo: () => {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    code: 200,
                    data: {
                        name: '中医师',
                        role: '医师',
                        avatar: ''
                    }
                })
            }, 300)
        })
    },

    // 添加收藏
    addFavorite: (data) => {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    code: 200,
                    message: '收藏成功'
                })
            }, 300)
        })
    },

    // 取消收藏
    removeFavorite: (id) => {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    code: 200,
                    message: '取消收藏成功'
                })
            }, 300)
        })
    }
}