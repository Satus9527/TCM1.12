import request from '@/utils/request'

export const medicineAPI = {
    // 搜索药材
    search: (params) => request.get('/medicines', { params }),

    // 获取药材详情
    getDetail: (id) => {
        if (!id) {
            return Promise.reject(new Error('药材ID不能为空'));
        }
        return request.get(`/medicines/${id}`);
    },

    // 获取药材分类
    getCategories: () => request.get('/medicine-categories'),

    // 获取性味选项
    getProperties: () => request.get('/medicine-properties'),

    // 获取功效选项
    getEfficacies: () => request.get('/medicine-efficacies'),

    // 收藏药材
    toggleFavorite: (id) => {
        if (!id) {
            return Promise.reject(new Error('药材ID不能为空'));
        }
        return request.post(`/medicines/${id}/favorite`);
    }
}