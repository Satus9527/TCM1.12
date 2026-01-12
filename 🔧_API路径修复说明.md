# 🔧 API 路径修复说明

**日期**: 2025-01-03  
**问题**: 前端 API 调用失败，显示 "The requested resource was not found"

---

## 🐛 问题原因

1. **API 路径重复**: 
   - `request.js` 中的 `baseURL` 已经设置为 `http://localhost:3000/api`
   - 但在 `medicine.js` 中调用时又添加了 `/api/medicines`
   - 导致实际请求路径变成 `http://localhost:3000/api/api/medicines`（重复的 `/api`）
   - 后端只监听 `http://localhost:3000/api/medicines`，所以返回 404

2. **环境变量格式错误**:
   - `.env.development` 文件中使用了 `VUE_APP_API_BASE_URL`（Vue CLI 格式）
   - 但项目使用的是 Vite，应该使用 `VITE_API_BASE_URL`

---

## ✅ 已修复的内容

### 1. 修复 `czb/src/api/medicine.js`

**修复的 API 调用**:
- ✅ `search()`: `/api/medicines` → `/medicines`
- ✅ `getDetail()`: `/api/medicines/:id` → `/medicines/:id`
- ✅ `toggleFavorite()`: `/api/collections` → `/collections`

---

## ⚠️ 需要手动修复的文件

### `.env.development` 文件

由于该文件被 gitignore 保护，需要手动编辑：

**文件路径**: `czb/.env.development`

**当前内容**（错误）:
```env
VUE_APP_API_BASE_URL=http://localhost:3000/api
VUE_APP_USE_MOCK=true
```

**应该改为**（正确）:
```env
VITE_API_BASE_URL=http://localhost:3000/api
```

**说明**:
- 删除 `VUE_APP_API_BASE_URL`（Vue CLI 格式）
- 删除 `VUE_APP_USE_MOCK=true`（不再需要）
- 添加 `VITE_API_BASE_URL=http://localhost:3000/api`（Vite 格式）

---

## 🔄 修复后的工作流程

1. **前端请求**:
   ```javascript
   request.get('/medicines', { params: { page: 1, limit: 20 } })
   ```

2. **实际请求 URL**:
   ```
   http://localhost:3000/api + /medicines = http://localhost:3000/api/medicines ✅
   ```

3. **后端路由**:
   ```javascript
   router.get('/api/medicines', medicineController.getMedicines)
   ```

4. **结果**: ✅ 请求成功！

---

## 🧪 测试步骤

修复后，请按以下步骤测试：

1. **重启前端开发服务器**:
   ```bash
   cd czb
   npm run dev
   ```

2. **检查浏览器控制台**:
   - 打开开发者工具（F12）
   - 查看 Network 标签
   - 刷新页面，观察 API 请求

3. **验证请求 URL**:
   - 应该看到请求到 `http://localhost:3000/api/medicines`
   - 不应该看到 `http://localhost:3000/api/api/medicines`

4. **检查响应**:
   - 状态码应该是 `200`（而不是 `404`）
   - 应该返回真实的药材数据（而不是模拟数据）

---

## 📋 修复总结

| 文件 | 修复内容 | 状态 |
|------|---------|------|
| `czb/src/api/medicine.js` | 修复 API 路径（移除重复的 `/api`） | ✅ 已修复 |
| `czb/.env.development` | 更改环境变量格式（VUE_APP → VITE） | ⚠️ 需要手动修复 |

---

## 💡 额外提示

如果修复后仍然出现问题，请检查：

1. **后端服务是否运行**:
   ```bash
   # 检查端口 3000 是否被占用
   netstat -ano | findstr :3000
   ```

2. **后端日志**:
   - 查看后端控制台是否有错误信息
   - 检查数据库连接是否正常

3. **CORS 配置**:
   - 确保后端 `corsConfig.js` 中包含了前端地址
   - 前端开发服务器通常是 `http://localhost:5173`

---

**修复完成后，页面应该能够正常显示真实的药材数据，不再显示 "The requested resource was not found" 错误。**
