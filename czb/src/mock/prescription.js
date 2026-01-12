import request from '@/utils/request'
import { mockAPI } from '@/mock'

const useMock = import.meta.env.VUE_APP_USE_MOCK === 'true'

export const prescriptionAPI = {
    // 配伍分析
    analyze: (data) => {
        if (useMock) {
            return mockAPI.prescription.analyze(data.medicines || data)
        }
        return request.post('/api/prescriptions/analyze', data)
    },

    // 保存处方
    save: (data) => {
        if (useMock) {
            return mockAPI.prescription.save(data)
        }
        return request.post('/api/prescriptions', data)
    },

    // 获取处方列表
    getList: (params) => {
        if (useMock) {
            return mockAPI.prescription.getList(params)
        }
        return request.get('/api/prescriptions', { params })
    },

    // 删除处方
    delete: (id) => {
        if (useMock) {
            return new Promise((resolve) => {
                setTimeout(() => {
                    resolve({ code: 200, message: '删除成功' })
                }, 300)
            })
        }
        return request.delete(`/api/prescriptions/${id}`)
    }
}