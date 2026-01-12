# 🔧 修复 Sequelize "separate" 错误

**日期**: 2025-01-03  
**错误**: "Only HasMany associations support include.separate"

---

## 🐛 问题原因

**错误原因**:
- 在 `medicineService.js` 的 `getMedicineById` 方法中，使用了 `belongsToMany` 关联查询
- 同时在 `include` 中使用了 `limit: 10` 来限制返回的药方数量
- Sequelize 在处理 `belongsToMany` 关联时，如果需要使用 `limit`，会尝试使用 `separate: true`
- 但 `separate: true` 选项只支持 `hasMany` 关联，不支持 `belongsToMany` 关联
- 因此抛出了 "Only HasMany associations support include.separate" 错误

---

## ✅ 修复方案

### 修复文件: `src/services/medicineService.js`

**问题代码**:
```javascript
async getMedicineById(medicineId) {
  const medicine = await Medicine.findByPk(medicineId, {
    include: [{
      model: Formula,
      as: 'formulas',
      through: {
        model: FormulaComposition,
        attributes: ['dosage', 'role']
      },
      attributes: ['formula_id', 'name', 'composition_summary'],
      limit: 10,  // ❌ 这里导致错误
      required: false
    }]
  });
  // ...
}
```

**修复后**:
```javascript
async getMedicineById(medicineId) {
  // 先查询药材基本信息
  const medicine = await Medicine.findByPk(medicineId);
  
  if (!medicine) {
    const error = new Error('药材不存在');
    error.statusCode = 404;
    error.code = 'MEDICINE_NOT_FOUND';
    throw error;
  }

  // 单独查询常用药方（最多10个）
  // 注意：belongsToMany 关联不支持在 include 中使用 limit，需要单独查询
  const formulas = await FormulaComposition.findAll({
    where: { medicine_id: medicineId },
    include: [{
      model: Formula,
      attributes: ['formula_id', 'name', 'composition_summary']
    }],
    attributes: ['dosage', 'role'],
    limit: 10,
    order: [['created_at', 'DESC']]
  });

  const result = medicine.toJSON();

  // 格式化常用药方
  if (formulas && formulas.length > 0) {
    result.common_formulas = formulas.map(fc => {
      const formula = fc.Formula || {};
      return {
        name: formula.name || '',
        composition: formula.composition_summary || '',
        dosage: fc.dosage || '',
        role: fc.role || ''
      };
    });
  } else {
    result.common_formulas = [];
  }

  return result;
}
```

---

## 📋 修复说明

### 为什么需要分开查询？

1. **Sequelize 限制**: `belongsToMany` 关联在 `include` 中使用 `limit` 时，Sequelize 会尝试使用 `separate: true`，但这是 `hasMany` 专有的功能。

2. **解决方案**: 
   - 先查询主模型（Medicine）
   - 然后单独查询关联模型（FormulaComposition + Formula）
   - 在内存中合并数据

3. **优点**:
   - ✅ 避免了 Sequelize 的限制
   - ✅ 仍然可以限制返回的药方数量（通过 `limit`）
   - ✅ 可以灵活控制排序（通过 `order`）

---

## 🧪 验证修复

修复后，药材详情查询应该能够正常工作：
- ✅ 不再出现 "separate" 错误
- ✅ 能够正确返回药材详情
- ✅ 能够正确返回常用药方（最多10个）
- ✅ 药方数据包含名称、组成、用量、角色等信息

---

## 💡 Sequelize 关联查询限制总结

| 关联类型 | 支持 `limit` | 支持 `separate: true` | 说明 |
|---------|-------------|---------------------|------|
| `belongsTo` | ❌ | ❌ | 一对一关联，不需要 limit |
| `hasOne` | ❌ | ❌ | 一对一关联，不需要 limit |
| `hasMany` | ✅ | ✅ | 一对多关联，支持 separate |
| `belongsToMany` | ⚠️ | ❌ | 多对多关联，不支持 separate |

**对于 `belongsToMany` 使用 `limit` 的建议**:
- 如果需要限制数量，应该单独查询关联表（如 `FormulaComposition`）
- 或者在查询后手动截取数组

---

## ✅ 修复完成

修复后，药材详情查询应该能够正常工作，不再出现 "separate" 错误。

**相关文件**:
- ✅ `src/services/medicineService.js` - 已修复查询逻辑
