# 🤖 Colab AI 集成指南 - TCM Platform

**日期**: 2025年11月2日  
**目标**: 将后端AI调用从Mock切换到Google Colab真实服务  
**状态**: ⚠️ 临时方案，需要与AI团队协商

---

## 📋 目录

1. [API契约不匹配问题](#1-api契约不匹配问题)
2. [集成步骤](#2-集成步骤)
3. [代码修改](#3-代码修改)
4. [测试指南](#4-测试指南)
5. [风险与建议](#5-风险与建议)

---

## 1. API契约不匹配问题

### ⚠️ 关键差异对比表

| 对比项 | 后端期望 (M5) | Colab 方案 (E1) | 状态 |
|--------|--------------|-----------------|------|
| **推荐接口** | POST /recommend/formula | POST /consult | ⚠️ **不一致** |
| **分析接口** | POST /analyze/composition | POST /consult | ⚠️ **不一致** |
| **推荐请求体** | `{ symptoms: [...] }` | `{ question: "..." }` | ⚠️ **需要转换** |
| **分析请求体** | `{ composition: [...] }` | `{ question: "..." }` | ⚠️ **需要转换** |
| **响应格式** | 结构化JSON | 自由文本 `{ answer: "..." }` | ⚠️ **需要解析** |
| **认证方式** | X-API-Key | 无认证 | ✅ **移除** |

### 🔴 核心问题

**后端需要结构化数据，AI返回自由文本**

- **推荐**: 需要 `formula_id`、`reasoning`、`confidence`
- **分析**: 需要 `overall_properties`、`functions_analysis`
- **AI**: 返回自然语言文本

**必须实现**: 序列化（数据→问题）+ 解析（答案→数据）

---

## 2. 集成步骤

### 步骤1: 更新环境变量

**文件**: `.env`

```env
# AI Service (E1) - Colab 云端服务
# ⚠️ 注意：URL会变化，需要AI团队提供最新地址
E1_RECOMMEND_URL=https://{public_url}/consult
E1_ANALYZE_URL=https://{public_url}/consult
E1_HEALTH_URL=https://{public_url}/health

# SLA 超时配置（保持5秒，但Colab首次请求可能超时）
E1_TIMEOUT_MS=5000

# 已移除: E1_API_KEY（Colab不使用）
```

**重要**: 
- `{public_url}` 是临时URL，AI团队每次重启都会变化
- 需要定期更新 `.env` 文件

---

### 步骤2: 修改P4推荐逻辑

**文件**: `src/controllers/recommendationController.js`

**修改点**: `callAIService` 方法

#### 变更1: 移除认证头

```javascript
// ❌ 旧代码
headers: {
  'Content-Type': 'application/json',
  'X-Request-ID': requestId,
  'X-API-Key': config.aiService.apiKey  // 删除此行
}
```

#### 变更2: 序列化请求体

```javascript
// ❌ 旧代码 (第219-223行)
const e1RequestBody = {
  symptoms: symptomsData.symptoms,
  tongue_desc: symptomsData.tongue_desc || null,
  user_profile: symptomsData.user_profile || null
};
```

```javascript
// ✅ 新代码
// 1. 将结构化数据转换为自然语言问题
let question = "我的症状是：" + symptomsData.symptoms.join('，');

if (symptomsData.tongue_desc) {
  question += "。舌象是：" + symptomsData.tongue_desc;
}

if (symptomsData.user_profile) {
  question += "。个人信息：" + JSON.stringify(symptomsData.user_profile);
}

question += "。请根据这些信息，辨证并推荐合适的经典方剂ID（格式：方剂ID：[uuid]）。";

// 2. 构建符合 Colab 的请求体
const e1RequestBody = {
  question: question
};
```

#### 变更3: 解析响应体

```javascript
// ❌ 旧代码 (第258-288行)
// 处理结构化响应 { recommendations: [...] }

// ✅ 新代码
const responseData = response.data; // { success: true, answer: "..." }

// 1. 验证 Colab 响应格式
if (!responseData || !responseData.success || !responseData.answer) {
  logger.error('E1响应格式无效', { correlationId: requestId });
  return {
    success: false,
    error: 'invalid_format',
    message: 'AI服务返回格式异常'
  };
}

// 2. 尝试从自由文本中解析方剂ID
const formulaIdMatch = responseData.answer.match(/方剂ID：\[([^\]]+)\]/);
const reasoningMatch = responseData.answer.match(/辨证为：\[([^\]]+)\]/);

let recommendations = [];

if (formulaIdMatch && formulaIdMatch[1]) {
  // 成功解析出方剂ID
  recommendations = [{
    formula_id: formulaIdMatch[1],
    reasoning: reasoningMatch ? reasoningMatch[1] : 'AI推荐',
    confidence: 0.7,
    matched_symptoms: symptomsData.symptoms
  }];
  
  logger.info('成功解析AI推荐结果', {
    correlationId: requestId,
    formula_id: formulaIdMatch[1]
  });
} else {
  // ⚠️ 无法解析，使用降级方案
  logger.warn('无法从AI答案中解析方剂ID', {
    correlationId: requestId,
    answer: responseData.answer
  });
  
  recommendations = [{
    formula_id: 'generic-answer-uuid', // 特殊标记
    reasoning: responseData.answer,    // 完整答案作为推理
    confidence: 0.5,
    matched_symptoms: symptomsData.symptoms
  }];
  
  // 前端需要特殊处理这个ID
}
```

---

### 步骤3: 修改P5分析逻辑

**文件**: `src/services/simulationSocketService.js`

**修改点**: `triggerDebouncedAnalysis` 函数

#### 变更1: 序列化请求体

```javascript
// ❌ 旧代码 (第327-333行)
const e1RequestBody = {
  composition: composition.map(item => ({
    medicine_id: item.medicine_id || item.id,
    name: item.name,
    dosage: item.dosage || '10g'
  }))
};
```

```javascript
// ✅ 新代码
// 1. 将配伍数据转换为自然语言问题
const compositionString = composition.map(med => {
  return `${med.name} ${med.dosage || '10g'}`;
}).join('，');

const question = `请分析这个配伍：${compositionString}。` +
  `请提供以下信息的JSON格式（用<JSON_START>...</JSON_END>包裹）：` +
  `{` +
  `  "overall_properties": { "nature": "...", "flavor": [...], "meridian": [...] },` +
  `  "functions_analysis": { "解表": 5, "清热": 8, ... },` +
  `  "suggestions": [...]` +
  `}`;

// 2. 构建符合 Colab 的请求体
const e1RequestBody = {
  question: question
};
```

#### 变更2: 解析响应体

```javascript
// ✅ 新代码 (替换第347-366行)
if (response.status === 200 && response.data) {
  const responseData = response.data; // { success: true, answer: "..." }
  
  // 1. 验证基本格式
  if (!responseData.success || !responseData.answer) {
    throw new Error('E1响应格式无效');
  }
  
  // 2. 尝试解析JSON
  const jsonMatch = responseData.answer.match(/<JSON_START>(.*?)<JSON_END>/s);
  
  if (jsonMatch && jsonMatch[1]) {
    try {
      const analysisData = JSON.parse(jsonMatch[1]);
      
      // 验证必需字段
      if (analysisData.overall_properties || analysisData.functions_analysis) {
        logger.info('成功解析AI分析结果', { userId });
        
        // 推送分析结果
        ws.send(JSON.stringify({
          type: 'AI_ANALYSIS_RESULT',
          payload: analysisData,
          timestamp: new Date().toISOString()
        }));
      } else {
        throw new Error('解析的JSON缺少必需字段');
      }
    } catch (parseError) {
      logger.error('JSON解析失败', { userId, error: parseError.message });
      throw new Error('AI返回的分析数据格式错误');
    }
  } else {
    // ⚠️ 无法解析JSON，使用降级方案
    logger.warn('无法从AI答案中解析JSON', { userId });
    
    const fallbackResult = {
      overall_properties: {
        nature: '未知',
        flavor: ['?'],
        meridian: ['?']
      },
      functions_analysis: {
        'AI原始回答': 10  // 特殊标记
      },
      original_text: responseData.answer
    };
    
    // 推送降级结果
    ws.send(JSON.stringify({
      type: 'AI_ANALYSIS_RESULT',
      payload: fallbackResult,
      timestamp: new Date().toISOString()
    }));
  }
} else {
  throw new Error(`E1返回非200状态: ${response.status}`);
}
```

---

### 步骤4: 网络与防火墙

#### ✅ 已验证配置

```bash
# 防火墙已允许出站HTTPS
sudo ufw default allow outgoing

# 无需IP白名单（ngrok公网隧道）
```

**无需额外配置** ✅

---

### 步骤5: 性能与降级测试

#### 测试清单

**P4 推荐测试**:

```bash
# 1. 健康检查
curl https://{public_url}/health

# 2. 推荐请求
curl -X POST https://{public_url}/consult \
  -H "Content-Type: application/json" \
  -d '{"question":"我的症状是：发热，恶寒。请推荐方剂。"}'

# 检查响应时间（应<5秒，但首次可能超时）
```

**P5 分析测试**:

```bash
# 分析请求
curl -X POST https://{public_url}/consult \
  -H "Content-Type: application/json" \
  -d '{"question":"请分析配伍：麻黄 10g，桂枝 10g。"}'

# 检查响应时间（应<10秒）
```

**降级测试**:

1. ✅ **会话过期**: 停止Colab 12小时后，测试P4/P5错误处理
2. ✅ **超时**: 检查是否返回503/错误消息
3. ✅ **格式错误**: AI返回无标记文本时，是否优雅降级

---

## 3. 代码修改

### 完整修改文件清单

| 文件 | 修改点 | 状态 |
|------|--------|------|
| `.env` | E1 URL配置 | ⏳ 待配置 |
| `src/controllers/recommendationController.js` | callAIService方法 | ⏳ 待修改 |
| `src/services/simulationSocketService.js` | triggerDebouncedAnalysis | ⏳ 待修改 |

---

## 4. 测试指南

### 测试环境准备

```bash
# 1. 更新.env
E1_RECOMMEND_URL=https://{AI团队提供的URL}/consult
E1_ANALYZE_URL=https://{AI团队提供的URL}/consult

# 2. 重启服务
pm2 restart tcm-backend

# 3. 检查日志
pm2 logs tcm-backend --lines 50
```

### 测试用例

#### 用例1: P4推荐（成功）

**请求**:
```bash
curl -X POST http://localhost:3000/api/recommend/formula \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "symptoms": ["发热", "恶寒"],
    "tongue_desc": "舌淡红"
  }'
```

**预期**:
- ✅ 200 OK
- ✅ AI返回包含"方剂ID：[uuid]"标记
- ✅ 后端解析成功
- ✅ 返回方剂详情

---

#### 用例2: P4推荐（无法解析）

**场景**: AI返回无标记的自然语言

**预期**:
- ✅ 200 OK
- ✅ formula_id = 'generic-answer-uuid'
- ✅ reasoning = 完整AI回答
- ⚠️ 前端需要特殊处理

---

#### 用例3: P5分析（成功）

**请求**: 通过WebSocket发送

**预期**:
- ✅ AI返回包含`<JSON_START>...</JSON_END>`
- ✅ 后端解析JSON成功
- ✅ WebSocket推送分析结果

---

#### 用例4: P5分析（无法解析）

**场景**: AI返回无JSON标记

**预期**:
- ✅ WebSocket推送降级结果
- ✅ functions_analysis包含'AI原始回答'
- ⚠️ 前端显示原始文本

---

#### 用例5: 超时测试

**场景**: Colab首次请求或会话过期

**预期**:
- ✅ P4返回503 "AI服务暂时不可用"
- ✅ P5推送错误消息"AI分析超时"

---

## 5. 风险与建议

### ⚠️ 高风险点

1. **API契约不匹配**
   - **风险**: AI返回格式不固定，解析可能失败
   - **影响**: 功能降级，用户体验下降
   - **建议**: 与AI团队约定返回格式规范

2. **超时问题**
   - **风险**: 5秒超时可能太短
   - **影响**: 首次请求超时
   - **建议**: 增加超时时间或实现重试机制

3. **URL不稳定**
   - **风险**: Colab URL会变化
   - **影响**: 需要频繁更新配置
   - **建议**: 建立URL通知机制

---

### 💡 改进建议

#### 短期（立即）

1. **约定返回格式**: 与AI团队协商标准格式
   ```
   推荐: "辨证为：[XXX证]。推荐方剂ID：[uuid]。"
   分析: "<JSON_START>{...}</JSON_END>"
   ```

2. **增加超时**: 首次请求超时增加到15秒
   ```env
   E1_TIMEOUT_MS=15000
   ```

3. **错误监控**: 记录解析失败率
   ```javascript
   logger.error('AI返回解析失败', {
     userId,
     rawAnswer: responseData.answer,
     parseAttempts: attempts
   });
   ```

#### 中期（1-2周）

1. **实现重试**: 超时后自动重试1-2次
2. **缓存降级**: 使用最近成功的AI结果
3. **A/B测试**: 对比Mock和真实AI效果

#### 长期（1个月）

1. **规范化接口**: 推动AI团队标准化API
2. **本地化部署**: 考虑部署本地AI服务
3. **智能解析**: 使用NLP解析自然语言

---

## 6. 紧急联系

### 需要AI团队配合

1. **返回格式**: 约定标记格式
2. **URL更新**: 每次重启后通知最新URL
3. **性能**: 提供首次请求耗时基准

### 临时方案

如果AI团队无法提供格式规范：

```javascript
// 使用正则表达式模糊匹配
const formulaIdRegex = /(?:方剂|配方)[^\d]*(\w{8}-\w{4}-\w{4}-\w{4}-\w{12})/i;
const match = responseData.answer.match(formulaIdRegex);
```

**风险**: 准确率低，需人工审核

---

## 7. 部署检查清单

- [ ] `.env` 已更新Colab URL
- [ ] P4推荐代码已修改
- [ ] P5分析代码已修改
- [ ] 认证头已移除
- [ ] 测试已通过
- [ ] 日志已检查
- [ ] 降级方案已验证
- [ ] AI团队已确认格式

---

**重要提醒**: 这是临时方案，建议尽快推动API标准化！

---

**文档版本**: 1.0  
**创建日期**: 2025年11月2日  
**最后更新**: 2025年11月2日

