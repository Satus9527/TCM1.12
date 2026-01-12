<template>
  <div class="ancient-sidebar" v-if="showSidebar">
    <!-- 桌面端侧边栏 -->
    <div class="sidebar-desktop" v-if="!isMobile">
      <div class="sidebar-scroll">
        <div class="scroll-top"></div>

        <div class="sidebar-content">
          <!-- 用户信息区域 -->
          <div class="user-info">
            <div class="user-avatar">
              <el-avatar :size="60" :src="userInfo.avatar" class="avatar">
                {{ userInfo.name?.charAt(0) || '用' }}
              </el-avatar>
            </div>
            <div class="user-details">
              <h3 class="user-name">{{ userInfo.name || '用户' }}</h3>
              <p class="user-role">{{ userInfo.role || '用户' }}</p>
              <div class="user-stats">
                <span class="stat-item">
                  <i class="ri-time-line"></i>
                  今日活跃
                </span>
              </div>
            </div>
          </div>


          <!-- 导航菜单 -->
          <div class="sidebar-menu">
            <el-menu
                :default-active="activeMenu"
                class="ancient-menu"
                background-color="transparent"
                text-color="#5A4A27"
                active-text-color="#A62F00"
                router
            >
              <el-menu-item index="/dashboard" class="menu-item">
                <i class="ri-home-4-line"></i>
                <span>系统首页</span>
              </el-menu-item>

              <el-menu-item index="/simulation" class="menu-item">
                <i class="ri-cpu-line"></i>
                <span>配伍模拟室</span>
              </el-menu-item>

              <el-menu-item index="/knowledge" class="menu-item">
                <i class="ri-book-2-line"></i>
                <span>中医药知识库</span>
              </el-menu-item>

              <el-menu-item index="/content" class="menu-item">
                <i class="ri-user-line"></i>
                <span>个人中心</span>
              </el-menu-item>

              <!-- 分隔线 -->
              <div class="menu-divider"></div>

              <el-menu-item index="/help" class="menu-item">
                <i class="ri-question-line"></i>
                <span>帮助中心</span>
              </el-menu-item>
            </el-menu>
          </div>

          <!-- 用户操作区域 -->
          <div class="user-actions">
            <!-- 消息通知 -->
            <el-dropdown trigger="click" class="action-item" placement="top-start">
              <div class="action-btn">
                <el-badge :value="messageCount" :max="99" class="message-badge">
                  <i class="ri-notification-3-line"></i>
                </el-badge>
                <span class="action-text">消息通知</span>
              </div>
              <template #dropdown>
                <el-dropdown-menu class="ancient-dropdown">
                  <el-dropdown-item v-for="msg in messages" :key="msg.id">
                    <div class="message-item">
                      <div class="message-title">{{ msg.title }}</div>
                      <div class="message-time">{{ msg.time }}</div>
                    </div>
                  </el-dropdown-item>
                  <el-dropdown-item divided>
                    <div class="view-all-messages" @click="viewAllMessages">查看全部消息</div>
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>

            <!-- 设置 -->
            <div class="action-item" @click="goToSettings">
              <div class="action-btn">
                <i class="ri-settings-3-line"></i>
                <span class="action-text">账户设置</span>
              </div>
            </div>

            <!-- 退出登录 -->
            <div class="action-item logout-item" @click="handleLogout">
              <div class="action-btn">
                <i class="ri-logout-box-r-line"></i>
                <span class="action-text">退出登录</span>
              </div>
            </div>
          </div>

          <!-- 底部装饰 -->
          <div class="sidebar-footer">
            <div class="sidebar-seal">
              <span>中医智慧</span>
            </div>
            <div class="sidebar-version">
              <span>v1.0.0</span>
            </div>
          </div>
        </div>

        <div class="scroll-bottom"></div>
      </div>
    </div>

    <!-- 移动端底部导航 -->
    <div class="sidebar-mobile" v-else>
      <div class="mobile-nav">
        <router-link
            to="/dashboard"
            class="nav-item"
            :class="{ active: activeMenu === '/dashboard' }"
        >
          <i class="ri-home-4-line"></i>
          <span>首页</span>
        </router-link>

        <router-link
            to="/simulation"
            class="nav-item"
            :class="{ active: activeMenu === '/simulation' }"
        >
          <i class="ri-cpu-line"></i>
          <span>配伍</span>
        </router-link>

        <router-link
            to="/knowledge"
            class="nav-item"
            :class="{ active: activeMenu === '/knowledge' }"
        >
          <i class="ri-search-line"></i>
          <span>搜索</span>
        </router-link>

        <router-link
            to="/content"
            class="nav-item"
            :class="{ active: activeMenu === '/content' }"
        >
          <i class="ri-user-line"></i>
          <span>我的</span>
        </router-link>
      </div>
    </div>
  </div>
</template>

<script>
import { computed, onMounted, ref, onUnmounted } from 'vue'
import { useStore } from 'vuex'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'

export default {
  name: 'AppSidebar',
  setup() {
    const store = useStore()
    const route = useRoute()
    const router = useRouter()

    // 响应式变量
    const isMobile = ref(false)
    const searchKeyword = ref('')
    const messageCount = ref(3)
    const messages = ref([
      { id: 1, title: '新的配伍分析已完成', time: '10分钟前' },
      { id: 2, title: '您收藏的药材有更新', time: '1小时前' },
      { id: 3, title: '系统维护通知', time: '2小时前' }
    ])

    // 检查设备类型
    const checkDevice = () => {
      isMobile.value = window.innerWidth <= 768
    }

    const isLoggedIn = computed(() => {
      return !!localStorage.getItem('user-token')
    })

    // 只在登录后且不在登录页显示侧边栏
    const showSidebar = computed(() => {
      return isLoggedIn.value && route.path !== '/login'
    })

    const userInfo = computed(() => {
      try {
        const stored = localStorage.getItem('user-info')
        return stored ? JSON.parse(stored) : { name: '用户', role: '用户' }
      } catch {
        return { name: '用户', role: '用户' }
      }
    })

    const activeMenu = computed(() => route.path)

    // 搜索功能
    const handleGlobalSearch = () => {
      if (searchKeyword.value.trim()) {
        router.push({
          path: '/knowledge',
          query: { keyword: searchKeyword.value }
        })
        searchKeyword.value = ''
      }
    }

    // 消息功能
    const viewAllMessages = () => {
      ElMessage.info('查看全部消息')
    }

    // 设置功能
    const goToSettings = () => {
      ElMessage.info('账户设置功能开发中')
    }

    // 退出登录
    const handleLogout = async () => {
      try {
        await store.dispatch('logout')
        ElMessage.success('已退出登录')
        router.push('/login')
      } catch (error) {
        console.error('退出登录失败:', error)
        ElMessage.error('退出登录失败')
      }
    }

    onMounted(() => {
      checkDevice()
      window.addEventListener('resize', checkDevice)
    })

    onUnmounted(() => {
      window.removeEventListener('resize', checkDevice)
    })

    return {
      isMobile,
      searchKeyword,
      messageCount,
      messages,
      isLoggedIn,
      showSidebar,
      userInfo,
      activeMenu,
      handleGlobalSearch,
      viewAllMessages,
      goToSettings,
      handleLogout
    }
  }
}
</script>

<style scoped lang="scss">
.ancient-sidebar {
  // 桌面端样式
  .sidebar-desktop {
    height: 100%;
    position: relative;
    display: block;

    .sidebar-scroll {
      height: 100%;
      display: flex;
      flex-direction: column;
      background:
          linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(249, 246, 237, 0.9)),
          url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" opacity="0.02"><rect width="100" height="100" fill="none" stroke="%238E7D4E" stroke-width="1"/></svg>');
      background-size: cover, 50px 50px;
      border-right: 1px solid rgba(216, 195, 165, 0.4);
      box-shadow: 4px 0 20px rgba(101, 67, 33, 0.08);

      .scroll-top, .scroll-bottom {
        height: 20px;
        background:
            linear-gradient(90deg,
                rgba(142, 125, 78, 0.1) 0%,
                rgba(142, 125, 78, 0.2) 50%,
                rgba(142, 125, 78, 0.1) 100%);
        flex-shrink: 0;
      }

      .scroll-top {
        border-bottom: 1px solid rgba(216, 195, 165, 0.3);
      }

      .scroll-bottom {
        border-top: 1px solid rgba(216, 195, 165, 0.3);
      }
    }

    .sidebar-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      padding: 0 16px;
    }

    .user-info {
      padding: 24px 16px;
      text-align: center;
      border-bottom: 1px solid rgba(216, 195, 165, 0.3);
      margin-bottom: 16px;

      .user-avatar {
        margin-bottom: 12px;

        .avatar {
          background: linear-gradient(135deg, #8E7D4E, #A62F00);
          border: 3px solid rgba(255, 255, 255, 0.9);
          box-shadow: 0 4px 12px rgba(142, 125, 78, 0.2);
          font-weight: bold;
          color: white;
        }
      }

      .user-details {
        .user-name {
          margin: 0 0 4px 0;
          color: #5A4A27;
          font-size: 16px;
          font-weight: 600;
        }

        .user-role {
          margin: 0 0 12px 0;
          color: #8E7D4E;
          font-size: 12px;
          opacity: 0.9;
        }

        .user-stats {
          .stat-item {
            display: inline-flex;
            align-items: center;
            gap: 4px;
            padding: 4px 8px;
            background: rgba(232, 216, 185, 0.3);
            border-radius: 12px;
            color: #8E7D4E;
            font-size: 12px;
            font-weight: 500;

            i {
              font-size: 12px;
            }
          }
        }
      }
    }

    .sidebar-search {
      padding: 0 8px 16px;

      .ancient-search {
        :deep(.el-input-group__append) {
          background: linear-gradient(135deg, #8E7D4E, #A62F00);
          border: none;
          border-radius: 0 6px 6px 0;

          .search-btn {
            color: white;
            border: none;
            padding: 8px 12px;
          }
        }

        :deep(.el-input__inner) {
          border-radius: 6px 0 0 6px;
          border: 1px solid rgba(216, 195, 165, 0.4);
          background: rgba(255, 255, 255, 0.9);
          font-size: 12px;

          &:focus {
            border-color: #8E7D4E;
          }
        }
      }
    }

    .sidebar-menu {
      flex: 1;

      .ancient-menu {
        border: none;
        background: transparent;

        .menu-item {
          margin: 4px 0;
          border-radius: 8px;
          height: 48px;
          line-height: 48px;
          transition: all 0.3s ease;
          position: relative;

          &:hover {
            background: rgba(232, 216, 185, 0.3) !important;
            transform: translateX(4px);
          }

          &.is-active {
            background: rgba(142, 125, 78, 0.15) !important;
            color: #A62F00 !important;
            font-weight: 600;

            &::before {
              content: '';
              position: absolute;
              left: 0;
              top: 50%;
              transform: translateY(-50%);
              width: 4px;
              height: 20px;
              background: #A62F00;
              border-radius: 0 2px 2px 0;
            }

            i {
              color: #A62F00;
            }
          }

          i {
            color: #8E7D4E;
            font-size: 18px;
            margin-right: 12px;
          }

          span {
            font-size: 14px;
            font-weight: 500;
          }
        }
      }

      .menu-divider {
        height: 1px;
        background: linear-gradient(90deg,
            transparent 0%,
            rgba(216, 195, 165, 0.4) 50%,
            transparent 100%);
        margin: 16px 0;
      }
    }

    .user-actions {
      padding: 16px 8px;
      border-top: 1px solid rgba(216, 195, 165, 0.3);

      .action-item {
        margin-bottom: 8px;
        border-radius: 8px;
        transition: all 0.3s ease;
        cursor: pointer;

        &:hover {
          background: rgba(232, 216, 185, 0.3);
        }

        &.logout-item:hover {
          background: rgba(166, 47, 0, 0.1);
        }

        .action-btn {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px;
          color: #5A4A27;

          i {
            font-size: 18px;
            color: #8E7D4E;
          }

          .action-text {
            font-size: 14px;
            font-weight: 500;
          }
        }
      }

      .message-badge {
        :deep(.el-badge__content) {
          background: linear-gradient(135deg, #A62F00, #8E7D4E);
          border: 2px solid white;
          font-size: 10px;
        }
      }
    }

    .sidebar-footer {
      padding: 20px 0;
      text-align: center;

      .sidebar-seal {
        display: inline-block;
        padding: 8px 16px;
        border: 2px solid #8E7D4E;
        border-radius: 20px;
        color: #8E7D4E;
        font-family: "楷体", "STKaiti", serif;
        font-size: 14px;
        font-weight: bold;
        background: rgba(255, 255, 255, 0.8);
      }

      .sidebar-version {
        margin-top: 8px;
        font-size: 12px;
        color: #8E7D4E;
        opacity: 0.7;
      }
    }
  }

  // 移动端样式
  .sidebar-mobile {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    height: 60px;
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(10px);
    border-top: 1px solid rgba(216, 195, 165, 0.4);
    box-shadow: 0 -2px 20px rgba(101, 67, 33, 0.1);
    z-index: 1000;

    .mobile-nav {
      display: flex;
      height: 100%;
      align-items: center;
      justify-content: space-around;

      .nav-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        flex: 1;
        height: 100%;
        text-decoration: none;
        color: #8E7D4E;
        transition: all 0.3s ease;
        position: relative;

        &:hover {
          color: #A62F00;
        }

        &.active {
          color: #A62F00;

          &::after {
            content: '';
            position: absolute;
            bottom: 0;
            left: 50%;
            transform: translateX(-50%);
            width: 20px;
            height: 3px;
            background: #A62F00;
            border-radius: 2px;
          }
        }

        i {
          font-size: 20px;
          margin-bottom: 4px;
        }

        span {
          font-size: 12px;
          font-weight: 500;
        }
      }
    }
  }
}

// 下拉菜单样式
.ancient-dropdown {
  background:
      linear-gradient(145deg, rgba(255, 255, 255, 0.98), rgba(249, 246, 237, 0.95)) !important;
  border: 1px solid rgba(216, 195, 165, 0.4) !important;
  border-radius: 8px !important;
  box-shadow: 0 8px 32px rgba(101, 67, 33, 0.1) !important;
  backdrop-filter: blur(10px);

  .el-dropdown-menu__item {
    color: #5A4A27 !important;
    font-size: 14px;
    transition: all 0.3s ease;

    &:hover {
      background: rgba(232, 216, 185, 0.3) !important;
      color: #A62F00 !important;
    }
  }

  .message-item {
    padding: 8px 0;
    min-width: 200px;

    .message-title {
      font-size: 14px;
      color: #5A4A27;
      margin-bottom: 4px;
      font-weight: 500;
    }

    .message-time {
      font-size: 12px;
      color: #8E7D4E;
      opacity: 0.8;
    }
  }

  .view-all-messages {
    text-align: center;
    color: #8E7D4E;
    font-weight: 500;
  }
}

// 移动端样式调整
@media (max-width: 768px) {
  .ancient-sidebar {
    .sidebar-desktop {
      display: none;
    }

    .sidebar-mobile {
      display: block;
    }
  }
}

// 桌面端样式调整
@media (min-width: 769px) {
  .ancient-sidebar {
    .sidebar-desktop {
      display: block;
    }

    .sidebar-mobile {
      display: none;
    }
  }
}

// 为移动端底部导航留出空间
@media (max-width: 768px) {
  body {
    padding-bottom: 60px;
  }
}
</style>