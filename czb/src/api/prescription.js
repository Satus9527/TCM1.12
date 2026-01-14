import request from '@/utils/request'

export const prescriptionAPI = {
    // 配伍分析
    analyze: (data) => request.post('/prescriptions/analyze', data),

    // 保存处方
    save: (data) => request.post('/prescriptions', data),

    // 获取处方列表
    getList: (params) => request.get('/prescriptions', { params }),

    // 获取处方详情
    getDetail: (id) => request.get(`/prescriptions/${id}`),

    // 删除处方
    delete: (id) => request.delete(`/prescriptions/${id}`),

    // 导出处方
    export: (id) => request.get(`/prescriptions/${id}/export`, {
        responseType: 'blob'
    })
}