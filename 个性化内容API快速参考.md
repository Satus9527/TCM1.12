# 个性化内容API快速参考

**基础URL**: `http://localhost:3000/api/content`  
**认证方式**: JWT Bearer Token  
**内容类型**: `application/json`

---

## 🔐 认证说明

所有 `/api/content/*` 接口都需要在请求头中携带JWT Token：

```http
Authorization: Bearer <access_token>
```

获取Token请先调用登录接口：
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "student@example.com",
  "password": "password123"
}
```

---

## 📚 1. 用户收藏管理

### 1.1 添加收藏

**接口**: `POST /api/content/collections`  
**权限**: `health_follower`, `student`  
**请求体**:
```json
{
  "content_type": "medicine",  // 或 "formula"
  "content_id": "d85c3b55-0f83-4354-a37c-73d01b273072"
}
```

**成功响应** (201):
```json
{
  "success": true,
  "message": "收藏成功",
  "data": {
    "collection_id": "b07ec688-b335-417a-973f-18756fdbdd93",
    "user_id": "3725afa0-08c5-4c18-854f-81db9e003c1b",
    "content_type": "medicine",
    "content_id": "d85c3b55-0f83-4354-a37c-73d01b273072",
    "created_at": "2025-10-30T15:33:39.000Z"
  }
}
```

**重复收藏响应** (409):
```json
{
  "success": false,
  "error": {
    "code": "DUPLICATE_COLLECTION",
    "message": "该内容已被收藏"
  },
  "timestamp": "2025-10-30T15:33:39.123Z",
  "path": "/api/content/collections"
}
```

**cURL示例**:
```bash
curl -X POST http://localhost:3000/api/content/collections \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"content_type":"medicine","content_id":"d85c3b55-0f83-4354-a37c-73d01b273072"}'
```

---

### 1.2 获取收藏列表

**接口**: `GET /api/content/collections`  
**权限**: `health_follower`, `student`  
**请求参数**: 无

**成功响应** (200):
```json
{
  "success": true,
  "message": "获取收藏列表成功",
  "data": [
    {
      "collection_id": "b07ec688-b335-417a-973f-18756fdbdd93",
      "user_id": "3725afa0-08c5-4c18-854f-81db9e003c1b",
      "content_type": "medicine",
      "content_id": "d85c3b55-0f83-4354-a37c-73d01b273072",
      "created_at": "2025-10-30T15:33:39.000Z"
    },
    {
      "collection_id": "373c8eb9-6220-4960-aeaa-33604a19a66b",
      "user_id": "3725afa0-08c5-4c18-854f-81db9e003c1b",
      "content_type": "formula",
      "content_id": "1ad75812-66fb-42f9-b53f-4e4e1c0644b8",
      "created_at": "2025-10-30T15:33:38.000Z"
    }
  ]
}
```

**cURL示例**:
```bash
curl -X GET http://localhost:3000/api/content/collections \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

### 1.3 删除收藏

**接口**: `DELETE /api/content/collections/:collection_id`  
**权限**: `health_follower`, `student`  
**路径参数**: `collection_id` - 收藏记录ID

**成功响应** (200):
```json
{
  "success": true,
  "message": "收藏删除成功"
}
```

**不存在响应** (404):
```json
{
  "success": false,
  "error": {
    "code": "COLLECTION_NOT_FOUND",
    "message": "收藏记录不存在或无权删除"
  },
  "timestamp": "2025-10-30T15:33:39.123Z",
  "path": "/api/content/collections/00000000-0000-0000-0000-000000000000"
}
```

**cURL示例**:
```bash
curl -X DELETE http://localhost:3000/api/content/collections/b07ec688-b335-417a-973f-18756fdbdd93 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 🧪 2. 模拟方案管理

### 2.1 保存模拟方案

**接口**: `POST /api/content/simulations/save`  
**权限**: `health_follower`, `student`  
**请求体**:
```json
{
  "name": "补气方案A",
  "composition_data": {
    "medicines": [
      {
        "medicine_id": "d85c3b55-0f83-4354-a37c-73d01b273072",
        "dosage": 10,
        "unit": "克"
      }
    ]
  },
  "ai_analysis_data": {
    "efficacy": "补气健脾",
    "safety": "配伍安全"
  },
  "user_notes": "适用于气虚体质"
}
```

**字段说明**:
- `name`: **必填**，方案名称（字符串）
- `composition_data`: **必填**，配方组成数据（JSON对象）
- `ai_analysis_data`: 可选，AI分析结果（JSON对象）
- `user_notes`: 可选，用户备注（字符串）

**成功响应** (201):
```json
{
  "success": true,
  "message": "模拟方案保存成功",
  "data": {
    "simulation_id": "48095e70-c1d4-465f-9165-e5cbb1645558",
    "user_id": "7e1631c6-f5ce-4171-836a-0536572f0a2b",
    "name": "补气方案A",
    "composition_data": {
      "medicines": [...]
    },
    "ai_analysis_data": {
      "efficacy": "补气健脾",
      "safety": "配伍安全"
    },
    "user_notes": "适用于气虚体质",
    "created_at": "2025-10-30T15:33:39.000Z",
    "updated_at": "2025-10-30T15:33:39.000Z"
  }
}
```

**验证失败响应** (400):
```json
{
  "timestamp": "2025-10-30T15:33:39.123Z",
  "status": 400,
  "error": "Bad Request",
  "message": "请求参数验证失败",
  "errors": [
    {
      "type": "field",
      "value": "",
      "msg": "模拟方案名称不能为空",
      "path": "name",
      "location": "body"
    }
  ],
  "path": "/api/content/simulations/save"
}
```

**cURL示例**:
```bash
curl -X POST http://localhost:3000/api/content/simulations/save \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "补气方案A",
    "composition_data": {"medicines": []},
    "user_notes": "测试方案"
  }'
```

---

### 2.2 获取模拟方案列表

**接口**: `GET /api/content/simulations`  
**权限**: `health_follower`, `student`  
**请求参数**: 无

**成功响应** (200):
```json
{
  "success": true,
  "message": "获取模拟方案列表成功",
  "data": [
    {
      "simulation_id": "48095e70-c1d4-465f-9165-e5cbb1645558",
      "user_id": "7e1631c6-f5ce-4171-836a-0536572f0a2b",
      "name": "补气方案A",
      "composition_data": {...},
      "ai_analysis_data": {...},
      "user_notes": "适用于气虚体质",
      "created_at": "2025-10-30T15:33:39.000Z",
      "updated_at": "2025-10-30T15:33:39.000Z"
    }
  ]
}
```

**cURL示例**:
```bash
curl -X GET http://localhost:3000/api/content/simulations \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

### 2.3 删除模拟方案

**接口**: `DELETE /api/content/simulations/:simulation_id`  
**权限**: `health_follower`, `student`  
**路径参数**: `simulation_id` - 方案ID

**成功响应** (200):
```json
{
  "success": true,
  "message": "模拟方案删除成功"
}
```

**不存在响应** (404):
```json
{
  "success": false,
  "error": {
    "code": "SIMULATION_NOT_FOUND",
    "message": "模拟方案不存在或无权删除"
  },
  "timestamp": "2025-10-30T15:33:39.123Z",
  "path": "/api/content/simulations/..."
}
```

**cURL示例**:
```bash
curl -X DELETE http://localhost:3000/api/content/simulations/48095e70-c1d4-465f-9165-e5cbb1645558 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 📁 3. 文件元数据管理（仅教师）

### 3.1 保存文件元数据（内部接口）

**接口**: `POST /api/content/files/meta`  
**权限**: 内部服务（待实现独立认证）  
**请求体**:
```json
{
  "user_id": "0e888841-0615-404f-861f-14ab1039cda7",
  "file_name": "中医基础理论.pdf",
  "storage_url": "https://d8.example.com/files/tcm-basics.pdf",
  "file_type": "application/pdf",
  "uploaded_at": "2025-10-30T15:33:39.000Z"
}
```

**字段说明**:
- `user_id`: **必填**，教师用户ID（UUID）
- `file_name`: **必填**，文件名（字符串）
- `storage_url`: **必填**，D8存储URL（URL格式）
- `file_type`: 可选，MIME类型（字符串）
- `uploaded_at`: **必填**，上传时间（ISO8601日期）

**成功响应** (201):
```json
{
  "success": true,
  "message": "文件元数据保存成功",
  "data": {
    "file_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "user_id": "0e888841-0615-404f-861f-14ab1039cda7",
    "file_name": "中医基础理论.pdf",
    "storage_url": "https://d8.example.com/files/tcm-basics.pdf",
    "file_type": "application/pdf",
    "file_size": null,
    "uploaded_at": "2025-10-30T15:33:39.000Z"
  }
}
```

**⚠️ 注意**: 此接口应仅供内部服务调用，不应直接暴露给前端。

---

### 3.2 获取文件列表

**接口**: `GET /api/content/files`  
**权限**: `teacher`  
**请求参数**: 无

**成功响应** (200):
```json
{
  "success": true,
  "message": "获取文件列表成功",
  "data": [
    {
      "file_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      "user_id": "0e888841-0615-404f-861f-14ab1039cda7",
      "file_name": "中医基础理论.pdf",
      "storage_url": "https://d8.example.com/files/tcm-basics.pdf",
      "file_type": "application/pdf",
      "file_size": 1024000,
      "uploaded_at": "2025-10-30T15:33:39.000Z"
    }
  ]
}
```

**cURL示例**:
```bash
curl -X GET http://localhost:3000/api/content/files \
  -H "Authorization: Bearer TEACHER_TOKEN"
```

---

### 3.3 删除文件

**接口**: `DELETE /api/content/files/:file_id`  
**权限**: `teacher`  
**路径参数**: `file_id` - 文件ID

**成功响应** (200):
```json
{
  "success": true,
  "message": "文件删除成功"
}
```

**⚠️ TODO**: 当前仅删除元数据，D8对象存储文件删除待集成。

**cURL示例**:
```bash
curl -X DELETE http://localhost:3000/api/content/files/a1b2c3d4-e5f6-7890-abcd-ef1234567890 \
  -H "Authorization: Bearer TEACHER_TOKEN"
```

---

## 🔒 4. 错误响应格式

### 4.1 未认证 (401)
```json
{
  "timestamp": "2025-10-30T15:33:39.123Z",
  "status": 401,
  "error": "Unauthorized",
  "message": "访问令牌缺失。",
  "path": "/api/content/collections"
}
```

### 4.2 权限不足 (403)
```json
{
  "timestamp": "2025-10-30T15:33:39.123Z",
  "status": 403,
  "error": "Forbidden",
  "message": "您无权访问此资源。需要角色: teacher",
  "path": "/api/content/files"
}
```

### 4.3 资源不存在 (404)
```json
{
  "success": false,
  "error": {
    "code": "COLLECTION_NOT_FOUND",
    "message": "收藏记录不存在或无权删除"
  },
  "timestamp": "2025-10-30T15:33:39.123Z",
  "path": "/api/content/collections/..."
}
```

### 4.4 冲突 (409)
```json
{
  "success": false,
  "error": {
    "code": "DUPLICATE_COLLECTION",
    "message": "该内容已被收藏"
  },
  "timestamp": "2025-10-30T15:33:39.123Z",
  "path": "/api/content/collections"
}
```

### 4.5 服务器错误 (500)
```json
{
  "timestamp": "2025-10-30T15:33:39.123Z",
  "status": 500,
  "error": "Internal Server Error",
  "message": "服务器内部错误，请稍后重试。",
  "path": "/api/content/collections"
}
```

---

## 🧪 测试用户账号

```javascript
// 养生爱好者（可访问收藏和方案）
{
  "email": "health@example.com",
  "password": "password123",
  "role": "health_follower"
}

// 学生（可访问收藏和方案）
{
  "email": "student@example.com",
  "password": "password123",
  "role": "student"
}

// 教师（可访问文件管理）
{
  "email": "teacher@example.com",
  "password": "password123",
  "role": "teacher"
}
```

---

## 📋 权限矩阵

| 接口 | health_follower | student | teacher |
|------|----------------|---------|---------|
| POST /collections | ✅ | ✅ | ❌ |
| GET /collections | ✅ | ✅ | ❌ |
| DELETE /collections/:id | ✅ | ✅ | ❌ |
| POST /simulations/save | ✅ | ✅ | ❌ |
| GET /simulations | ✅ | ✅ | ❌ |
| DELETE /simulations/:id | ✅ | ✅ | ❌ |
| POST /files/meta | 🔧 内部 | 🔧 内部 | 🔧 内部 |
| GET /files | ❌ | ❌ | ✅ |
| DELETE /files/:id | ❌ | ❌ | ✅ |

---

**文档版本**: v1.0  
**最后更新**: 2025-10-30  
**维护者**: AI Assistant
