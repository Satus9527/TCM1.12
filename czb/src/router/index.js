import { createRouter, createWebHistory } from 'vue-router'

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
router.beforeEach((to, from, next) => {
    console.log('路由跳转:', to.path)

    const token = localStorage.getItem('user-token')
    const isLoggedIn = !!token

    console.log('登录状态:', isLoggedIn, 'Token:', token)

    if (to.meta.requiresAuth && !isLoggedIn) {
        console.log('需要登录，跳转到登录页')
        next('/login')
    } else if ((to.path === '/login' ||to.path==='/register')&& isLoggedIn) {
        console.log('已登录，跳转到首页')
        next('/dashboard')
    } else {
        console.log('正常跳转')
        next()
    }
})

export default router