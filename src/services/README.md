# Services 业务逻辑层

此目录包含应用的业务逻辑服务。

## 职责

Services 层负责：

1. 实现核心业务逻辑
2. 协调多个数据模型的操作
3. 处理复杂的数据转换
4. 与外部服务（如 AI 服务）交互
5. 实现可复用的业务功能

## 设计原则

1. **单一职责**: 每个 service 文件应专注于一个业务领域
2. **独立性**: Service 应该独立于 HTTP 层（controllers）
3. **可测试性**: Service 应该易于单元测试
4. **错误处理**: Service 应该抛出明确的业务异常

## 示例结构

```javascript
// userService.js
const { User } = require('../models');
const { hashPassword } = require('../utils/hashUtils');

class UserService {
  async createUser(userData) {
    // 业务逻辑
    const hashedPassword = await hashPassword(userData.password);
    
    const user = await User.create({
      ...userData,
      password_hash: hashedPassword
    });
    
    return user;
  }

  async getUserById(userId) {
    const user = await User.findByPk(userId);
    
    if (!user) {
      const error = new Error('User not found');
      error.statusCode = 404;
      throw error;
    }
    
    return user;
  }
}

module.exports = new UserService();
```

## 待实现的 Services

- [ ] authService.js - 认证相关业务逻辑
- [ ] userService.js - 用户管理
- [ ] medicineService.js - 药材管理
- [ ] formulaService.js - 方剂管理
- [ ] collectionService.js - 收藏管理
- [ ] simulationService.js - 模拟配方
- [ ] fileService.js - 文件管理
- [ ] aiService.js - AI 服务集成

