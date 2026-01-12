import { createStore } from 'vuex'

export default createStore({
    state: {
        user: {
            isLoggedIn: false,
            info: null
        }
    },
    mutations: {
        SET_USER_INFO(state, userInfo) {
            state.user.info = userInfo
            state.user.isLoggedIn = true
            console.log('SET_USER_INFO:', userInfo)
        },
        CLEAR_USER_INFO(state) {
            state.user.info = null
            state.user.isLoggedIn = false
            console.log('CLEAR_USER_INFO')
        }
    },
    actions: {
        login({ commit }, userInfo) {
            return new Promise((resolve) => {
                console.log('登录 action 执行:', userInfo)

                // 保存用户信息到 store
                commit('SET_USER_INFO', userInfo)

                // 保存 token 到 localStorage
                localStorage.setItem('user-token', 'demo-token-' + Date.now())
                localStorage.setItem('user-info', JSON.stringify(userInfo))

                console.log('Token 已保存到 localStorage')
                resolve(userInfo)
            })
        },
        logout({ commit }) {
            commit('CLEAR_USER_INFO')
            localStorage.removeItem('user-token')
            localStorage.removeItem('user-info')
            console.log('退出登录完成')
        }
    },
    getters: {
        isLoggedIn: state => {
            const status = state.user.isLoggedIn || !!localStorage.getItem('user-token')
            console.log('isLoggedIn getter:', status)
            return status
        },
        userInfo: state => {
            const info = state.user.info || JSON.parse(localStorage.getItem('user-info') || '{}')
            console.log('userInfo getter:', info)
            return info
        }
    }
})