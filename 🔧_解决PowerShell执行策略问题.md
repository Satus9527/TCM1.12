# 🔧 解决 PowerShell 执行策略问题

**日期**: 2025-01-03  
**错误**: `无法加载文件 ... 因为在此系统上禁止运行脚本`

---

## 🐛 问题说明

**错误信息**:
```
.\测试后端API.ps1 : 无法加载文件 D:\TCM web\测试后端API.ps1,
因为在此系统上禁止运行脚本。
```

**原因**: Windows PowerShell 默认的执行策略 (`ExecutionPolicy`) 不允许运行未签名的脚本，这是为了安全考虑。

---

## ✅ 解决方案（3种方法）

### 方法1: 临时绕过执行策略（推荐，最简单）

**在当前 PowerShell 会话中**：

```powershell
# 临时允许运行脚本（仅本次会话）
powershell -ExecutionPolicy Bypass -File ".\测试后端API.ps1"
```

**或者**：

```powershell
# 使用 Get-Content 和 Invoke-Expression
Get-Content ".\测试后端API.ps1" | Invoke-Expression
```

---

### 方法2: 更改当前用户的执行策略（永久）

**以管理员身份运行 PowerShell**，然后执行：

```powershell
# 查看当前执行策略
Get-ExecutionPolicy

# 更改当前用户的执行策略为 RemoteSigned（推荐）
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

# 或者更宽松的策略（仅用于开发）
Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope CurrentUser
```

**说明**:
- `RemoteSigned`: 允许运行本地脚本，但远程脚本需要签名（推荐）
- `Bypass`: 不阻止任何脚本运行（仅用于开发环境）
- `CurrentUser`: 仅影响当前用户，不需要管理员权限

---

### 方法3: 直接复制命令执行（不需要脚本）

如果不想修改执行策略，可以直接在 PowerShell 中粘贴以下命令：

```powershell
# 测试登录
$loginBody = @{
    username = "health_user"
    password = "password123"
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri "http://localhost:3000/api/auth/login" `
    -Method POST `
    -ContentType "application/json" `
    -Body $loginBody

$response | ConvertTo-Json

# 保存 token
$accessToken = $response.data.access_token
Write-Host "Token 已保存: $($accessToken.Substring(0, 20))..." -ForegroundColor Green
```

---

## 🚀 快速开始（推荐使用方法1）

### 步骤1: 测试登录

```powershell
cd "D:\TCM web"
powershell -ExecutionPolicy Bypass -File ".\测试后端API.ps1"
```

---

### 步骤2: 测试推荐（在同一会话中）

```powershell
powershell -ExecutionPolicy Bypass -File ".\测试后端推荐API.ps1"
```

---

## 📋 执行策略说明

### 可用的执行策略级别

| 策略 | 说明 | 推荐使用场景 |
|------|------|------------|
| `Restricted` | 默认，不允许运行任何脚本 | - |
| `RemoteSigned` | 本地脚本可运行，远程脚本需签名 | ✅ **推荐** |
| `Unrestricted` | 所有脚本都可运行，但会警告 | 不推荐 |
| `Bypass` | 不阻止任何脚本，不警告 | 仅开发环境 |
| `AllSigned` | 所有脚本都需要数字签名 | 企业环境 |

---

## ⚠️ 安全提示

1. **临时绕过（方法1）**: 最安全，每次需要手动输入命令
2. **CurrentUser 范围（方法2）**: 安全，只影响当前用户
3. **避免使用 LocalMachine**: 会影响所有用户，需要管理员权限

---

## ✅ 推荐操作

**对于开发和测试**，推荐使用：

```powershell
# 以当前用户身份设置 RemoteSigned（不需要管理员）
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

设置后，您就可以直接运行脚本了：

```powershell
.\测试后端API.ps1
```

---

## 🧪 验证设置

```powershell
# 查看当前执行策略
Get-ExecutionPolicy

# 查看所有作用域的执行策略
Get-ExecutionPolicy -List
```

---

**选择最适合您的方法！推荐使用方法1（临时绕过）或方法2（设置为RemoteSigned）。**
