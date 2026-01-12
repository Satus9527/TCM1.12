# 🚀 快速启动并测试AI功能

**日期**: 2025年11月2日  
**状态**: ✅ 配置已完成，准备启动测试

---

## 🎯 启动步骤

### 方法1: 使用批处理文件（推荐）⭐

**双击运行**: `启动服务器.bat`

**或命令行**:
```bash
cd "D:\TCM web"
.\启动服务器.bat
```

---

### 方法2: 手动启动

**1. 打开新的PowerShell窗口**

**2. 切换到项目目录**:
```powershell
cd "D:\TCM web"
```

**3. 启动开发服务器**:
```powershell
npm run dev
```

**4. 等待启动成功**:
```
🚀 TCM Platform Backend Server
📍 Environment: development
🌐 Server: http://localhost:3000
💚 Health: http://localhost:3000/api/health

✨ Server started successfully!
```

---

## 🧪 测试步骤

### 1. 健康检查

**浏览器访问**:
```
http://localhost:3000/api/health
```

**或使用curl**:
```powershell
curl http://localhost:3000/api/health
```

**预期响应**:
```json
{
  "success": true,
  "data": {
    "status": "healthy"
  }
}
```

---

### 2. 测试AI推荐功能

#### 步骤A: 登录获取Token

**使用PowerShell**:
```powershell
$response = Invoke-RestMethod -Uri "http://localhost:3000/api/auth/login" `
  -Method Post `
  -ContentType "application/json" `
  -Body '{"username":"health_user","password":"password123"}'

$token = $response.data.access_token
Write-Host "Token: $token"
```

**或使用curl** (PowerShell):
```powershell
$result = curl.exe -X POST http://localhost:3000/api/auth/login `
  -H "Content-Type: application/json" `
  -d '{\"username\":\"health_user\",\"password\":\"password123\"}'

$result
```

---

#### 步骤B: 测试AI推荐

**使用PowerShell**:
```powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/recommend/formula" `
  -Method Post `
  -ContentType "application/json" `
  -Headers @{"Authorization"="Bearer $token"} `
  -Body '{
    "symptoms": ["发热", "恶寒"],
    "tongue_desc": "舌淡红苔薄白"
  }'
```

**或使用curl**:
```powershell
curl.exe -X POST http://localhost:3000/api/recommend/formula `
  -H "Content-Type: application/json" `
  -H "Authorization: Bearer YOUR_TOKEN" `
  -d "{\"symptoms\":[\"发热\",\"恶寒\"]}"
```

---

### 3. 查看测试结果

**成功标志**:
- ✅ 返回推荐结果（包含formula_id）
- ✅ 或返回降级方案（AI服务异常时）
- ✅ 响应时间合理（<15秒）

**失败标志**:
- ❌ 连接超时
- ❌ 返回错误信息
- ❌ 服务不可用

---

## 📋 完整测试命令（复制粘贴）

### PowerShell完整测试脚本

```powershell
# 1. 切换到项目目录
cd "D:\TCM web"

# 2. 等待服务启动（如果刚启动）
Start-Sleep -Seconds 3

# 3. 测试健康检查
Write-Host "`n=== 1. 健康检查 ===" -ForegroundColor Cyan
Invoke-RestMethod http://localhost:3000/api/health | ConvertTo-Json

# 4. 登录获取Token
Write-Host "`n=== 2. 登录 ===" -ForegroundColor Cyan
$loginBody = @{
    username = "health_user"
    password = "password123"
} | ConvertTo-Json

$loginResponse = Invoke-RestMethod -Uri "http://localhost:3000/api/auth/login" `
    -Method Post `
    -ContentType "application/json" `
    -Body $loginBody

$token = $loginResponse.data.access_token
Write-Host "Token获取成功: $($token.Substring(0, 20))..." -ForegroundColor Green

# 5. 测试AI推荐
Write-Host "`n=== 3. AI推荐测试 ===" -ForegroundColor Cyan
$recommendBody = @{
    symptoms = @("发热", "恶寒")
    tongue_desc = "舌淡红苔薄白"
} | ConvertTo-Json

$headers = @{
    "Authorization" = "Bearer $token"
}

try {
    $recommendResponse = Invoke-RestMethod -Uri "http://localhost:3000/api/recommend/formula" `
        -Method Post `
        -ContentType "application/json" `
        -Headers $headers `
        -Body $recommendBody
    
    $recommendResponse | ConvertTo-Json -Depth 5
    Write-Host "`n✅ AI推荐测试成功！" -ForegroundColor Green
} catch {
    Write-Host "`n❌ AI推荐测试失败: $_" -ForegroundColor Red
}

Write-Host "`n=== 测试完成 ===" -ForegroundColor Cyan
```

---

## 📊 测试结果说明

### 预期结果A: 成功返回推荐

```json
{
  "success": true,
  "data": {
    "recommendations": [
      {
        "formula_id": "uuid-xxx",
        "reasoning": "风寒表证",
        "confidence": 0.7
      }
    ]
  }
}
```

**说明**: AI服务正常，返回了推荐结果 ✅

---

### 预期结果B: 降级方案

```json
{
  "success": true,
  "data": {
    "recommendations": [
      {
        "formula_id": "generic-answer-uuid",
        "reasoning": "AI服务的完整回答文本...",
        "confidence": 0.5
      }
    ],
    "degraded": true
  }
}
```

**说明**: AI服务异常，使用降级方案 ⚠️

---

### 错误结果: 超时

```json
{
  "success": false,
  "error": "AI服务繁忙，请稍后重试"
}
```

**可能原因**:
- AI服务响应慢
- 网络连接问题
- Colab会话过期

---

## 🔍 查看详细日志

**查看应用日志**:
```powershell
Get-Content -Wait "D:\TCM web\logs\combined.log"
```

**查看错误日志**:
```powershell
Get-Content -Wait "D:\TCM web\logs\error.log"
```

**关键信息**:
- `AI Service connected` - 连接成功
- `AI Service timeout` - 超时
- `Degraded response` - 降级方案
- `AI Service error` - 服务错误

---

## ⚠️ 常见问题

### Q1: 服务启动失败

**检查项**:
1. 是否在正确目录: `D:\TCM web`
2. MySQL服务是否运行
3. 端口3000是否被占用

**解决方法**:
```powershell
# 检查MySQL
Get-Service MySQL

# 检查端口
Get-NetTCPConnection -LocalPort 3000

# 检查目录
Get-Location
```

---

### Q2: AI推荐超时

**可能原因**:
- Colab首次请求慢（正常）
- URL可能失效
- 网络问题

**解决方法**:
- 等待15秒（已配置超时）
- 检查AI服务URL是否有效
- 查看日志确认错误

---

### Q3: 连接被拒绝

**检查**:
```powershell
# 检查服务是否运行
curl http://localhost:3000/api/health

# 检查.env配置
Get-Content .env | Select-String "AI"
```

---

## 📚 相关文档

- `🎉_配置更新完成.md` - 配置详情
- `🚀_快速对接指南.md` - 对接步骤
- `🧪_Colab_AI测试指南.md` - 详细测试
- `✅_所有任务完成.md` - 完成总结

---

**开始测试**: 双击 `启动服务器.bat` 然后运行上面的测试命令

