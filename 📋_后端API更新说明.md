# 📋 后端 API 更新说明

**日期**: 2025-01-03  
**更新内容**: 后端 API 增强（常用药方查询）、种子数据补充

---

## ✅ 已完成的工作

### 1. 更新后端 API - 常用药方查询

#### 1.1 更新文件: `src/services/medicineService.js`

**修改内容**:
- ✅ 在 `getMedicineById` 方法中添加了常用药方查询
- ✅ 通过 `FormulaComposition` 关联查询药材所属的药方
- ✅ 最多返回 10 个常用药方
- ✅ 格式化返回数据，包含药方名称、组成、用量、角色

**代码变更**:
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
      limit: 10,  // 最多返回10个常用药方
      required: false  // LEFT JOIN，即使没有药方也返回药材
    }]
  });

  // ... 错误处理 ...

  const result = medicine.toJSON();

  // 格式化常用药方
  if (result.formulas && result.formulas.length > 0) {
    result.common_formulas = result.formulas.map(formula => ({
      name: formula.name,
      composition: formula.composition_summary || '',
      dosage: formula.FormulaComposition?.dosage || '',
      role: formula.FormulaComposition?.role || ''
    }));
  } else {
    result.common_formulas = [];
  }

  // 移除临时的 formulas 字段，只保留 common_formulas
  delete result.formulas;

  return result;
}
```

**返回数据格式**:
```json
{
  "medicine_id": "uuid",
  "name": "人参",
  "english_name": "Panax ginseng C. A. Mey.",
  "toxicity": "无毒",
  "modern_research": "...",
  "common_formulas": [
    {
      "name": "四君子汤",
      "composition": "人参、白术、茯苓、甘草",
      "dosage": "9g",
      "role": "君"
    },
    {
      "name": "生脉散",
      "composition": "人参、麦冬、五味子",
      "dosage": "9g",
      "role": "君"
    }
  ]
}
```

---

### 2. 补充种子数据 - 新字段数据

#### 2.1 创建文件: `seeders/20250103000001-update-medicine-fields.js`

**功能**:
- ✅ 为现有药材补充 `english_name`（英文名/拉丁学名）
- ✅ 为现有药材补充 `toxicity`（毒性）
- ✅ 为现有药材补充 `modern_research`（现代研究）

**包含的药材**（共 34 种）:
- 人参、白术、茯苓、甘草、黄芪、当归、川芎、白芍、熟地黄、桂枝
- 麻黄、杏仁、麦冬、五味子、山药、大枣、炙甘草、生地黄
- 黄连、黄芩、金银花、连翘、桔梗、薄荷、柴胡、生姜
- 牡丹皮、泽泻、山茱萸、荆芥穗、淡豆豉、牛蒡子、竹叶、枳壳

**数据特点**:
- 英文名（拉丁学名）格式规范，符合植物学命名标准
- 毒性分类：无毒、小毒、有毒
- 现代研究内容丰富，涵盖主要药理作用

**执行方式**:
```bash
cd "d:\TCM web"
npx sequelize-cli db:seed:all
# 或者单独执行
npx sequelize-cli db:seed --seed 20250103000001-update-medicine-fields.js
```

**回滚方式**:
```bash
npx sequelize-cli db:seed:undo --seed 20250103000001-update-medicine-fields.js
```

---

## 📋 字段数据示例

### 示例 1: 人参
```javascript
{
  name: '人参',
  english_name: 'Panax ginseng C. A. Mey.',
  toxicity: '无毒',
  modern_research: '增强免疫功能，抗疲劳，改善心脑血管功能，促进造血，抗氧化，抗肿瘤，降血糖，改善记忆和学习能力'
}
```

### 示例 2: 麻黄（有毒药材）
```javascript
{
  name: '麻黄',
  english_name: 'Ephedra sinica Stapf',
  toxicity: '有毒',
  modern_research: '扩张支气管，抗炎，抗过敏，兴奋中枢神经，升高血压，发汗，利尿'
}
```

### 示例 3: 杏仁（小毒药材）
```javascript
{
  name: '杏仁',
  english_name: 'Prunus armeniaca L.',
  toxicity: '小毒',
  modern_research: '镇咳平喘，润肠通便，抗炎，抗氧化，抗肿瘤，降血糖，降血脂'
}
```

---

## 🔗 API 使用示例

### 获取药材详情（包含常用药方）

**请求**:
```http
GET /api/medicines/{medicine_id}
```

**响应**:
```json
{
  "code": 200,
  "data": {
    "medicine_id": "xxx-xxx-xxx",
    "name": "人参",
    "english_name": "Panax ginseng C. A. Mey.",
    "toxicity": "无毒",
    "modern_research": "增强免疫功能，抗疲劳...",
    "common_formulas": [
      {
        "name": "四君子汤",
        "composition": "人参、白术、茯苓、甘草",
        "dosage": "9g",
        "role": "君"
      }
    ]
  }
}
```

---

## ⚠️ 注意事项

1. **数据库迁移**: 必须先运行字段迁移（`migrations/20250103000001-add-medicine-fields.js`），然后才能运行种子数据更新

2. **关联查询**: `getMedicineById` 方法使用 LEFT JOIN，即使药材没有关联的药方，也会返回 `common_formulas: []`

3. **性能考虑**: 
   - 常用药方限制为最多 10 个
   - 如果药材关联的药方很多，建议添加排序规则（如按使用频率）

4. **数据完整性**: 
   - Seeder 通过药材名称匹配更新，确保数据库中已有对应药材
   - 如果药材名称不匹配，该药材的新字段将不会被更新

---

## 📝 后续建议

1. **优化查询性能**:
   - 考虑为 `formula_composition` 表的 `medicine_id` 添加索引
   - 考虑缓存常用药方查询结果

2. **扩展功能**:
   - 添加按药方使用频率排序
   - 添加药方分类筛选
   - 支持分页查询常用药方

3. **数据维护**:
   - 定期更新现代研究内容
   - 补充更多药材的新字段数据
   - 添加高清图片 URL

---

**更新完成时间**: 2025-01-03  
**更新人员**: AI Assistant
