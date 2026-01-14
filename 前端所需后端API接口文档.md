# 前端所需后端API接口文档

## 概述

这份文档整理了前端项目运行所需的所有后端API接口，包含接口路径、请求方式、功能需求、数据格式及优先级，用于指导后端开发人员进行接口实现，保障前端页面功能正常运行。

## 一、 立即需要接口（Dashboard页面运行必备）

该部分接口为 Dashboard 页面正常展示和运行的核心，需优先实现。

### 1. 用户信息接口

- **请求方式**：GET

- **接口路径**：`/api/user/info`

- **接口需求**：获取当前登录用户的详细信息

- **前端期望数据格式**：

```JavaScript

{
  code: 200,
  message: "获取用户信息成功",
  data: {
    user_id: 1,
    username: "用户名",
    name: "用户姓名",  // Dashboard.vue中显示的这个字段
    email: "email@example.com",
    phone: "13800138000",
    role: "user",  // 或 "admin"
    avatar: "头像URL",  // 可选
    avatar_url: "头像URL",  // 可选
    created_at: "2024-01-01T00:00:00.000Z"
  }
}
```

### 2. 用户统计接口

- **请求方式**：GET

- **接口路径**：`/api/user/stats`

- **接口需求**：获取用户的统计数据（Dashboard页面展示用）

- **前端期望数据格式**：

```JavaScript

{
  code: 200,
  message: "获取统计数据成功",
  data: {
    // 快速统计部分
    prescriptions: 12,  // 配伍记录数量
    favorites: 8,       // 收藏内容数量
    learningHours: 24,  // 学习时长（小时）
    
    // 数据概览部分
    medicineCount: 356,      // 药材库总量
    medicineTrend: 12,       // 药材库趋势（百分比，正数为增长）
    medicineChartData: [30, 40, 50, 60, 70, 80, 90],  // 图表数据
    
    compatibilityRate: 85,   // 配伍成功率（百分比）
    rateTrend: 5,            // 成功率趋势
    rateChartData: [65, 70, 75, 80, 85, 90, 95],  // 图表数据
    
    learningProgress: 68,    // 学习进度（百分比）
    progressTrend: 8,        // 学习进度趋势
    progressChartData: [20, 30, 40, 50, 60, 70, 80]  // 图表数据
  }
}
```

## 二、 其次需要接口（其他页面功能必备，按优先级排序）

该部分接口保障前端其他核心页面的功能实现，完成立即需要接口后优先推进。

### 3. 配伍分析接口

- **请求方式**：POST

- **接口路径**：`/api/prescriptions/analyze`

- **接口需求**：对提交的药材组合进行配伍分析，返回分析结果

### 4. 药材详情接口

- **请求方式**：GET

- **接口路径**：`/api/medicines/{id}`

- **接口需求**：根据药材ID获取单个药材的详细信息

### 5. AI症状咨询接口

- **请求方式**：POST

- **接口路径**：`/api/consult`

- **接口需求**：接收用户提交的症状信息，返回方剂推荐及相关分析结果

## 三、 其他待实现接口（完整列表）

除上述核心接口外，前端项目还需以下接口支撑全部功能，可按项目进度逐步实现。

### 3.1 认证相关（已全部实现）

|请求方式|接口路径|功能说明|实现状态|
|---|---|---|---|
|POST|`/api/auth/login`|用户登录|✅ 已实现|
|POST|`/api/auth/register`|用户注册|✅ 已实现|
### 3.2 药材相关（部分已实现）

|请求方式|接口路径|功能说明|实现状态|
|---|---|---|---|
|GET|`/api/medicines`|获取药材列表|✅ 已实现|
|GET|`/api/medicines/{id}`|获取单个药材详情|❓ 待实现|
|GET|`/api/medicine-categories`|获取药材分类列表|❓ 待实现|
|GET|`/api/medicine-properties`|获取药材性味选项列表|❓ 待实现|
|GET|`/api/medicine-efficacies`|获取药材功效选项列表|❓ 待实现|
|POST|`/api/medicines/{id}/favorite`|收藏指定药材|❓ 待实现|
### 3.3 处方相关（全部待实现）

|请求方式|接口路径|功能说明|实现状态|
|---|---|---|---|
|POST|`/api/prescriptions/analyze`|药材配伍分析|❓ 待实现|
|POST|`/api/prescriptions`|保存新处方|❓ 待实现|
|GET|`/api/prescriptions`|获取用户处方列表|❓ 待实现|
|GET|`/api/prescriptions/{id}`|获取单个处方详情|❓ 待实现|
|DELETE|`/api/prescriptions/{id}`|删除指定处方|❓ 待实现|
|GET|`/api/prescriptions/{id}/export`|导出指定处方|❓ 待实现|
### 3.4 AI相关（全部待实现）

|请求方式|接口路径|功能说明|实现状态|
|---|---|---|---|
|POST|`/api/consult`|症状咨询与方剂推荐/分析|❓ 待实现|
### 3.5 用户其他功能（全部待实现）

|请求方式|接口路径|功能说明|实现状态|
|---|---|---|---|
|GET|`/api/user/favorites`|获取用户收藏列表|❓ 待实现|
|POST|`/api/user/favorites`|添加新收藏|❓ 待实现|
|DELETE|`/api/user/favorites/{id}`|取消指定收藏|❓ 待实现|
|GET|`/api/user/learning-history`|获取用户学习记录|❓ 待实现|
|POST|`/api/user/learning-history`|添加新学习记录|❓ 待实现|
|PUT|`/api/user/info`|更新用户个人信息|❓ 待实现|
### 3.6 文件上传相关（全部待实现）

|请求方式|接口路径|功能说明|实现状态|
|---|---|---|---|
|POST|`/api/files/upload`|上传文件（如头像、附件等）|❓ 待实现|
|GET|`/api/user/files`|获取用户上传文件列表|❓ 待实现|
|DELETE|`/api/files/{id}`|删除指定上传文件|❓ 待实现|
> （注：文档部分内容可能由 AI 生成）