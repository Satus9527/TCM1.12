<template>
  <div class="ancient-dashboard">

    <div class="login-bg">
      <div class="bg-texture"></div>
      <div class="bg-pattern"></div>
      <div class="bg-herbs"></div>
    </div>
    <!-- 顶部欢迎区域 -->
    <div class="welcome-section ancient-card">
      <div class="welcome-content">
        <div class="user-info">
          <div class="user-avatar">
            <el-avatar :size="80" :src="userInfo.avatar" class="avatar">
              {{ userInfo.name?.charAt(0) || '用' }}
            </el-avatar>
          </div>
          <div class="welcome-text">
            <h1 class="welcome-title">欢迎归来，{{ userInfo.name || '用户' }}</h1>
            <p class="welcome-subtitle">{{ currentTime }}，愿您今日顺利</p>
            <div class="weather-info">
              <i class="ri-sun-line"></i>
              <span>今日宜：配伍研究 | 忌：过度劳累</span>
            </div>
          </div>
        </div>
        <div class="quick-stats">
          <div class="stat-item" v-for="stat in quickStats" :key="stat.label">
            <div class="stat-icon" :style="{ backgroundColor: stat.color }">
              <i :class="stat.icon"></i>
            </div>
            <div class="stat-data">
              <div class="stat-value">{{ stat.value }}</div>
              <div class="stat-label">{{ stat.label }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="dashboard-content">
      <!-- 左侧快速操作区 -->
      <div class="left-panel">
        <!-- 快捷功能入口 -->
        <div class="quick-actions ancient-card">
          <div class="card-header">
            <h3><i class="ri-apps-line"></i> 快捷功能</h3>
          </div>
          <div class="actions-grid">
            <div
                v-for="action in quickActions"
                :key="action.name"
                class="action-card"
                @click="handleAction(action)"
            >
              <div class="action-icon" :style="{ color: action.color }">
                <i :class="action.icon"></i>
              </div>
              <div class="action-info">
                <span class="action-name">{{ action.name }}</span>
                <span class="action-desc">{{ action.desc }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 最近使用记录 -->
        <div class="recent-activity ancient-card">
          <div class="card-header">
            <h3><i class="ri-time-line"></i> 最近使用</h3>
          </div>
          <div class="activity-list">
            <div
                v-for="activity in recentActivities"
                :key="activity.id"
                class="activity-item"
                @click="handleActivity(activity)"
            >
              <div class="activity-icon">
                <i :class="activity.icon"></i>
              </div>
              <div class="activity-content">
                <p class="activity-title">{{ activity.title }}</p>
                <p class="activity-time">{{ activity.time }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 中间数据概览区 -->
      <div class="center-panel">
        <!-- 数据统计卡片 -->
        <div class="stats-overview">
          <div class="stat-card ancient-card" v-for="stat in statsOverview" :key="stat.title">
            <div class="stat-header">
              <div class="stat-title">
                <h4>{{ stat.title }}</h4>
                <el-tag :type="stat.trend > 0 ? 'success' : 'info'" size="small" class="trend-tag">
                  {{ stat.trend > 0 ? '↑' : '↓' }}{{ Math.abs(stat.trend) }}%
                </el-tag>
              </div>
            </div>
            <div class="stat-content">
              <div class="stat-main">
                <span class="stat-number">{{ stat.value }}</span>
                <span class="stat-unit">{{ stat.unit }}</span>
              </div>
              <div class="stat-chart">
                <div class="mini-chart">
                  <div
                      v-for="(point, index) in stat.chartData"
                      :key="index"
                      class="chart-bar"
                      :style="{ height: point + '%' }"
                  ></div>
                </div>
              </div>
            </div>
            <div class="stat-footer">
              <span class="stat-desc">{{ stat.description }}</span>
            </div>
          </div>
        </div>

        <!-- 配伍记录 -->
        <div class="compatibility-records ancient-card">
          <div class="card-header">
            <h3><i class="ri-book-2-line"></i> 配伍记录</h3>
            <el-button type="text" class="more-btn" @click="viewAllRecords">查看全部</el-button>
          </div>
          <div class="records-list">
            <div
                v-for="record in compatibilityRecords"
                :key="record.id"
                class="record-item"
                @click="viewRecordDetail(record)"
            >
              <div class="record-icon">
                <i class="ri-file-text-line" :style="{ color: record.status === 'success' ? '#52734D' : '#A62F00' }"></i>
              </div>
              <div class="record-info">
                <span class="record-name">{{ record.name }}</span>
                <span class="record-desc">{{ record.description }}</span>
              </div>
              <div class="record-meta">
                <span class="record-time">{{ record.time }}</span>
                <el-tag :type="record.status === 'success' ? 'success' : 'warning'" size="small" class="status-tag">
                  {{ record.status === 'success' ? '成功' : '待优化' }}
                </el-tag>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧信息区 -->
      <div class="right-panel">

        <!-- 今日提示 -->
        <div class="daily-tips ancient-card">
          <div class="card-header">
            <h3><i class="ri-lightbulb-line"></i> 今日提示</h3>
          </div>
          <div class="tips-content">
            <div class="tip-item" v-for="(tip, index) in dailyTips" :key="index">
              <div class="tip-icon" :class="tip.type">
                <i :class="tip.icon"></i>
              </div>
              <span class="tip-text">{{ tip.text }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, onMounted, onUnmounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useStore } from 'vuex'
import { ElMessage } from 'element-plus'
import { userAPI, prescriptionAPI } from '@/api'  // 确保导入正确的 API

export default {
  name: 'AncientDashboard',
  setup() {
    const router = useRouter()
    const store = useStore()

    // 用户信息
    const userInfo = computed(() => {
      // 先从 store 获取
      const storeUser = store.state.user || {}
      if (storeUser.username) {
        return storeUser
      }

      // 如果 store 中没有，从 localStorage 获取
      try {
        const localUser = JSON.parse(localStorage.getItem('user') || '{}')
        return localUser
      } catch (e) {
        console.error('读取用户信息失败:', e)
        return {}
      }
    })

    // 当前时间（友好问候）
    const currentTime = computed(() => {
      const now = new Date()
      const hour = now.getHours()
      if (hour < 6) return '凌晨好'
      if (hour < 9) return '早上好'
      if (hour < 12) return '上午好'
      if (hour < 14) return '中午好'
      if (hour < 18) return '下午好'
      return '晚上好'
    })

    // 当前具体时间（HH:MM）
    const currentHourMinute = ref('')

    // 快速统计数据
    const quickStats = ref([
      { label: '配伍记录', value: '0', icon: 'ri-book-2-line', color: 'rgba(232,216,185,0.3)' },
      { label: '收藏内容', value: '0', icon: 'ri-star-line', color: 'rgba(232,216,185,0.3)' },
      { label: '学习时长', value: '0小时', icon: 'ri-time-line', color: 'rgba(232,216,185,0.3)' }
    ])

    // 快速操作 - 添加上这些变量
    const quickActions = ref([
      { name: '开始模拟', desc: '进行中药配伍模拟', icon: 'ri-play-circle-line', color: '#8E7D4E' },
      { name: '知识库', desc: '查看中药知识', icon: 'ri-book-open-line', color: '#52734D' },
      { name: '我的收藏', desc: '查看收藏内容', icon: 'ri-heart-line', color: '#A62F00' },
      { name: '学习记录', desc: '查看学习进度', icon: 'ri-history-line', color: '#5A4A27' }
    ])

    // 最近活动 - 添加上这些变量
    const recentActivities = ref([
      { id: 1, title: '暂无最近活动', time: '-', icon: 'ri-time-line' }
    ])

    // 数据概览 - 添加上这些变量
    const statsOverview = ref([
      {
        title: '药材库总量',
        value: '0',
        unit: '种',
        trend: 0,
        description: '暂无数据',
        chartData: [30, 40, 50, 60, 70, 80, 90]
      },
      {
        title: '配伍成功率',
        value: '0',
        unit: '%',
        trend: 0,
        description: '暂无数据',
        chartData: [65, 70, 75, 80, 85, 90, 95]
      },
      {
        title: '学习进度',
        value: '0',
        unit: '%',
        trend: 0,
        description: '暂无数据',
        chartData: [20, 30, 40, 50, 60, 70, 80]
      }
    ])

    // 配伍记录 - 添加上这些变量
    const compatibilityRecords = ref([
      { id: 1, name: '暂无配伍记录', description: '请开始您的第一次配伍模拟', time: '-', status: 'warning' }
    ])

    // 每日提示 - 添加上这些变量
    const dailyTips = ref([
      { type: 'info', icon: 'ri-information-line', text: '欢迎使用中医智慧平台！' },
      { type: 'success', icon: 'ri-checkbox-circle-line', text: '建议先完成新手引导' },
      { type: 'warning', icon: 'ri-alert-line', text: '麻黄与桂枝存在配伍禁忌' }
    ])

    // 系统状态（暂时不用，可以注释掉）
    // const systemStatus = ref([])

    // 处理方法 - 添加这些函数
    const handleAction = (action) => {
      console.log('执行操作:', action.name)
      ElMessage.info(`正在进入${action.name}`)

      if (action.name === '开始模拟') {
        router.push('/simulation')
      } else if (action.name === '知识库') {
        router.push('/knowledge')
      } else if (action.name === '我的收藏') {
        router.push('/collection')
      } else if (action.name === '学习记录') {
        router.push('/content')
      }
    }

    const handleActivity = (activity) => {
      console.log('查看活动:', activity.title)
      ElMessage.info(`查看活动: ${activity.title}`)
    }

    const viewAllRecords = () => {
      console.log('查看所有记录')
      router.push('/records')
    }

    const viewRecordDetail = (record) => {
      console.log('查看记录详情:', record.name)
      ElMessage.info(`查看记录: ${record.name}`)
    }

    // 更新时间函数
    const updateCurrentTime = () => {
      const now = new Date()
      const hour = now.getHours().toString().padStart(2, '0')
      const minute = now.getMinutes().toString().padStart(2, '0')
      currentHourMinute.value = `${hour}:${minute}`
    }

    // 加载用户信息的简化版本（确保有数据）
    const loadUserInfo = async () => {
      try {
        // 先尝试从 API 获取
        if (userAPI && typeof userAPI.getInfo === 'function') {
          const response = await userAPI.getInfo()
          if (response.code === 200) {
            // 如果有新数据，更新 store 和 localStorage
            store.commit('setUser', response.data)
            localStorage.setItem('user', JSON.stringify(response.data))
          }
        }
      } catch (error) {
        console.warn('获取用户信息失败，使用缓存数据:', error)
        // 使用缓存的数据
      }
    }

    // 加载统计数据
    const loadStats = async () => {
      try {
        // 如果 API 可用，调用 API
        if (userAPI && typeof userAPI.getStats === 'function') {
          const response = await userAPI.getStats()
          if (response.code === 200 && response.data) {
            const statsData = response.data

            // 更新快速统计
            quickStats.value = [
              {
                label: '配伍记录',
                value: statsData.prescriptions || '0',
                icon: 'ri-book-2-line',
                color: 'rgba(232,216,185,0.3)'
              },
              {
                label: '收藏内容',
                value: statsData.favorites || '0',
                icon: 'ri-star-line',
                color: 'rgba(232,216,185,0.3)'
              },
              {
                label: '学习时长',
                value: `${statsData.learningHours || 0}小时`,
                icon: 'ri-time-line',
                color: 'rgba(232,216,185,0.3)'
              }
            ]

            // 更新数据概览
            statsOverview.value = [
              {
                title: '药材库总量',
                value: statsData.medicineCount || '0',
                unit: '种',
                trend: statsData.medicineTrend || 0,
                description: '较上月新增',
                chartData: statsData.medicineChartData || [30, 40, 50, 60, 70, 80, 90]
              },
              {
                title: '配伍成功率',
                value: statsData.compatibilityRate || '0',
                unit: '%',
                trend: statsData.rateTrend || 0,
                description: '保持稳定水平',
                chartData: statsData.rateChartData || [65, 70, 75, 80, 85, 90, 95]
              },
              {
                title: '学习进度',
                value: statsData.learningProgress || '0',
                unit: '%',
                trend: statsData.progressTrend || 0,
                description: '本周进步明显',
                chartData: statsData.progressChartData || [20, 30, 40, 50, 60, 70, 80]
              }
            ]
          }
        }
      } catch (error) {
        console.warn('加载统计数据失败:', error)
        // 保持默认值
      }
    }

    // 初始化加载数据
    const initData = async () => {
      try {
        await loadUserInfo()
        await loadStats()
      } catch (error) {
        console.error('初始化数据失败:', error)
        // 不影响页面显示
      }
    }

    // 定时器用于更新时间
    let timeInterval

    onMounted(() => {
      console.log('Dashboard 组件已加载')
      console.log('当前用户信息:', userInfo.value)

      // 检查用户是否登录
      if (!userInfo.value.user_id) {
        ElMessage.warning('请先登录')
        router.push('/login')
        return
      }

      // 初始化数据
      initData()

      // 更新时间
      updateCurrentTime()
      timeInterval = setInterval(updateCurrentTime, 60000) // 每分钟更新一次

      // 每分钟检查一次登录状态
      const checkLoginInterval = setInterval(() => {
        const token = localStorage.getItem('token')
        if (!token) {
          ElMessage.warning('登录已过期，请重新登录')
          router.push('/login')
          clearInterval(checkLoginInterval)
        }
      }, 60000)

      // 清理定时器
      return () => {
        if (timeInterval) clearInterval(timeInterval)
        if (checkLoginInterval) clearInterval(checkLoginInterval)
      }
    })

    return {
      userInfo,
      currentTime,
      currentHourMinute,
      quickStats,
      quickActions,
      recentActivities,
      statsOverview,
      compatibilityRecords,
      dailyTips,
      handleAction,
      handleActivity,
      viewAllRecords,
      viewRecordDetail
    }
  }
}
</script>

<style scoped lang="scss">
.ancient-dashboard {
  min-height: 100vh;
  background: #F9F6ED;
  padding: 20px;
  position: relative;

  .login-bg {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 0;

    .bg-texture {
      position: absolute;
      width: 100%;
      height: 100%;
      background:
          linear-gradient(135deg, #F9F6ED 0%, #F9F6ED 100%),
          url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" opacity="0.03"><rect width="100" height="100" fill="none" stroke="%235A4A27" stroke-width="1"/></svg>');
      background-size: cover, 50px 50px;
    }

    .bg-pattern {
      position: absolute;
      width: 100%;
      height: 100%;
      background-image:
          radial-gradient(circle at 20% 80%, rgba(90, 74, 39, 0.05) 0%, transparent 50%),
          radial-gradient(circle at 80% 20%, rgba(90, 74, 39, 0.05) 0%, transparent 50%);
    }

    .bg-herbs {
      position: absolute;
      width: 100%;
      height: 100%;
      background-image:
          url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" opacity="0.02"><path d="M30,20 Q50,5 70,20 T90,40 T70,60 T50,80 T30,60 T10,40 T30,20" fill="none" stroke="%235A4A27" stroke-width="1"/></svg>');
      background-size: 300px 300px;
    }
  }

  .welcome-section {
    margin-bottom: 24px;
    background: rgba(255, 255, 255, 0.8);
    border: 1px solid rgba(216, 195, 165, 0.5);
    border-radius: 16px;
    padding: 32px;
    position: relative;
    z-index: 1;
    box-shadow:
        0 8px 32px rgba(101, 67, 33, 0.08),
        inset 0 1px 0 rgba(255, 255, 255, 0.8);

    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background:
          radial-gradient(circle at 20% 80%, rgba(142, 125, 78, 0.03) 0%, transparent 50%),
          radial-gradient(circle at 80% 20%, rgba(166, 47, 0, 0.03) 0%, transparent 50%);
      border-radius: 16px;
      pointer-events: none;
    }

    .welcome-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
      position: relative;
      z-index: 1;

      @media (max-width: 768px) {
        flex-direction: column;
        gap: 20px;
        text-align: center;
      }
    }

    .user-info {
      display: flex;
      align-items: center;
      gap: 24px;

      .user-avatar {
        .avatar {
          background: linear-gradient(135deg, #8E7D4E, #A62F00);
          font-weight: 600;
          color: white;
          border: 4px solid rgba(255, 255, 255, 0.9);
          box-shadow: 0 8px 24px rgba(142, 125, 78, 0.2);
        }
      }

      .welcome-text {
        .welcome-title {
          font-size: 32px;
          font-weight: 600;
          color: #5A4A27;
          margin: 0 0 12px 0;
          line-height: 1.3;
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
        }

        .welcome-subtitle {
          font-size: 18px;
          color: #8E7D4E;
          margin: 0 0 16px 0;
          line-height: 1.4;
          opacity: 0.9;
        }

        .weather-info {
          display: flex;
          align-items: center;
          gap: 12px;
          color: #A62F00;
          font-size: 16px;
          line-height: 1.2;
          font-weight: 500;

          i {
            font-size: 20px;
            opacity: 0.9;
          }
        }
      }
    }

    .quick-stats {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 20px;

      @media (max-width: 768px) {
        grid-template-columns: repeat(3, 1fr);
        width: 100%;
      }

      @media (max-width: 480px) {
        grid-template-columns: repeat(3, 1fr);
        gap: 16px;
      }

      .stat-item {
        display: flex;
        align-items: center;
        gap: 16px;
        padding: 20px;
        background: rgba(255, 255, 255, 0.9);
        border-radius: 12px;
        border: 1px solid rgba(216, 195, 165, 0.4);
        transition: all 0.3s ease;
        min-width: 160px;
        box-shadow: 0 4px 16px rgba(142, 125, 78, 0.1);
        backdrop-filter: blur(10px);

        &:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 24px rgba(142, 125, 78, 0.15);
          border-color: rgba(142, 125, 78, 0.6);
        }

        .stat-icon {
          width: 56px;
          height: 56px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s ease;

          i {
            font-size: 24px;
            color: #8E7D4E;
            opacity: 0.9;
          }
        }

        .stat-data {
          .stat-value {
            font-size: 24px;
            font-weight: 700;
            color: #5A4A27;
            line-height: 1;
            text-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
          }

          .stat-label {
            color: #8E7D4E;
            font-size: 14px;
            margin-top: 6px;
            opacity: 0.85;
            font-weight: 500;
          }
        }
      }
    }
  }

  .dashboard-content {
    display: grid;
    grid-template-columns: 280px 1fr 300px;
    gap: 24px;
    position: relative;
    z-index: 1;

    @media (max-width: 1200px) {
      grid-template-columns: 280px 1fr;

      .right-panel {
        display: none;
      }
    }

    @media (max-width: 768px) {
      grid-template-columns: 1fr;

      .left-panel {
        display: none;
      }
    }
  }

  // 古风卡片样式 - 优雅版本
  .ancient-card {
    background: rgba(255, 255, 255, 0.85);
    border: 1px solid rgba(216, 195, 165, 0.4);
    border-radius: 16px;
    box-shadow:
        0 8px 32px rgba(101, 67, 33, 0.08),
        inset 0 1px 0 rgba(255, 255, 255, 0.8);
    position: relative;
    overflow: hidden;
    margin-bottom: 24px;
    backdrop-filter: blur(10px);
    transition: all 0.3s ease;

    &:hover {
      box-shadow:
          0 12px 40px rgba(101, 67, 33, 0.12),
          inset 0 1px 0 rgba(255, 255, 255, 0.9);
      transform: translateY(-2px);
    }

    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background:
          radial-gradient(circle at 0% 0%, rgba(142, 125, 78, 0.03) 0%, transparent 50%),
          radial-gradient(circle at 100% 100%, rgba(166, 47, 0, 0.03) 0%, transparent 50%);
      border-radius: 16px;
      pointer-events: none;
    }

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20px 24px;
      border-bottom: 1px solid rgba(216, 195, 165, 0.3);
      background: rgba(249, 246, 237, 0.6);
      position: relative;
      z-index: 1;

      h3 {
        margin: 0;
        color: #5A4A27;
        font-weight: 600;
        font-size: 18px;
        display: flex;
        align-items: center;
        gap: 12px;
        line-height: 1.4;

        i {
          font-size: 20px;
          color: #8E7D4E;
          opacity: 0.9;
        }
      }

      .more-btn {
        color: #8E7D4E;
        padding: 6px 12px;
        font-size: 13px;
        opacity: 0.85;
        border-radius: 6px;
        transition: all 0.3s ease;

        &:hover {
          color: #5A4A27;
          opacity: 1;
          background: rgba(142, 125, 78, 0.1);
        }
      }
    }
  }

  // 左侧面板
  .left-panel {
    .quick-actions {
      .actions-grid {
        padding: 20px 24px;
        display: grid;
        grid-template-columns: 1fr;
        gap: 16px;

        .action-card {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 20px;
          border: 1px solid rgba(216, 195, 165, 0.3);
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.3s ease;
          background: rgba(255, 255, 255, 0.6);
          position: relative;
          overflow: hidden;

          &::before {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(142, 125, 78, 0.05), transparent);
            transition: left 0.5s ease;
          }

          &:hover {
            border-color: #8E7D4E;
            background: rgba(255, 255, 255, 0.8);
            transform: translateX(4px);
            box-shadow: 0 4px 16px rgba(142, 125, 78, 0.1);

            &::before {
              left: 100%;
            }

            .action-icon {
              background: rgba(142, 125, 78, 0.15);
              transform: scale(1.1);

              i {
                opacity: 1;
                transform: scale(1.1);
              }
            }
          }

          .action-icon {
            width: 52px;
            height: 52px;
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            background: rgba(232, 216, 185, 0.3);
            box-shadow: 0 4px 12px rgba(142, 125, 78, 0.1);
            transition: all 0.3s ease;

            i {
              font-size: 24px;
              opacity: 0.9;
              transition: all 0.3s ease;
            }
          }

          .action-info {
            flex: 1;

            .action-name {
              display: block;
              color: #5A4A27;
              font-weight: 600;
              font-size: 16px;
              margin-bottom: 6px;
              line-height: 1.3;
            }

            .action-desc {
              display: block;
              color: #8E7D4E;
              font-size: 13px;
              opacity: 0.85;
              line-height: 1.4;
            }
          }
        }
      }
    }

    .recent-activity {
      .activity-list {
        padding: 0 24px 20px;

        .activity-item {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 16px 0;
          border-bottom: 1px solid rgba(216, 195, 165, 0.2);
          cursor: pointer;
          transition: all 0.3s ease;
          position: relative;

          &:last-child {
            border-bottom: none;
          }

          &:hover {
            background: rgba(142, 125, 78, 0.05);
            padding-left: 16px;
            padding-right: 16px;
            border-radius: 12px;
            transform: translateX(4px);

            .activity-icon {
              background: rgba(142, 125, 78, 0.2);

              i {
                opacity: 1;
                transform: scale(1.1);
              }
            }
          }

          .activity-icon {
            width: 44px;
            height: 44px;
            background: rgba(232, 216, 185, 0.3);
            border-radius: 10px;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.3s ease;

            i {
              color: #8E7D4E;
              font-size: 18px;
              opacity: 0.9;
              transition: all 0.3s ease;
            }
          }

          .activity-content {
            flex: 1;

            .activity-title {
              margin: 0 0 6px 0;
              color: #5A4A27;
              font-size: 15px;
              font-weight: 500;
              line-height: 1.4;
            }

            .activity-time {
              margin: 0;
              color: #8E7D4E;
              font-size: 13px;
              opacity: 0.85;
              line-height: 1.2;
            }
          }
        }
      }
    }
  }

  // 中间面板
  .center-panel {
    .stats-overview {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 20px;
      margin-bottom: 24px;

      @media (max-width: 768px) {
        grid-template-columns: 1fr;
      }

      .stat-card {
        background: rgba(255, 255, 255, 0.9);
        border: 1px solid rgba(216, 195, 165, 0.3);
        border-radius: 16px;
        padding: 24px;
        transition: all 0.3s ease;
        position: relative;
        overflow: hidden;

        &:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 40px rgba(142, 125, 78, 0.15);
          border-color: rgba(142, 125, 78, 0.5);
        }

        .stat-header {
          margin-bottom: 20px;

          .stat-title {
            display: flex;
            justify-content: space-between;
            align-items: center;

            h4 {
              margin: 0;
              color: #5A4A27;
              font-size: 16px;
              font-weight: 600;
              line-height: 1.4;
            }

            .trend-tag {
              border-radius: 12px;
              font-size: 12px;
              line-height: 1.2;
              padding: 4px 8px;
              font-weight: 600;
            }
          }
        }

        .stat-content {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          margin-bottom: 16px;

          .stat-main {
            .stat-number {
              font-size: 36px;
              font-weight: 700;
              color: #5A4A27;
              line-height: 1;
              text-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
            }

            .stat-unit {
              color: #8E7D4E;
              font-size: 16px;
              margin-left: 4px;
              opacity: 0.9;
              font-weight: 500;
            }
          }

          .stat-chart {
            .mini-chart {
              display: flex;
              align-items: flex-end;
              gap: 4px;
              height: 48px;
              padding: 6px;
              background: rgba(232, 216, 185, 0.3);
              border-radius: 8px;
              box-shadow: inset 0 2px 4px rgba(142, 125, 78, 0.1);

              .chart-bar {
                width: 8px;
                background: linear-gradient(to top, #8E7D4E, #A62F00);
                border-radius: 3px;
                transition: all 0.3s ease;
                min-height: 6px;
                box-shadow: 0 2px 4px rgba(142, 125, 78, 0.2);

                &:hover {
                  background: linear-gradient(to top, #A62F00, #8E7D4E);
                  transform: scaleY(1.1);
                }
              }
            }
          }
        }

        .stat-footer {
          .stat-desc {
            color: #8E7D4E;
            font-size: 13px;
            opacity: 0.85;
            line-height: 1.4;
            font-weight: 500;
          }
        }
      }
    }

    .compatibility-records {
      .records-list {
        padding: 0 24px 20px;

        .record-item {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 16px 0;
          border-bottom: 1px solid rgba(216, 195, 165, 0.2);
          cursor: pointer;
          transition: all 0.3s ease;

          &:last-child {
            border-bottom: none;
          }

          &:hover {
            background: rgba(142, 125, 78, 0.05);
            padding-left: 16px;
            padding-right: 16px;
            border-radius: 12px;
            transform: translateX(4px);
          }

          .record-icon {
            width: 40px;
            height: 40px;
            background: rgba(232, 216, 185, 0.3);
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 2px 8px rgba(142, 125, 78, 0.1);

            i {
              font-size: 18px;
              opacity: 0.9;
            }
          }

          .record-info {
            flex: 1;

            .record-name {
              display: block;
              color: #5A4A27;
              font-weight: 600;
              font-size: 15px;
              margin-bottom: 4px;
              line-height: 1.3;
            }

            .record-desc {
              display: block;
              color: #8E7D4E;
              font-size: 13px;
              opacity: 0.85;
              line-height: 1.2;
            }
          }

          .record-meta {
            display: flex;
            flex-direction: column;
            align-items: flex-end;
            gap: 6px;

            .record-time {
              color: #8E7D4E;
              font-size: 12px;
              opacity: 0.85;
              line-height: 1.2;
              font-weight: 500;
            }

            .status-tag {
              border-radius: 10px;
              font-size: 11px;
              line-height: 1.2;
              padding: 2px 8px;
              font-weight: 600;
            }
          }
        }
      }
    }
  }

  // 右侧面板
  .right-panel {
    .system-status {
      .status-list {
        padding: 20px 24px;

        .status-item {
          margin-bottom: 24px;

          .status-info {
            display: flex;
            align-items: center;
            gap: 16px;
            margin-bottom: 12px;

            .status-icon {
              width: 48px;
              height: 48px;
              background: rgba(232, 216, 185, 0.3);
              border-radius: 10px;
              display: flex;
              align-items: center;
              justify-content: center;
              box-shadow: 0 4px 12px rgba(142, 125, 78, 0.1);
              transition: all 0.3s ease;

              &:hover {
                transform: scale(1.1);
                background: rgba(142, 125, 78, 0.2);

                i {
                  opacity: 1;
                }
              }

              i {
                font-size: 20px;
                opacity: 0.9;
                transition: all 0.3s ease;
              }
            }

            .status-details {
              flex: 1;

              .status-label {
                display: block;
                color: #5A4A27;
                font-weight: 600;
                font-size: 15px;
                margin-bottom: 4px;
                line-height: 1.3;
              }

              .status-value {
                display: block;
                color: #8E7D4E;
                font-size: 13px;
                opacity: 0.85;
                line-height: 1.2;
                font-weight: 500;
              }
            }
          }

          .status-progress {
            :deep(.el-progress-bar) {
              padding-right: 0;
            }

            :deep(.el-progress-bar__inner) {
              border-radius: 6px;
              box-shadow: 0 2px 4px rgba(142, 125, 78, 0.2);
            }
          }
        }
      }
    }

    .daily-tips {
      .tips-content {
        padding: 20px 24px;

        .tip-item {
          display: flex;
          align-items: flex-start;
          gap: 16px;
          padding: 16px 0;
          border-bottom: 1px solid rgba(216, 195, 165, 0.2);

          &:last-child {
            border-bottom: none;
          }

          .tip-icon {
            width: 40px;
            height: 40px;
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
            transition: all 0.3s ease;

            &:hover {
              transform: scale(1.1);

              i {
                opacity: 1;
              }
            }

            &.success {
              background: rgba(82, 115, 77, 0.1);
              color: #52734D;
            }

            &.warning {
              background: rgba(166, 47, 0, 0.1);
              color: #A62F00;
            }

            &.info {
              background: rgba(142, 125, 78, 0.1);
              color: #8E7D4E;
            }

            i {
              font-size: 18px;
              opacity: 0.9;
              transition: all 0.3s ease;
            }
          }

          .tip-text {
            color: #8E7D4E;
            font-size: 14px;
            line-height: 1.5;
            flex: 1;
            opacity: 0.9;
            font-weight: 500;
          }
        }
      }
    }
  }
}

// 响应式设计
@media (max-width: 768px) {
  .ancient-dashboard {
    padding: 16px;

    .welcome-section {
      .welcome-content {
        .user-info {
          flex-direction: column;
          text-align: center;
        }

        .quick-stats {
          width: 100%;
        }
      }
    }

    .center-panel .stats-overview {
      grid-template-columns: 1fr;
    }
  }
}

// 动画效果
@keyframes fadeInUp {
  0% {
    opacity: 0;
    transform: translateY(20px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

.ancient-card {
  animation: fadeInUp 0.6s ease;
}
</style>