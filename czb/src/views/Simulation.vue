<template>
  <div class="ancient-simulation-room">
    <!-- 顶部标题区 -->
    <div class="simulation-header">
      <div class="header-content">
        <h1 class="platform-title">本草配伍</h1>
        <div class="header-subtitle">
          <h2>智能配伍模拟室</h2>
          <p>探索移动配伍场景，生成安全有效的中药处方</p>
        </div>
        <div class="header-actions">
          <el-button type="primary" class="ancient-btn save-btn" @click="savePrescription" :loading="saving">
            <i class="el-icon-document"></i>
            保存处方
          </el-button>
          <el-button type="danger" class="ancient-btn clear-btn" @click="clearPrescription">
            <i class="el-icon-delete"></i>
            清空配伍
          </el-button>
        </div>
      </div>
    </div>

    <div class="simulation-container">
      <!-- 左侧药材选择区 - 桌面端 -->
      <div class="left-panel ancient-panel desktop-only">
        <div class="panel-header">
          <h3>药材选择</h3>
          <div class="panel-actions">
            <el-input
                v-model="searchKeyword"
                placeholder="搜索药材名称..."
                prefix-icon="el-icon-search"
                class="ancient-input search-input"
                size="small"
                @input="handleMedicineSearch"
            ></el-input>
          </div>
        </div>

        <!-- 药材分类 -->
        <div class="medicine-categories">
          <div
              v-for="category in categories"
              :key="category.id"
              :class="['category-tab', { active: activeCategory === category.id }]"
              @click="handleCategoryChange(category.id)"
          >
            <i :class="category.icon"></i>
            <span>{{ category.name }}</span>
          </div>
        </div>

        <!-- 药材列表 -->
        <div class="medicine-list">
          <div
              v-for="medicine in filteredMedicines"
              :key="medicine.id"
              class="medicine-item"
              draggable="true"
              @dragstart="onDragStart($event, medicine)"
              @dragend="onDragEnd"
              @click="addToPrescription(medicine)"
          >
            <div class="medicine-info">
              <h4 class="medicine-name">{{ medicine.name }}</h4>
              <p class="medicine-property">{{ medicine.property }}</p>
              <p class="medicine-efficiency">{{ medicine.efficacy }}</p>
            </div>
            <div class="medicine-actions">
              <el-button
                  type="text"
                  size="small"
                  class="add-btn"
                  @click.stop="addToPrescription(medicine)"
              >
                <i class="el-icon-circle-plus"></i>
              </el-button>
            </div>
          </div>
        </div>

        <!-- 加载状态 -->
        <div v-if="loadingMedicines" class="loading-state">
          <el-skeleton :rows="3" animated />
        </div>

        <!-- 空状态 -->
        <div v-if="!loadingMedicines && filteredMedicines.length === 0" class="empty-state">
          <div class="empty-icon">
            <i class="el-icon-search"></i>
          </div>
          <p class="empty-text">未找到相关药材</p>
        </div>
      </div>

      <!-- 中间配伍编辑区 -->
      <div class="center-panel ancient-panel">
        <div class="panel-header">
          <h3>配伍编辑</h3>
          <div class="prescription-info">
            <div class="info-item">
              <label>处方名称：</label>
              <el-input
                  v-model="prescriptionName"
                  placeholder="未命名处方"
                  class="ancient-input name-input"
              ></el-input>
            </div>
            <div class="info-item">
              <label>主治病症：</label>
              <el-input
                  v-model="mainDisease"
                  placeholder="请输入主治病症..."
                  class="ancient-input disease-input"
              ></el-input>
            </div>
            <div class="info-item">
              <label>配伍模式：</label>
              <el-select v-model="compatibilityMode" class="ancient-select mode-select">
                <el-option label="经典配伍" value="classic"></el-option>
                <el-option label="创新配伍" value="innovative"></el-option>
                <el-option label="安全配伍" value="safe"></el-option>
              </el-select>
            </div>
          </div>
        </div>

        <!-- 配伍可视化区域 -->
        <div class="compatibility-visualization">
          <!-- 移动端圆圈布局 -->
          <div class="mobile-circles-layout" v-if="isMobile">
            <div class="circles-container">
              <div
                  class="role-circle monarch-circle"
                  @drop="onDrop($event, 'monarch')"
                  @dragover="onDragOver"
                  @dragenter="onDragEnter"
                  @dragleave="onDragLeave"
              >
                <div class="circle-content">
                  <div class="role-label">君药</div>
                  <div class="medicine-count">{{ monarchMedicines.length }}</div>
                  <div class="circle-hint">拖拽药材至此</div>
                </div>
              </div>
              <div
                  class="role-circle minister-circle"
                  @drop="onDrop($event, 'minister')"
                  @dragover="onDragOver"
                  @dragenter="onDragEnter"
                  @dragleave="onDragLeave"
              >
                <div class="circle-content">
                  <div class="role-label">臣药</div>
                  <div class="medicine-count">{{ ministerMedicines.length }}</div>
                  <div class="circle-hint">拖拽药材至此</div>
                </div>
              </div>
              <div
                  class="role-circle assistant-circle"
                  @drop="onDrop($event, 'assistant')"
                  @dragover="onDragOver"
                  @dragenter="onDragEnter"
                  @dragleave="onDragLeave"
              >
                <div class="circle-content">
                  <div class="role-label">佐药</div>
                  <div class="medicine-count">{{ assistantMedicines.length }}</div>
                  <div class="circle-hint">拖拽药材至此</div>
                </div>
              </div>
              <div
                  class="role-circle guide-circle"
                  @drop="onDrop($event, 'guide')"
                  @dragover="onDragOver"
                  @dragenter="onDragEnter"
                  @dragleave="onDragLeave"
              >
                <div class="circle-content">
                  <div class="role-label">使药</div>
                  <div class="medicine-count">{{ guideMedicines.length }}</div>
                  <div class="circle-hint">拖拽药材至此</div>
                </div>
              </div>
            </div>

            <!-- 移动端药材列表 -->
            <div class="mobile-medicine-list">
              <div class="mobile-medicine-header">
                <h4>药材库</h4>
                <el-input
                    v-model="searchKeyword"
                    placeholder="搜索药材..."
                    prefix-icon="el-icon-search"
                    class="ancient-input mobile-search-input"
                    size="small"
                ></el-input>
              </div>
              <div class="mobile-medicine-items">
                <div
                    v-for="medicine in filteredMedicines"
                    :key="medicine.id"
                    class="mobile-medicine-item"
                    draggable="true"
                    @dragstart="onDragStart($event, medicine)"
                    @dragend="onDragEnd"
                >
                  <span class="mobile-medicine-name">{{ medicine.name }}</span>
                  <span class="mobile-medicine-property">{{ medicine.property }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- 桌面端布局 -->
          <div class="visualization-container" v-else>
            <!-- 君药区域 -->
            <div
                class="medicine-role-area monarch-area"
                @drop="onDrop($event, 'monarch')"
                @dragover="onDragOver"
                @dragenter="onDragEnter"
                @dragleave="onDragLeave"
            >
              <div class="role-label">君药</div>
              <div class="medicine-cards">
                <div
                    v-for="medicine in monarchMedicines"
                    :key="medicine.id"
                    class="medicine-card monarch-card"
                    draggable="true"
                    @dragstart="onDragStart($event, medicine)"
                    @dragend="onDragEnd"
                    @click="adjustDosage(medicine)"
                >
                  <div class="card-content">
                    <span class="medicine-name">{{ medicine.name }}</span>
                    <span class="medicine-dosage">{{ medicine.dosage }}克</span>
                  </div>
                  <el-button
                      type="text"
                      size="small"
                      class="remove-btn"
                      @click.stop="removeFromPrescription(medicine)"
                  >
                    <i class="el-icon-close"></i>
                  </el-button>
                </div>
                <div v-if="monarchMedicines.length === 0" class="empty-hint">
                  拖动药材到此处或点击添加
                </div>
              </div>
            </div>

            <!-- 臣药区域 -->
            <div
                class="medicine-role-area minister-area"
                @drop="onDrop($event, 'minister')"
                @dragover="onDragOver"
                @dragenter="onDragEnter"
                @dragleave="onDragLeave"
            >
              <div class="role-label">臣药</div>
              <div class="medicine-cards">
                <div
                    v-for="medicine in ministerMedicines"
                    :key="medicine.id"
                    class="medicine-card minister-card"
                    draggable="true"
                    @dragstart="onDragStart($event, medicine)"
                    @dragend="onDragEnd"
                    @click="adjustDosage(medicine)"
                >
                  <div class="card-content">
                    <span class="medicine-name">{{ medicine.name }}</span>
                    <span class="medicine-dosage">{{ medicine.dosage }}克</span>
                  </div>
                  <el-button
                      type="text"
                      size="small"
                      class="remove-btn"
                      @click.stop="removeFromPrescription(medicine)"
                  >
                    <i class="el-icon-close"></i>
                  </el-button>
                </div>
                <div v-if="ministerMedicines.length === 0" class="empty-hint">
                  拖动药材到此处或点击添加
                </div>
              </div>
            </div>

            <!-- 佐药区域 -->
            <div
                class="medicine-role-area assistant-area"
                @drop="onDrop($event, 'assistant')"
                @dragover="onDragOver"
                @dragenter="onDragEnter"
                @dragleave="onDragLeave"
            >
              <div class="role-label">佐药</div>
              <div class="medicine-cards">
                <div
                    v-for="medicine in assistantMedicines"
                    :key="medicine.id"
                    class="medicine-card assistant-card"
                    draggable="true"
                    @dragstart="onDragStart($event, medicine)"
                    @dragend="onDragEnd"
                    @click="adjustDosage(medicine)"
                >
                  <div class="card-content">
                    <span class="medicine-name">{{ medicine.name }}</span>
                    <span class="medicine-dosage">{{ medicine.dosage }}克</span>
                  </div>
                  <el-button
                      type="text"
                      size="small"
                      class="remove-btn"
                      @click.stop="removeFromPrescription(medicine)"
                  >
                    <i class="el-icon-close"></i>
                  </el-button>
                </div>
                <div v-if="assistantMedicines.length === 0" class="empty-hint">
                  拖动药材到此处或点击添加
                </div>
              </div>
            </div>

            <!-- 使药区域 -->
            <div
                class="medicine-role-area guide-area"
                @drop="onDrop($event, 'guide')"
                @dragover="onDragOver"
                @dragenter="onDragEnter"
                @dragleave="onDragLeave"
            >
              <div class="role-label">使药</div>
              <div class="medicine-cards">
                <div
                    v-for="medicine in guideMedicines"
                    :key="medicine.id"
                    class="medicine-card guide-card"
                    draggable="true"
                    @dragstart="onDragStart($event, medicine)"
                    @dragend="onDragEnd"
                    @click="adjustDosage(medicine)"
                >
                  <div class="card-content">
                    <span class="medicine-name">{{ medicine.name }}</span>
                    <span class="medicine-dosage">{{ medicine.dosage }}克</span>
                  </div>
                  <el-button
                      type="text"
                      size="small"
                      class="remove-btn"
                      @click.stop="removeFromPrescription(medicine)"
                  >
                    <i class="el-icon-close"></i>
                  </el-button>
                </div>
                <div v-if="guideMedicines.length === 0" class="empty-hint">
                  拖动药材到此处或点击添加
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 配伍操作按钮 -->
        <div class="compatibility-actions">
          <el-button class="ancient-btn" @click="autoArrange" :disabled="prescriptionMedicines.length === 0">
            <i class="el-icon-cpu"></i>
            智能排列
          </el-button>
          <el-button class="ancient-btn" @click="analyzeCompatibility" :loading="analyzing" :disabled="prescriptionMedicines.length === 0">
            <i class="el-icon-data-analysis"></i>
            配伍分析
          </el-button>
          <el-button class="ancient-btn" @click="exportPrescription" :disabled="prescriptionMedicines.length === 0">
            <i class="el-icon-download"></i>
            导出处方
          </el-button>
        </div>
      </div>

      <!-- 右侧分析结果区 -->
      <div class="right-panel ancient-panel">
        <div class="panel-header">
          <h3>分析结果</h3>
          <div class="analysis-status" :class="analysisStatus">
            <i class="el-icon-success" v-if="analysisStatus === 'safe'"></i>
            <i class="el-icon-warning" v-if="analysisStatus === 'warning'"></i>
            <i class="el-icon-error" v-if="analysisStatus === 'danger'"></i>
            <span>{{ analysisMessage }}</span>
          </div>
        </div>

        <!-- 分析标签页 -->
        <el-tabs v-model="activeAnalysisTab" class="analysis-tabs">
          <!-- 性味归经分析 -->
          <el-tab-pane label="性味归经分析" name="property">
            <div class="property-analysis">
              <div class="taste-analysis">
                <h4>性味分析</h4>
                <div class="taste-charts">
                  <div
                      v-for="taste in tasteAnalysis"
                      :key="taste.name"
                      class="taste-item"
                  >
                    <div class="taste-info">
                      <span class="taste-name">{{ taste.name }}</span>
                      <span class="taste-percent">{{ taste.percentage }}%</span>
                    </div>
                    <el-progress
                        :percentage="taste.percentage"
                        :show-text="false"
                        :color="taste.color"
                        class="taste-progress"
                    ></el-progress>
                  </div>
                </div>
              </div>

              <div class="property-summary">
                <h4>性味总结</h4>
                <p>{{ propertySummary }}</p>
              </div>

              <div class="meridian-analysis">
                <h4>归经分析</h4>
                <div class="meridian-tags">
                  <el-tag
                      v-for="meridian in meridianAnalysis"
                      :key="meridian.name"
                      :type="meridian.intensity > 70 ? 'primary' : meridian.intensity > 40 ? 'success' : 'info'"
                      class="meridian-tag"
                  >
                    {{ meridian.name }} ({{ meridian.intensity }}%)
                  </el-tag>
                </div>
              </div>
            </div>
          </el-tab-pane>

          <!-- 功效协同 -->
          <el-tab-pane label="功效协同" name="efficacy">
            <div class="efficacy-analysis">
              <div class="efficacy-chart">
                <div class="chart-placeholder">
                  <i class="el-icon-pie-chart"></i>
                  <p>功效协同雷达图</p>
                </div>
              </div>
              <div class="efficacy-synergy">
                <h4>协同效应</h4>
                <div class="synergy-list">
                  <div
                      v-for="synergy in synergyEffects"
                      :key="synergy.type"
                      class="synergy-item"
                  >
                    <div class="synergy-header">
                      <span class="synergy-type">{{ synergy.type }}</span>
                      <el-tag :type="synergy.effect > 0 ? 'success' : 'warning'" size="small">
                        {{ synergy.effect > 0 ? '增强' : '减弱' }}
                      </el-tag>
                    </div>
                    <p class="synergy-desc">{{ synergy.description }}</p>
                  </div>
                </div>
              </div>
            </div>
          </el-tab-pane>

          <!-- 禁忌提示 -->
          <el-tab-pane label="禁忌提示" name="contraindication">
            <div class="contraindication-analysis">
              <div class="warning-level" :class="warningLevel">
                <div class="warning-icon">
                  <i class="el-icon-warning"></i>
                </div>
                <div class="warning-content">
                  <h4>{{ warningTitle }}</h4>
                  <p>{{ warningDescription }}</p>
                </div>
              </div>

              <div class="taboo-list">
                <h4>配伍禁忌</h4>
                <div class="taboo-items">
                  <div
                      v-for="taboo in tabooList"
                      :key="taboo.id"
                      class="taboo-item"
                  >
                    <div class="taboo-medicines">
                      <span class="medicine-combination">{{ taboo.combination }}</span>
                    </div>
                    <div class="taboo-reason">
                      <p>{{ taboo.reason }}</p>
                    </div>
                    <div class="taboo-severity">
                      <el-tag :type="taboo.severity === 'high' ? 'danger' : 'warning'" size="small">
                        {{ taboo.severity === 'high' ? '严重' : '注意' }}
                      </el-tag>
                    </div>
                  </div>
                </div>
              </div>

              <div class="safety-suggestions">
                <h4>安全建议</h4>
                <ul class="suggestion-list">
                  <li v-for="suggestion in safetySuggestions" :key="suggestion">
                    {{ suggestion }}
                  </li>
                </ul>
              </div>
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>

      <!-- AI智能咨询组件 -->
      <div class="right-panel ai-panel ancient-panel">
        <AIConsultation :onAddToPrescription="handleAddFromAIRecommendation" />
      </div>
    </div>

    <!-- 剂量调整弹窗 -->
    <el-dialog
        v-model="dosageDialogVisible"
        title="调整剂量"
        width="400px"
        class="ancient-dialog"
    >
      <div v-if="selectedMedicine" class="dosage-adjustment">
        <div class="medicine-info">
          <h4>{{ selectedMedicine.name }}</h4>
          <p>{{ selectedMedicine.property }}</p>
        </div>
        <div class="dosage-control">
          <label>剂量（克）</label>
          <el-slider
              v-model="selectedMedicine.dosage"
              :min="1"
              :max="selectedMedicine.maxDosage ? parseInt(selectedMedicine.maxDosage) : 50"
              :step="1"
              show-stops
              show-input
          ></el-slider>
        </div>
        <div class="dosage-suggestions">
          <h5>建议剂量范围</h5>
          <p>常规用量：{{ selectedMedicine.suggestedDosage || '3-9' }}克</p>
          <p>最大用量：{{ selectedMedicine.maxDosage || '15' }}克</p>
        </div>
      </div>
      <template #footer>
        <el-button @click="dosageDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmDosage">确认</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
import { ElMessage } from 'element-plus'
import { medicineAPI } from '@/api/medicine'
import { prescriptionAPI } from '@/api/prescription'
import AIConsultation from '@/components/AIConsultation.vue'

export default {
  name: 'AncientSimulationRoom',
  setup() {
    // 响应式数据
    const searchKeyword = ref('')
    const activeCategory = ref('all')
    const prescriptionName = ref('未命名处方')
    const mainDisease = ref('')
    const compatibilityMode = ref('classic')
    const activeAnalysisTab = ref('property')
    const dosageDialogVisible = ref(false)
    const selectedMedicine = ref(null)
    const loadingMedicines = ref(false)
    const analyzing = ref(false)
    const saving = ref(false)
    const isMobile = ref(false)

    // 拖拽相关状态
    const dragSource = ref(null)
    const isDragging = ref(false)

    // 药材数据
    const allMedicines = ref([])
    const prescriptionMedicines = ref([])

    // 分析数据
    const tasteAnalysis = ref([])
    const meridianAnalysis = ref([])
    const synergyEffects = ref([])
    const tabooList = ref([])
    const safetySuggestions = ref([])
    const compatibilityScore = ref(0)

    // 分类数据
    const categories = ref([])

    // 响应式处理
    const checkMobile = () => {
      isMobile.value = window.innerWidth <= 768
    }

    // 计算属性
    const filteredMedicines = computed(() => {
      let filtered = allMedicines.value

      // 分类筛选
      if (activeCategory.value !== 'all') {
        filtered = filtered.filter(med => med.category === activeCategory.value)
      }

      // 关键词搜索
      if (searchKeyword.value) {
        const keyword = searchKeyword.value.toLowerCase()
        filtered = filtered.filter(med =>
            med.name.toLowerCase().includes(keyword) ||
            (med.latinName && med.latinName.toLowerCase().includes(keyword)) ||
            med.efficacy.includes(keyword)
        )
      }

      return filtered
    })

    const monarchMedicines = computed(() => {
      return prescriptionMedicines.value.filter(med => med.role === 'monarch')
    })

    const ministerMedicines = computed(() => {
      return prescriptionMedicines.value.filter(med => med.role === 'minister')
    })

    const assistantMedicines = computed(() => {
      return prescriptionMedicines.value.filter(med => med.role === 'assistant')
    })

    const guideMedicines = computed(() => {
      return prescriptionMedicines.value.filter(med => med.role === 'guide')
    })

    const analysisStatus = computed(() => {
      if (prescriptionMedicines.value.length === 0) return 'info'
      const hasHighSeverity = tabooList.value.some(t => t.severity === 'high')
      const hasWarning = tabooList.value.length > 0

      if (hasHighSeverity) return 'danger'
      if (hasWarning) return 'warning'
      if (compatibilityScore.value > 80) return 'safe'
      return 'warning'
    })

    const analysisMessage = computed(() => {
      switch (analysisStatus.value) {
        case 'safe': return '配伍安全'
        case 'warning': return '存在注意事项'
        case 'danger': return '存在严重禁忌'
        default: return '请添加药材进行分析'
      }
    })

    const propertySummary = computed(() => {
      if (tasteAnalysis.value.length === 0) {
        return '请先进行配伍分析'
      }
      return '本处方以甘味为主，温性平和，整体药性偏温，适合虚寒体质人群，阴虚火旺者慎用。'
    })

    const warningLevel = computed(() => analysisStatus.value)

    const warningTitle = computed(() => {
      switch (analysisStatus.value) {
        case 'safe': return '配伍安全'
        case 'warning': return '注意事项'
        case 'danger': return '配伍禁忌'
        default: return '未分析'
      }
    })

    const warningDescription = computed(() => {
      switch (analysisStatus.value) {
        case 'safe': return '当前配伍未发现明显禁忌，可安全使用'
        case 'warning': return '存在需要注意的配伍关系，请谨慎使用'
        case 'danger': return '存在严重配伍禁忌，建议调整处方'
        default: return '请添加药材进行配伍分析'
      }
    })

    // 拖拽相关方法
    const onDragStart = (event, medicine) => {
      isDragging.value = true
      dragSource.value = medicine
      event.dataTransfer.setData('text/plain', JSON.stringify(medicine))
      event.dataTransfer.effectAllowed = 'move'

      // 为拖拽元素添加视觉反馈
      event.target.classList.add('dragging')
    }

    const onDragEnd = (event) => {
      isDragging.value = false
      dragSource.value = null
      event.target.classList.remove('dragging')

      // 移除所有区域的拖拽悬停样式
      document.querySelectorAll('.medicine-role-area, .role-circle').forEach(area => {
        area.classList.remove('drag-over')
      })
    }

    const onDragOver = (event) => {
      event.preventDefault()
      event.dataTransfer.dropEffect = 'move'
    }

    const onDragEnter = (event) => {
      event.preventDefault()
      event.currentTarget.classList.add('drag-over')
    }

    const onDragLeave = (event) => {
      event.currentTarget.classList.remove('drag-over')
    }

    const onDrop = (event, targetRole) => {
      event.preventDefault()
      event.currentTarget.classList.remove('drag-over')

      try {
        const medicineData = JSON.parse(event.dataTransfer.getData('text/plain'))

        if (medicineData && medicineData.id) {
          // 检查是否是从配伍区域内部拖拽（重新分配角色）
          const existingIndex = prescriptionMedicines.value.findIndex(m => m.id === medicineData.id)

          if (existingIndex > -1) {
            // 如果药材已存在，更新其角色
            prescriptionMedicines.value[existingIndex].role = targetRole
            ElMessage.success(`已将 ${medicineData.name} 设置为${getRoleName(targetRole)}`)
          } else {
            // 如果是从药材列表拖拽，添加新药材
            addToPrescriptionWithRole(medicineData, targetRole)
          }
        }
      } catch (error) {
        console.error('拖拽数据处理失败:', error)
        ElMessage.error('添加药材失败')
      }
    }

    const getRoleName = (role) => {
      const roleNames = {
        monarch: '君药',
        minister: '臣药',
        assistant: '佐药',
        guide: '使药'
      }
      return roleNames[role] || role
    }

    const addToPrescriptionWithRole = (medicine, role) => {
      if (!prescriptionMedicines.value.find(m => m.id === medicine.id)) {
        const medicineCopy = {
          ...medicine,
          dosage: parseInt(medicine.suggestedDosage?.split('-')[0]) || 6,
          role: role
        }

        prescriptionMedicines.value.push(medicineCopy)
        ElMessage.success(`已添加 ${medicine.name} 为${getRoleName(role)}`)
      } else {
        ElMessage.warning(`${medicine.name} 已在处方中`)
      }
    }

    // 修改原有的addToPrescription方法，保持向后兼容
    const addToPrescription = (medicine, role = null) => {
      if (!prescriptionMedicines.value.find(m => m.id === medicine.id)) {
        const medicineCopy = {
          ...medicine,
          dosage: parseInt(medicine.suggestedDosage?.split('-')[0]) || 6
        }

        // 如果指定了角色，使用指定角色，否则自动分配
        if (role) {
          medicineCopy.role = role
        } else {
          // 自动分配角色逻辑
          const roleCount = {
            monarch: monarchMedicines.value.length,
            minister: ministerMedicines.value.length,
            assistant: assistantMedicines.value.length,
            guide: guideMedicines.value.length
          }
          const minRole = Object.keys(roleCount).reduce((a, b) =>
              roleCount[a] < roleCount[b] ? a : b
          )
          medicineCopy.role = minRole
        }
        prescriptionMedicines.value.push(medicineCopy)
        ElMessage.success(`已添加 ${medicine.name}`)
      } else {
        ElMessage.warning(`${medicine.name} 已在处方中`)
      }
    }

    // 其他方法
    const removeFromPrescription = (medicine) => {
      const index = prescriptionMedicines.value.findIndex(m => m.id === medicine.id)
      if (index > -1) {
        prescriptionMedicines.value.splice(index, 1)
        ElMessage.info(`已移除 ${medicine.name}`)
      }
    }

    const adjustDosage = (medicine) => {
      selectedMedicine.value = medicine
      dosageDialogVisible.value = true
    }

    const confirmDosage = () => {
      dosageDialogVisible.value = false
      ElMessage.success('剂量调整成功')
    }

    const savePrescription = async () => {
      if (prescriptionMedicines.value.length === 0) {
        ElMessage.warning('请先添加药材')
        return
      }

      saving.value = true
      try {
        const prescriptionData = {
          name: prescriptionName.value,
          description: mainDisease.value,
          mainDisease: mainDisease.value,
          medicines: prescriptionMedicines.value.map(med => ({
            id: med.id,
            name: med.name,
            dosage: med.dosage,
            role: med.role
          })),
          compatibilityMode: compatibilityMode.value
        }

        const result = await prescriptionAPI.save(prescriptionData)
        ElMessage.success(result.message || '处方保存成功')

        // 重置表单
        prescriptionName.value = '未命名处方'
        mainDisease.value = ''
      } catch (error) {
        console.error('保存处方失败:', error)
        ElMessage.error('保存处方失败')
      } finally {
        saving.value = false
      }
    }

    const clearPrescription = () => {
      if (prescriptionMedicines.value.length === 0) {
        ElMessage.info('处方已为空')
        return
      }

      prescriptionMedicines.value = []
      // 重置分析数据
      tasteAnalysis.value = []
      meridianAnalysis.value = []
      synergyEffects.value = []
      tabooList.value = []
      safetySuggestions.value = []
      compatibilityScore.value = 0

      ElMessage.info('已清空配伍')
    }

    const autoArrange = () => {
      if (prescriptionMedicines.value.length === 0) {
        ElMessage.warning('请先添加药材')
        return
      }

      // 简单的自动排列逻辑
      prescriptionMedicines.value.forEach((med, index) => {
        if (index === 0) med.role = 'monarch'
        else if (index < 3) med.role = 'minister'
        else if (index < 5) med.role = 'assistant'
        else med.role = 'guide'
      })
      ElMessage.info('已智能排列药材角色')
    }

    const analyzeCompatibility = async () => {
      if (prescriptionMedicines.value.length === 0) {
        ElMessage.warning('请先添加药材')
        return
      }

      analyzing.value = true
      try {
        const result = await prescriptionAPI.analyze({
          medicines: prescriptionMedicines.value
        })

        const analysisData = result.data
        tasteAnalysis.value = analysisData.tasteAnalysis || []
        meridianAnalysis.value = analysisData.meridianAnalysis || []
        synergyEffects.value = analysisData.synergyEffects || []
        tabooList.value = analysisData.tabooList || []
        safetySuggestions.value = analysisData.safetySuggestions || []
        compatibilityScore.value = analysisData.compatibilityScore || 0

        ElMessage.success('配伍分析完成')
        activeAnalysisTab.value = 'property'
      } catch (error) {
        console.error('配伍分析失败:', error)
        ElMessage.error('配伍分析失败')
      } finally {
        analyzing.value = false
      }
    }

    const exportPrescription = () => {
      if (prescriptionMedicines.value.length === 0) {
        ElMessage.warning('请先添加药材')
        return
      }

      // 模拟导出功能
      const prescriptionData = {
        name: prescriptionName.value,
        mainDisease: mainDisease.value,
        medicines: prescriptionMedicines.value,
        analysis: {
          compatibilityScore: compatibilityScore.value,
          tabooList: tabooList.value
        }
      }

      const dataStr = JSON.stringify(prescriptionData, null, 2)
      const dataBlob = new Blob([dataStr], { type: 'application/json' })

      const link = document.createElement('a')
      link.href = URL.createObjectURL(dataBlob)
      link.download = `${prescriptionName.value || '处方'}.json`
      link.click()

      ElMessage.success('处方导出成功')
    }

    // 处理从AI推荐添加到处方
    const handleAddFromAIRecommendation = (prescription) => {
      if (!prescription || !prescription.medicines) {
        ElMessage.warning('未获取到可添加的方剂信息')
        return
      }

      // 遍历推荐方剂中的药材，添加到当前处方
      prescription.medicines.forEach(medicine => {
        // 检查药材是否已存在
        const existingIndex = prescriptionMedicines.value.findIndex(m => m.name === medicine.name)
        if (existingIndex === -1) {
          // 创建药材对象，使用模拟ID（实际应用中应该通过药材名称查找真实ID）
          const newMedicine = {
            id: `ai_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            name: medicine.name,
            dosage: medicine.dosage.replace('克', ''),
            role: 'monarch', // 默认设置为君药
            property: medicine.property || '',
            efficacy: medicine.efficacy || ''
          }
          prescriptionMedicines.value.push(newMedicine)
        } else {
          ElMessage.warning(`${medicine.name} 已在处方中`)
        }
      })

      ElMessage.success(`已添加${prescription.medicines.length}味药材到处方`)
    }

    const loadMedicines = async () => {
      loadingMedicines.value = true
      try {
        const [medicinesResult, categoriesResult] = await Promise.all([
          medicineAPI.search({ pageSize: 100 }),
          medicineAPI.getCategories()
        ])

        allMedicines.value = medicinesResult.data.list
        categories.value = categoriesResult.data
      } catch (error) {
        console.error('加载药材失败:', error)
        ElMessage.error('加载药材失败')
      } finally {
        loadingMedicines.value = false
      }
    }

    const handleMedicineSearch = () => {
      // 可以添加防抖搜索逻辑
    }

    const handleCategoryChange = (categoryId) => {
      activeCategory.value = categoryId
    }

    // 响应式处理
    const handleResize = () => {
      checkMobile()
    }

    onMounted(() => {
      loadMedicines()
      checkMobile()
      window.addEventListener('resize', handleResize)
    })

    onUnmounted(() => {
      window.removeEventListener('resize', handleResize)
    })

    return {
      searchKeyword,
      activeCategory,
      prescriptionName,
      mainDisease,
      compatibilityMode,
      activeAnalysisTab,
      dosageDialogVisible,
      selectedMedicine,
      loadingMedicines,
      analyzing,
      saving,
      isMobile,
      prescriptionMedicines,
      categories,
      tasteAnalysis,
      meridianAnalysis,
      synergyEffects,
      tabooList,
      safetySuggestions,
      filteredMedicines,
      monarchMedicines,
      ministerMedicines,
      assistantMedicines,
      guideMedicines,
      analysisStatus,
      analysisMessage,
      propertySummary,
      warningLevel,
      warningTitle,
      warningDescription,
      // 拖拽相关方法
      onDragStart,
      onDragEnd,
      onDragOver,
      onDragEnter,
      onDragLeave,
      onDrop,
      // 原有方法
      handleMedicineSearch,
      handleCategoryChange,
      addToPrescription,
      removeFromPrescription,
      adjustDosage,
      confirmDosage,
      savePrescription,
      clearPrescription,
      autoArrange,
      analyzeCompatibility,
      exportPrescription,
      handleAddFromAIRecommendation
    }
  }
}
</script>


<style scoped lang="scss">
.loading-state, .empty-state {
  padding: 20px;
  text-align: center;
  color: #999;
}

.empty-state {
  .empty-icon {
    font-size: 48px;
    margin-bottom: 16px;
    color: #ccc;
  }

  .empty-text {
    font-size: 16px;
    margin-bottom: 8px;
  }
}

.ancient-simulation-room {
  min-height: 100vh;
  background:
      linear-gradient(135deg, #f9f3e9 0%, #f5e6d3 100%),
      url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" opacity="0.03"><rect width="100" height="100" fill="none" stroke="%238B4513" stroke-width="1"/></svg>');
  background-size: cover, 50px 50px;
  padding: 20px;

  .simulation-header {
    margin-bottom: 24px;
    padding: 20px;
    background:
        linear-gradient(135deg, rgba(139, 69, 19, 0.1), rgba(210, 180, 140, 0.05));
    border-radius: 12px;
    border: 1px solid rgba(139, 69, 19, 0.2);

    .header-content {
      display: flex;
      justify-content: space-between;
      align-items: center;

      .platform-title {
        font-size: 36px;
        font-weight: bold;
        color: #8B4513;
        margin: 0;
        letter-spacing: 4px;
      }

      .header-subtitle {
        text-align: center;
        flex: 1;
        margin: 0 40px;

        h2 {
          margin: 0 0 8px 0;
          color: #8B4513;
          font-size: 24px;
        }

        p {
          margin: 0;
          color: #A0522D;
          font-size: 14px;
        }
      }

      .header-actions {
        display: flex;
        gap: 12px;

        .save-btn, .clear-btn {
          padding: 12px 24px;
          font-weight: 500;
        }
      }
    }
  }

  .simulation-container {
    display: grid;
    grid-template-columns: 300px 1fr 400px;
    gap: 20px;

    @media (max-width: 1200px) {
      grid-template-columns: 280px 1fr;

      .right-panel {
        display: none;
      }
    }

    @media (max-width: 768px) {
      grid-template-columns: 1fr;
      height: auto;
      gap: 16px;

      .left-panel.desktop-only {
        display: none;
      }

      .center-panel {
        order: 1;
      }

      .right-panel {
        display: block;
        order: 2;
      }
    }
  }

  .right-panel {
    display: flex;
    flex-direction: column;
    gap: 20px;

    &.ai-panel {
      margin-top: 20px;

      @media (max-width: 768px) {
        margin-top: 16px;
      }
    }
  }

  // 古风面板样式
  .ancient-panel {
    background:
        linear-gradient(to bottom, #fefbf6, #f9f3e9);
    border: 1px solid #D2B48C;
    border-radius: 12px;
    box-shadow:
        0 4px 20px rgba(139, 69, 19, 0.1),
        inset 0 1px 0 rgba(255, 255, 255, 0.8);
    position: relative;
    overflow: hidden;
    display: flex;
    flex-direction: column;

    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 4px;
      background: linear-gradient(90deg, #8B4513, #D2691E, #8B4513);
    }

    .panel-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px 20px;
      border-bottom: 1px solid rgba(139, 69, 19, 0.2);
      background: rgba(255, 255, 255, 0.5);

      h3 {
        margin: 0;
        color: #8B4513;
        font-weight: bold;
        font-size: 18px;
      }
    }
  }

  // 左侧药材选择区
  .left-panel {
    .panel-actions {
      .search-input {
        width: 180px;
      }
    }

    .medicine-categories {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px;
      padding: 16px 20px;
      border-bottom: 1px solid rgba(139, 69, 19, 0.1);

      .category-tab {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 10px 12px;
        border: 1px solid #D2B48C;
        border-radius: 8px;
        cursor: pointer;
        transition: all 0.3s ease;
        color: #8B4513;
        font-size: 14px;

        &:hover {
          border-color: #8B4513;
          background: rgba(139, 69, 19, 0.05);
        }

        &.active {
          background: rgba(139, 69, 19, 0.1);
          border-color: #8B4513;
          font-weight: 500;
        }

        i {
          font-size: 16px;
        }
      }
    }

    .medicine-list {
      flex: 1;
      overflow-y: auto;
      padding: 0 20px 20px;

      .medicine-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 12px;
        margin-bottom: 8px;
        border: 1px solid #D2B48C;
        border-radius: 8px;
        cursor: pointer;
        transition: all 0.3s ease;
        background: rgba(255, 255, 255, 0.5);

        &:hover {
          border-color: #8B4513;
          background: rgba(139, 69, 19, 0.05);
          transform: translateY(-1px);
        }

        .medicine-info {
          flex: 1;

          .medicine-name {
            margin: 0 0 4px 0;
            color: #8B4513;
            font-size: 16px;
            font-weight: 500;
          }

          .medicine-property {
            margin: 0 0 2px 0;
            color: #A0522D;
            font-size: 12px;
          }

          .medicine-efficiency {
            margin: 0;
            color: #CD853F;
            font-size: 12px;
          }
        }

        .medicine-actions {
          .add-btn {
            color: #8B4513;
            padding: 4px;

            &:hover {
              color: #A0522D;
              transform: scale(1.1);
            }
          }
        }
      }
    }
  }

  // 中间配伍编辑区
  .center-panel {
    .panel-header {
      .prescription-info {
        display: flex;
        gap: 20px;
        align-items: center;

        .info-item {
          display: flex;
          align-items: center;
          gap: 8px;

          label {
            color: #8B4513;
            font-size: 14px;
            font-weight: 500;
            white-space: nowrap;
          }

          .name-input, .disease-input {
            width: 150px;
          }

          .mode-select {
            width: 120px;
          }
        }
      }
    }

    .compatibility-visualization {
      flex: 1;
      padding: 20px;
      position: relative;

      // 移动端圆圈布局
      .mobile-circles-layout {
        display: flex;
        flex-direction: column;
        height: 100%;
        gap: 20px;

        .circles-container {
          display: flex;
          justify-content: space-around;
          align-items: center;
          padding: 20px 0;

          .role-circle {
            width: 80px;
            height: 80px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: all 0.3s ease;
            position: relative;
            border: 3px dashed;

            &.monarch-circle {
              border-color: #8B4513;
              background: rgba(139, 69, 19, 0.1);
            }

            &.minister-circle {
              border-color: #D2691E;
              background: rgba(210, 105, 30, 0.1);
            }

            &.assistant-circle {
              border-color: #CD853F;
              background: rgba(205, 133, 63, 0.1);
            }

            &.guide-circle {
              border-color: #DEB887 ;
              background: rgba(222, 184, 135, 0.1);
            }

            &.drag-over {
              background: rgba(139, 69, 19, 0.2) !important;
              border-style: solid !important;
              transform: scale(1.1);
            }

            .circle-content {
              text-align: center;
              color: #8B4513;

              .role-label {
                font-size: 14px;
                font-weight: bold;
                margin-bottom: 4px;
              }

              .medicine-count {
                font-size: 18px;
                font-weight: bold;
                margin-bottom: 2px;
              }

              .circle-hint {
                font-size: 10px;
                opacity: 0.7;
              }
            }
          }
        }

        .mobile-medicine-list {
          flex: 1;
          border: 1px solid #D2B48C;
          border-radius: 8px;
          background: rgba(255, 255, 255, 0.5);
          overflow: hidden;

          .mobile-medicine-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 12px 16px;
            border-bottom: 1px solid #D2B48C;
            background: rgba(139, 69, 19, 0.05);

            h4 {
              margin: 0;
              color: #8B4513;
              font-size: 16px;
            }

            .mobile-search-input {
              width: 150px;
            }
          }

          .mobile-medicine-items {
            max-height: 200px;
            overflow-y: auto;
            padding: 8px;

            .mobile-medicine-item {
              display: flex;
              justify-content: space-between;
              align-items: center;
              padding: 10px 12px;
              margin-bottom: 6px;
              border: 1px solid #D2B48C;
              border-radius: 6px;
              cursor: grab;
              transition: all 0.2s ease;
              background: rgba(255, 255, 255, 0.8);

              &:active {
                cursor: grabbing;
              }

              &:hover {
                background: rgba(139, 69, 19, 0.05);
                border-color: #8B4513;
              }

              .mobile-medicine-name {
                color: #8B4513;
                font-weight: 500;
                font-size: 14px;
              }

              .mobile-medicine-property {
                color: #A0522D;
                font-size: 12px;
              }
            }
          }
        }
      }

      .visualization-container {
        height: 100%;
        display: grid;
        grid-template-rows: 1fr 1fr 1fr 1fr;
        gap: 20px;
        position: relative;
      }

      .medicine-role-area {
        border: 2px dashed #D2B48C;
        border-radius: 12px;
        padding: 16px;
        position: relative;
        background: rgba(255, 255, 255, 0.3);
        transition: all 0.3s ease;
        min-height: 120px;

        &.drag-over {
          background: rgba(139, 69, 19, 0.1) !important;
          border-color: #8B4513 !important;
          border-style: solid !important;

          .empty-hint {
            color: #8B4513;
            font-weight: bold;
          }
        }

        &.monarch-area {
          border-color: #8B4513;
          background: rgba(139, 69, 19, 0.05);
        }

        &.minister-area {
          border-color: #D2691E;
          background: rgba(210, 105, 30, 0.05);
        }

        &.assistant-area {
          border-color: #CD853F;
          background: rgba(205, 133, 63, 0.05);
        }


        &.guide-area {
          border-color: #DEB887;
          background: rgba(222, 184, 135, 0.05);
        }

        .role-label {
          position: absolute;
          top: -12px;
          left: 20px;
          background: #f9f3e9;
          padding: 4px 12px;
          border: 1px solid;
          border-radius: 16px;
          font-size: 12px;
          font-weight: bold;

          .monarch-area & {
            color: #8B4513;
            border-color: #8B4513;
          }

          .minister-area & {
            color: #D2691E;
            border-color: #D2691E;
          }

          .assistant-area & {
            color: #CD853F;
            border-color: #CD853F;
          }

          .guide-area & {
            color: #DEB887;
            border-color: #DEB887;
          }
        }

        .medicine-cards {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          height: 100%;
          align-items: center;
          justify-content: center;
        }

        .medicine-card {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 12px;
          border-radius: 20px;
          cursor: pointer;
          transition: all 0.3s ease;
          position: relative;

          &.monarch-card {
            background: rgba(139, 69, 19, 0.1);
            border: 1px solid rgba(139, 69, 19, 0.3);
          }

          &.minister-card {
            background: rgba(210, 105, 30, 0.1);
            border: 1px solid rgba(210, 105, 30, 0.3);
          }

          &.assistant-card {
            background: rgba(205, 133, 63, 0.1);
            border: 1px solid rgba(205, 133, 63, 0.3);
          }

          &.guide-card {
            background: rgba(222, 184, 135, 0.05);
            border: 1px solid rgba(222, 184, 135, 0.05);
          }

          &:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          }

          .card-content {
            display: flex;
            flex-direction: column;
            align-items: center;

            .medicine-name {
              color: #8B4513;
              font-weight: 500;
              font-size: 14px;
            }

            .medicine-dosage {
              color: #A0522D;
              font-size: 12px;
            }
          }

          .remove-btn {
            color: #A0522D;
            padding: 2px;
            margin-left: 4px;

            &:hover {
              color: #8B4513;
            }
          }
        }

        .empty-hint {
          color: #CD853F;
          font-style: italic;
          text-align: center;
          width: 100%;
          transition: all 0.3s ease;
        }
      }
    }

    .compatibility-actions {
      display: flex;
      justify-content: center;
      gap: 16px;
      padding: 16px 20px;
      border-top: 1px solid rgba(139, 69, 19, 0.2);
      background: rgba(255, 255, 255, 0.5);
    }
  }

  // 右侧分析结果区
  .right-panel {
    .panel-header {
      .analysis-status {
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 14px;
        font-weight: 500;

        &.safe {
          color: #67C23A;
        }

        &.warning {
          color: #E6A23C;
        }

        &.danger {
          color: #F56C6C;
        }

        &.info {
          color: #909399;
        }
      }
    }

    .analysis-tabs {
      flex: 1;
      display: flex;
      flex-direction: column;

      :deep(.el-tabs__header) {
        margin: 0;
        background: rgba(255, 255, 255, 0.5);
      }

      :deep(.el-tabs__content) {
        flex: 1;
        overflow-y: auto;
        padding: 16px 20px;
      }

      :deep(.el-tab-pane) {
        height: 100%;
      }
    }

    .property-analysis {
      .taste-analysis {
        margin-bottom: 20px;

        h4 {
          color: #8B4513;
          margin: 0 0 12px 0;
          font-size: 16px;
        }

        .taste-charts {
          .taste-item {
            margin-bottom: 12px;

            .taste-info {
              display: flex;
              justify-content: space-between;
              margin-bottom: 4px;

              .taste-name {
                color: #8B4513;
                font-weight: 500;
              }

              .taste-percent {
                color: #A0522D;
                font-size: 12px;
              }
            }

            .taste-progress {
              :deep(.el-progress-bar) {
                padding-right: 0;
              }
            }
          }
        }
      }

      .property-summary {
        margin-bottom: 20px;
        padding: 12px;
        background: rgba(139, 69, 19, 0.05);
        border-radius: 8px;
        border-left: 4px solid #8B4513;

        h4 {
          color: #8B4513;
          margin: 0 0 8px 0;
          font-size: 16px;
        }

        p {
          color: #A0522D;
          margin: 0;
          line-height: 1.5;
          font-size: 14px;
        }
      }

      .meridian-analysis {
        h4 {
          color: #8B4513;
          margin: 0 0 12px 0;
          font-size: 16px;
        }

        .meridian-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;

          .meridian-tag {
            border-radius: 12px;
          }
        }
      }
    }

    .efficacy-analysis {
      .efficacy-chart {
        height: 200px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: rgba(139, 69, 19, 0.05);
        border-radius: 8px;
        margin-bottom: 20px;

        .chart-placeholder {
          text-align: center;
          color: #A0522D;

          i {
            font-size: 48px;
            margin-bottom: 8px;
            display: block;
          }

          p {
            margin: 0;
            font-size: 14px;
          }
        }
      }

      .efficacy-synergy {
        .synergy-list {
          .synergy-item {
            padding: 12px;
            margin-bottom: 12px;
            background: rgba(255, 255, 255, 0.5);
            border: 1px solid #D2B48C;
            border-radius: 8px;

            .synergy-header {
              display: flex;
              justify-content: space-between;
              align-items: center;
              margin-bottom: 8px;

              .synergy-type {
                color: #8B4513;
                font-weight: 500;
              }
            }

            .synergy-desc {
              color: #A0522D;
              margin: 0;
              font-size: 14px;
              line-height: 1.4;
            }
          }
        }
      }
    }

    .contraindication-analysis {
      .warning-level {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 16px;
        border-radius: 8px;
        margin-bottom: 20px;

        &.safe {
          background: rgba(103, 194, 58, 0.1);
          border: 1px solid rgba(103, 194, 58, 0.3);
        }

        &.warning {
          background: rgba(230, 162, 60, 0.1);
          border: 1px solid rgba(230, 162, 60, 0.3);
        }

        &.danger {
          background: rgba(245, 108, 108, 0.1);
          border: 1px solid rgba(245, 108, 108, 0.3);
        }

        .warning-icon {
          i {
            font-size: 24px;

            .safe & { color: #67C23A; }
            .warning & { color: #E6A23C; }
            .danger & { color: #F56C6C; }
          }
        }

        .warning-content {
          flex: 1;

          h4 {
            margin: 0 0 4px 0;
            font-size: 16px;

            .safe & { color: #67C23A; }
            .warning & { color: #E6A23C; }
            .danger & { color: #F56C6C; }
          }

          p {
            margin: 0;
            color: #A0522D;
            font-size: 14px;
          }
        }
      }

      .taboo-list {
        margin-bottom: 20px;

        h4 {
          color: #8B4513;
          margin: 0 0 12px 0;
          font-size: 16px;
        }

        .taboo-items {
          .taboo-item {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 12px;
            margin-bottom: 8px;
            background: rgba(255, 255, 255, 0.5);
            border: 1px solid #D2B48C;
            border-radius: 8px;

            .taboo-medicines {
              .medicine-combination {
                color: #8B4513;
                font-weight: 500;
                font-size: 14px;
              }
            }

            .taboo-reason {
              flex: 1;

              p {
                margin: 0;
                color: #A0522D;
                font-size: 12px;
                line-height: 1.4;
              }
            }

            .taboo-severity {
              flex-shrink: 0;
            }
          }
        }
      }

      .safety-suggestions {
        h4 {
          color: #8B4513;
          margin: 0 0 12px 0;
          font-size: 16px;
        }

        .suggestion-list {
          list-style: none;
          padding: 0;
          margin: 0;

          li {
            position: relative;
            padding: 8px 0 8px 20px;
            color: #A0522D;
            font-size: 14px;
            line-height: 1.4;

            &::before {
              content: '•';
              position: absolute;
              left: 8px;
              color: #8B4513;
              font-weight: bold;
            }
          }
        }
      }
    }
  }

  // 剂量调整弹窗内容
  .dosage-adjustment {
    .medicine-info {
      text-align: center;
      margin-bottom: 24px;
      padding-bottom: 16px;
      border-bottom: 1px solid rgba(139, 69, 19, 0.2);

      h4 {
        margin: 0 0 8px 0;
        color: #8B4513;
        font-size: 18px;
      }

      p {
        margin: 0;
        color: #A0522D;
        font-size: 14px;
      }
    }

    .dosage-control {
      margin-bottom: 20px;

      label {
        display: block;
        margin-bottom: 12px;
        color: #8B4513;
        font-weight: 500;
      }
    }

    .dosage-suggestions {
      padding: 16px;
      background: rgba(139, 69, 19, 0.05);
      border-radius: 8px;

      h5 {
        margin: 0 0 8px 0;
        color: #8B4513;
        font-size: 14px;
      }

      p {
        margin: 4px 0;
        color: #A0522D;
        font-size: 13px;
      }
    }
  }

  // 输入框和选择器
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

  // 按钮
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

  // 对话框
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

      .el-dialog__footer {
        background: #f9f3e9;
        padding: 16px 20px;
        border-radius: 0 0 10px 10px;
      }
    }
  }
}

// 拖拽样式
.medicine-item {
  cursor: grab;

  &:active {
    cursor: grabbing;
  }

  &.dragging {
    opacity: 0.5;
    transform: scale(0.95);
    box-shadow: 0 4px 12px rgba(139, 69, 19, 0.3);
  }
}

.medicine-card {
  cursor: grab;

  &:active {
    cursor: grabbing;
  }

  &.dragging {
    opacity: 0.7;
    transform: rotate(5deg) scale(1.05);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
    z-index: 10;
  }
}

/* 拖拽视觉反馈 */
@keyframes pulse-glow {
  0% {
    box-shadow: 0 0 0 0 rgba(139, 69, 19, 0.4);
  }
  70% {
    box-shadow: 0 0 0 10px rgba(139, 69, 19, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(139, 69, 19, 0);
  }
}

.drag-over {
  animation: pulse-glow 2s infinite;
}

/* 移动端优化 */
@media (max-width: 768px) {
  .ancient-simulation-room {
    padding: 16px;

    .simulation-header {
      .header-content {
        flex-direction: column;
        gap: 16px;
        text-align: center;

        .platform-title {
          font-size: 28px;
        }

        .header-subtitle {
          margin: 0;
        }

        .header-actions {
          width: 100%;
          justify-content: center;
        }
      }
    }

    .center-panel .panel-header .prescription-info {
      flex-direction: column;
      align-items: flex-start;
      gap: 12px;
    }

    .compatibility-actions {
      flex-wrap: wrap;

      .ancient-btn {
        flex: 1;
        min-width: 120px;
        margin-bottom: 8px;
      }
    }
  }

  .medicine-item,
  .medicine-card,
  .mobile-medicine-item {
    -webkit-touch-callout: none;
    -webkit-user-select: none;
    user-select: none;
  }

  // 移动端隐藏桌面端元素
  .desktop-only {
    display: none !important;
  }
}

// 动画效果
@keyframes medicineAdd {
  0% {
    transform: scale(0.8);
    opacity: 0;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

.medicine-card {
  animation: medicineAdd 0.3s ease;
}

@keyframes analysisUpdate {
  0% {
    background-color: transparent;
  }
  50% {
    background-color: rgba(139, 69, 19, 0.1);
  }
  100% {
    background-color: transparent;
  }
}

.analysis-tabs :deep(.el-tabs__content) {
  transition: all 0.3s ease;
}

.analysis-update {
  animation: analysisUpdate 1s ease;
}

// 移动端圆圈布局的特殊样式
@media (max-width: 768px) {
  .mobile-circles-layout {
    .circles-container {
      .role-circle {
        &.drag-over {
          transform: scale(1.15);
          box-shadow: 0 0 20px rgba(139, 69, 19, 0.3);
        }
      }
    }

    .mobile-medicine-items {
      .mobile-medicine-item {
        &.dragging {
          opacity: 0.6;
          transform: scale(0.95);
        }
      }
    }
  }
}
</style>