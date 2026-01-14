<template>
  <div class="ai-consultation ancient-panel">
    <div class="panel-header">
      <h3>AI智能咨询</h3>
      <div class="ai-type-tabs">
        <el-radio-group v-model="consultType" class="ai-type-group">
          <el-radio-button label="symptom" class="ai-type-btn">症状咨询</el-radio-button>
          <el-radio-button label="analysis" class="ai-type-btn">配伍分析</el-radio-button>
        </el-radio-group>
      </div>
    </div>

    <div class="ai-content">
      <!-- 症状咨询模式 -->
      <div v-if="consultType === 'symptom'" class="symptom-consult">
        <el-form label-width="100px" class="symptom-form">
          <el-form-item label="症状描述">
            <el-input
              v-model="symptomForm.symptoms"
              type="textarea"
              :rows="4"
              placeholder="请描述您的症状，例如：发热，恶寒，头痛，无汗"
              class="ancient-textarea"
            ></el-input>
          </el-form-item>
          <el-form-item label="舌象">
            <el-input
              v-model="symptomForm.tongue"
              placeholder="请描述舌象，例如：舌苔薄白，舌质淡红"
              class="ancient-input"
            ></el-input>
          </el-form-item>
          <el-form-item label="脉象">
            <el-input
              v-model="symptomForm.pulse"
              placeholder="请描述脉象，例如：浮紧"
              class="ancient-input"
            ></el-input>
          </el-form-item>
        </el-form>
      </div>

      <!-- 配伍分析模式 -->
      <div v-if="consultType === 'analysis'" class="compatibility-analyze">
        <el-input
          v-model="analysisForm.medicines"
          type="textarea"
          :rows="4"
          placeholder="请输入要分析的中药配伍，例如：麻黄10g,桂枝10g,甘草5g"
          class="ancient-textarea"
        ></el-input>
      </div>

      <!-- 操作按钮 -->
      <div class="ai-actions">
        <el-button
          type="primary"
          class="ancient-btn ai-btn"
          @click="handleConsultation"
          :loading="consulting"
        >
          <i class="el-icon-robot"></i>
          {{ consultType === 'symptom' ? '辨证推荐' : '分析配伍' }}
        </el-button>
        <el-button
          type="info"
          class="ancient-btn"
          @click="clearConsultation"
        >
          <i class="el-icon-delete"></i>
          清空
        </el-button>
      </div>

      <!-- 咨询结果 -->
      <div v-if="consultationResult" class="ai-result ancient-panel">
        <div class="result-header">
          <h4>AI咨询结果</h4>
          <el-tag type="info" size="small">AI建议</el-tag>
          <el-button
            type="text"
            size="small"
            @click="addToPrescriptionFromResult"
            v-if="consultType === 'symptom' && consultationResult.prescription"
          >
            <i class="el-icon-plus"></i>
            添加到处方
          </el-button>
        </div>
        <div class="result-content">
          <!-- 症状咨询结果 -->
          <template v-if="consultType === 'symptom'">
            <div class="result-item">
              <div class="result-label">辨证结果：</div>
              <div class="result-value">{{ consultationResult.syndrome || '未获取到辨证结果' }}</div>
            </div>
            <div class="result-item" v-if="consultationResult.prescription">
              <div class="result-label">推荐方剂：</div>
              <div class="result-value prescription-name">{{ consultationResult.prescription.name }}</div>
            </div>
            <div class="result-item" v-if="consultationResult.prescription">
              <div class="result-label">方剂组成：</div>
              <div class="prescription-medicines">
                <div
                  v-for="medicine in consultationResult.prescription.medicines"
                  :key="medicine.id || medicine.name"
                  class="prescription-medicine-item"
                >
                  {{ medicine.name }} {{ medicine.dosage }}
                </div>
              </div>
            </div>
            <div class="result-item" v-if="consultationResult.explanation">
              <div class="result-label">解释：</div>
              <div class="result-value">{{ consultationResult.explanation }}</div>
            </div>
          </template>

          <!-- 配伍分析结果 -->
          <template v-if="consultType === 'analysis'">
            <div class="result-item">
              <div class="result-label">整体药性：</div>
              <div class="result-value">{{ consultationResult.nature || '未获取到药性分析' }}</div>
            </div>
            <div class="result-item">
              <div class="result-label">味道：</div>
              <div class="result-value">
                <el-tag v-for="taste in consultationResult.taste" :key="taste" class="taste-tag">
                  {{ taste }}
                </el-tag>
              </div>
            </div>
            <div class="result-item">
              <div class="result-label">归经：</div>
              <div class="result-value">
                <el-tag v-for="meridian in consultationResult.meridian" :key="meridian" class="meridian-tag">
                  {{ meridian }}
                </el-tag>
              </div>
            </div>
            <div class="result-item" v-if="consultationResult.efficacy">
              <div class="result-label">功效分析：</div>
              <div class="result-value efficacy-list">
                <div
                  v-for="(value, key) in consultationResult.efficacy"
                  :key="key"
                  class="efficacy-item"
                >
                  {{ key }}: {{ value }}
                </div>
              </div>
            </div>
            <div class="result-item" v-if="consultationResult.suggestions">
              <div class="result-label">使用建议：</div>
              <div class="result-value suggestions-list">
                <ul>
                  <li v-for="(suggestion, index) in consultationResult.suggestions" :key="index">
                    {{ suggestion }}
                  </li>
                </ul>
              </div>
            </div>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import { aiAPI } from '@/api'

export default {
  name: 'AIConsultation',
  props: {
    // 用于添加推荐方剂到主处方的回调
    onAddToPrescription: {
      type: Function,
      default: () => {}
    }
  },
  setup(props) {
    // 响应式数据
    const consultType = ref('symptom') // 'symptom' 或 'analysis'
    const consulting = ref(false)
    const consultationResult = ref(null)

    // 症状咨询表单
    const symptomForm = reactive({
      symptoms: '',
      tongue: '',
      pulse: ''
    })

    // 配伍分析表单
    const analysisForm = reactive({
      medicines: ''
    })

    // 处理咨询
    const handleConsultation = async () => {
      if (consultType.value === 'symptom') {
        if (!symptomForm.symptoms) {
          ElMessage.warning('请输入症状描述')
          return
        }
        await handleSymptomConsultation()
      } else {
        if (!analysisForm.medicines) {
          ElMessage.warning('请输入要分析的中药配伍')
          return
        }
        await handleCompatibilityAnalysis()
      }
    }

    // 症状咨询
    const handleSymptomConsultation = async () => {
      consulting.value = true
      try {
        const question = `我的症状是：${symptomForm.symptoms}${symptomForm.tongue ? `，舌象：${symptomForm.tongue}` : ''}${symptomForm.pulse ? `，脉象：${symptomForm.pulse}` : ''}。请辨证并推荐合适的方剂。`
        const result = await aiAPI.consult({ question })
        // 添加数据结构检查 - 适配后端返回格式 (code: 200, data: {...})
        if (result && result.code === 200) {
          consultationResult.value = result.data
          ElMessage.success('辨证推荐完成')
        } else {
          consultationResult.value = null
          console.error('AI咨询结果格式错误:', result)
          ElMessage.error(result?.message || '辨证推荐失败，请稍后重试')
        }
      } catch (error) {
        console.error('症状咨询失败:', error)
        ElMessage.error('症状咨询失败，请稍后重试')
        consultationResult.value = null
      } finally {
        consulting.value = false
      }
    }

    // 配伍分析
    const handleCompatibilityAnalysis = async () => {
      consulting.value = true
      try {
        const result = await aiAPI.consult({ question: analysisForm.medicines })
        // 添加数据结构检查 - 适配后端返回格式 (code: 200, data: {...})
        if (result && result.code === 200) {
          consultationResult.value = result.data
          ElMessage.success('配伍分析完成')
        } else {
          consultationResult.value = null
          console.error('配伍分析结果格式错误:', result)
          ElMessage.error(result?.message || '配伍分析失败，请稍后重试')
        }
      } catch (error) {
        console.error('配伍分析失败:', error)
        ElMessage.error('配伍分析失败，请稍后重试')
        consultationResult.value = null
      } finally {
        consulting.value = false
      }
    }

    // 清空咨询
    const clearConsultation = () => {
      if (consultType.value === 'symptom') {
        symptomForm.symptoms = ''
        symptomForm.tongue = ''
        symptomForm.pulse = ''
      } else {
        analysisForm.medicines = ''
      }
      consultationResult.value = null
    }

    // 添加推荐方剂到主处方
    const addToPrescriptionFromResult = () => {
      if (consultationResult.value && consultationResult.value.prescription) {
        props.onAddToPrescription(consultationResult.value.prescription)
      }
    }

    return {
      consultType,
      consulting,
      consultationResult,
      symptomForm,
      analysisForm,
      handleConsultation,
      clearConsultation,
      addToPrescriptionFromResult
    }
  }
}
</script>

<style scoped lang="scss">
.ai-consultation {
  margin-bottom: 20px;

  .ai-type-tabs {
    margin-top: 10px;
  }

  .ai-type-group {
    display: flex;
  }

  .ai-content {
    padding: 15px 0;
  }

  .symptom-form {
    margin-bottom: 20px;
  }

  .ancient-textarea {
    width: 100%;
    border-radius: 8px;
    background-color: rgba(255, 255, 255, 0.9);
    border: 1px solid rgba(139, 69, 19, 0.3);
  }

  .ancient-input {
    width: 100%;
    border-radius: 8px;
    background-color: rgba(255, 255, 255, 0.9);
    border: 1px solid rgba(139, 69, 19, 0.3);
  }

  .ai-actions {
    margin-top: 15px;
    display: flex;
    gap: 10px;
  }

  .ai-btn {
    display: flex;
    align-items: center;
    gap: 5px;
  }

  .ai-result {
    margin-top: 20px;
    padding: 15px;

    .result-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 15px;

      h4 {
        margin: 0;
        color: #8B4513;
      }
    }

    .result-content {
      .result-item {
        margin-bottom: 12px;

        .result-label {
          font-weight: bold;
          color: #8B4513;
          margin-bottom: 5px;
          display: block;
        }

        .result-value {
          color: #333;
          line-height: 1.6;
        }

        .prescription-name {
          font-size: 1.1rem;
          color: #8B4513;
          font-weight: bold;
        }

        .prescription-medicines {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;

          .prescription-medicine-item {
            background-color: rgba(139, 69, 19, 0.1);
            padding: 4px 10px;
            border-radius: 15px;
            border: 1px solid rgba(139, 69, 19, 0.3);
          }
        }

        .taste-tag {
          margin-right: 8px;
        }

        .meridian-tag {
          margin-right: 8px;
        }

        .efficacy-list {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;

          .efficacy-item {
            background-color: rgba(139, 69, 19, 0.1);
            padding: 4px 10px;
            border-radius: 15px;
            border: 1px solid rgba(139, 69, 19, 0.3);
          }
        }

        .suggestions-list {
          ul {
            margin: 0;
            padding-left: 20px;

            li {
              margin-bottom: 5px;
            }
          }
        }
      }
    }
  }
}
</style>
