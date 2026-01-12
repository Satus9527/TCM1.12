import request from '@/utils/request'
import { mockAPI } from '@/mock'

const useMock = process.env.VUE_APP_USE_MOCK === 'true'

export const userAPI = {
    // 获取用户信息
    getInfo: () => {
        if (useMock) {
            return mockAPI.user.getInfo()
        }
        return request.get('/api/user/info')
    },

    // 获取用户统计
    getStats: () => {
        if (useMock) {
            return mockAPI.user.getStats()
        }
        return request.get('/api/user/stats')
    },

    // 获取收藏列表
    getFavorites: () => {
        if (useMock) {
            return mockAPI.user.getFavorites()
        }
        return request.get('/api/user/favorites')
    },

    // 获取学习记录
    getLearningHistory: (params) => {
        if (useMock) {
            return new Promise((resolve) => {
                setTimeout(() => {
                    resolve({
                        code: 200,
                        data: {
                            list: [
                                { id: 1, title: '学习了人参的详细功效', time: '2小时前', type: 'medicine' },
                                { id: 2, title: '查阅了四君子汤的配伍', time: '1天前', type: 'prescription' }
                            ],
                            total: 2
                        }
                    })
                }, 400)
            })
        }
        return request.get('/api/user/learning-history', { params })
    }
}