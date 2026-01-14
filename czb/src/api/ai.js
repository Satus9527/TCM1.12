import request from '@/utils/request'

export const aiAPI = {
    // 症状咨询与方剂推荐
    consult: (data) => request.post('/consult', data),
    
    // 中药配伍分析
    analyzeCompatibility: (data) => request.post('/consult', {
        ...data,
        type: 'analyze'
    })
}
