# 🔧 Flask 根路径说明

**日期**: 2025-01-03  
**问题**: 访问 `http://localhost:5000` 显示 "Not Found"

---

## 🐛 问题说明

### 现象

访问 `http://localhost:5000` 时显示：
```
Not Found

The requested URL was not found on the server.
```

---

## ✅ 原因解释

**这是正常现象**，因为 Flask 应用只定义了以下路由：
- `/health` - 健康检查
- `/consult` - 咨询接口

**没有定义根路径 `/`**，所以访问根路径会返回 404。

---

## 🔧 解决方案

### 已添加根路径路由 ✅

已在 `app.py` 中添加根路径 `/`，现在访问 `http://localhost:5000` 会返回：

```json
{
  "service": "仲景中医AI咨询系统",
  "version": "2.0",
  "status": "running",
  "endpoints": {
    "/": "服务信息（当前页面）",
    "/health": "健康检查",
    "/consult": "统一咨询接口（POST）"
  },
  "usage": {
    "health_check": "GET http://localhost:5000/health",
    "consult": "POST http://localhost:5000/consult",
    "example_request": {
      "url": "POST http://localhost:5000/consult",
      "body": {
        "question": "我的症状是：发热，恶寒。请辨证并推荐合适的方剂。"
      }
    }
  },
  "web_interface": "http://localhost:7860",
  "timestamp": "..."
}
```

---

## 📋 可用端点

### 1. 根路径 - `GET /`

**用途**: 查看服务信息和API文档

**访问**: `http://localhost:5000`

**响应**: 服务信息和API使用说明

---

### 2. 健康检查 - `GET /health`

**用途**: 检查服务是否正常运行

**访问**: `http://localhost:5000/health`

**响应**:
```json
{
  "status": "ok",
  "message": "仲景中医AI咨询系统",
  "version": "2.0",
  "endpoints": {...}
}
```

---

### 3. 咨询接口 - `POST /consult`

**用途**: 调用AI进行推荐或分析

**访问**: `POST http://localhost:5000/consult`

**请求体**:
```json
{
  "question": "问题内容..."
}
```

**响应**:
```json
{
  "success": true,
  "question": "...",
  "answer": "...",
  "processing_time_seconds": 1.5,
  "timestamp": "..."
}
```

---

## 🔄 更新说明

### 重启AI服务

**如果AI服务正在运行**，需要重启以应用更改：

1. 在运行 `app.py` 的命令行窗口中按 `Ctrl+C` 停止服务
2. 重新运行：
   ```bash
   cd "D:\TCM web\zhongjing-ai-api"
   D:\python\python.exe app.py
   ```
   或双击 `启动服务.bat`

---

## ✅ 验证

重启后，访问以下URL应该都能正常工作：

- ✅ `http://localhost:5000` - 显示服务信息
- ✅ `http://localhost:5000/health` - 健康检查
- ✅ `http://localhost:7860` - Gradio Web界面

---

## 📊 当前状态

- ✅ **根路径已添加** - 访问 `http://localhost:5000` 不再显示404
- ✅ **服务信息页面** - 提供API使用说明
- ✅ **健康检查正常** - `/health` 端点工作正常

---

**更新完成！重启AI服务后，访问 `http://localhost:5000` 将显示服务信息页面。**
