import request from '@/utils/request'

export const userAPI = {
    // 获取收藏列表
    getFavorites: (params) => request.get('/content/collections', { params }),

    // 添加收藏
    addFavorite: (data) => request.post('/content/collections', data),

    // 取消收藏
    removeFavorite: (id) => request.delete(`/content/collections/${id}`),

    // 获取学习记录
    getLearningHistory: (params) => request.get('/user/learning-history', { params }),

    // 添加学习记录
    addLearningRecord: (data) => request.post('/user/learning-history', data),

    // 获取用户统计
    getStats: () => request.get('/user/stats'),
    getUserStats: () => request.get('/user/stats'),
    
    // 获取用户信息
    getInfo: () => request.get('/user/info'),
    getUserInfo: () => request.get('/user/info'),
    
    // 获取近期活动
    getActivities: (params) => request.get('/user/activities', { params }),
    
    // 获取今日提示
    getTips: () => request.get('/user/tips')
}