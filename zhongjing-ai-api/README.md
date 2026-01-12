---
title: 仲景中医AI咨询系统
emoji: 🏥
colorFrom: green
colorTo: blue
sdk: gradio
sdk_version: 4.0.0
app_file: app.py
pinned: false
---

# 仲景中医AI咨询系统

基于微调AI模型的中医智能咨询平台，提供症状辨证、方剂推荐和中药配伍分析服务。

## 🎯 功能特点

- 🩺 **智能辨证**: 根据症状自动辨证
- 💊 **方剂推荐**: 推荐合适的经典方剂
- 🔬 **配伍分析**: 分析中药配伍的药性功效
- 🔗 **标准API**: 符合后端集成要求的REST API接口
- 🖥️ **Web界面**: 提供 Gradio Web 界面用于测试

## 📚 使用说明

### 推荐服务
输入症状描述，系统会自动辨证并推荐方剂，返回格式：
```
辨证为：[证型]。方剂ID：[方剂名称]。
```

### 分析服务
输入中药配伍，系统会分析药性功效，返回格式：
```
<JSON_START>{"overall_properties": {...}, "functions_analysis": {...}}<JSON_END>
```

## 🚀 本地部署

### 1. 安装依赖

```bash
cd zhongjing-ai-api
pip install -r requirements.txt
```

### 2. 启动服务

```bash
python app.py
```

服务启动后会同时运行：
- **Flask REST API**: `http://localhost:5000`
  - 健康检查: `GET http://localhost:5000/health`
  - 咨询接口: `POST http://localhost:5000/consult`
- **Gradio Web界面**: `http://localhost:7860`（用于测试）

## 🔗 REST API 集成

### 健康检查

```bash
curl http://localhost:5000/health
```

**响应**:
```json
{
  "status": "ok",
  "message": "仲景中医AI咨询系统",
  "version": "2.0",
  "timestamp": "2025-11-02T12:00:00Z",
  "endpoints": {
    "/health": "健康检查",
    "/consult": "统一咨询接口"
  }
}
```

### 咨询接口

**请求**:
```bash
curl -X POST http://localhost:5000/consult \
  -H "Content-Type: application/json" \
  -d '{
    "question": "我的症状是：发热，恶寒，头痛。请辨证并推荐合适的方剂。"
  }'
```

**响应**:
```json
{
  "success": true,
  "question": "我的症状是：发热，恶寒，头痛。请辨证并推荐合适的方剂。",
  "answer": "根据您的症状，辨证为：[风寒束表证]。方剂ID：[麻黄汤]。此方剂适合当前症状。",
  "processing_time_seconds": 1.5,
  "timestamp": "2025-11-02T12:00:00Z"
}
```

## 🔧 后端对接配置

在 `.env` 文件中配置：

```env
# AI Service - 本地服务
E1_RECOMMEND_URL=http://localhost:5000/consult
E1_ANALYZE_URL=http://localhost:5000/consult
E1_HEALTH_URL=http://localhost:5000/health
E1_TIMEOUT_MS=5000
```

## 📋 API 格式规范

### 推荐服务请求示例

```json
{
  "question": "我的症状是：发热，恶寒，头痛。舌象是：舌淡红苔薄白。请根据这些信息，辨证并推荐合适的经典方剂（格式：辨证为：[证型]。方剂ID：[uuid]。）。"
}
```

### 分析服务请求示例

```json
{
  "question": "请分析这个配伍：麻黄 10g，桂枝 10g，甘草 5g。请提供以下信息的JSON格式（用<JSON_START>...</JSON_END>包裹）：整体药性、功效分析和使用建议。"
}
```

### 响应格式

```json
{
  "success": true,
  "question": "原问题",
  "answer": "包含标记的回答",
  "processing_time_seconds": 1.5,
  "timestamp": "2025-11-02T12:00:00Z"
}
```

## 🔧 技术架构

- **REST API**: Flask 2.0
- **Web界面**: Gradio 4.0
- **后端**: Python + 微调AI模型
- **CORS**: 支持跨域请求

## 📞 支持

如有问题请联系开发团队。

**开发团队**: AI团队  
**版本**: v2.0  
**最后更新**: 2025年1月
