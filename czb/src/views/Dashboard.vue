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
import { ElMessage } from 'element-plus'
import { userAPI } from '@/api/user'
import { prescriptionAPI } from '@/api/prescription'

export default {
  name: 'AncientDashboard',
  setup() {
    const router = useRouter()

    // 用户信息
    const userInfo = ref({
      name: '',
      avatar: '',
      role: ''
    })

    // 当前时间
    const currentTime = ref('')

    // 快捷操作
    const quickActions = ref([
      { name: '智能配伍', desc: '创建新处方', icon: 'ri-cpu-line', color: '#8E7D4E', route: '/simulation' },
      { name: '知识库', desc: '查阅药材信息', icon: 'ri-book-2-line', color: '#8E7D4E', route: '/knowledge' },
      { name: '个人中心', desc: '管理个人内容', icon: 'ri-user-line', color: '#8E7D4E', route: '/content' },
      { name: '学习记录', desc: '查看学习历史', icon: 'ri-time-line', color: '#8E7D4E', route: '/content' }
    ])

    // 快速统计
    const quickStats = ref([])

    // 最近活动
    const recentActivities = ref([])

    // 数据概览
    const statsOverview = ref([])

    // 配伍记录
    const compatibilityRecords = ref([])

    // 系统状态
    const systemStatus = ref([])

    // 今日提示
    const dailyTips = ref([])

    // 更新时间
    const updateTime = () => {
      const now = new Date()
      currentTime.value = now.toLocaleTimeString('zh-CN', {
        hour: '2-digit',
        minute: '2-digit'
      })
    }

    // 获取用户信息
    const getUserInfo = async () => {
      try {
        // 从localStorage获取用户信息
        const storedInfo = localStorage.getItem('user-info')
        if (storedInfo) {
          userInfo.value = JSON.parse(storedInfo)
        } else {
          // 如果没有，尝试从API获取
          const result = await userAPI.getUserInfo()
          if (result && result.code === 200) {
            userInfo.value = result.data
            localStorage.setItem('user-info', JSON.stringify(result.data))
          }
        }
      } catch (error) {
        console.error('获取用户信息失败:', error)
        // 使用默认值
        userInfo.value = {
          name: '张仲景',
          avatar: '',
          role: '主任医师'
        }
      }
    }

    // 加载数据（模拟环境下使用模拟数据）
    const loadRealData = async () => {
      try {
        // 获取用户信息
        await getUserInfo()

        // 模拟环境：直接使用模拟数据，避免真实API请求
        console.log('使用模拟数据加载仪表盘数据')

        // 模拟统计数据
        const statsData = {
          prescriptions: 140,
          favorites: 0,
          learningHours: 0,
          medicineCount: 56,
          medicineTrend: 12,
          compatibilityRate: 85,
          rateTrend: 5,
          learningProgress: 0,
          progressTrend: 5,
          medicineChartData: [60, 80, 70, 90, 85, 75, 95, 80, 90, 75, 85, 90],
          rateChartData: [75, 80, 78, 82, 80, 75, 78, 80, 82, 85, 82, 80],
          progressChartData: [10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65]
        }

        // 构建快速统计
        quickStats.value = [
          { label: '配伍记录', value: statsData.prescriptions.toString(), icon: 'ri-book-2-line', color: 'rgba(232,216,185,0.3)' },
          { label: '收藏内容', value: statsData.favorites.toString(), icon: 'ri-star-line', color: 'rgba(232,216,185,0.3)' },
          { label: '学习时长', value: `${Math.floor(statsData.learningHours / 60)}小时`, icon: 'ri-time-line', color: 'rgba(232,216,185,0.3)' }
        ]

        // 构建数据概览
        statsOverview.value = [
          {
            title: '药材库总量',
            value: statsData.medicineCount.toString(),
            unit: '种',
            trend: statsData.medicineTrend,
            description: '较上月新增7种',
            chartData: statsData.medicineChartData
          },
          {
            title: '配伍成功率',
            value: statsData.compatibilityRate.toString(),
            unit: '%',
            trend: statsData.rateTrend,
            description: '保持稳定水平',
            chartData: statsData.rateChartData
          },
          {
            title: '学习进度',
            value: statsData.learningProgress.toString(),
            unit: '%',
            trend: statsData.progressTrend,
            description: '本周进步明显',
            chartData: statsData.progressChartData
          }
        ]

        // 模拟配伍记录
        compatibilityRecords.value = [
          { id: 1, name: '补气养血方', description: '益气补血，调理身体', time: '2024-01-15', status: 'success' },
          { id: 2, name: '清热解毒汤', description: '清热祛湿，解毒消肿', time: '2024-01-14', status: 'warning' },
          { id: 3, name: '安神助眠散', description: '安神定志，改善睡眠', time: '2024-01-13', status: 'success' }
        ]

        // 模拟最近活动
        recentActivities.value = [
          { id: 1, title: '查看了人参详情', time: '2小时前', icon: 'ri-search-line', route: '/knowledge' },
          { id: 2, title: '创建了新处方', time: '1天前', icon: 'ri-file-text-line', route: '/simulation' },
          { id: 3, title: '收藏了黄芪', time: '2天前', icon: 'ri-star-line', route: '/knowledge' }
        ]

        // 系统状态
        systemStatus.value = [
          { label: '药材库', value: '286 种', percentage: 85, icon: 'ri-database-2-line', color: '#8E7D4E' },
          { label: '配伍规则', value: '1,248 条', percentage: 92, icon: 'ri-settings-4-line', color: '#8E7D4E' },
          { label: '学习资源', value: '156 个', percentage: 78, icon: 'ri-book-open-line', color: '#8E7D4E' }
        ]

        // 模拟今日提示
        dailyTips.value = [
          { type: 'success', icon: 'ri-sun-line', text: '今日宜研究补气类药材配伍' },
          { type: 'warning', icon: 'ri-moon-line', text: '注意：孕妇慎用活血化瘀药材' },
          { type: 'info', icon: 'ri-star-line', text: '推荐学习：四君子汤的现代应用' }
        ]

      } catch (error) {
        console.error('加载数据失败:', error)
        ElMessage.error('加载数据失败')
      }
    }

    // 处理方法
    const handleAction = (action) => {
      if (action.route) {
        router.push(action.route)
      }
    }

    const handleActivity = (activity) => {
      if (activity.route) {
        router.push(activity.route)
      }
    }

    const viewAllRecords = () => {
      router.push('/simulation')
    }

    const viewRecordDetail = (record) => {
      ElMessage.info(`查看记录: ${record.name}`)
    }

    // 生命周期
    onMounted(() => {
      updateTime()
      loadRealData()

      const timer = setInterval(updateTime, 60000)

      return () => {
        clearInterval(timer)
      }
    })

    return {
      userInfo,
      currentTime,
      quickStats,
      quickActions,
      recentActivities,
      statsOverview,
      compatibilityRecords,
      systemStatus,
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