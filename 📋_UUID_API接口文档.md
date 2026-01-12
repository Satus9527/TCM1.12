# 📋 TCM Platform UUID API 接口文档

**版本**: v1.0  
**更新日期**: 2025年11月3日  
**用途**: 为前端团队和AI团队提供准确的UUID接口

---

## 🎯 概述

本文档列出所有返回UUID的API接口，供前端和AI团队使用。

**基础URL**: `http://localhost:3000` (开发) / `https://yourdomain.com` (生产)

**认证**: 部分接口需要JWT Token（见接口说明）

**响应格式**: JSON

---

## 📊 接口概览

| 接口 | 方法 | 路径 | 认证 | 返回UUID |
|------|------|------|------|---------|
| 获取药材列表 | GET | `/api/medicines` | 可选 | ✅ medicine_id |
| 获取药材详情 | GET | `/api/medicines/:id` | 可选 | ✅ medicine_id |
| 搜索药材 | GET | `/api/knowledge/medicines/search` | ✅ 必需 | ✅ medicine_id |
| 获取药材详情 | GET | `/api/knowledge/medicines/:id` | ✅ 必需 | ✅ medicine_id |
| 按功效搜索药材 | GET | `/api/knowledge/medicines/efficacy` | ✅ 必需 | ✅ medicine_id |
| 获取方剂列表 | GET | `/api/formulas` | 可选 | ✅ formula_id |
| 获取方剂详情 | GET | `/api/formulas/:id` | 可选 | ✅ formula_id |
| 搜索方剂 | GET | `/api/knowledge/formulas/search` | ✅ 必需 | ✅ formula_id |
| 获取方剂详情 | GET | `/api/knowledge/formulas/:id` | ✅ 必需 | ✅ formula_id |
| 按功效搜索方剂 | GET | `/api/knowledge/formulas/efficacy` | ✅ 必需 | ✅ formula_id |

---

## 📝 详细接口

### 1. 获取药材列表

**接口**: `GET /api/medicines`

**认证**: 可选

**查询参数**:
| 参数 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| page | number | 否 | 1 | 页码 |
| limit | number | 否 | 20 | 每页数量 |
| search | string | 否 | - | 搜索关键词 |
| category | string | 否 | - | 药类筛选 |
| nature | string | 否 | - | 性味筛选 |
| flavor | string | 否 | - | 五味筛选 |
| sortBy | string | 否 | created_at | 排序字段 |
| sortOrder | string | 否 | DESC | 排序方向 |

**请求示例**:
```http
GET /api/medicines?page=1&limit=56 HTTP/1.1
Host: localhost:3000
```

**响应示例**:
```json
{
  "success": true,
  "data": {
    "medicines": [
      {
        "medicine_id": "ef76c5dd-ef1c-4229-a011-9b2a21189510",
        "name": "人参",
        "pinyin": "renshen",
        "category": "补气药",
        "nature": "微温",
        "flavor": "甘、微苦",
        "meridian": "脾、肺、心",
        "efficacy": "大补元气，复脉固脱，补脾益肺，生津养血，安神益智",
        "usage_dosage": "3-9g",
        "image_url": null
      },
      {
        "medicine_id": "ce0ded1e-531e-49ae-bdde-69045e6745e4",
        "name": "白术",
        "pinyin": "baizhu",
        "category": "补气药",
        "nature": "温",
        "flavor": "苦、甘",
        "meridian": "脾、胃",
        "efficacy": "补气健脾，燥湿利水，止汗，安胎",
        "usage_dosage": "6-12g",
        "image_url": null
      }
    ],
    "pagination": {
      "total": 56,
      "page": 1,
      "limit": 56,
      "totalPages": 1
    }
  }
}
```

---

### 2. 获取药材详情

**接口**: `GET /api/medicines/:id`

**认证**: 可选

**路径参数**:
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | UUID | 是 | 药材ID |

**请求示例**:
```http
GET /api/medicines/ef76c5dd-ef1c-4229-a011-9b2a21189510 HTTP/1.1
Host: localhost:3000
```

**响应示例**:
```json
{
  "success": true,
  "data": {
    "medicine_id": "ef76c5dd-ef1c-4229-a011-9b2a21189510",
    "name": "人参",
    "pinyin": "renshen",
    "category": "补气药",
    "nature": "微温",
    "flavor": "甘、微苦",
    "meridian": "脾、肺、心",
    "efficacy": "大补元气，复脉固脱，补脾益肺，生津养血，安神益智",
    "indications": "体虚欲脱，肢冷脉微，脾虚食少，肺虚喘咳，津伤口渴，内热消渴，气血亏虚，久病虚羸，惊悸失眠，阳痿宫冷",
    "usage_dosage": "3-9g",
    "contraindications": "实证、热证忌服",
    "description": "五加科植物人参的干燥根及根茎",
    "image_url": null,
    "created_at": "2024-01-01T00:00:00.000Z",
    "updated_at": "2024-01-01T00:00:00.000Z"
  }
}
```

---

### 3. 搜索药材（知识库API）

**接口**: `GET /api/knowledge/medicines/search`

**认证**: ✅ **必需**

**查询参数**:
| 参数 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| q | string | 是 | - | 搜索关键词（名称或拼音） |
| limit | number | 否 | 20 | 每页数量 |
| offset | number | 否 | 0 | 偏移量 |

**请求示例**:
```http
GET /api/knowledge/medicines/search?q=人参&limit=20&offset=0 HTTP/1.1
Host: localhost:3000
Authorization: Bearer YOUR_JWT_TOKEN
```

**响应示例**:
```json
{
  "success": true,
  "data": [
    {
      "medicine_id": "ef76c5dd-ef1c-4229-a011-9b2a21189510",
      "name": "人参",
      "pinyin": "renshen",
      "category": "补气药",
      "nature": "微温",
      "flavor": "甘、微苦",
      "meridian": "脾、肺、心",
      "efficacy": "大补元气，复脉固脱，补脾益肺，生津养血，安神益智",
      "indications": "体虚欲脱，肢冷脉微，脾虚食少，肺虚喘咳，津伤口渴，内热消渴，气血亏虚，久病虚羸，惊悸失眠，阳痿宫冷",
      "usage_dosage": "3-9g",
      "contraindications": "实证、热证忌服",
      "description": "五加科植物人参的干燥根及根茎",
      "image_url": null,
      "created_at": "2024-01-01T00:00:00.000Z",
      "updated_at": "2024-01-01T00:00:00.000Z"
    }
  ],
  "pagination": {
    "total": 1,
    "limit": 20,
    "offset": 0
  }
}
```

---

### 4. 获取药材详情（知识库API）

**接口**: `GET /api/knowledge/medicines/:id`

**认证**: ✅ **必需**

**路径参数**:
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | UUID | 是 | 药材ID |

**请求示例**:
```http
GET /api/knowledge/medicines/ef76c5dd-ef1c-4229-a011-9b2a21189510 HTTP/1.1
Host: localhost:3000
Authorization: Bearer YOUR_JWT_TOKEN
```

**响应**: 同"获取药材详情"接口

---

### 5. 按功效搜索药材

**接口**: `GET /api/knowledge/medicines/efficacy`

**认证**: ✅ **必需**

**查询参数**:
| 参数 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| q | string | 是 | - | 功效关键词 |
| limit | number | 否 | 20 | 每页数量 |
| offset | number | 否 | 0 | 偏移量 |

**请求示例**:
```http
GET /api/knowledge/medicines/efficacy?q=补气&limit=20&offset=0 HTTP/1.1
Host: localhost:3000
Authorization: Bearer YOUR_JWT_TOKEN
```

**响应**: 药材列表数组

---

### 6. 获取方剂列表

**接口**: `GET /api/formulas`

**认证**: 可选

**查询参数**: 同药材列表接口

**请求示例**:
```http
GET /api/formulas?page=1&limit=17 HTTP/1.1
Host: localhost:3000
```

**响应示例**:
```json
{
  "success": true,
  "data": {
    "formulas": [
      {
        "formula_id": "1ad75812-66fb-42f9-b53f-4e4e1c0644b8",
        "name": "四君子汤",
        "pinyin": "sijunzitang",
        "category": "补益剂",
        "source": "《太平惠民和剂局方》",
        "composition_summary": "人参、白术、茯苓、甘草",
        "efficacy": "益气健脾",
        "indications": "脾胃气虚证。面色萎白，语声低微，气短乏力，食少便溏，舌淡苔白，脉虚弱",
        "usage_dosage": "水煎服",
        "contraindications": "阴虚火旺或实热证者不宜使用",
        "clinical_applications": "慢性胃炎、胃及十二指肠溃疡等属脾胃气虚者",
        "description": "四君子汤是补气的基础方，功能益气健脾，主治脾胃气虚证",
        "created_at": "2024-01-01T00:00:00.000Z",
        "updated_at": "2024-01-01T00:00:00.000Z"
      }
    ],
    "pagination": {
      "total": 17,
      "page": 1,
      "limit": 17,
      "totalPages": 1
    }
  }
}
```

---

### 7. 获取方剂详情

**接口**: `GET /api/formulas/:id`

**认证**: 可选

**路径参数**:
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | UUID | 是 | 方剂ID |

**请求示例**:
```http
GET /api/formulas/1ad75812-66fb-42f9-b53f-4e4e1c0644b8 HTTP/1.1
Host: localhost:3000
```

**响应示例**:
```json
{
  "success": true,
  "data": {
    "formula_id": "1ad75812-66fb-42f9-b53f-4e4e1c0644b8",
    "name": "四君子汤",
    "pinyin": "sijunzitang",
    "category": "补益剂",
    "source": "《太平惠民和剂局方》",
    "composition_summary": "人参、白术、茯苓、甘草",
    "efficacy": "益气健脾",
    "indications": "脾胃气虚证。面色萎白，语声低微，气短乏力，食少便溏，舌淡苔白，脉虚弱",
    "usage_dosage": "水煎服",
    "contraindications": "阴虚火旺或实热证者不宜使用",
    "clinical_applications": "慢性胃炎、胃及十二指肠溃疡等属脾胃气虚者",
    "modifications": "若呕吐，加半夏以降逆止呕，名六君子汤；若痰多，加陈皮、半夏以理气化痰，名异功散",
    "description": "四君子汤是补气的基础方，功能益气健脾，主治脾胃气虚证",
    "created_at": "2024-01-01T00:00:00.000Z",
    "updated_at": "2024-01-01T00:00:00.000Z",
    "compositions": [
      {
        "composition_id": "a5203bdf-f6c4-4bb8-b951-9e147b24cedc",
        "formula_id": "1ad75812-66fb-42f9-b53f-4e4e1c0644b8",
        "medicine_id": "ef76c5dd-ef1c-4229-a011-9b2a21189510",
        "dosage": "9g",
        "role": "君",
        "processing": null,
        "notes": "大补元气，健脾养胃",
        "created_at": "2024-01-01T00:00:00.000Z",
        "medicine": {
          "medicine_id": "ef76c5dd-ef1c-4229-a011-9b2a21189510",
          "name": "人参",
          "pinyin": "renshen",
          "category": "补虚药",
          "nature": "温",
          "flavor": "甘、微苦",
          "meridian": "脾、肺、心"
        }
      },
      {
        "composition_id": "4ac34457-5f6c-455c-b524-77cae40aba80",
        "formula_id": "1ad75812-66fb-42f9-b53f-4e4e1c0644b8",
        "medicine_id": "ce0ded1e-531e-49ae-bdde-69045e6745e4",
        "dosage": "9g",
        "role": "臣",
        "processing": null,
        "notes": "健脾燥湿",
        "created_at": "2024-01-01T00:00:00.000Z",
        "medicine": {
          "medicine_id": "ce0ded1e-531e-49ae-bdde-69045e6745e4",
          "name": "白术",
          "pinyin": "baizhu",
          "category": "补虚药",
          "nature": "温",
          "flavor": "苦、甘",
          "meridian": "脾、胃"
        }
      }
    ]
  }
}
```

---

### 8. 搜索方剂（知识库API）

**接口**: `GET /api/knowledge/formulas/search`

**认证**: ✅ **必需**

**查询参数**: 同搜索药材接口

**请求示例**:
```http
GET /api/knowledge/formulas/search?q=四君子&limit=20&offset=0 HTTP/1.1
Host: localhost:3000
Authorization: Bearer YOUR_JWT_TOKEN
```

**响应**: 方剂列表数组（含formula_id）

---

### 9. 获取方剂详情（知识库API）

**接口**: `GET /api/knowledge/formulas/:id`

**认证**: ✅ **必需**

**路径参数**:
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | UUID | 是 | 方剂ID |

**响应**: 方剂详情（含组成药材及medicine_id）

---

### 10. 按功效搜索方剂

**接口**: `GET /api/knowledge/formulas/efficacy`

**认证**: ✅ **必需**

**查询参数**: 同按功效搜索药材接口

**响应**: 方剂列表数组（含formula_id）

---

## 🔑 认证说明

### JWT Token 获取

**接口**: `POST /api/auth/login`

**请求示例**:
```http
POST /api/auth/login HTTP/1.1
Host: localhost:3000
Content-Type: application/json

{
  "username": "testuser",
  "password": "password123"
}
```

**响应示例**:
```json
{
  "success": true,
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refresh_token": "another-long-token...",
    "expires_in": 900
  }
}
```

### 使用Token

在需要认证的接口中，添加Header:
```
Authorization: Bearer YOUR_ACCESS_TOKEN
```

---

## ⚠️ 错误响应

### 400 Bad Request

```json
{
  "timestamp": "2025-11-03T08:00:00.000Z",
  "status": 400,
  "error": "Bad Request",
  "message": "无效的药材 ID 格式",
  "path": "/api/knowledge/medicines/invalid-id"
}
```

### 401 Unauthorized

```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Invalid or expired token"
  },
  "timestamp": "2025-11-03T08:00:00.000Z",
  "path": "/api/knowledge/medicines/search"
}
```

### 404 Not Found

```json
{
  "timestamp": "2025-11-03T08:00:00.000Z",
  "status": 404,
  "error": "Not Found",
  "message": "未找到指定的药材",
  "path": "/api/knowledge/medicines/00000000-0000-0000-0000-000000000000"
}
```

### 500 Internal Server Error

```json
{
  "success": false,
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "An unexpected error occurred"
  },
  "timestamp": "2025-11-03T08:00:00.000Z",
  "path": "/api/medicines"
}
```

---

## 📊 UUID字段说明

### 药材UUID

**字段名**: `medicine_id`  
**格式**: UUID v4  
**示例**: `ef76c5dd-ef1c-4229-a011-9b2a21189510`  
**来源**: 数据库自动生成  
**唯一性**: 全局唯一

---

### 方剂UUID

**字段名**: `formula_id`  
**格式**: UUID v4  
**示例**: `1ad75812-66fb-42f9-b53f-4e4e1c0644b8`  
**来源**: 数据库自动生成  
**唯一性**: 全局唯一

---

### 方剂组成UUID

**字段名**: `composition_id`  
**格式**: UUID v4  
**示例**: `a5203bdf-f6c4-4bb8-b951-9e147b24cedc`  
**来源**: 数据库自动生成  
**唯一性**: 全局唯一

---

## 🎯 使用建议

### 前端团队

**获取所有UUID**:
```bash
# 1. 获取所有药材UUID
curl http://localhost:3000/api/medicines?limit=100 | jq '.data.medicines[].medicine_id'

# 2. 获取所有方剂UUID
curl http://localhost:3000/api/formulas?limit=100 | jq '.data.formulas[].formula_id'
```

---

### AI团队

**获取方剂UUID清单**（用于推荐接口返回）:
```bash
# 获取所有方剂（含UUID和名称）
curl http://localhost:3000/api/formulas?limit=100 | jq '.data.formulas[] | {formula_id, name}'
```

**结果示例**:
```json
{
  "formula_id": "1ad75812-66fb-42f9-b53f-4e4e1c0644b8",
  "name": "四君子汤"
}
{
  "formula_id": "476183c0-cc4d-40ab-a0ab-17d41c1540c2",
  "name": "四物汤"
}
```

---

## 📝 快速参考表

### 常用药材UUID

| 名称 | medicine_id |
|------|-------------|
| 人参 | `ef76c5dd-ef1c-4229-a011-9b2a21189510` |
| 白术 | `ce0ded1e-531e-49ae-bdde-69045e6745e4` |
| 茯苓 | `597e7b89-0e38-4da9-843d-33354cba3472` |
| 甘草 | `d85c3b55-0f83-4354-a37c-73d01b273072` |
| 黄芪 | `055b7b8c-8492-466b-a2a4-d6f7c8932784` |
| 当归 | `4cb9112e-9a1e-4f99-b1f8-f81ed4d121d4` |
| 熟地黄 | `763b0a92-8c49-4ef8-ab11-0b7e253ba27d` |
| 白芍 | `e4867d3d-9753-4dcc-acc4-f4e01a1d21d1` |

---

### 常用方剂UUID

| 名称 | formula_id |
|------|------------|
| 四君子汤 | `1ad75812-66fb-42f9-b53f-4e4e1c0644b8` |
| 四物汤 | `476183c0-cc4d-40ab-a0ab-17d41c1540c2` |
| 八珍汤 | `9210e063-1c96-41cb-9127-04ee2da2f6b7` |
| 六味地黄丸 | `6e598704-beeb-4f3a-a8ff-5b9789e88979` |
| 逍遥散 | `ddf2279a-e9a8-4eae-8de5-f313b58f62b2` |
| 桂枝汤 | `24abe694-369a-4fa9-a726-8e01d15512d0` |
| 麻黄汤 | `ef873ed0-1791-48d7-870d-d35e8368a047` |
| 小柴胡汤 | `d396c6be-6c09-46c6-8893-2a02a17d0bb1` |

**注意**: UUID可能会因为数据库重置而变化，请通过API动态获取！

---

## 🔧 测试工具

### cURL示例

```bash
# 获取所有药材UUID
curl -X GET http://localhost:3000/api/medicines?limit=100 \
  | jq '.data.medicines[] | {medicine_id, name}'

# 获取所有方剂UUID
curl -X GET http://localhost:3000/api/formulas?limit=100 \
  | jq '.data.formulas[] | {formula_id, name}'

# 获取特定药材详情
curl -X GET http://localhost:3000/api/medicines/ef76c5dd-ef1c-4229-a011-9b2a21189510

# 获取特定方剂详情（含组成）
curl -X GET http://localhost:3000/api/formulas/1ad75812-66fb-42f9-b53f-4e4e1c0644b8
```

---

### PowerShell示例

```powershell
# 获取所有药材UUID
$response = Invoke-RestMethod -Uri "http://localhost:3000/api/medicines?limit=100" -Method Get
$response.data.medicines | Select-Object medicine_id, name

# 获取所有方剂UUID
$response = Invoke-RestMethod -Uri "http://localhost:3000/api/formulas?limit=100" -Method Get
$response.data.formulas | Select-Object formula_id, name
```

---

## ✅ 接口状态

| 接口 | 状态 | 测试 |
|------|------|------|
| 药材列表 | ✅ 正常 | 通过 |
| 药材详情 | ✅ 正常 | 通过 |
| 药材搜索 | ✅ 正常 | 通过 |
| 药材功效搜索 | ✅ 正常 | 通过 |
| 方剂列表 | ✅ 正常 | 通过 |
| 方剂详情 | ✅ 正常 | 通过 |
| 方剂搜索 | ✅ 正常 | 通过 |
| 方剂功效搜索 | ✅ 正常 | 通过 |

---

**文档版本**: v1.0  
**最后更新**: 2025年11月3日  
**维护者**: 后端团队

