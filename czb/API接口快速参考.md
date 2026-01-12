# czb前端API接口快速参考

## 🚀 快速概览

### 当前状态
- ✅ **auth.js** - 已配置真实API（但Login.vue未调用）
- ✅ **upload.js** - 已配置真实API
- ❌ **medicine.js** - 使用Mock数据
- ❌ **prescription.js** - 使用Mock数据
- ❌ **user.js** - 使用Mock数据

---

## 📡 API接口清单

### 1. 认证相关 (auth.js)
```
POST   /api/auth/login         登录
POST   /api/auth/register      注册
GET    /api/user/info          获取用户信息
POST   /api/auth/refresh       刷新token
POST   /api/auth/logout        退出登录
```

### 2. 药材相关 (medicine.js)
```
GET    /api/medicines                   搜索药材（支持keyword, category, page, pageSize, sort）
GET    /api/medicines/:id               获取药材详情
GET    /api/medicine-categories         获取药材分类
POST   /api/medicines/:id/favorite      收藏/取消收藏药材
```

### 3. 方剂相关 (prescription.js)
```
POST   /api/prescriptions/analyze       配伍分析
POST   /api/prescriptions               保存处方
GET    /api/prescriptions               获取处方列表（支持page, pageSize）
GET    /api/prescriptions/:id            获取处方详情
DELETE /api/prescriptions/:id           删除处方
GET    /api/prescriptions/:id/export    导出处方（返回blob）
```

### 4. 用户数据相关 (user.js)
```
GET    /api/user/favorites              获取收藏列表（支持page, pageSize）
POST   /api/user/favorites              添加收藏
DELETE /api/user/favorites/:id          取消收藏
GET    /api/user/learning-history       获取学习记录（支持page, pageSize）
POST   /api/user/learning-history       添加学习记录
GET    /api/user/stats                  获取用户统计
```

### 5. 文件上传相关 (upload.js)
```
POST   /api/files/upload                上传文件（multipart/form-data）
GET    /api/user/files                  获取文件列表
DELETE /api/files/:id                   删除文件
```

---

## 🗄️ 数据库表结构

### 核心表（9张）

1. **users** - 用户表
   - id, username, password, name, role, avatar, createdAt, updatedAt

2. **medicines** - 药材表
   - id, name, latinName, category, property, meridian, efficacy, toxicity, 
     suggestedDosage, maxDosage, flavor(JSON), usage_notes, 
     contraindications(JSON), modernResearch, createdAt, updatedAt

3. **medicine_categories** - 药材分类表
   - id, code, name, icon, count

4. **prescriptions** - 方剂表
   - id, name, source, efficacy, mainDisease, description, 
     compatibilityScore, compatibilityFeatures, modernApplication, 
     userId, createdAt, updatedAt

5. **prescription_medicines** - 方剂药材关联表
   - id, prescriptionId, medicineId, dosage, role, efficacy

6. **user_favorites** - 用户收藏表
   - id, userId, medicineId, createdAt

7. **learning_history** - 学习记录表
   - id, userId, contentType, contentId, title, description, createdAt

8. **user_files** - 用户文件表
   - id, userId, name, url, size, type, uploadTime, createdAt

9. **tokens** - Token表（可选）
   - id, userId, token, expiresAt, createdAt

---

## 🎭 Mock数据位置

### 主要Mock文件
1. `czb/src/mock/index.js` - Mock数据源和API函数
2. `czb/src/mock/auth.js` - Mock认证API
3. `czb/src/api/medicine.js` - 使用mockAPI
4. `czb/src/api/prescription.js` - 使用mockAPI
5. `czb/src/api/user.js` - 内联Promise模拟

### 硬编码数据位置
1. `czb/src/views/Dashboard.vue` - 首页所有数据
2. `czb/src/views/Content.vue` - 收藏列表硬编码
3. `czb/src/views/Login.vue` - 登录逻辑硬编码
4. `czb/src/components/Layout/AppSidebar.vue` - 消息列表硬编码

---

## 📝 数据格式示例

### 药材对象格式
```json
{
  "id": 1,
  "name": "人参",
  "latinName": "Panax ginseng C. A. Mey.",
  "category": "tonifying",
  "property": "甘、微苦，微温",
  "meridian": "脾、肺、心、肾经",
  "efficacy": "大补元气，复脉固脱，补脾益肺，生津养血，安神益智",
  "toxicity": "无毒",
  "suggestedDosage": "3-9",
  "maxDosage": "15",
  "dosage": 6,
  "favorite": false,
  "flavor": ["甘", "微苦"],
  "usage_notes": "挽救虚脱可用15-30g；研末吞服，每次1-2g",
  "contraindications": ["实证", "热证", "正气不虚者"],
  "modernResearch": "增强免疫功能，抗疲劳，改善心脑血管功能"
}
```

### 方剂对象格式
```json
{
  "id": 1,
  "name": "四君子汤",
  "source": "《太平惠民和剂局方》",
  "efficacy": "益气健脾",
  "mainDisease": "脾胃气虚证...",
  "description": "四君子汤是治疗脾胃气虚证的基础方...",
  "compatibilityScore": 95,
  "medicines": [
    {
      "id": 1,
      "name": "人参",
      "dosage": 9,
      "role": "monarch",
      "efficacy": "大补元气，健脾养胃"
    }
  ],
  "compatibilityFeatures": "温而不燥，补而不峻",
  "modernApplication": "慢性胃炎、胃溃疡...",
  "createdAt": "2024-01-15"
}
```

### 配伍分析返回格式
```json
{
  "code": 200,
  "data": {
    "tasteAnalysis": [
      { "name": "甘", "percentage": 42, "color": "#e6a23c" }
    ],
    "meridianAnalysis": [
      { "name": "脾经", "intensity": 85 }
    ],
    "synergyEffects": [
      {
        "type": "补气效果",
        "effect": 15,
        "description": "黄芪与人参协同增强补气效果"
      }
    ],
    "tabooList": [
      {
        "combination": "甘草+甘遂",
        "reason": "十八反禁忌，可能产生毒性反应",
        "severity": "high"
      }
    ],
    "safetySuggestions": ["建议1", "建议2"],
    "compatibilityScore": 85
  }
}
```

---

## ⚠️ 重要注意事项

1. **Login.vue未使用真实API**
   - 虽然auth.js已配置，但Login.vue中handleLogin函数未调用authAPI.login()
   - 需要修改Login.vue使用真实API

2. **Token存储**
   - 前端使用localStorage存储token（键名：`user-token`）
   - 所有需要认证的API都需要在请求头添加：`Authorization: Bearer {token}`

3. **统一响应格式**
   ```json
   {
     "code": 200,
     "data": {},
     "message": "提示信息"
   }
   ```

4. **分页参数**
   - 统一使用：`page`（页码）和 `pageSize`（每页数量）

5. **时间格式**
   - 建议使用ISO 8601格式：`2024-01-15T10:30:00Z`

---

## 🔄 切换步骤

1. 修改 `czb/src/api/medicine.js` - 改为真实API
2. 修改 `czb/src/api/prescription.js` - 改为真实API
3. 修改 `czb/src/api/user.js` - 改为真实API
4. 修改 `czb/src/views/Login.vue` - 使用authAPI.login()
5. 修改 `czb/src/views/Dashboard.vue` - 使用真实API获取统计数据
6. 配置环境变量：`VITE_USE_MOCK=false`

详细说明请查看：`数据对接清单.md`

