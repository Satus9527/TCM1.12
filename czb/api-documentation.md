# 中医智慧平台后端API接口规范

## 1. 概述

本文档定义了中医智慧平台的后端API接口规范，包括用户、药材、处方等模块的接口设计。

### 1.1 基础URL

```
https://api.tcm-platform.com/v1
```

### 1.2 响应格式

所有API响应均采用JSON格式，包含以下字段：

```json
{
  "code": 200,        // 响应状态码
  "message": "成功",   // 响应消息
  "data": {}          // 响应数据
}
```

### 1.3 状态码

| 状态码 | 描述 |
|--------|------|
| 200    | 成功 |
| 400    | 请求参数错误 |
| 401    | 未授权 |
| 403    | 禁止访问 |
| 404    | 资源不存在 |
| 500    | 服务器错误 |

## 2. 用户模块

### 2.1 获取用户统计数据

**请求方式**: GET
**请求路径**: `/api/user/stats`
**认证方式**: Token

**响应数据**:

```json
{
  "code": 200,
  "message": "成功",
  "data": {
    "prescriptions": 140,         // 配伍记录数
    "favorites": 0,               // 收藏数
    "learningHours": 0,           // 学习时长（分钟）
    "medicineCount": 56,          // 药材库总量
    "medicineTrend": 12,          // 药材库增长趋势
    "compatibilityRate": 85,      // 配伍成功率
    "rateTrend": 5,               // 成功率趋势
    "learningProgress": 0,        // 学习进度
    "progressTrend": 5,           // 学习进度趋势
    "medicineChartData": [60, 80, 70, 90, 85, 75, 95, 80, 90, 75, 85, 90], // 药材库趋势图数据
    "rateChartData": [75, 80, 78, 82, 80, 75, 78, 80, 82, 85, 82, 80],     // 成功率趋势图数据
    "progressChartData": [10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65]  // 学习进度趋势图数据
  }
}
```

### 2.2 获取用户活动记录

**请求方式**: GET
**请求路径**: `/api/user/activities`
**认证方式**: Token
**请求参数**:

| 参数名 | 类型 | 必填 | 描述 |
|--------|------|------|------|
| limit  | int  | 否   | 返回记录数，默认10 |

**响应数据**:

```json
{
  "code": 200,
  "message": "成功",
  "data": [
    {
      "id": 1,
      "title": "查看了人参详情",
      "time": "2小时前",
      "icon": "ri-search-line",
      "route": "/knowledge"
    }
  ]
}
```

### 2.3 获取今日提示

**请求方式**: GET
**请求路径**: `/api/user/tips`
**认证方式**: Token

**响应数据**:

```json
{
  "code": 200,
  "message": "成功",
  "data": [
    {
      "type": "success",
      "icon": "ri-sun-line",
      "text": "今日宜研究补气类药材配伍"
    }
  ]
}
```

### 2.4 获取用户收藏

**请求方式**: GET
**请求路径**: `/api/user/favorites`
**认证方式**: Token

**响应数据**:

```json
{
  "code": 200,
  "message": "成功",
  "data": [
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
      "usage": "煎服"
    }
  ]
}
```

## 3. 药材模块

### 3.1 获取药材分类

**请求方式**: GET
**请求路径**: `/api/medicine/categories`
**认证方式**: 无需认证

**响应数据**:

```json
{
  "code": 200,
  "message": "成功",
  "data": [
    {
      "id": "tonifying",
      "name": "补益药",
      "icon": "ri-heart-line",
      "count": 28
    }
  ]
}
```

### 3.2 搜索药材

**请求方式**: GET
**请求路径**: `/api/medicine/search`
**认证方式**: 无需认证
**请求参数**:

| 参数名 | 类型 | 必填 | 描述 |
|--------|------|------|------|
| keyword | string | 否 | 搜索关键词 |
| category | string | 否 | 分类ID |
| page | int | 否 | 页码，默认1 |
| limit | int | 否 | 每页记录数，默认12 |
| sortBy | string | 否 | 排序字段，默认created_at |
| sortOrder | string | 否 | 排序方式，默认DESC |

**响应数据**:

```json
{
  "code": 200,
  "message": "成功",
  "data": [
    {
      "id": 1,
      "name": "人参",
      "latinName": "Panax ginseng C. A. Mey.",
      "category": "tonifying",
      "property": "甘、微苦，微温",
      "meridian": "脾、肺、心、肾经",
      "efficacy": "大补元气，复脉固脱，补脾益肺，生津养血，安神益智",
      "toxicity": "无毒",
      "favorite": false
    }
  ],
  "pagination": {
    "total": 56,
    "page": 1,
    "limit": 12,
    "pages": 5
  }
}
```

### 3.3 获取药材详情

**请求方式**: GET
**请求路径**: `/api/medicine/detail/:id`
**认证方式**: 无需认证
**路径参数**:

| 参数名 | 类型 | 必填 | 描述 |
|--------|------|------|------|
| id | int | 是 | 药材ID |

**响应数据**:

```json
{
  "code": 200,
  "message": "成功",
  "data": {
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
    "usage": "煎服",
    "clinicalApplications": ["用于气虚欲脱，肢冷脉微，脾虚食少，肺虚喘咳，津伤口渴，内热消渴，气血亏虚，久病虚羸，惊悸失眠，阳痿宫冷"],
    "contraindications": ["不宜与藜芦、五灵脂同用"],
    "modernResearch": "现代研究表明，人参具有抗疲劳、抗衰老、提高免疫力等作用。",
    "favorite": false
  }
}
```

### 3.4 切换收藏状态

**请求方式**: POST
**请求路径**: `/api/medicine/favorite/:id`
**认证方式**: Token
**路径参数**:

| 参数名 | 类型 | 必填 | 描述 |
|--------|------|------|------|
| id | int | 是 | 药材ID |

**响应数据**:

```json
{
  "code": 200,
  "message": "收藏成功",
  "data": {
    "id": 1,
    "favorite": true
  }
}
```

## 4. 处方模块

### 4.1 获取处方列表

**请求方式**: GET
**请求路径**: `/api/prescription/list`
**认证方式**: Token
**请求参数**:

| 参数名 | 类型 | 必填 | 描述 |
|--------|------|------|------|
| page | int | 否 | 页码，默认1 |
| limit | int | 否 | 每页记录数，默认10 |

**响应数据**:

```json
{
  "code": 200,
  "message": "成功",
  "data": [
    {
      "id": 1,
      "name": "四君子汤",
      "description": "益气健脾",
      "status": "success",
      "time": "2024-01-15"
    }
  ]
}
```

### 4.2 保存处方

**请求方式**: POST
**请求路径**: `/api/prescription/save`
**认证方式**: Token
**请求数据**:

```json
{
  "name": "未命名处方",
  "mainDisease": "脾胃气虚",
  "medicines": [
    {
      "id": 1,
      "name": "人参",
      "dosage": 9,
      "role": "monarch"
    }
  ],
  "compatibilityMode": "strict"
}
```

**响应数据**:

```json
{
  "code": 200,
  "message": "处方保存成功",
  "data": {
    "id": 1001
  }
}
```

### 4.3 分析配伍

**请求方式**: POST
**请求路径**: `/api/prescription/analyze`
**认证方式**: Token
**请求数据**:

```json
{
  "medicines": [
    {
      "id": 1,
      "name": "人参",
      "dosage": 9,
      "role": "monarch",
      "property": "甘、微苦，微温",
      "meridian": "脾、肺、心、肾经"
    },
    {
      "id": 3,
      "name": "白术",
      "dosage": 9,
      "role": "minister",
      "property": "甘、苦，温",
      "meridian": "脾、胃经"
    }
  ]
}
```

**响应数据**:

```json
{
  "code": 200,
  "message": "分析成功",
  "data": {
    "compatibilityScore": 95,
    "tasteAnalysis": [
      { "taste": "甘", "count": 2, "percentage": 100 }
    ],
    "meridianAnalysis": [
      { "meridian": "脾经", "count": 2, "percentage": 100 },
      { "meridian": "肺经", "count": 1, "percentage": 50 }
    ],
    "synergyEffects": [
      "人参配白术，益气健脾功效增强"
    ],
    "tabooList": [],
    "safetySuggestions": []
  }
}
```

## 5. AI咨询模块

### 5.1 智能咨询

**请求方式**: POST
**请求路径**: `/api/ai/consult`
**认证方式**: Token
**请求数据**:

```json
{
  "question": "请分析四君子汤的配伍特点",
  "type": "prescription",
  "medicines": "人参、白术、茯苓、甘草"
}
```

**响应数据**:

```json
{
  "code": 200,
  "message": "咨询成功",
  "data": {
    "answer": "四君子汤由人参、白术、茯苓、甘草组成，具有益气健脾的功效。方中人参大补元气为君药，白术健脾燥湿为臣药，茯苓渗湿健脾为佐药，甘草调和诸药为使药。四药配伍，补而不峻，温而不燥，是益气健脾的基础方。"
  }
}
```

## 6. 安全规范

### 6.1 认证机制

- 使用JWT Token进行认证
- Token有效期为7天
- 每次请求需在Authorization头中携带Token

### 6.2 速率限制

- 普通用户：60次/分钟
- 认证用户：120次/分钟

### 6.3 数据加密

- 敏感数据传输使用HTTPS加密
- 密码存储使用BCrypt加密

## 7. 版本管理

| 版本 | 日期 | 描述 |
|------|------|------|
| v1.0 | 2024-01-14 | 初始版本 |

## 8. 联系方式

如有问题，请联系API开发团队：api-dev@tcm-platform.com