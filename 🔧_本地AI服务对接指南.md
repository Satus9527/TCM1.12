# 🔧 本地AI服务对接指南

**日期**: 2025-01-03  
**状态**: ✅ **本地AI服务对接方案**

---

## 📋 概述

本项目包含本地AI服务 `zhongjing-ai-api`，提供REST API接口用于中医辨证推荐和配伍分析。

---

## 🚀 快速开始

### 步骤1: 启动AI服务

```bash
# 进入AI服务目录
cd zhongjing-ai-api

# 安装依赖（如果还没有安装）
pip install -r requirements.txt

# 启动服务
python app.py
```

**服务启动后**:
- ✅ Flask REST API: `http://localhost:5000`
  - 健康检查: `GET http://localhost:5000/health`
  - 咨询接口: `POST http://localhost:5000/consult`
- ✅ Gradio Web界面: `http://localhost:7860`（用于测试）

---

### 步骤2: 更新后端配置

**编辑 `.env` 文件**:

```env
# AI Service - 本地服务配置
E1_RECOMMEND_URL=http://localhost:5000/consult
E1_ANALYZE_URL=http://localhost:5000/consult
E1_HEALTH_URL=http://localhost:5000/health
E1_TIMEOUT_MS=5000
```

**重要**: 
- 如果之前配置了远程Colab URL，请替换为本地URL
- `E1_TIMEOUT_MS=5000` 是5秒超时，本地服务通常很快，可以保持此值

---

### 步骤3: 重启后端服务

```bash
# 如果使用PM2
pm2 restart tcm-backend

# 或直接重启
npm start
```

---

## 🧪 测试对接

### 测试1: AI服务健康检查

```bash
curl http://localhost:5000/health
```

**预期响应**:
```json
{
  "status": "ok",
  "message": "仲景中医AI咨询系统",
  "version": "2.0",
  "timestamp": "2025-01-03T...",
  "endpoints": {
    "/health": "健康检查",
    "/consult": "统一咨询接口"
  }
}
```

---

### 测试2: 直接测试AI咨询接口

```bash
curl -X POST http://localhost:5000/consult \
  -H "Content-Type: application/json" \
  -d '{
    "question": "我的症状是：发热，恶寒，头痛。请辨证并推荐合适的方剂。"
  }'
```

**预期响应**:
```json
{
  "success": true,
  "question": "我的症状是：发热，恶寒，头痛。请辨证并推荐合适的方剂。",
  "answer": "根据您的症状，辨证为：[风寒束表证]。方剂ID：[麻黄汤]。此方剂适合当前症状。",
  "processing_time_seconds": 1.5,
  "timestamp": "2025-01-03T..."
}
```

---

### 测试3: 通过后端API测试推荐功能

```bash
# 1. 登录获取Token
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"health_user","password":"password123"}'

# 2. 使用Token测试推荐（替换 YOUR_TOKEN）
curl -X POST http://localhost:3000/api/recommend/formula \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "symptoms": ["发热", "恶寒", "头痛"],
    "tongue_desc": "舌淡红苔薄白"
  }'
```

---

## 📊 API端点说明

### 1. 健康检查 - `GET /health`

**用途**: 检查AI服务是否正常运行

**请求**:
```bash
GET http://localhost:5000/health
```

**响应**:
```json
{
  "status": "ok",
  "message": "仲景中医AI咨询系统",
  "version": "2.0",
  "timestamp": "2025-01-03T12:00:00Z",
  "endpoints": {
    "/health": "健康检查",
    "/consult": "统一咨询接口"
  }
}
```

---

### 2. 统一咨询接口 - `POST /consult`

**用途**: 处理推荐和分析请求

**请求**:
```json
{
  "question": "问题内容..."
}
```

**响应**:
```json
{
  "success": true,
  "question": "原问题",
  "answer": "包含标记的回答",
  "processing_time_seconds": 1.5,
  "timestamp": "2025-01-03T12:00:00Z"
}
```

---

## 🔄 后端集成流程

### 1. 推荐服务（P4）

**后端发送**:
```javascript
// 后端序列化
const question = "我的症状是：" + symptoms.join('，') + 
  "。舌象是：" + tongue_desc + 
  "。请根据这些信息，辨证并推荐合适的经典方剂（格式：辨证为：[证型]。方剂ID：[uuid]。）。"

// 调用AI服务
const response = await axios.post('http://localhost:5000/consult', {
  question: question
})

// 后端解析
// 从 response.data.answer 中提取 辨证为：[xxx] 和 方剂ID：[yyy]
```

**AI返回示例**:
```
根据您的症状，辨证为：[风寒束表证]。方剂ID：[麻黄汤]。此方剂适合当前症状。
```

---

### 2. 分析服务（P5）

**后端发送**:
```javascript
// 后端序列化
const compositionString = composition.map(med => 
  `${med.name} ${med.dosage || '10g'}`
).join('，')

const question = `请分析这个配伍：${compositionString}。` +
  `请提供以下信息的JSON格式（用<JSON_START>...</JSON_END>包裹）：` +
  `整体药性、功效分析和使用建议。`

// 调用AI服务
const response = await axios.post('http://localhost:5000/consult', {
  question: question
})

// 后端解析
// 从 response.data.answer 中提取 <JSON_START>...</JSON_END>
```

**AI返回示例**:
```
配伍分析完成。<JSON_START>{"overall_properties": {...}, "functions_analysis": {...}}<JSON_END>
```

---

## ⚠️ 注意事项

### 1. 端口冲突

- **Flask API**: 默认端口 `5000`
- **Gradio界面**: 默认端口 `7860`
- 如果端口被占用，需要修改 `app.py` 中的端口配置

### 2. 服务启动顺序

**推荐顺序**:
1. 先启动AI服务 (`python app.py`)
2. 再启动后端服务 (`npm start`)

这样可以确保后端启动时能够连接到AI服务。

### 3. 模型加载

当前 `app.py` 中的 `ZhongJingAISystem` 类使用示例逻辑。如果需要加载真实的微调模型，请在 `__init__` 方法中添加模型加载代码。

---

## 🐛 故障排查

### 问题1: AI服务无法启动

**错误**: `ModuleNotFoundError: No module named 'flask'`

**解决**:
```bash
pip install -r requirements.txt
```

---

### 问题2: 后端无法连接AI服务

**错误**: `ECONNREFUSED` 或 `timeout`

**检查**:
1. 确认AI服务已启动: `curl http://localhost:5000/health`
2. 检查 `.env` 配置是否正确
3. 检查防火墙是否阻止了端口5000

---

### 问题3: CORS错误

**错误**: `Access-Control-Allow-Origin`

**解决**: `app.py` 中已配置 `CORS(flask_app)`，确保代码包含此行。

---

## 📋 配置对比

### 本地服务配置

```env
E1_RECOMMEND_URL=http://localhost:5000/consult
E1_ANALYZE_URL=http://localhost:5000/consult
E1_HEALTH_URL=http://localhost:5000/health
E1_TIMEOUT_MS=5000
```

### 远程Colab配置（参考）

```env
E1_RECOMMEND_URL=https://subsocial-robbyn-uninfinitely.ngrok-free.dev/consult
E1_ANALYZE_URL=https://subsocial-robbyn-uninfinitely.ngrok-free.dev/consult
E1_HEALTH_URL=https://subsocial-robbyn-uninfinitely.ngrok-free.dev/health
E1_TIMEOUT_MS=15000
```

---

## ✅ 对接完成检查清单

- [ ] AI服务已启动（`python app.py`）
- [ ] 健康检查通过（`curl http://localhost:5000/health`）
- [ ] `.env` 配置已更新
- [ ] 后端服务已重启
- [ ] 推荐功能测试通过
- [ ] 分析功能测试通过

---

## 📚 相关文档

- `zhongjing-ai-api/README.md` - AI服务详细说明
- `zhongjing-ai-api/requirements.txt` - 依赖列表
- `🤖_Colab_AI集成指南.md` - Colab集成参考（远程服务）

---

**对接完成后，后端应该能够正常调用本地AI服务进行推荐和分析！**
