// import request from '@/utils/request'
//
// export const medicineAPI = {
//     // 搜索药材
//     search: (params) => request.get('/api/medicines', { params }),
//
//     // 获取药材详情
//     getDetail: (id) => request.get(`/api/medicines/${id}`),
//
//     // 获取药材分类
//     getCategories: () => request.get('/api/medicine-categories'),
//
//     // 获取性味选项
//     getProperties: () => request.get('/api/medicine-properties'),
//
//     // 获取功效选项
//     getEfficacies: () => request.get('/api/medicine-efficacies'),
//
//     // 收藏药材
//     toggleFavorite: (id) => request.post(`/api/medicines/${id}/favorite`)
// }


//下面是使用模拟数据接口

import { mockAPI } from '@/mock'

// 直接使用模拟数据，不进行网络请求
export const medicineAPI = {
    // 搜索药材
    search: (params) => {
        return mockAPI.searchMedicines(params)
    },

    // 获取药材详情
    getDetail: (id) => {
        return mockAPI.getMedicineDetail(id)
    },

    // 获取药材分类
    getCategories: () => {
        return mockAPI.getCategories()
    },

    // 收藏药材
    toggleFavorite: (id) => {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    code: 200,
                    message: '操作成功'
                })
            }, 300)
        })
    }
}