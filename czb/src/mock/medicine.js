import request from '@/utils/request'
import { mockAPI } from '@/mock'

const useMock = import.meta.env.VUE_APP_USE_MOCK === 'true'

export const medicineAPI = {
    // 搜索药材
    search: (params) => {
        if (useMock) {
            return mockAPI.medicine.search(params)
        }
        return request.get('/api/medicines', { params })
    },

    // 获取药材详情
    getDetail: (id) => {
        if (useMock) {
            return mockAPI.medicine.getDetail(id)
        }
        return request.get(`/api/medicines/${id}`)
    },

    // 获取药材分类
    getCategories: () => {
        if (useMock) {
            return mockAPI.medicine.getCategories()
        }
        return request.get('/api/medicine-categories')
    },

    // 收藏药材
    toggleFavorite: (id) => {
        if (useMock) {
            return mockAPI.medicine.toggleFavorite(id)
        }
        return request.post(`/api/medicines/${id}/favorite`)
    }
}