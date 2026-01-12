// 响应式工具函数
export const responsive = {
    // 获取屏幕尺寸
    getScreenSize() {
        const width = window.innerWidth
        if (width < 768) return 'mobile'
        if (width < 1024) return 'tablet'
        return 'desktop'
    },

    // 组件尺寸映射
    getComponentSize() {
        const size = this.getScreenSize()
        const sizeMap = {
            mobile: 'small',
            tablet: 'default',
            desktop: 'large'
        }
        return sizeMap[size]
    },

    // 弹窗宽度映射
    getDialogWidth() {
        const size = this.getScreenSize()
        const widthMap = {
            mobile: '90%',
            tablet: '70%',
            desktop: '50%'
        }
        return widthMap[size]
    },

    // 监听屏幕变化
    onScreenChange(callback) {
        const handleResize = () => {
            callback(this.getScreenSize())
        }

        window.addEventListener('resize', handleResize)
        return () => window.removeEventListener('resize', handleResize)
    }
}

// 在组件中使用
import { responsive } from '@/utils/responsive'

const screenSize = ref(responsive.getScreenSize())
const componentSize = ref(responsive.getComponentSize())

onMounted(() => {
    responsive.onScreenChange((size) => {
        screenSize.value = size
        componentSize.value = responsive.getComponentSize()
    })
})