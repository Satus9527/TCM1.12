<template>
  <div class="ancient-knowledge-base">
    <!-- 顶部导航区 -->
    <div class="knowledge-header">
      <div class="header-content">
        <h1 class="platform-title">本草纲目</h1>
        <div class="header-actions">
          <el-button class="ancient-btn" type="primary" @click="showFavorites">
            <i class="el-icon-collection"></i>
            我的收藏
          </el-button>
          <el-button class="ancient-btn" @click="showLearningHistory">
            <i class="el-icon-notebook-2"></i>
            学习记录
          </el-button>
        </div>
      </div>
      <p class="platform-subtitle">探索中医药智慧，传承千年文化</p>
    </div>

    <div class="knowledge-container">
      <!-- 左侧分类导航 -->
      <div class="sidebar-navigation">
        <div class="nav-scroll">
          <!-- 分类标题 -->
          <div class="nav-category">
            <h3 class="category-title">知识分类</h3>
            <div class="nav-items">
              <div
                  v-for="category in categories"
                  :key="category.id"
                  :class="['nav-item', { active: activeCategory === category.id }]"
                  @click="handleCategoryChange(category.id)"
              >
                <i :class="category.icon"></i>
                <span>{{ category.name }}</span>
                <span class="item-count">{{ category.count }}</span>
              </div>
            </div>
          </div>

          <!-- 最近查阅 -->
          <div class="nav-category">
            <h3 class="category-title">最近查阅</h3>
            <div class="recent-items">
              <div
                  v-for="item in recentItems"
                  :key="item.id"
                  class="recent-item"
                  @click="viewItem(item)"
              >
                <span class="item-name">{{ item.name }}</span>
                <span class="item-time">{{ item.time }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 主内容区 -->
      <div class="main-content">
        <!-- 高级搜索区 -->
        <div class="advanced-search ancient-card">
          <div class="card-header">
            <h3>高级搜索</h3>
            <div class="search-tips">
              <i class="el-icon-info"></i>
              <span>支持多维度药材筛选</span>
            </div>
          </div>

          <div class="search-form">
            <el-row :gutter="16">
              <el-col :span="8">
                <div class="search-field">
                  <label>关键词</label>
                  <el-input
                      v-model="searchForm.keyword"
                      placeholder="输入药材名称、性味、功效或归经..."
                      prefix-icon="el-icon-search"
                      class="ancient-input"
                      @keyup.enter="handleSearch"
                  ></el-input>
                </div>
              </el-col>
              <el-col :span="6">
                <div class="search-field">
                  <label>药材分类</label>
                  <el-select
                      v-model="searchForm.category"
                      placeholder="请选择分类..."
                      class="ancient-select"
                      @change="handleSearch"
                  >
                    <el-option label="全部" value="all"></el-option>
                    <el-option
                        v-for="cat in categories"
                        :key="cat.id"
                        :label="cat.name"
                        :value="cat.id"
                    ></el-option>
                  </el-select>
                </div>
              </el-col>
              <el-col :span="5">
                <div class="search-field">
                  <label>排序方式</label>
                  <el-select
                      v-model="searchForm.sort"
                      placeholder="排序方式"
                      class="ancient-select"
                      @change="handleSearch"
                  >
                    <el-option label="默认排序" value="default"></el-option>
                    <el-option label="按名称排序" value="name"></el-option>
                    <el-option label="按分类排序" value="category"></el-option>
                  </el-select>
                </div>
              </el-col>
            </el-row>

            <div class="search-actions">
              <el-button type="primary" class="ancient-btn search-btn" @click="handleSearch" :loading="searchLoading">
                <i class="el-icon-search"></i>
                搜索
              </el-button>
              <el-button class="ancient-btn" @click="resetSearch">
                <i class="el-icon-refresh"></i>
                重置
              </el-button>
            </div>
          </div>
        </div>

        <!-- 药材库 -->
        <div class="medicine-library ancient-card">
          <div class="card-header">
            <h3>药材库</h3>
            <div class="library-stats">
              <span>共 {{ totalMedicines }} 种药材</span>
              <el-pagination
                  small
                  layout="prev, pager, next"
                  :total="totalMedicines"
                  :page-size="pageSize"
                  v-model:current-page="currentPage"
                  @current-change="handlePageChange"
              ></el-pagination>
            </div>
          </div>

          <div class="medicine-grid">
            <div
                v-for="medicine in (medicines || [])"
                :key="medicine.id"
                class="medicine-card"
                @click="viewMedicineDetail(medicine)"
            >
              <div class="medicine-header">
                <h4 class="medicine-name">{{ medicine.name }}</h4>
                <span class="medicine-latin">{{ medicine.latinName }}</span>
              </div>

              <div class="medicine-properties">
                <div class="property-row">
                  <span class="property-label">性味：</span>
                  <span class="property-value">{{ medicine.property }}</span>
                </div>
                <div class="property-row">
                  <span class="property-label">归经：</span>
                  <span class="property-value">{{ medicine.meridian }}</span>
                </div>
                <div class="property-row">
                  <span class="property-label">功效：</span>
                  <span class="property-value">{{ medicine.efficacy }}</span>
                </div>
              </div>

              <div class="medicine-footer">
                <el-tag
                    :type="medicine.toxicity === '无毒' ? 'success' : 'warning'"
                    size="small"
                    class="toxicity-tag"
                >
                  {{ medicine.toxicity }}
                </el-tag>
                <div class="medicine-actions">
                  <el-button
                      type="text"
                      size="small"
                      @click.stop="toggleFavorite(medicine)"
                      class="action-btn"
                  >
                    <i :class="medicine.favorite ? 'el-icon-star-on' : 'el-icon-star-off'"></i>
                  </el-button>
                </div>
              </div>
            </div>
          </div>

          <!-- 加载状态 -->
          <div v-if="searchLoading" class="loading-state">
            <el-skeleton :rows="3" animated />
          </div>

          <!-- 空状态 -->
          <div v-if="!searchLoading && (!medicines || medicines.length === 0)" class="empty-state">
            <div class="empty-icon">
              <i class="el-icon-search"></i>
            </div>
            <p class="empty-text">未找到相关药材</p>
            <p class="empty-desc">请尝试调整搜索条件</p>
          </div>
        </div>
      </div>
    </div>

    <el-dialog
        v-model="detailVisible"
        :title="selectedMedicine ? selectedMedicine.name : '药材详情'"
        width="700px"
        class="ancient-dialog"
    >
      <div v-if="selectedMedicine" class="medicine-detail">
        <div class="detail-content">
          <!-- 顶部基本信息 -->
          <div class="detail-header">
            <div class="medicine-title">
              <h2>{{ selectedMedicine.name }}</h2>
              <p class="latin-name">{{ selectedMedicine.latinName }}</p>
            </div>
            <div class="header-actions">
              <el-button
                  type="text"
                  @click="toggleFavorite(selectedMedicine)"
                  class="favorite-btn"
                  :class="{ 'is-favorite': selectedMedicine.favorite }"
              >
                <i :class="selectedMedicine.favorite ? 'el-icon-star-on' : 'el-icon-star-off'"></i>
                {{ selectedMedicine.favorite ? '已收藏' : '收藏' }}
              </el-button>
            </div>
          </div>

          <!-- 详细信息 -->
          <div class="detail-body">
            <div class="detail-grid">
              <!-- 左侧基本信息 -->
              <div class="detail-section">
                <h3 class="section-title">基本信息</h3>
                <div class="property-list">
                  <div class="property-item">
                    <span class="property-label">性味：</span>
                    <span class="property-value">{{ selectedMedicine.property }}</span>
                  </div>
                  <div class="property-item">
                    <span class="property-label">归经：</span>
                    <span class="property-value">{{ selectedMedicine.meridian }}</span>
                  </div>
                  <div class="property-item">
                    <span class="property-label">毒性：</span>
                    <el-tag
                        :type="selectedMedicine.toxicity === '无毒' ? 'success' : 'warning'"
                        size="small"
                    >
                      {{ selectedMedicine.toxicity }}
                    </el-tag>
                  </div>
                  <div class="property-item">
                    <span class="property-label">分类：</span>
                    <span class="property-value">{{ selectedMedicine.category || '未分类' }}</span>
                  </div>
                </div>
              </div>

              <!-- 右侧剂量信息 -->
              <div class="detail-section">
                <h3 class="section-title">用量信息</h3>
                <div class="property-list">
                  <div class="property-item">
                    <span class="property-label">建议剂量：</span>
                    <span class="property-value">{{ selectedMedicine.suggestedDosage || '3-10' }}克</span>
                  </div>
                  <div class="property-item">
                    <span class="property-label">最大剂量：</span>
                    <span class="property-value">{{ selectedMedicine.maxDosage || '15' }}克</span>
                  </div>
                  <div class="property-item">
                    <span class="property-label">用法：</span>
                    <span class="property-value">{{ selectedMedicine.usage || '煎服' }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- 功效主治 -->
            <div class="detail-section full-width">
              <h3 class="section-title">功效主治</h3>
              <div class="efficacy-content">
                <div v-if="selectedMedicine.mainEffects" class="effects-tags">
                  <el-tag
                      v-for="effect in selectedMedicine.mainEffects"
                      :key="effect"
                      type="info"
                      size="small"
                      class="effect-tag"
                  >
                    {{ effect }}
                  </el-tag>
                </div>
                <div v-else-if="selectedMedicine.efficacy" class="effects-tags">
                  <!-- 如果没有mainEffects，则将efficacy按顿号分割为标签显示 -->
                  <el-tag
                      v-for="(effect, index) in selectedMedicine.efficacy.split('、')"
                      :key="index"
                      type="info"
                      size="small"
                      class="effect-tag"
                  >
                    {{ effect }}
                  </el-tag>
                </div>
              </div>
            </div>

            <!-- 临床应用 -->
            <div v-if="selectedMedicine.clinicalApplications" class="detail-section full-width">
              <h3 class="section-title">临床应用</h3>
              <div class="clinical-content">
                <ul class="application-list">
                  <li
                      v-for="application in selectedMedicine.clinicalApplications"
                      :key="application"
                      class="application-item"
                  >
                    {{ application }}
                  </li>
                </ul>
              </div>
            </div>

            <!-- 配伍禁忌 -->
            <div v-if="selectedMedicine.contraindications" class="detail-section full-width">
              <h3 class="section-title">配伍禁忌</h3>
              <div class="contraindications-content">
                <ul class="contraindications-list">
                  <li
                      v-for="contra in selectedMedicine.contraindications"
                      :key="contra"
                      class="contraindications-item"
                  >
                    {{ contra }}
                  </li>
                </ul>
              </div>
            </div>

            <!-- 现代研究 -->
            <div v-if="selectedMedicine.modernResearch" class="detail-section full-width">
              <h3 class="section-title">现代研究</h3>
              <div class="research-content">
                <p>{{ selectedMedicine.modernResearch }}</p>
              </div>
            </div>
          </div>

          <!-- 底部操作按钮 -->
          <div class="detail-footer">
            <el-button type="primary" class="ancient-btn" @click="addToPrescription(selectedMedicine)">
              <i class="el-icon-document-add"></i>
              加入处方
            </el-button>
            <el-button class="ancient-btn" @click="detailVisible = false">
              <i class="el-icon-close"></i>
              关闭
            </el-button>
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { userAPI } from '@/api/user'
import { medicineAPI } from '@/api/medicine'
import { prescriptionAPI } from '@/api/prescription'

// 添加 MedicineDetail 组件定义
const MedicineDetail = {
  props: ['medicine'],
  template: `
    <div class="medicine-detail">
      <div v-if="medicine" class="detail-content">
        <div class="detail-header">
          <h3>{{ medicine.name }}</h3>
          <span class="latin-name">{{ medicine.latinName }}</span>
        </div>
        <div class="detail-properties">
          <div class="property-group">
            <h4>基本信息</h4>
            <div class="property-item">
              <span>性味：</span>
              <span>{{ medicine.property }}</span>
            </div>
            <div class="property-item">
              <span>归经：</span>
              <span>{{ medicine.meridian }}</span>
            </div>
            <div class="property-item">
              <span>毒性：</span>
              <el-tag :type="medicine.toxicity === '无毒' ? 'success' : 'warning'">
                {{ medicine.toxicity }}
              </el-tag>
            </div>
            <div class="property-item">
              <span>建议剂量：</span>
              <span>{{ medicine.suggestedDosage }}克</span>
            </div>
            <div class="property-item">
              <span>最大剂量：</span>
              <span>{{ medicine.maxDosage }}克</span>
            </div>
          </div>
          <div class="property-group">
            <h4>功效主治</h4>
            <p>{{ medicine.efficacy }}</p>
          </div>
          <div v-if="medicine.contraindications && medicine.contraindications.length" class="property-group">
            <h4>禁忌</h4>
            <ul>
              <li v-for="contra in medicine.contraindications" :key="contra">{{ contra }}</li>
            </ul>
          </div>
          <div v-if="medicine.usage_notes" class="property-group">
            <h4>用法说明</h4>
            <p>{{ medicine.usage_notes }}</p>
          </div>
          <div v-if="medicine.modernResearch" class="property-group">
            <h4>现代研究</h4>
            <p>{{ medicine.modernResearch }}</p>
          </div>
        </div>
        <div class="detail-actions">
          <el-button type="primary" @click="$emit('add-to-prescription', medicine)">
            加入处方
          </el-button>
          <el-button @click="$emit('close')">关闭</el-button>
        </div>
      </div>
    </div>
  `
}
// 响应式数据
const activeCategory = ref('all')
const searchForm = reactive({
  keyword: '',
  category: 'all',
  sort: 'default'
})
const currentPage = ref(1)
const pageSize = ref(12)
const totalMedicines = ref(0)
const detailVisible = ref(false)
const selectedMedicine = ref(null)
const searchLoading = ref(false)

// 数据
const categories = ref([])
const medicines = ref([])
const recentItems = ref([])

// 方法 - 保持原有的API调用不变
const loadCategories = async () => {
  try {
    const result = await medicineAPI.getCategories()
    // 适配后端返回格式 (code: 200, data: [...])
    if (result && result.code === 200) {
      categories.value = result.data || []
    } else {
      categories.value = []
      console.error('分类数据格式错误:', result)
    }
  } catch (error) {
    console.error('加载分类失败:', error)
    ElMessage.error('加载分类失败')
  }
}

const loadMedicines = async () => {
  searchLoading.value = true
  try {
    const params = {
      search: searchForm.keyword,
      category: searchForm.category === 'all' ? '' : searchForm.category,
      page: currentPage.value,
      limit: pageSize.value,
      sortBy: 'created_at', // 默认按创建时间排序
      sortOrder: 'DESC' // 默认降序排序
    }

    const result = await medicineAPI.search(params)
    // 添加完整的数据结构检查 - 适配后端返回格式 (code: 200, data: [...], pagination: {...})
    if (result && result.code === 200) {
      medicines.value = result.data || []
      totalMedicines.value = result.pagination?.total || 0
    } else {
      medicines.value = []
      totalMedicines.value = 0
      console.error('药材数据格式错误:', result)
    }
  } catch (error) {
    console.error('搜索药材失败:', error)
    ElMessage.error('搜索失败')
    medicines.value = []
    totalMedicines.value = 0
  } finally {
    searchLoading.value = false
  }
}

const handleSearch = () => {
  currentPage.value = 1
  loadMedicines()
}

const handleCategoryChange = (categoryId) => {
  activeCategory.value = categoryId
  searchForm.category = categoryId
  handleSearch()
}

const handlePageChange = (page) => {
  currentPage.value = page
  loadMedicines()
}

const resetSearch = () => {
  searchForm.keyword = ''
  searchForm.category = 'all'
  searchForm.sort = 'default'
  activeCategory.value = 'all'
  currentPage.value = 1
  loadMedicines()
}

const viewMedicineDetail = async (medicine) => {
  try {
    const result = await medicineAPI.getDetail(medicine.id)
    // 适配后端返回格式 (code: 200, data: {...})
    if (result && result.code === 200) {
      selectedMedicine.value = result.data
      detailVisible.value = true

      // 添加到最近查阅
      addToRecent(medicine)
    } else {
      console.error('药材详情数据格式错误:', result)
      ElMessage.error('获取详情失败')
    }
  } catch (error) {
    console.error('获取药材详情失败:', error)
    ElMessage.error('获取详情失败')
  }
}

const toggleFavorite = async (medicine) => {
  try {
    await medicineAPI.toggleFavorite(medicine.id)
    medicine.favorite = !medicine.favorite
    ElMessage.success(medicine.favorite ? '已收藏' : '已取消收藏')
  } catch (error) {
    console.error('收藏操作失败:', error)
    ElMessage.error('操作失败')
  }
}

const addToRecent = (medicine) => {
  const existingIndex = recentItems.value.findIndex(item => item.id === medicine.id)
  if (existingIndex > -1) {
    recentItems.value.splice(existingIndex, 1)
  }

  recentItems.value.unshift({
    id: medicine.id,
    name: medicine.name,
    time: '刚刚'
  })

  // 只保留最近5个
  if (recentItems.value.length > 5) {
    recentItems.value = recentItems.value.slice(0, 5)
  }
}

const addToPrescription = (medicine) => {
  ElMessage.success(`已将 ${medicine.name} 加入处方`)
  detailVisible.value = false
}

const showFavorites = async () => {
  try {
    const result = await userAPI.getFavorites()
    medicines.value = result.data
    totalMedicines.value = result.data.length
    activeCategory.value = 'favorites'
    ElMessage.success('显示收藏列表')
  } catch (error) {
    console.error('获取收藏列表失败:', error)
    ElMessage.error('获取收藏列表失败')
  }
}

const showLearningHistory = () => {
  ElMessage.info('学习记录功能开发中')
}

const viewItem = (item) => {
  const medicine = medicines.value.find(m => m.id === item.id)
  if (medicine) {
    viewMedicineDetail(medicine)
  }
}

// 初始化
onMounted(() => {
  loadCategories()
  loadMedicines()
})
</script>

<style scoped lang="scss">
.ancient-knowledge-base {
  min-height: 100vh;
  background:
      linear-gradient(135deg, #f9f3e9 0%, #f5e6d3 100%),
      url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" opacity="0.03"><rect width="100" height="100" fill="none" stroke="%238B4513" stroke-width="1"/></svg>');
  background-size: cover, 50px 50px;
  padding: 20px;

  .knowledge-header {
    text-align: center;
    margin-bottom: 30px;
    padding: 20px;
    background:
        linear-gradient(135deg, rgba(139, 69, 19, 0.1), rgba(210, 180, 140, 0.05));
    border-radius: 12px;
    border: 1px solid rgba(139, 69, 19, 0.2);

    .header-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 10px;

      .platform-title {
        font-size: 36px;
        font-weight: bold;
        color: #8B4513;
        margin: 0;
        letter-spacing: 4px;
      }

      .header-actions {
        display: flex;
        gap: 12px;
      }
    }

    .platform-subtitle {
      font-size: 16px;
      color: #A0522D;
      margin: 0;
      letter-spacing: 1px;
    }
  }

  .knowledge-container {
    display: grid;
    grid-template-columns: 280px 1fr;
    gap: 20px;
    max-width: 1400px;
    margin: 0 auto;

    @media (max-width: 768px) {
      grid-template-columns: 1fr;

      .sidebar-navigation {
        display: none;
      }
    }
  }

  // 古风卡片样式
  .ancient-card {
    background:
        linear-gradient(to bottom, #fefbf6, #f9f3e9);
    border: 1px solid #D2B48C;
    border-radius: 12px;
    padding: 20px;
    box-shadow:
        0 4px 20px rgba(139, 69, 19, 0.1),
        inset 0 1px 0 rgba(255, 255, 255, 0.8);
    position: relative;
    overflow: hidden;

    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 4px;
      background: linear-gradient(90deg, #8B4513, #D2691E, #8B4513);
    }

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
      padding-bottom: 12px;
      border-bottom: 1px solid rgba(139, 69, 19, 0.2);

      h3, h4 {
        margin: 0;
        color: #8B4513;
        font-weight: bold;
      }

      h3 {
        font-size: 18px;
      }

      h4 {
        font-size: 16px;
      }
    }
  }

  // 左侧导航
  .sidebar-navigation {
    .nav-scroll {
      position: sticky;
      top: 20px;
    }

    .nav-category {
      margin-bottom: 24px;

      .category-title {
        font-size: 16px;
        color: #8B4513;
        margin: 0 0 12px 0;
        padding-left: 8px;
        border-left: 3px solid #8B4513;
      }
    }

    .nav-items {
      .nav-item {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 12px 16px;
        margin-bottom: 4px;
        border-radius: 8px;
        cursor: pointer;
        transition: all 0.3s ease;
        color: #8B4513;
        border: 1px solid transparent;

        &:hover {
          background: rgba(139, 69, 19, 0.1);
          border-color: rgba(139, 69, 19, 0.2);
        }

        &.active {
          background: rgba(139, 69, 19, 0.15);
          border-color: #8B4513;
          font-weight: bold;
        }

        i {
          font-size: 18px;
          width: 20px;
          text-align: center;
        }

        .item-count {
          margin-left: auto;
          background: rgba(139, 69, 19, 0.1);
          color: #8B4513;
          padding: 2px 8px;
          border-radius: 10px;
          font-size: 12px;
        }
      }
    }

    .recent-items {
      .recent-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 8px 12px;
        margin-bottom: 4px;
        border-radius: 6px;
        cursor: pointer;
        transition: all 0.3s ease;
        color: #8B4513;

        &:hover {
          background: rgba(139, 69, 19, 0.1);
        }

        .item-name {
          font-weight: 500;
        }

        .item-time {
          font-size: 12px;
          color: #A0522D;
        }
      }
    }
  }

  // 主内容区
  .main-content {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  // 高级搜索
  .advanced-search {
    .search-tips {
      display: flex;
      align-items: center;
      gap: 6px;
      color: #A0522D;
      font-size: 14px;
    }

    .search-form {
      .search-field {
        label {
          display: block;
          margin-bottom: 8px;
          color: #8B4513;
          font-weight: 500;
          font-size: 14px;
        }
      }

      .search-actions {
        display: flex;
        justify-content: center;
        gap: 16px;
        margin-top: 20px;
        padding-top: 20px;
        border-top: 1px solid rgba(139, 69, 19, 0.2);
      }
    }
  }

  // 药材库
  .medicine-library {
    .library-stats {
      display: flex;
      align-items: center;
      gap: 16px;
      color: #A0522D;
      font-size: 14px;
    }

    .medicine-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 16px;

      @media (max-width: 768px) {
        grid-template-columns: 1fr;
      }
    }

    .medicine-card {
      background: rgba(255, 255, 255, 0.8);
      border: 1px solid #D2B48C;
      border-radius: 8px;
      padding: 16px;
      cursor: pointer;
      transition: all 0.3s ease;
      position: relative;

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(139, 69, 19, 0.15);
        border-color: #8B4513;
      }

      .medicine-header {
        margin-bottom: 12px;

        .medicine-name {
          margin: 0 0 4px 0;
          color: #8B4513;
          font-size: 16px;
          font-weight: bold;
        }

        .medicine-latin {
          color: #A0522D;
          font-size: 12px;
          font-style: italic;
        }
      }

      .medicine-properties {
        .property-row {
          display: flex;
          margin-bottom: 6px;
          font-size: 14px;

          .property-label {
            color: #8B4513;
            font-weight: 500;
            min-width: 50px;
          }

          .property-value {
            color: #A0522D;
            flex: 1;
          }
        }
      }

      .medicine-footer {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-top: 12px;
        padding-top: 12px;
        border-top: 1px solid rgba(139, 69, 19, 0.1);

        .toxicity-tag {
          border-radius: 12px;
        }

        .medicine-actions {
          display: flex;
          gap: 8px;

          .action-btn {
            color: #8B4513;
            padding: 4px;

            &:hover {
              color: #A0522D;
            }
          }
        }
      }
    }
  }

  // 古风输入框和选择器
  .ancient-input {
    :deep(.el-input__inner) {
      background: rgba(255, 255, 255, 0.8);
      border: 1px solid #D2B48C;
      border-radius: 6px;
      color: #8B4513;

      &:focus {
        border-color: #8B4513;
        box-shadow: 0 0 0 2px rgba(139, 69, 19, 0.1);
      }

      &::placeholder {
        color: #CD853F;
      }
    }

    :deep(.el-input__prefix) {
      .el-icon {
        color: #8B4513;
      }
    }
  }

  .ancient-select {
    :deep(.el-input__inner) {
      background: rgba(255, 255, 255, 0.8);
      border: 1px solid #D2B48C;
      border-radius: 6px;
      color: #8B4513;
    }
  }

  // 古风按钮
  .ancient-btn {
    border-radius: 6px;
    transition: all 0.3s ease;

    &.el-button--primary {
      background: linear-gradient(135deg, #8B4513, #A0522D);
      border: none;
      color: #f9f3e9;

      &:hover {
        background: linear-gradient(135deg, #A0522D, #8B4513);
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(139, 69, 19, 0.3);
      }
    }

    &:not(.el-button--primary) {
      background: rgba(255, 255, 255, 0.8);
      border: 1px solid #D2B48C;
      color: #8B4513;

      &:hover {
        background: rgba(139, 69, 19, 0.1);
        border-color: #8B4513;
        transform: translateY(-1px);
      }
    }
  }

  // 古风对话框
  .ancient-dialog {
    :deep(.el-dialog) {
      background: #f9f3e9;
      border: 2px solid #8B4513;
      border-radius: 12px;
      box-shadow: 0 8px 32px rgba(139, 69, 19, 0.2);

      .el-dialog__header {
        background: linear-gradient(135deg, #8B4513, #A0522D);
        margin: 0;
        padding: 16px 20px;
        border-radius: 10px 10px 0 0;

        .el-dialog__title {
          color: #f9f3e9;
          font-weight: bold;
        }

        .el-dialog__headerbtn {
          top: 16px;

          .el-dialog__close {
            color: #f9f3e9;
          }
        }
      }

      .el-dialog__body {
        padding: 20px;
        background: #fefbf6;
      }
    }
  }
}

// 响应式设计
@media (max-width: 768px) {
  .ancient-knowledge-base {
    padding: 16px;

    .knowledge-header {
      .header-content {
        flex-direction: column;
        gap: 16px;

        .platform-title {
          font-size: 28px;
        }
      }
    }

    .advanced-search .search-form .el-row .el-col {
      margin-bottom: 16px;
    }
  }
}

// 药材详情样式
.medicine-detail {
  .detail-content {
    padding: 20px;

    .detail-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 24px;
      padding-bottom: 16px;
      border-bottom: 1px solid rgba(139, 69, 19, 0.2);

      .medicine-title {
        h2 {
          margin: 0 0 8px 0;
          color: #8B4513;
          font-size: 24px;
          font-weight: bold;
        }

        .latin-name {
          color: #A0522D;
          font-style: italic;
          font-size: 14px;
        }
      }

      .header-actions {
        .favorite-btn {
          color: #8B4513;
          font-size: 14px;

          &.is-favorite {
            color: #E6A23C;
          }

          i {
            margin-right: 4px;
          }
        }
      }
    }

    .detail-body {
      .detail-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 20px;
        margin-bottom: 20px;

        @media (max-width: 768px) {
          grid-template-columns: 1fr;
        }
      }

      .detail-section {
        &.full-width {
          grid-column: 1 / -1;
        }

        .section-title {
          color: #8B4513;
          font-size: 16px;
          font-weight: bold;
          margin: 0 0 12px 0;
          padding-left: 8px;
          border-left: 3px solid #8B4513;
        }

        .property-list {
          .property-item {
            display: flex;
            align-items: center;
            margin-bottom: 8px;
            font-size: 14px;

            .property-label {
              color: #8B4513;
              font-weight: 500;
              min-width: 70px;
            }

            .property-value {
              color: #A0522D;
              flex: 1;
            }
          }
        }

        .efficacy-content {
          p {
            color: #A0522D;
            line-height: 1.6;
            margin: 0 0 12px 0;
          }

          .effects-tags {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;

            .effect-tag {
              background: rgba(139, 69, 19, 0.1);
              border: 1px solid rgba(139, 69, 19, 0.3);
              color: #8B4513;
            }
          }
        }

        .clinical-content,
        .contraindications-content {
          .application-list,
          .contraindications-list {
            margin: 0;
            padding-left: 16px;

            .application-item,
            .contraindications-item {
              color: #A0522D;
              line-height: 1.6;
              margin-bottom: 6px;
            }
          }
        }

        .research-content {
          p {
            color: #A0522D;
            line-height: 1.6;
            margin: 0;
          }
        }
      }
    }

    .detail-footer {
      display: flex;
      justify-content: center;
      gap: 16px;
      margin-top: 24px;
      padding-top: 20px;
      border-top: 1px solid rgba(139, 69, 19, 0.2);
    }
  }
}

// 古风对话框样式优化
.ancient-dialog {
  :deep(.el-dialog) {
    background: #f9f3e9;
    border: 2px solid #8B4513;
    border-radius: 12px;
    box-shadow: 0 8px 32px rgba(139, 69, 19, 0.2);

    .el-dialog__header {
      background: linear-gradient(135deg, #8B4513, #A0522D);
      margin: 0;
      padding: 16px 20px;
      border-radius: 10px 10px 0 0;

      .el-dialog__title {
        color: #f9f3e9;
        font-weight: bold;
        font-size: 18px;
      }

      .el-dialog__headerbtn {
        top: 16px;

        .el-dialog__close {
          color: #f9f3e9;
          font-size: 18px;
        }
      }
    }

    .el-dialog__body {
      padding: 0;
      background: #fefbf6;
      max-height: 70vh;
      overflow-y: auto;
    }
  }
}

// 响应式设计
@media (max-width: 768px) {
  .medicine-detail {
    .detail-content {
      padding: 16px;

      .detail-header {
        flex-direction: column;
        gap: 12px;
        align-items: flex-start;

        .medicine-title {
          h2 {
            font-size: 20px;
          }
        }
      }

      .detail-body {
        .detail-grid {
          grid-template-columns: 1fr;
        }
      }

      .detail-footer {
        flex-direction: column;
      }
    }
  }
}
</style>