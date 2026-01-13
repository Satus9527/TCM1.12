import request from '@/utils/request'

export const prescriptionAPI = {
    // 配伍分析
    analyze: (data) => request.post('/api/prescriptions/analyze', data),

    // 保存处方
    save: (data) => request.post('/api/prescriptions', data),

    // 获取处方列表
    getList: (params) => request.get('/api/prescriptions', { params }),

    // 获取处方详情
    getDetail: (id) => request.get(`/api/prescriptions/${id}`),

    // 删除处方
    delete: (id) => request.delete(`/api/prescriptions/${id}`),

    // 导出处方
    export: (id) => request.get(`/api/prescriptions/${id}/export`, {
        responseType: 'blob'
    })
}
//
// import { mockAPI } from '@/mock'
//
// export const prescriptionAPI = {
//     // 配伍分析
//     analyze: (data) => {
//         return mockAPI.analyzeCompatibility(data.medicines)
//     },
//
//     // 保存处方
//     save: (data) => {
//         return mockAPI.savePrescription(data)
//     },
//
//     // 获取处方列表
//     getList: (params) => {
//         return mockAPI.getPrescriptions(params)
//     },
//
//     // 获取处方详情
//     getDetail: (id) => {
//         return new Promise((resolve) => {
//             setTimeout(() => {
//                 resolve({
//                     code: 200,
//                     data: {
//                         id: id,
//                         name: '示例处方',
//                         description: '这是一个示例处方'
//                     }
//                 })
//             }, 300)
//         })
//     },
//
//     // 删除处方
//     delete: (id) => {
//         return new Promise((resolve) => {
//             setTimeout(() => {
//                 resolve({
//                     code: 200,
//                     message: '删除成功'
//                 })
//             }, 300)
//         })
//     },
//
//     // 导出处方
//     export: (id) => {
//         return new Promise((resolve) => {
//             setTimeout(() => {
//                 resolve({
//                     code: 200,
//                     data: '导出数据'
//                 })
//             }, 300)
//         })
//     }
// }