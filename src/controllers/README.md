# Controllers 控制器层

此目录包含应用的控制器（路由处理器）。

## 职责

Controllers 层负责：

1. 接收和验证 HTTP 请求
2. 调用 Service 层执行业务逻辑
3. 格式化和返回 HTTP 响应
4. 处理 HTTP 相关的错误

## 设计原则

1. **薄控制器**: 控制器应该保持简洁，复杂逻辑放在 Service 层
2. **标准响应**: 使用统一的响应格式
3. **验证优先**: 在调用 Service 前验证输入
4. **错误传递**: 将业务逻辑错误传递给错误处理中间件

## 示例结构

```javascript
// userController.js
const userService = require('../services/userService');
const { validationResult } = require('express-validator');

class UserController {
  async createUser(req, res, next) {
    try {
      // 验证请求
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid input',
            details: errors.array()
          }
        });
      }

      // 调用 Service
      const user = await userService.createUser(req.body);

      // 返回成功响应
      res.status(201).json({
        success: true,
        data: {
          user: {
            user_id: user.user_id,
            username: user.username,
            role: user.role
          }
        }
      });
    } catch (error) {
      next(error);
    }
  }

  async getUserById(req, res, next) {
    try {
      const user = await userService.getUserById(req.params.id);

      res.json({
        success: true,
        data: { user }
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new UserController();
```

## 响应格式

### 成功响应

```json
{
  "success": true,
  "data": {
    // 响应数据
  }
}
```

### 错误响应

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "错误描述",
    "details": {} // 可选的详细信息
  },
  "timestamp": "2024-01-01T00:00:00.000Z",
  "path": "/api/endpoint"
}
```

## 待实现的 Controllers

- [ ] authController.js - 认证（登录、注册、刷新令牌）
- [ ] userController.js - 用户管理
- [ ] medicineController.js - 药材管理
- [ ] formulaController.js - 方剂管理
- [ ] collectionController.js - 收藏管理
- [ ] simulationController.js - 模拟配方
- [ ] fileController.js - 文件上传下载
- [ ] aiController.js - AI 推荐和分析

