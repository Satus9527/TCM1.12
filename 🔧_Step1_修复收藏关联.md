# 🔧 步骤1: 修复收藏关联

**目标**: 修复认证测试中的收藏API关联问题  
**时间**: 已完成 ✅  

---

## ✅ 已完成的修改

### 文件: `src/models/index.js`

**位置**: 第58-72行

**添加的代码**:
```javascript
// 用户与收藏的关联
if (db.User && db.UserCollection) {
  db.User.hasMany(db.UserCollection, { foreignKey: 'user_id' });
  db.UserCollection.belongsTo(db.User, { foreignKey: 'user_id' });
  
  // ✅ 新增：收藏与方剂的关联（灵活关联，支持content_type）
  if (db.Formula) {
    db.UserCollection.belongsTo(db.Formula, {
      foreignKey: 'content_id',
      targetKey: 'formula_id',
      constraints: false, // 不创建外键约束（因为用于多种类型）
      as: 'formula'
    });
  }
}
```

---

## ✅ 测试结果

### 修复前
```
通过: 10
失败: 2
总计: 12
```

### 修复后 ✅
```
通过: 12
失败: 0
总计: 12
```

**🎉 认证授权测试现在100%通过！**

---

## 📋 技术说明

### 为什么需要这个关联？

**问题**: `collectionService.js` 使用：
```javascript
const collections = await UserCollection.findAndCountAll({
  include: [{
    model: Formula,
    as: 'formula',  // 👈 需要这个关联
    ...
  }]
});
```

**解决**: 在 `index.js` 中定义关联：
```javascript
db.UserCollection.belongsTo(db.Formula, {
  foreignKey: 'content_id',     // UserCollection中的字段
  targetKey: 'formula_id',      // Formula中的主键
  constraints: false,           // 不创建外键约束
  as: 'formula'                // 关联别名
});
```

### 为什么使用 `constraints: false`？

因为 `content_id` 字段被用于多种类型：
- `content_type = 'formula'` 时，`content_id` = `formula_id`
- `content_type = 'medicine'` 时，`content_id` = `medicine_id`

所以不能创建外键约束。

---

## ✅ 步骤1完成

**状态**: ✅ 已完成并验证  
**下一步**: 步骤2 - MinIO配置（可选）

