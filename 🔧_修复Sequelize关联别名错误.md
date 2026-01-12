# 🔧 修复 Sequelize 关联别名错误

**日期**: 2025-01-03  
**错误**: "Formula is associated to Medicine using an alias. You've included an alias (formulas), but it does not match the alias(es) defined in your association (Formulas)."

---

## 🐛 问题原因

**错误原因**:
- 在 `src/models/Medicine.js` 中，关联定义的别名是 `as: 'formulas'`（小写）
- 但在 `src/models/index.js` 中，关联定义没有指定别名
- Sequelize 在加载模型时，会因为关联定义不一致导致别名冲突
- 当 `medicineService.js` 使用 `as: 'formulas'` 查询时，Sequelize 找不到匹配的别名

---

## ✅ 修复方案

### 修复文件: `src/models/index.js`

**问题代码**（第42-51行）:
```javascript
db.Medicine.belongsToMany(db.Formula, {
  through: db.FormulaComposition,
  foreignKey: 'medicine_id',
  otherKey: 'formula_id'
  // ❌ 缺少别名 as
});
```

**修复后**:
```javascript
db.Medicine.belongsToMany(db.Formula, {
  through: db.FormulaComposition,
  foreignKey: 'medicine_id',
  otherKey: 'formula_id',
  as: 'formulas'  // ✅ 添加别名，与 Medicine.js 中的定义保持一致
});
```

---

## 📋 关联定义一致性

### Medicine → Formula 关联

| 文件 | 别名 | 状态 |
|------|------|------|
| `src/models/Medicine.js` | `as: 'formulas'` | ✅ 已定义 |
| `src/models/index.js` | `as: 'formulas'` | ✅ 已修复 |

### Formula → Medicine 关联

| 文件 | 别名 | 状态 |
|------|------|------|
| `src/models/Formula.js` | `as: 'medicines'` | ✅ 已定义 |
| `src/models/index.js` | `as: 'medicines'` | ✅ 已定义 |

---

## 🧪 验证修复

修复后，应该能够正常查询药材详情和常用药方：

```javascript
// 在 medicineService.js 中
const medicine = await Medicine.findByPk(medicineId, {
  include: [{
    model: Formula,
    as: 'formulas',  // ✅ 现在应该能正确匹配
    through: {
      model: FormulaComposition,
      attributes: ['dosage', 'role']
    },
    attributes: ['formula_id', 'name', 'composition_summary'],
    limit: 10,
    required: false
  }]
});
```

---

## 💡 为什么会有重复的关联定义？

**原因**:
- Sequelize 的最佳实践是在模型文件中定义关联（`associate` 方法）
- 但有些项目也会在 `index.js` 中集中定义关联
- 如果两处都有定义，必须保持**完全一致**，包括别名、外键等

**建议**:
- 优先使用模型文件中的 `associate` 方法定义关联
- 在 `index.js` 中的关联定义只作为备用或兼容性保留
- 确保两处的定义完全一致

---

## ✅ 修复完成

修复后，药材详情查询应该能够正常工作，不再出现别名匹配错误。

**相关文件**:
- ✅ `src/models/index.js` - 已修复别名定义
- ✅ `src/models/Medicine.js` - 别名定义正确
- ✅ `src/services/medicineService.js` - 使用正确的别名查询
