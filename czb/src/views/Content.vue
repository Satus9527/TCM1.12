<template>
  <div class="ancient-content">
    <!-- 顶部导航区 -->
    <div class="content-header">
      <div class="header-content">
        <h1 class="platform-title">个人中心</h1>
        <div class="header-actions">
          <el-button class="ancient-btn" @click="refreshData">
            <i class="ri-refresh-line"></i>
            刷新数据
          </el-button>
          <el-button type="primary" class="ancient-btn" @click="goToSimulation">
            <i class="ri-file-add-line"></i>
            新建处方
          </el-button>
        </div>
      </div>
      <p class="platform-subtitle">管理您的收藏、学习记录和个性化内容</p>
    </div>

    <div class="content-container">
      <!-- 主要内容区 -->
      <div class="main-content">
        <el-card class="ancient-card content-card">
          <div slot="header" class="card-header">
            <h3> 个性化内容</h3>
          </div>

          <el-tabs v-model="activeTab" class="content-tabs ancient-tabs">
            <el-tab-pane label="我的收藏" name="favorites">
              <div class="tab-content">
                <div v-if="favorites.length > 0" class="favorites-list">
                  <div class="favorites-grid">
                    <div
                        v-for="item in favorites"
                        :key="item.id"
                        class="favorite-item ancient-card"
                        @click="viewFavorite(item)"
                    >
                      <div class="favorite-header">
                        <h4 class="item-name">{{ item.name }}</h4>
                        <el-button
                            type="text"
                            size="small"
                            class="remove-btn"
                            @click.stop="removeFavorite(item)"
                        >
                          <i class="ri-close-line"></i>
                        </el-button>
                      </div>
                      <div class="favorite-content">
                        <p class="item-property">{{ item.property }}</p>
                        <p class="item-efficiency">{{ item.efficacy }}</p>
                      </div>
                      <div class="favorite-footer">
                        <el-tag size="small" type="success" class="ancient-tag">{{ item.categoryName }}</el-tag>
                        <span class="item-time">收藏于 {{ item.favoriteTime }}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div v-else class="empty-state">
                  <div class="empty-icon">
                    <i class="ri-star-line"></i>
                  </div>
                  <p class="empty-text">暂无收藏内容</p>
                  <p class="empty-desc">您收藏的药材和方剂将会显示在这里</p>
                  <el-button type="primary" class="ancient-btn empty-action" @click="goToKnowledge">
                    去知识库探索
                  </el-button>
                </div>
              </div>
            </el-tab-pane>

            <el-tab-pane label="学习记录" name="history">
              <div class="tab-content">
                <div v-if="learningHistory.length > 0" class="history-list">
                  <el-timeline>
                    <el-timeline-item
                        v-for="record in learningHistory"
                        :key="record.id"
                        :timestamp="record.time"
                        :type="record.type"
                    >
                      <div class="history-item ancient-card" @click="viewHistoryRecord(record)">
                        <h4>{{ record.title }}</h4>
                        <p>{{ record.description }}</p>
                        <el-tag size="small" :type="getRecordType(record.contentType)" class="ancient-tag">
                          {{ getContentTypeName(record.contentType) }}
                        </el-tag>
                      </div>
                    </el-timeline-item>
                  </el-timeline>
                </div>
                <div v-else class="empty-state">
                  <div class="empty-icon">
                    <i class="ri-time-line"></i>
                  </div>
                  <p class="empty-text">暂无学习记录</p>
                  <p class="empty-desc">您的学习历史将会记录在这里</p>
                  <el-button type="primary" class="ancient-btn empty-action" @click="goToKnowledge">
                    开始学习
                  </el-button>
                </div>
              </div>
            </el-tab-pane>

            <el-tab-pane v-if="isTeacher" label="我的上传" name="uploads">
              <div class="tab-content">
                <div class="upload-section ancient-card">
                  <div class="upload-header">
                    <h4>文件上传</h4>
                    <p class="upload-desc">支持 JPG、PNG、PDF 格式，文件大小不超过 500KB</p>
                  </div>
                  <el-upload
                      class="upload-demo"
                      action="/api/files/upload"
                      :on-success="handleUploadSuccess"
                      :on-error="handleUploadError"
                      :before-upload="beforeUpload"
                      :show-file-list="false"
                      drag
                  >
                    <div class="upload-area">
                      <i class="ri-upload-cloud-line"></i>
                      <div class="el-upload__text">
                        将文件拖到此处，或<em>点击上传</em>
                      </div>
                    </div>
                  </el-upload>
                </div>

                <div class="uploaded-files ancient-card" v-if="uploadedFiles.length > 0">
                  <div class="files-header">
                    <h4>已上传文件</h4>
                  </div>
                  <el-table :data="uploadedFiles" style="width: 100%" class="ancient-table">
                    <el-table-column prop="name" label="文件名"></el-table-column>
                    <el-table-column prop="size" label="大小" width="100"></el-table-column>
                    <el-table-column prop="date" label="上传时间" width="180"></el-table-column>
                    <el-table-column label="操作" width="120">
                      <template #default="scope">
                        <el-button type="text" size="small" class="ancient-btn" @click="downloadFile(scope.row)">下载</el-button>
                        <el-button type="text" size="small" class="ancient-btn delete-btn" @click="deleteFile(scope.row)">删除</el-button>
                      </template>
                    </el-table-column>
                  </el-table>
                </div>
              </div>
            </el-tab-pane>

            <el-tab-pane label="我的处方" name="prescriptions">
              <div class="tab-content">
                <div v-if="userPrescriptions.length > 0" class="prescriptions-list">
                  <div class="prescriptions-grid">
                    <div
                        v-for="prescription in userPrescriptions"
                        :key="prescription.id"
                        class="prescription-item ancient-card"
                        @click="viewPrescription(prescription)"
                    >
                      <div class="prescription-header">
                        <h4 class="prescription-name">{{ prescription.name }}</h4>
                        <el-tag :type="getPrescriptionScoreType(prescription.compatibilityScore)" size="small" class="ancient-tag">
                          {{ prescription.compatibilityScore }}分
                        </el-tag>
                      </div>
                      <div class="prescription-content">
                        <p class="prescription-disease">{{ prescription.mainDisease }}</p>
                        <div class="prescription-medicines">
                          <span v-for="med in prescription.medicines.slice(0, 3)" :key="med.id" class="medicine-tag ancient-tag">
                            {{ med.name }}
                          </span>
                          <span v-if="prescription.medicines.length > 3" class="more-tag">+{{ prescription.medicines.length - 3 }}</span>
                        </div>
                      </div>
                      <div class="prescription-footer">
                        <span class="prescription-date">{{ prescription.createdAt }}</span>
                        <div class="prescription-actions">
                          <el-button type="text" size="small" class="ancient-btn" @click.stop="editPrescription(prescription)">编辑</el-button>
                          <el-button type="text" size="small" class="ancient-btn delete-btn" @click.stop="deletePrescription(prescription)">删除</el-button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div v-else class="empty-state">
                  <div class="empty-icon">
                    <i class="ri-file-text-line"></i>
                  </div>
                  <p class="empty-text">暂无处方记录</p>
                  <p class="empty-desc">您创建的处方将会显示在这里</p>
                  <el-button type="primary" class="ancient-btn empty-action" @click="goToSimulation">
                    去创建处方
                  </el-button>
                </div>
              </div>
            </el-tab-pane>
          </el-tabs>
        </el-card>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useStore } from 'vuex'
import { ElMessage, ElMessageBox } from 'element-plus'

export default {
  name: 'AncientContent',
  setup() {
    const router = useRouter()
    const store = useStore()

    const activeTab = ref('favorites')
    const favorites = ref([])
    const learningHistory = ref([])
    const userPrescriptions = ref([])
    const uploadedFiles = ref([])

    const isTeacher = computed(() => {
      return store.getters.userInfo?.role === 'teacher' || store.getters.userInfo?.role === '医师'
    })

    // 加载收藏列表
    const loadFavorites = async () => {
      try {
        // 模拟数据
        favorites.value = [
          {
            id: 1,
            name: '人参',
            property: '甘、微苦，微温',
            efficacy: '大补元气，复脉固脱，补脾益肺，生津养血，安神益智',
            categoryName: '补虚药',
            favoriteTime: '2024-01-15'
          },
          {
            id: 2,
            name: '黄芪',
            property: '甘，温',
            efficacy: '补气升阳，固表止汗，利水消肿，生津养血，行滞通痹',
            categoryName: '补虚药',
            favoriteTime: '2024-01-14'
          },
          {
            id: 3,
            name: '当归',
            property: '甘、辛，温',
            efficacy: '补血活血，调经止痛，润肠通便',
            categoryName: '补血药',
            favoriteTime: '2024-01-13'
          }
        ]
      } catch (error) {
        console.error('加载收藏失败:', error)
        ElMessage.error('加载收藏失败')
      }
    }

    // 加载学习记录
    const loadLearningHistory = async () => {
      try {
        learningHistory.value = [
          {
            id: 1,
            title: '学习了人参的详细功效',
            description: '深入了解人参的大补元气作用及其临床应用',
            time: '2小时前',
            contentType: 'medicine',
            type: 'primary'
          },
          {
            id: 2,
            title: '查阅了四君子汤的配伍',
            description: '研究四君子汤的君臣佐使关系和现代应用',
            time: '1天前',
            contentType: 'prescription',
            type: 'success'
          },
          {
            id: 3,
            title: '完成了配伍分析测试',
            description: '测试了黄芪与当归的配伍效果和注意事项',
            time: '2天前',
            contentType: 'analysis',
            type: 'warning'
          }
        ]
      } catch (error) {
        console.error('加载学习记录失败:', error)
      }
    }

    // 加载用户处方
    const loadUserPrescriptions = async () => {
      try {
        userPrescriptions.value = [
          {
            id: 1,
            name: '补气养血方',
            mainDisease: '气血两虚证',
            compatibilityScore: 92,
            medicines: [
              { id: 1, name: '人参' },
              { id: 2, name: '黄芪' },
              { id: 3, name: '当归' },
              { id: 4, name: '熟地' }
            ],
            createdAt: '2024-01-15'
          },
          {
            id: 2,
            name: '清热解毒汤',
            mainDisease: '热毒内盛证',
            compatibilityScore: 85,
            medicines: [
              { id: 5, name: '金银花' },
              { id: 6, name: '连翘' },
              { id: 7, name: '黄芩' }
            ],
            createdAt: '2024-01-14'
          }
        ]
      } catch (error) {
        console.error('加载用户处方失败:', error)
        ElMessage.error('加载处方失败')
      }
    }

    // 获取内容类型名称
    const getContentTypeName = (type) => {
      const typeMap = {
        medicine: '药材',
        prescription: '方剂',
        analysis: '分析'
      }
      return typeMap[type] || '内容'
    }

    // 获取记录类型
    const getRecordType = (contentType) => {
      const typeMap = {
        medicine: 'success',
        prescription: 'primary',
        analysis: 'warning'
      }
      return typeMap[contentType] || 'info'
    }

    // 获取处方评分类型
    const getPrescriptionScoreType = (score) => {
      if (score >= 90) return 'success'
      if (score >= 80) return 'primary'
      if (score >= 70) return 'warning'
      return 'danger'
    }

    // 查看收藏
    const viewFavorite = (item) => {
      ElMessage.info(`查看收藏: ${item.name}`)
      router.push('/knowledge')
    }

    // 移除收藏
    const removeFavorite = async (item) => {
      try {
        await ElMessageBox.confirm(`确定要移除收藏 "${item.name}" 吗？`, '提示', {
          type: 'warning'
        })
        favorites.value = favorites.value.filter(fav => fav.id !== item.id)
        ElMessage.success('移除收藏成功')
      } catch (error) {
        if (error !== 'cancel') {
          ElMessage.error('移除收藏失败')
        }
      }
    }

    // 查看历史记录
    const viewHistoryRecord = (record) => {
      ElMessage.info(`查看记录: ${record.title}`)
    }

    // 查看处方
    const viewPrescription = (prescription) => {
      ElMessage.info(`查看处方: ${prescription.name}`)
    }

    // 编辑处方
    const editPrescription = (prescription) => {
      router.push(`/simulation?edit=${prescription.id}`)
    }

    // 删除处方
    const deletePrescription = async (prescription) => {
      try {
        await ElMessageBox.confirm(`确定要删除处方 "${prescription.name}" 吗？`, '提示', {
          type: 'warning'
        })
        userPrescriptions.value = userPrescriptions.value.filter(p => p.id !== prescription.id)
        ElMessage.success('删除处方成功')
      } catch (error) {
        if (error !== 'cancel') {
          ElMessage.error('删除处方失败')
        }
      }
    }

    // 文件上传处理
    const beforeUpload = (file) => {
      const isLt500K = file.size / 1024 < 500
      if (!isLt500K) {
        ElMessage.error('文件大小不能超过 500KB!')
        return false
      }
      return true
    }

    const handleUploadSuccess = (response) => {
      ElMessage.success('上传成功')
    }

    const handleUploadError = () => {
      ElMessage.error('上传失败')
    }

    const downloadFile = (file) => {
      ElMessage.info(`下载文件: ${file.name}`)
    }

    const deleteFile = async (file) => {
      try {
        await ElMessageBox.confirm(`确定要删除文件 "${file.name}" 吗？`, '提示', {
          type: 'warning'
        })
        ElMessage.success('删除文件成功')
      } catch (error) {
        if (error !== 'cancel') {
          ElMessage.error('删除文件失败')
        }
      }
    }

    // 导航方法
    const goToKnowledge = () => {
      router.push('/knowledge')
    }

    const goToSimulation = () => {
      router.push('/simulation')
    }

    const refreshData = () => {
      ElMessage.success('数据已刷新')
      loadFavorites()
      loadLearningHistory()
      loadUserPrescriptions()
    }

    // 初始化加载
    onMounted(async () => {
      await Promise.all([
        loadFavorites(),
        loadLearningHistory(),
        loadUserPrescriptions()
      ])
    })

    return {
      activeTab,
      favorites,
      learningHistory,
      userPrescriptions,
      uploadedFiles,
      isTeacher,
      viewFavorite,
      removeFavorite,
      viewHistoryRecord,
      viewPrescription,
      editPrescription,
      deletePrescription,
      beforeUpload,
      handleUploadSuccess,
      handleUploadError,
      downloadFile,
      deleteFile,
      goToKnowledge,
      goToSimulation,
      refreshData,
      getContentTypeName,
      getRecordType,
      getPrescriptionScoreType
    }
  }
}
</script>

<style scoped lang="scss">
.ancient-content {
  min-height: 100vh;
  background: #F9F6ED;
  padding: 20px;
  position: relative;

  .content-header {
    text-align: center;
    margin-bottom: 30px;
    padding: 32px;
    background: rgba(255, 255, 255, 0.8);
    border: 1px solid rgba(216, 195, 165, 0.4);
    border-radius: 16px;
    box-shadow: 0px 8px 32px rgba(101, 67, 33, 0.08);
    backdrop-filter: blur(10px);

    .header-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;

      .platform-title {
        font-size: 36px;
        font-weight: 600;
        color: #5A4A27;
        margin: 0;
        letter-spacing: 2px;
        text-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
      }

      .header-actions {
        display: flex;
        gap: 12px;
      }
    }

    .platform-subtitle {
      font-size: 16px;
      color: #8E7D4E;
      margin: 0;
      opacity: 0.9;
      font-weight: 500;
    }
  }

  .content-container {
    max-width: 1200px;
    margin: 0 auto;
  }

  .main-content {
    .content-card {
      background: rgba(255, 255, 255, 0.85);
      border: 1px solid rgba(216, 195, 165, 0.4);
      border-radius: 16px;
      box-shadow:
          0px 8px 32px rgba(101, 67, 33, 0.08),
          inset 0 1px 0 rgba(255, 255, 255, 0.8);
      position: relative;
      overflow: hidden;
      backdrop-filter: blur(10px);
      transition: all 0.3s ease;

      &:hover {
        box-shadow:
            0px 12px 40px rgba(101, 67, 33, 0.12),
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

      :deep(.el-card__header) {
        background: rgba(249, 246, 237, 0.6);
        border-bottom: 1px solid rgba(216, 195, 165, 0.3);
        padding: 24px;

        .card-header {
          h3 {
            text-indent: 10px;
            margin:2px;
            color: #5A4A27;
            font-weight: 600;
            font-size: 20px;
            line-height: 1.4;
          }
        }
      }

      :deep(.el-card__body) {
        padding: 0;
      }
    }

    .content-tabs {
      :deep(.el-tabs__header) {
        background: rgba(249, 246, 237, 0.6);
        margin: 0;
        padding: 0 24px;

        .el-tabs__nav-wrap::after {
          background-color: rgba(216, 195, 165, 0.3);
        }

        .el-tabs__active-bar {
          background: linear-gradient(90deg, #8E7D4E, #A62F00);
          height: 3px;
          border-radius: 2px;
        }

        .el-tabs__item {
          font-size: 15px;
          font-weight: 500;
          color: #8E7D4E;
          height: 56px;
          line-height: 56px;
          opacity: 0.85;
          transition: all 0.3s ease;

          &.is-active {
            color: #5A4A27;
            font-weight: 600;
            opacity: 1;
          }

          &:hover {
            color: #5A4A27;
            opacity: 1;
          }
        }
      }

      :deep(.el-tabs__content) {
        padding: 24px;
      }
    }
  }

  // 标签页内容样式
  .tab-content {
    min-height: 400px;

    .empty-state {
      text-align: center;
      padding: 80px 20px;

      .empty-icon {
        width: 96px;
        height: 96px;
        background: rgba(232, 216, 185, 0.3);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        margin: 0 auto 24px;
        box-shadow: 0 4px 16px rgba(142, 125, 78, 0.1);

        i {
          font-size: 40px;
          color: #8E7D4E;
          opacity: 0.9;
        }
      }

      .empty-text {
        font-size: 20px;
        color: #5A4A27;
        margin: 0 0 12px 0;
        font-weight: 600;
        line-height: 1.4;
      }

      .empty-desc {
        color: #8E7D4E;
        margin: 0 0 32px 0;
        opacity: 0.85;
        line-height: 1.4;
        font-size: 15px;
      }

      .empty-action {
        background: linear-gradient(135deg, #8E7D4E, #A62F00);
        border: none;
        border-radius: 12px;
        padding: 14px 32px;
        font-weight: 600;
        font-size: 15px;
        box-shadow: 0 4px 16px rgba(142, 125, 78, 0.2);
        transition: all 0.3s ease;

        &:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(142, 125, 78, 0.3);
        }
      }
    }
  }

  // 统一小卡片样式
  .small-card {
    background: rgba(255, 255, 255, 0.9);
    border: 1px solid rgba(216, 195, 165, 0.4);
    border-radius: 12px;
    padding: 20px;
    cursor: pointer;
    transition: all 0.3s ease;
    position: relative;
    overflow: hidden;
    backdrop-filter: blur(10px);

    &:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 24px rgba(142, 125, 78, 0.15);
      border-color: rgba(142, 125, 78, 0.6);
    }

    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background:
          radial-gradient(circle at 0% 0%, rgba(142, 125, 78, 0.02) 0%, transparent 50%),
          radial-gradient(circle at 100% 100%, rgba(166, 47, 0, 0.02) 0%, transparent 50%);
      border-radius: 12px;
      pointer-events: none;
    }
  }

  // 收藏列表样式
  .favorites-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 20px;

    .favorite-item {
      @extend .small-card;

      .favorite-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 16px;
        position: relative;
        z-index: 1;

        .item-name {
          margin: 0;
          color: #5A4A27;
          font-size: 18px;
          font-weight: 600;
          flex: 1;
          margin-right: 12px;
          line-height: 1.3;
        }

        .remove-btn {
          color: #8E7D4E;
          padding: 6px;
          width: 28px;
          height: 28px;
          opacity: 0.7;
          transition: all 0.3s ease;
          background: rgba(255, 255, 255, 0.8);
          border-radius: 6px;

          &:hover {
            color: #A62F00;
            opacity: 1;
            background: rgba(166, 47, 0, 0.1);
            transform: scale(1.1);
          }
        }
      }

      .favorite-content {
        margin-bottom: 16px;
        position: relative;
        z-index: 1;

        .item-property {
          color: #A62F00;
          font-size: 14px;
          font-weight: 600;
          margin: 0 0 8px 0;
          line-height: 1.4;
          display: flex;
          align-items: center;
          gap: 6px;

          &::before {
            content: '';
            font-size: 12px;
          }
        }

        .item-efficiency {
          color: #8E7D4E;
          font-size: 13px;
          margin: 0;
          line-height: 1.5;
          opacity: 0.9;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      }

      .favorite-footer {
        display: flex;
        justify-content: space-between;
        align-items: center;
        position: relative;
        z-index: 1;

        .item-time {
          color: #8E7D4E;
          font-size: 12px;
          opacity: 0.8;
          font-weight: 500;
          display: flex;
          align-items: center;
          gap: 4px;

          &::before {
            content: '🕒';
            font-size: 10px;
          }
        }
      }
    }
  }

  // 学习记录样式
  .history-list {
    :deep(.el-timeline) {
      padding-left: 0;

      .el-timeline-item {
        padding-bottom: 24px;

        .el-timeline-item__timestamp {
          color: #8E7D4E;
          font-size: 13px;
          font-weight: 500;
          opacity: 0.85;
          display: flex;
          align-items: center;
          gap: 6px;

          &::before {
            content: '';
            font-size: 11px;
          }
        }

        .history-item {
          @extend .small-card;
          padding: 18px 20px;

          &:hover {
            transform: translateX(8px) translateY(-2px);
          }

          h4 {
            margin: 0 0 10px 0;
            color: #5A4A27;
            font-size: 16px;
            font-weight: 600;
            line-height: 1.4;
            display: flex;
            align-items: center;
            gap: 8px;

            &::before {
              content: '';
              font-size: 14px;
            }
          }

          p {
            margin: 0 0 12px 0;
            color: #8E7D4E;
            font-size: 14px;
            line-height: 1.5;
            opacity: 0.9;
            padding-left: 22px;
          }
        }
      }
    }
  }

  // 上传区域样式
  .upload-section {
    @extend .small-card;
    margin-bottom: 24px;

    .upload-header {
      margin-bottom: 20px;
      position: relative;
      z-index: 1;

      h4 {
        margin: 0 0 8px 0;
        color: #5A4A27;
        font-size: 18px;
        font-weight: 600;
        line-height: 1.4;
        display: flex;
        align-items: center;
        gap: 8px;

        &::before {
          content: '';
          font-size: 16px;
        }
      }

      .upload-desc {
        margin: 0;
        color: #8E7D4E;
        font-size: 14px;
        opacity: 0.85;
        line-height: 1.4;
        padding-left: 26px;
      }
    }

    :deep(.upload-demo) {
      .el-upload {
        width: 100%;

        .el-upload-dragger {
          width: 100%;
          background: rgba(232, 216, 185, 0.2);
          border: 2px dashed rgba(142, 125, 78, 0.4);
          border-radius: 12px;
          transition: all 0.3s ease;
          position: relative;
          z-index: 1;

          &:hover {
            border-color: #8E7D4E;
            background: rgba(232, 216, 185, 0.3);
            transform: translateY(-2px);
          }

          .upload-area {
            padding: 48px 20px;

            .ri-upload-cloud-line {
              font-size: 56px;
              color: #8E7D4E;
              margin-bottom: 20px;
              opacity: 0.9;
            }

            .el-upload__text {
              color: #8E7D4E;
              font-size: 15px;
              line-height: 1.4;

              em {
                color: #A62F00;
                font-style: normal;
                font-weight: 600;
              }
            }
          }
        }
      }
    }
  }

  .uploaded-files {
    @extend .small-card;

    .files-header {
      margin-bottom: 20px;
      position: relative;
      z-index: 1;

      h4 {
        margin: 0;
        color: #5A4A27;
        font-size: 18px;
        font-weight: 600;
        line-height: 1.4;
        display: flex;
        align-items: center;
        gap: 8px;

        &::before {
          content: '📁';
          font-size: 16px;
        }
      }
    }

    :deep(.ancient-table) {
      background: transparent;
      position: relative;
      z-index: 1;

      .el-table__header,
      .el-table__body {
        background: transparent;
      }

      th {
        background: rgba(232, 216, 185, 0.3);
        color: #5A4A27;
        font-weight: 600;
        border-bottom: 1px solid rgba(216, 195, 165, 0.4);
      }

      td {
        border-bottom: 1px solid rgba(216, 195, 165, 0.2);
        color: #8E7D4E;
      }

      .el-button {
        font-weight: 500;
        transition: all 0.3s ease;

        &.delete-btn {
          color: #A62F00;

          &:hover {
            color: #c2410c;
            background: rgba(166, 47, 0, 0.1);
            transform: scale(1.05);
          }
        }

        &:not(.delete-btn):hover {
          background: rgba(142, 125, 78, 0.1);
          transform: scale(1.05);
        }
      }
    }
  }

  // 处方列表样式
  .prescriptions-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
    gap: 20px;

    .prescription-item {
      @extend .small-card;

      .prescription-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 16px;
        position: relative;
        z-index: 1;

        .prescription-name {
          margin: 0;
          color: #5A4A27;
          font-size: 18px;
          font-weight: 600;
          flex: 1;
          margin-right: 16px;
          line-height: 1.3;
          display: flex;
          align-items: center;
          gap: 8px;

          &::before {
            content: '';
            font-size: 16px;
          }
        }
      }

      .prescription-content {
        margin-bottom: 16px;
        position: relative;
        z-index: 1;

        .prescription-disease {
          color: #A62F00;
          font-size: 15px;
          font-weight: 600;
          margin: 0 0 16px 0;
          line-height: 1.4;
          display: flex;
          align-items: center;
          gap: 6px;

          &::before {
            content: '';
            font-size: 14px;
          }
        }

        .prescription-medicines {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;

          .medicine-tag {
            background: rgba(232, 216, 185, 0.3);
            color: #5A4A27;
            border: 1px solid rgba(142, 125, 78, 0.3);
            font-size: 12px;
            padding: 4px 8px;
            border-radius: 6px;
            font-weight: 500;
            transition: all 0.3s ease;

            &:hover {
              background: rgba(142, 125, 78, 0.2);
              transform: translateY(-1px);
            }
          }

          .more-tag {
            color: #8E7D4E;
            font-size: 12px;
            align-self: center;
            opacity: 0.8;
            font-weight: 500;
          }
        }
      }

      .prescription-footer {
        display: flex;
        justify-content: space-between;
        align-items: center;
        position: relative;
        z-index: 1;

        .prescription-date {
          color: #8E7D4E;
          font-size: 13px;
          opacity: 0.8;
          font-weight: 500;
          display: flex;
          align-items: center;
          gap: 4px;

          &::before {
            content: '🕗';
            font-size: 11px;
          }
        }

        .prescription-actions {
          .el-button {
            font-size: 13px;
            padding: 6px 12px;
            font-weight: 500;
            transition: all 0.3s ease;

            &.delete-btn {
              color: #A62F00;

              &:hover {
                color: #c2410c;
                background: rgba(166, 47, 0, 0.1);
                transform: scale(1.05);
              }
            }

            &:not(.delete-btn):hover {
              background: rgba(142, 125, 78, 0.1);
              transform: scale(1.05);
            }
          }
        }
      }
    }
  }
}

// 古风标签样式
.ancient-tag {
  background: rgba(232, 216, 185, 0.3);
  color: #5A4A27;
  border: 1px solid rgba(142, 125, 78, 0.3);
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  padding: 4px 8px;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(142, 125, 78, 0.2);
    transform: translateY(-1px);
  }
}

// 古风按钮样式
.ancient-btn {
  border-radius: 8px;
  transition: all 0.3s ease;
  font-weight: 500;
  position: relative;
  overflow: hidden;

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
    background: linear-gradient(135deg, #8E7D4E, #A62F00);
    border: none;
    color: #F9F6ED;
    box-shadow: 0 4px 16px rgba(142, 125, 78, 0.2);

    &:hover {
      background: linear-gradient(135deg, #A62F00, #8E7D4E);
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(142, 125, 78, 0.3);
    }
  }

  &:not(.el-button--primary) {
    background: rgba(255, 255, 255, 0.9);
    border: 1px solid rgba(216, 195, 165, 0.4);
    color: #5A4A27;

    &:hover {
      background: rgba(232, 216, 185, 0.3);
      border-color: #8E7D4E;
      transform: translateY(-1px);
      box-shadow: 0 2px 8px rgba(142, 125, 78, 0.1);
    }
  }

  &.el-button--text {
    background: transparent;
    color: #8E7D4E;

    &:hover {
      background: rgba(142, 125, 78, 0.1);
      color: #5A4A27;
      transform: none;
      box-shadow: none;
    }
  }
}

// 响应式设计
@media (max-width: 768px) {
  .ancient-content {
    padding: 16px;

    .content-header {
      .header-content {
        flex-direction: column;
        gap: 20px;

        .platform-title {
          font-size: 28px;
        }
      }
    }

    .favorites-grid,
    .prescriptions-grid {
      grid-template-columns: 1fr;
    }

    .main-content .content-tabs :deep(.el-tabs__content) {
      padding: 20px;
    }

    .small-card {
      padding: 16px;
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

@keyframes shimmer {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}

.ancient-card {
  animation: fadeInUp 0.6s ease;
}

.small-card {
  animation: fadeInUp 0.4s ease;
}
</style>