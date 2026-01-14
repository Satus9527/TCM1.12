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

// 优化的路由守卫
router.beforeEach((to, from, next) => {
    console.log('路由跳转:', to.path)

    // 检查localStorage中的token
    const token = localStorage.getItem('user-token')
    const storeIsLoggedIn = store.getters.isLoggedIn
    const isLoggedIn = !!token || storeIsLoggedIn

    console.log('登录状态检查:', 'Token存在:', !!token, 'Store登录:', storeIsLoggedIn, '最终状态:', isLoggedIn)

    if (to.meta.requiresAuth && !isLoggedIn) {
        // 需要登录但未登录，跳转到登录页
        console.log('需要登录，跳转到登录页')
        next('/login')
    } else if ((to.path === '/login' || to.path === '/register') && isLoggedIn) {
        // 已登录但要去登录/注册页，跳转到首页
        console.log('已登录，跳转到首页')
        next('/dashboard')
    } else {
        // 正常跳转
        console.log('正常跳转')
        next()
    }
})

export default router