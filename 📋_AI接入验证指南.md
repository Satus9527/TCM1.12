# 📋 AI接入验证指南

**日期**: 2025-01-03  
**目的**: 验证本地AI服务是否成功接入后端

---

## ✅ 当前状态检查

### 已完成 ✅

- ✅ AI服务已启动（`localhost:5000`）
- ✅ 后端服务已运行（`localhost:3000`）
- ✅ 登录功能正常

### 待完成 ⏳

- ⏳ 更新后端 `.env` 配置为本地AI服务
- ⏳ 重启后端服务
- ⏳ 测试推荐功能，验证AI调用

---

## 🔧 步骤1: 更新后端配置

### 检查当前配置

查看 `.env` 文件中的AI服务配置：

```env
E1_RECOMMEND_URL=...
E1_ANALYZE_URL=...
E1_HEALTH_URL=...
```

### 更新为本地AI服务

**编辑 `.env` 文件**，将以下配置：

```env
# 修改前（远程Colab）
E1_RECOMMEND_URL=https://subsocial-robbyn-uninfinitely.ngrok-free.dev/consult
E1_ANALYZE_URL=https://subsocial-robbyn-uninfinitely.ngrok-free.dev/consult
E1_HEALTH_URL=https://subsocial-robbyn-uninfinitely.ngrok-free.dev/health
E1_TIMEOUT_MS=15000
```

**修改为**：

```env
# 修改后（本地AI服务）
E1_RECOMMEND_URL=http://localhost:5000/consult
E1_ANALYZE_URL=http://localhost:5000/consult
E1_HEALTH_URL=http://localhost:5000/health
E1_TIMEOUT_MS=5000
```

---

## 🔄 步骤2: 重启后端服务

### 方法1: 如果使用命令行启动

1. 找到运行后端的命令行窗口
2. 按 `Ctrl+C` 停止服务
3. 重新运行：`npm start`

### 方法2: 如果使用PM2

```bash
pm2 restart tcm-backend
```

---

## 🧪 步骤3: 验证AI接入

### 测试1: 测试推荐功能（调用AI）

**使用简化版脚本**：

```powershell
# 在 PowerShell 中运行
cd "D:\TCM web"

# 1. 先登录获取token
powershell -ExecutionPolicy Bypass -File ".\测试登录-简化版.ps1"

# 2. 在同一会话中测试推荐（会调用AI）
powershell -ExecutionPolicy Bypass -File ".\测试推荐-简化版.ps1"
```

**或直接运行批处理文件**：

1. 双击 `测试登录-运行.bat` - 登录
2. 在同一PowerShell窗口中运行：`.\测试推荐-运行.bat` - 测试推荐

---

### 测试2: 检查后端日志

如果AI成功接入，后端日志应该显示：

```
收到AI推荐请求
调用E1服务 (本地)
成功解析AI推荐结果
```

如果AI未接入，会显示：

```
E1服务连接失败
使用降级方案（知识库推荐）
```

---

## 📊 AI在哪里体现

### 1. 推荐功能（P4功能）

**前端路径**: 处方推荐页面

**后端接口**: `POST /api/recommend/formula`

**AI的作用**:
- 根据用户输入的症状进行**智能辨证**
- 推荐合适的**方剂ID**
- 提供**辨证理由**和**推荐依据**

**验证方法**:
- 测试推荐API，检查响应中是否包含AI返回的辨证结果
- 查看后端日志，确认调用了 `localhost:5000/consult`

---

### 2. 配伍分析功能（P5功能）

**前端路径**: 模拟开方页面（实时分析）

**后端接口**: WebSocket连接，自动触发分析

**AI的作用**:
- 实时分析用户添加的药材配伍
- 提供**整体药性**分析
- 提供**功效分析**（各种功效的强度评分）
- 提供**使用建议**和**注意事项**

**验证方法**:
- 在前端模拟开方页面添加药材
- 查看是否显示AI分析结果（整体药性、功效分析等）

---

## 🔍 验证AI是否成功调用

### 方法1: 查看后端日志

在后端运行窗口查看日志输出：

**成功调用AI的日志**：
```
收到AI推荐请求
调用E1服务 (本地AI服务)
E1服务调用成功
成功解析AI推荐结果
```

**AI调用失败的日志**：
```
E1服务调用失败: ECONNREFUSED
使用降级方案（知识库推荐）
```

---

### 方法2: 测试推荐API响应

运行推荐测试脚本，检查响应：

**包含AI辨证的响应**：
```json
{
  "success": true,
  "data": {
    "recommendations": [{
      "formula_id": "...",
      "syndrome": "风寒束表证",  // ← AI辨证的结果
      "reasoning": "...",        // ← AI提供的理由
      "confidence": 0.85
    }]
  }
}
```

**降级方案（未调用AI）**：
```json
{
  "success": true,
  "data": {
    "recommendations": [{
      "formula_id": "...",
      "source": "knowledge_base",  // ← 标记为知识库推荐
      "syndrome": "根据症状匹配"
    }]
  }
}
```

---

### 方法3: 直接测试AI服务

```powershell
# 测试AI服务是否正常工作
Invoke-RestMethod -Uri "http://localhost:5000/consult" `
  -Method POST `
  -ContentType "application/json" `
  -Body '{"question":"我的症状是：发热，恶寒。请辨证并推荐合适的方剂。"}'
```

**预期响应**：
```json
{
  "success": true,
  "answer": "辨证为：[风寒束表证]。方剂ID：[麻黄汤]。..."
}
```

---

## 📍 AI在前端的体现位置

### 1. 处方推荐页面

**功能**: 用户输入症状 → AI辨证 → 推荐方剂

**显示内容**:
- 辨证结果（证型）
- 推荐方剂列表
- 推荐理由和依据

---

### 2. 模拟开方页面

**功能**: 用户添加药材 → AI实时分析配伍

**显示内容**:
- 整体药性（性味、归经）
- 功效分析（各种功效的评分）
- 使用建议和注意事项

**触发时机**: 
- 用户添加/删除药材时
- 自动触发AI分析（有去抖延迟）

---

## ✅ 完整验证流程

### 1. 确认AI服务运行

```bash
# 检查AI服务
curl http://localhost:5000/health
```

---

### 2. 更新后端配置

编辑 `.env` 文件，将AI服务URL改为 `http://localhost:5000`

---

### 3. 重启后端服务

停止并重新启动后端服务

---

### 4. 测试推荐功能

运行推荐测试脚本，查看是否调用AI

---

### 5. 查看日志确认

检查后端日志，确认AI调用成功

---

## 🎯 下一步

1. ✅ **更新 `.env` 配置** - 将AI服务URL改为本地
2. ✅ **重启后端服务** - 应用新配置
3. ✅ **测试推荐功能** - 验证AI是否被调用
4. ✅ **查看前端** - 在推荐和模拟开方页面查看AI分析结果

---

**完成以上步骤后，AI就会在推荐和配伍分析功能中体现！**
