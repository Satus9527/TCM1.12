// 认证工具函数
export const auth = {
    // 保存token
    setToken: (token) => {
        localStorage.setItem('token', token)
    },

    // 获取token
    getToken: () => {
        return localStorage.getItem('token')
    },

    // 移除token
    removeToken: () => {
        localStorage.removeItem('token')
    },

    // 检查是否登录
    isLoggedIn: () => {
        return !!localStorage.getItem('token')
    }
}