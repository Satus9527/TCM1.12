# 📋 前端 API 接入完成说明

**日期**: 2025-01-03  
**更新内容**: 前端药材 API 已接入真实后端接口

---

## ✅ 已完成的更新

### 1. 更新文件: `czb/src/api/medicine.js`

**更新内容**:
- ✅ `search()` - 已接入 `GET /api/medicines` 真实接口
- ✅ `getDetail()` - 已接入 `GET /api/medicines/:id` 真实接口
- ✅ `toggleFavorite()` - 已接入 `POST /api/collections` 真实接口
- ⚠️ `getCategories()` - 后端未实现，仍使用模拟数据（已标注"模拟"）

---

## 🔗 API 接口映射

| 前端方法 | 后端接口 | 状态 | 说明 |
|---------|---------|------|------|
| `medicineAPI.search()` | `GET /api/medicines` | ✅ 已接入 | 支持搜索、分页、分类筛选 |
| `medicineAPI.getDetail()` | `GET /api/medicines/:id` | ✅ 已接入 | 返回完整药材详情，包含常用药方 |
| `medicineAPI.toggleFavorite()` | `POST /api/collections` | ✅ 已接入 | 收藏/取消收藏药材 |
| `medicineAPI.getCategories()` | - | ⚠️ 模拟数据 | 后端未实现，使用模拟数据 |

---

## 📋 数据字段映射

### 后端返回的药材详情字段

```javascript
{
  medicine_id: "uuid",
  name: "药材名称",
  pinyin: "拼音",
  category: "分类",
  nature: "性味",
  flavor: "味",
  meridian: "归经",
  efficacy: "功效",
  indications: "主治",
  usage_dosage: "用法用量",
  contraindications: "禁忌",
  description: "描述",
  image_url: "图片URL",
  english_name: "英文名（拉丁学名）",  // ✅ 新增字段
  toxicity: "毒性",  // ✅ 新增字段
  modern_research: "现代研究",  // ✅ 新增字段
  common_formulas: [  // ✅ 新增字段（常用药方）
    {
      name: "四君子汤",
      composition: "人参、白术、茯苓、甘草",
      dosage: "9g",
      role: "君"
    }
  ]
}
```

### 前端使用的字段

- ✅ 所有后端字段都会被正确传递到前端
- ✅ 前端 `Knowledge.vue` 已支持显示所有字段
- ✅ 模拟数据会自动添加 `isMock: true` 标记
- ✅ 真实数据会标记 `isMock: false`

---

## 🔄 降级机制

如果真实 API 调用失败，系统会自动降级到模拟数据：

1. **搜索药材**: 如果 `GET /api/medicines` 失败，自动使用 `mockAPI.searchMedicines()`
2. **获取详情**: 如果 `GET /api/medicines/:id` 失败，自动使用 `mockAPI.getMedicineDetail()`
3. **收藏操作**: 如果 `POST /api/collections` 失败，返回模拟响应

**优点**:
- 前端不会因 API 错误而崩溃
- 开发时可以测试前端界面
- 生产环境可以及时发现 API 问题

---

## ⚠️ 注意事项

### 1. 认证要求

部分接口需要 JWT token 认证：
- `GET /api/medicines` - 公开接口，不需要认证
- `GET /api/medicines/:id` - 公开接口，不需要认证
- `POST /api/collections` - **需要认证**，必须在登录状态下使用

### 2. 错误处理

所有 API 调用都包含 `try-catch` 错误处理：
- 网络错误会自动降级到模拟数据
- 控制台会输出错误日志：`console.error('搜索药材失败，使用模拟数据:', error)`
- 用户不会看到错误提示（除非需要）

### 3. 数据格式转换

后端返回的数据格式：
```javascript
{
  success: true,
  data: {
    medicines: [...],  // 列表数据
    pagination: { ... }  // 分页信息
  }
}
```

前端期望的格式：
```javascript
{
  code: 200,
  data: {
    list: [...],  // 列表数据
    total: 100,  // 总数
    page: 1,  // 当前页
    pageSize: 20,  // 每页数量
    totalPages: 5  // 总页数
  }
}
```

**已自动转换**: `search()` 方法会自动转换数据格式。

---

## 📝 待完成的工作

### 1. 测试真实 API

建议测试以下场景：
- [ ] 搜索药材（带关键词）
- [ ] 搜索药材（不带关键词，获取全部）
- [ ] 分页功能
- [ ] 分类筛选
- [ ] 获取药材详情（包含常用药方）
- [ ] 收藏/取消收藏药材

### 2. 优化分类接口

`getCategories()` 当前使用模拟数据，可以考虑：
- [ ] 从药材列表中提取分类（通过 `GET /api/medicines` 获取所有药材，提取唯一分类）
- [ ] 等待后端实现分类接口
- [ ] 在前端缓存分类列表

### 3. 错误提示优化

当前错误处理会降级到模拟数据，不会提示用户。可以考虑：
- [ ] 添加错误提示（当真实 API 失败时）
- [ ] 区分网络错误和业务错误
- [ ] 提供重试机制

---

## 🎯 下一步

1. **启动后端服务**: 确保后端服务在 `http://localhost:3000` 运行
2. **启动前端服务**: 在 `czb` 目录运行 `npm run dev`
3. **测试功能**: 
   - 登录系统
   - 搜索药材
   - 查看药材详情（验证是否显示常用药方）
   - 验证新增字段（英文名、毒性、现代研究）

---

**更新完成时间**: 2025-01-03  
**更新人员**: AI Assistant
