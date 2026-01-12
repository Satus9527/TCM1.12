<template>
  <div id="app" class="ancient-medicine-app">
    <!-- 水墨背景层 -->
    <div class="ink-background">
      <div class="ink-wash"></div>
      <div class="ink-pattern"></div>
      <div class="ink-overlay"></div>
    </div>

    <!-- 主要内容区域 -->
    <div class="app-layout" v-if="isLoggedIn">
      <div class="app-body">
        <!-- 左侧菜单栏 -->
        <app-sidebar
            class="app-sidebar"
            :class="{ 'mobile-mini': isMobile }"
        />

        <!-- 主内容区 -->
        <main class="app-main" :class="{ 'mobile-expanded': isMobile }">
          <div class="page-scroll">
            <router-view />
          </div>
        </main>
      </div>
    </div>

    <!-- 登录页面 -->
    <div v-else class="login-layout">
      <router-view />
    </div>
  </div>
</template>

<script>
import { useStore } from 'vuex'
import AppSidebar from '@/components/Layout/AppSidebar.vue'
import { ref, onMounted, onUnmounted, computed } from 'vue'

export default {
  name: 'AncientMedicineApp',
  components: {
    AppSidebar
  },
  setup() {
    const store = useStore()
    const isMobile = ref(false)

    // 使用Vuex的登录状态
    const isLoggedIn = computed(() => {
      return store.getters.isLoggedIn
    })

    // 检查屏幕尺寸
    const checkScreenSize = () => {
      isMobile.value = window.innerWidth < 768
      console.log('屏幕尺寸检查:', window.innerWidth, '移动端:', isMobile.value)
    }

    onMounted(() => {
      checkScreenSize()
      window.addEventListener('resize', checkScreenSize)

      console.log('App.vue mounted - 登录状态:', isLoggedIn.value)
    })

    onUnmounted(() => {
      window.removeEventListener('resize', checkScreenSize)
    })

    return {
      isMobile,
      isLoggedIn
    }
  }
}
</script>

<style lang="scss">
// 响应式断点
$mobile: 768px;
$tablet: 1024px;

// 中医药平台色彩体系
$primary-brown: #5A4A27;
$secondary-brown: #8E7D4E;
$accent-red: #A62F00;
$accent-green: #52734D;
$background-light: #F9F6ED;
$background-dark: #f5e6d3;
$border-color: #D8C3A5;
$shadow-color: rgba(101, 67, 33, 0.1);

.login-layout {
  height: 100vh;
  overflow: auto;
}

#app {
  font-family: 'Microsoft YaHei', 'PingFang SC', 'Hiragino Sans GB', 'Noto Sans SC', 'SimSun', serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  height: 100vh;
  overflow: hidden;
}

.ancient-medicine-app {
  position: relative;
  min-height: 100vh;

  // 水墨背景
  .ink-background {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 0;

    .ink-wash {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background:
          linear-gradient(135deg, #F9F6ED 0%, #f5e6d3 50%, #e8dfd1 100%),
          url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" opacity="0.02"><path d="M40,40 Q100,20 160,40 T200,100 T160,160 T100,180 T40,160 T0,100 T40,40" fill="none" stroke="%238E7D4E" stroke-width="2"/></svg>');
      background-size: cover, 200px 200px;
    }

    .ink-pattern {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-image:
          radial-gradient(circle at 20% 30%, rgba(142, 125, 78, 0.08) 0%, transparent 50%),
          radial-gradient(circle at 80% 70%, rgba(166, 47, 0, 0.06) 0%, transparent 50%),
          radial-gradient(circle at 40% 80%, rgba(82, 115, 77, 0.04) 0%, transparent 50%),
          url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" opacity="0.03"><path d="M30,5 Q45,15 55,30 T30,55 T5,30 T30,5" fill="none" stroke="%235A4A27" stroke-width="0.5"/></svg>');
      background-size: auto, auto, auto, 60px 60px;
    }

    .ink-overlay {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background:
          linear-gradient(45deg, transparent 48%, rgba(142, 125, 78, 0.03) 50%, transparent 52%),
          linear-gradient(-45deg, transparent 48%, rgba(166, 47, 0, 0.02) 50%, transparent 52%);
      background-size: 20px 20px;
    }
  }

  // 布局结构
  .app-layout {
    display: flex;
    flex-direction: column;
    height: 100vh;
    position: relative;
    z-index: 2;
  }

  .app-body {
    display: flex;
    flex: 1;
    overflow: hidden;
    position: relative;
    height: 100vh;
  }

  // 侧边栏
  .app-sidebar {
    flex-shrink: 0;
    width: 280px;
    transition: width 0.3s ease;
    z-index: 1001;
    background: rgba(255, 255, 255, 0.92);
    backdrop-filter: blur(15px);
    border-right: 1px solid rgba(216, 195, 165, 0.4);
    box-shadow: 4px 0 20px $shadow-color;
    position: relative;

    @media (max-width: $tablet) {
      width: 260px;
    }

    @media (max-width: $mobile) {
      width: 100%;
      height: auto;
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      z-index: 1000;
      border-right: none;
      border-top: 1px solid rgba(216, 195, 165, 0.4);

      &.mobile-mini {
        .sidebar-content {
          .user-info {
            flex-direction: column;
            padding: 10px 5px;

            .user-avatar {
              margin-right: 0;
              margin-bottom: 8px;
            }

            .user-details {
              display: none;
            }
          }

          .sidebar-menu {
            .el-menu-item {
              justify-content: center;
              padding: 0 !important;

              span {
                display: none;
              }

              i {
                margin-right: 0;
                font-size: 20px;
              }
            }
          }
        }
      }
    }

    // 侧边栏卷轴装饰
    &::before {
      content: '';
      position: absolute;
      top: 0;
      bottom: 0;
      left: -8px;
      width: 16px;
      background:
          linear-gradient(90deg,
              rgba(142, 125, 78, 0.1) 0%,
              rgba(216, 195, 165, 0.05) 50%,
              rgba(142, 125, 78, 0.1) 100%),
          url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="16" height="100" opacity="0.3"><rect width="16" height="100" fill="%23D8C3A5"/><circle cx="8" cy="20" r="4" fill="%238E7D4E"/><circle cx="8" cy="50" r="4" fill="%23A62F00"/><circle cx="8" cy="80" r="4" fill="%2352734D"/></svg>');
      background-size: auto, 16px 100px;
      border-radius: 8px 0 0 8px;

      @media (max-width: $mobile) {
        display: none;
      }
    }
  }

  // 主内容区域
  .app-main {
    flex: 1;
    overflow: auto;
    background: transparent;
    transition: margin-left 0.3s ease;
    position: relative;

    @media (max-width: $mobile) {
      width: 100%;
      margin-bottom: 60px; // 为移动端底部导航留出空间

      &.mobile-expanded {
        margin-left: 0;
      }
    }

    // 主内容区边框装饰
    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      border: 8px solid transparent;
      border-image:
          url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect width="100" height="100" fill="none" stroke="%238E7D4E" stroke-width="8" stroke-dasharray="10,5" opacity="0.1"/></svg>') 8 round;
      pointer-events: none;
      z-index: 1;

      @media (max-width: $mobile) {
        border: none;
      }
    }
  }

  .page-scroll {
    padding: 24px;
    height: 100%;
    min-height: 100vh;
    position: relative;
    z-index: 2;

    @media (max-width: $tablet) {
      padding: 20px;
    }

    @media (max-width: $mobile) {
      padding: 16px;
      min-height: calc(100vh - 60px);
    }
  }
}

// 全局组件样式 - 中医药平台设计
.ancient-medicine-app {
  // 卷轴式卡片
  .ancient-card {
    background:
        linear-gradient(145deg, rgba(255, 255, 255, 0.95), rgba(249, 246, 237, 0.9));
    border: 1px solid $border-color;
    border-radius: 16px;
    box-shadow:
        0 8px 32px $shadow-color,
        inset 0 1px 0 rgba(255, 255, 255, 0.8),
        inset 0 -1px 0 rgba(101, 67, 33, 0.05);
    backdrop-filter: blur(10px);
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    margin-bottom: 24px;
    position: relative;
    overflow: hidden;

    // 卷轴顶部装饰
    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 6px;
      background:
          linear-gradient(90deg,
              transparent 0%,
              $secondary-brown 20%,
              $accent-red 50%,
              $secondary-brown 80%,
              transparent 100%);
      border-radius: 16px 16px 0 0;
    }

    // 宣纸纹理
    &::after {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-image:
          url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" opacity="0.02"><rect width="100" height="100" fill="none" stroke="%235A4A27" stroke-width="0.5"/></svg>');
      background-size: 100px 100px;
      pointer-events: none;
      z-index: 0;
    }

    &:hover {
      box-shadow:
          0 12px 40px rgba(101, 67, 33, 0.15),
          inset 0 1px 0 rgba(255, 255, 255, 0.9);
      transform: translateY(-2px);
    }

    @media (max-width: $mobile) {
      border-radius: 12px;
      margin-bottom: 20px;
    }
  }

  // 中医药平台按钮
  .ancient-btn {
    border-radius: 25px !important;
    transition: all 0.3s ease !important;
    font-weight: 500 !important;
    position: relative;
    overflow: hidden;

    // 毛笔笔触效果
    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
      transition: left 0.5s ease;
    }

    &:hover::before {
      left: 100%;
    }

    &.el-button--primary {
      background: linear-gradient(135deg, $secondary-brown, $accent-red) !important;
      border: none !important;
      color: white !important;
      box-shadow: 0 4px 15px rgba(142, 125, 78, 0.3) !important;

      &:hover {
        background: linear-gradient(135deg, $accent-red, $secondary-brown) !important;
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(142, 125, 78, 0.4) !important;
      }

      &:active {
        transform: translateY(0);
      }
    }

    &:not(.el-button--primary) {
      background: rgba(255, 255, 255, 0.9) !important;
      border: 1px solid $border-color !important;
      color: $primary-brown !important;

      &:hover {
        background: rgba(232, 216, 185, 0.3) !important;
        border-color: $secondary-brown !important;
        color: $primary-brown !important;
        transform: translateY(-1px);
      }
    }
  }

  // 中医药平台输入框
  .ancient-input {
    :deep(.el-input__inner) {
      background: rgba(255, 255, 255, 0.9) !important;
      border: 1px solid $border-color !important;
      border-radius: 10px !important;
      color: $primary-brown !important;
      transition: all 0.3s ease !important;
      font-family: inherit !important;

      &:focus {
        border-color: $secondary-brown !important;
        box-shadow: 0 0 0 2px rgba(142, 125, 78, 0.1) !important;
        background: rgba(255, 255, 255, 0.95) !important;
      }

      &::placeholder {
        color: #8E7D4E !important;
        font-style: italic;
      }
    }

    :deep(.el-input__prefix) {
      .el-icon {
        color: $secondary-brown !important;
      }
    }
  }

  // 中医药平台标签页
  .ancient-tabs {
    :deep(.el-tabs__header) {
      margin-bottom: 24px !important;
      background: rgba(255, 255, 255, 0.8) !important;
      border-radius: 12px 12px 0 0 !important;
      border: 1px solid rgba(216, 195, 165, 0.4) !important;
      border-bottom: none !important;
    }

    :deep(.el-tabs__nav-wrap) {
      &::after {
        background-color: rgba(216, 195, 165, 0.4) !important;
      }
    }

    :deep(.el-tabs__active-bar) {
      background: linear-gradient(90deg, $secondary-brown, $accent-red) !important;
      height: 3px !important;
      border-radius: 2px !important;
    }

    :deep(.el-tabs__item) {
      font-weight: 500 !important;
      color: $secondary-brown !important;
      transition: all 0.3s ease !important;

      &.is-active {
        color: $primary-brown !important;
        font-weight: 600 !important;
      }

      &:hover {
        color: $primary-brown !important;
      }
    }
  }

  // 中医药平台标签
  .ancient-tag {
    border-radius: 16px !important;
    border: 1px solid rgba(142, 125, 78, 0.3) !important;
    background: rgba(232, 216, 185, 0.3) !important;
    color: $primary-brown !important;
    font-weight: 500 !important;

    &.el-tag--primary {
      background: rgba(142, 125, 78, 0.15) !important;
      border-color: rgba(142, 125, 78, 0.3) !important;
      color: $primary-brown !important;
    }

    &.el-tag--success {
      background: rgba(82, 115, 77, 0.15) !important;
      border-color: rgba(82, 115, 77, 0.3) !important;
      color: $accent-green !important;
    }

    &.el-tag--warning {
      background: rgba(166, 47, 0, 0.15) !important;
      border-color: rgba(166, 47, 0, 0.3) !important;
      color: $accent-red !important;
    }
  }
}

// 滚动条样式 - 中医药平台设计
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: rgba(232, 216, 185, 0.3);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb {
  background: linear-gradient(135deg, $secondary-brown, $accent-red);
  border-radius: 4px;
  border: 1px solid rgba(255, 255, 255, 0.3);

  &:hover {
    background: linear-gradient(135deg, $accent-red, $secondary-brown);
  }
}

::-webkit-scrollbar-corner {
  background: transparent;
}

// 动画效果
@keyframes inkSpread {
  0% {
    opacity: 0;
    transform: scale(0.8);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes scrollUnroll {
  0% {
    transform: translateY(-20px);
    opacity: 0;
  }
  100% {
    transform: translateY(0);
    opacity: 1;
  }
}

// 页面过渡动画
.page-enter-active,
.page-leave-active {
  transition: all 0.4s ease;
}

.page-enter-from {
  opacity: 0;
  transform: translateX(30px);
}

.page-leave-to {
  opacity: 0;
  transform: translateX(-30px);
}

// 卡片入场动画
.ancient-card {
  animation: inkSpread 0.6s ease;
}

// 为移动端底部导航留出空间
@media (max-width: 768px) {
  body {
    padding-bottom: 60px;
  }
}

// 打印样式
@media print {
  .app-sidebar {
    display: none !important;
  }

  .app-main {
    margin-left: 0 !important;
  }

  .ancient-card {
    box-shadow: none !important;
    border: 1px solid #ddd !important;
    background: white !important;
  }
}
</style>