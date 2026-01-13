import { createRouter, createWebHistory } from 'vue-router'
import store from '@/store'

const routes = [
    {
        path: '/',
        redirect: '/dashboard'
    },
    {
        path: '/login',
        name: 'Login',
        component: () => import('@/views/Login.vue'),
        meta: { requiresAuth: false }
    },
    {
        path: '/register',
        name: 'Register',
        component: () => import('@/views/Register.vue'),
        meta: { requiresAuth: false }
    },
    {
        path: '/dashboard',
        name: 'Dashboard',
        component: () => import('@/views/Dashboard.vue'),
        meta: { requiresAuth: true }
    },
    {
        path: '/simulation',
        name: 'Simulation',
        component: () => import('@/views/Simulation.vue'),
        meta: { requiresAuth: true }
    },
    {
        path: '/knowledge',
        name: 'Knowledge',
        component: () => import('@/views/Knowledge.vue'),
        meta: { requiresAuth: true }
    },
    {
        path: '/content',
        name: 'Content',
        component: () => import('@/views/Content.vue'),
        meta: { requiresAuth: true }
    }
]
const router = createRouter({
    history: createWebHistory(),
    routes
})

// 简化的路由守卫
router.beforeEach(async (to, from, next) => {
    console.log('=== 路由守卫开始 ===')
    console.log('路由跳转:', to.path)
    console.log('路由元信息:', to.meta)

    // 检查 localStorage 中的所有键
    console.log('localStorage 所有内容:')
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        const value = localStorage.getItem(key)
        console.log(`${key}:`, value ? (value.length > 50 ? value.substring(0, 50) + '...' : value) : 'null')
    }

    // 检查localStorage中的token和store中的登录状态
    const token = localStorage.getItem('token')
    const userStr = localStorage.getItem('user')
    let storeIsLoggedIn = store.getters.isLoggedIn

    console.log('检查结果:', {
        token: token ? token.substring(0, 20) + '...' : 'null',
        userStr: userStr ? '存在' : 'null',
        storeIsLoggedIn
    })

    // 如果有token但store状态未同步，恢复store状态
    if (token && userStr && !storeIsLoggedIn) {
        console.log('检测到token但store未同步，正在恢复...')
        try {
            const user = JSON.parse(userStr)
            store.commit('setUser', user)
            store.commit('setLoggedIn', true)
            storeIsLoggedIn = true
            console.log('store状态恢复成功')
        } catch (e) {
            console.error('恢复store状态失败:', e)
        }
    }

    const isLoggedIn = !!token || storeIsLoggedIn
    console.log('最终登录状态:', isLoggedIn)

    // 需要认证的页面
    if (to.meta.requiresAuth && !isLoggedIn) {
        console.log('需要登录，跳转到登录页')
        next('/login')
    }
    // 如果已登录但访问登录/注册页，跳转到首页
    else if ((to.path === '/login' || to.path === '/register') && isLoggedIn) {
        console.log('已登录，跳转到首页')
        next('/dashboard')
    } else {
        console.log('正常跳转')
        next()
    }

    console.log('=== 路由守卫结束 ===')
})

export default router