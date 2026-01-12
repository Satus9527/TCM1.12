import request from '@/utils/request'

export const uploadAPI = {
    // 上传文件
    uploadFile: (formData) => request.post('/api/files/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),

    // 获取上传文件列表
    getFiles: () => request.get('/api/user/files'),

    // 删除文件
    deleteFile: (id) => request.delete(`/api/files/${id}`)
}