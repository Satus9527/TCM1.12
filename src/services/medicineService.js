const { Medicine } = require('../models');
const { Op } = require('sequelize');
const logger = require('../utils/logger');
const knowledgeDbService = require('./knowledgeDbService');
const { Formula, FormulaComposition } = require('../models');

class MedicineService {
  /**
   * 获取药材列表（支持分页、搜索、筛选）
   * @param {Object} options - 查询选项
   * @returns {Promise<Object>} 药材列表和分页信息
   */
  async getMedicines(options = {}) {
    const {
      page = 1,
      limit = 20,
      search = '',
      category = '',
      nature = '',
      flavor = '',
      sortBy = 'created_at',
      sortOrder = 'DESC'
    } = options;

    const offset = (page - 1) * limit;

    // 构建查询条件
    const where = {};

    // 搜索条件（名称或拼音）
    if (search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { pinyin: { [Op.like]: `%${search}%` } }
      ];
    }

    // 分类筛选
    if (category) {
      where.category = category;
    }

    // 性味筛选
    if (nature) {
      where.nature = { [Op.like]: `%${nature}%` };
    }

    if (flavor) {
      where.flavor = { [Op.like]: `%${flavor}%` };
    }

    // 查询
    const { rows: medicines, count: total } = await Medicine.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [[sortBy, sortOrder]],
      attributes: [
        'medicine_id',
        'name',
        'pinyin',
        'category',
        'nature',
        'flavor',
        'meridian',
        'efficacy',
        'usage_dosage',
        'image_url'
      ]
    });

    return {
      medicines,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * 根据ID获取药材详情
   * @param {string} medicineId - 药材ID
   * @returns {Promise<Object>} 药材详情
   */
  async getMedicineById(medicineId) {
    // 先查询药材基本信息
    const medicine = await Medicine.findByPk(medicineId);
    
    if (!medicine) {
      const error = new Error('药材不存在');
      error.statusCode = 404;
      error.code = 'MEDICINE_NOT_FOUND';
      throw error;
    }

    const result = medicine.toJSON();

    // 单独查询常用药方（最多10个）
    // 使用 try-catch 包裹，即使查询失败也不影响药材基本信息返回
    try {
      const formulas = await FormulaComposition.findAll({
        where: { medicine_id: medicineId },
        include: [{
          model: Formula,
          as: 'formula',  // FormulaComposition.belongsTo(Formula, { as: 'formula' })
          attributes: ['formula_id', 'name', 'composition_summary'],
          required: false  // LEFT JOIN，即使没有关联的 Formula 也返回 FormulaComposition
        }],
        attributes: ['dosage', 'role'],
        limit: 10,
        order: [['created_at', 'DESC']]
      });

      // 格式化常用药方
      if (formulas && formulas.length > 0) {
        result.common_formulas = formulas
          .filter(fc => fc.formula)  // 过滤掉没有关联 Formula 的记录
          .map(fc => {
            const formula = fc.formula || {};
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
    } catch (error) {
      // 如果查询常用药方失败，记录错误但不抛出，返回空数组
      logger.warn('查询药材常用药方失败', {
        medicineId,
        error: error.message
      });
      result.common_formulas = [];
    }

    return result;
  }

  /**
   * 获取药材分类列表
   * 从药材表中提取唯一分类并统计每个分类的药材数量
   * @returns {Promise<Array>} 分类列表
   */
  async getCategories() {
    const { Sequelize } = require('sequelize');
    const sequelize = Medicine.sequelize;
    
    // 从药材表中提取唯一分类并统计数量
    const categories = await Medicine.findAll({
      attributes: [
        'category',
        [Sequelize.fn('COUNT', Sequelize.col('Medicine.medicine_id')), 'count']
      ],
      where: {
        category: {
          [Op.ne]: null  // 排除分类为空的药材
        }
      },
      group: ['category'],
      order: [[Sequelize.fn('COUNT', Sequelize.col('Medicine.medicine_id')), 'DESC']],
      raw: true
    });

    // 格式化返回数据
    const result = categories.map(cat => ({
      id: cat.category,  // 使用分类名称作为ID
      name: cat.category,
      count: parseInt(cat.count) || 0
    }));

    // 添加"全部药材"选项（统计所有分类的药材总数）
    const totalCount = await Medicine.count({
      where: {
        category: {
          [Op.ne]: null
        }
      }
    });

    // 将"全部药材"放在第一位
    return [
      {
        id: 'all',
        name: '全部药材',
        count: totalCount
      },
      ...result
    ];
  }

  /**
   * 创建药材（仅教师权限）
   * @param {Object} medicineData - 药材数据
   * @returns {Promise<Object>} 创建的药材
   */
  async createMedicine(medicineData) {
    // 检查药材名称是否已存在
    const existing = await Medicine.findOne({
      where: { name: medicineData.name }
    });

    if (existing) {
      const error = new Error('该药材名称已存在');
      error.statusCode = 409;
      error.code = 'MEDICINE_NAME_EXISTS';
      throw error;
    }

    const medicine = await Medicine.create(medicineData);

    logger.info('Medicine created', { medicineId: medicine.medicine_id, name: medicine.name });

    return medicine;
  }

  /**
   * 更新药材（仅教师权限）
   * @param {string} medicineId - 药材ID
   * @param {Object} updateData - 更新数据
   * @returns {Promise<Object>} 更新后的药材
   */
  async updateMedicine(medicineId, updateData) {
    const medicine = await Medicine.findByPk(medicineId);

    if (!medicine) {
      const error = new Error('药材不存在');
      error.statusCode = 404;
      error.code = 'MEDICINE_NOT_FOUND';
      throw error;
    }

    // 如果更新名称，检查是否重复
    if (updateData.name && updateData.name !== medicine.name) {
      const existing = await Medicine.findOne({
        where: { name: updateData.name }
      });

      if (existing) {
        const error = new Error('该药材名称已存在');
        error.statusCode = 409;
        error.code = 'MEDICINE_NAME_EXISTS';
        throw error;
      }
    }

    await medicine.update(updateData);

    // 清除该药材的缓存，确保下次查询获取最新数据
    await knowledgeDbService.clearMedicineCache(medicineId);

    logger.info('Medicine updated', { medicineId: medicine.medicine_id });

    return medicine;
  }

  /**
   * 删除药材（仅教师权限）
   * @param {string} medicineId - 药材ID
   * @returns {Promise<void>}
   */
  async deleteMedicine(medicineId) {
    const medicine = await Medicine.findByPk(medicineId);

    if (!medicine) {
      const error = new Error('药材不存在');
      error.statusCode = 404;
      error.code = 'MEDICINE_NOT_FOUND';
      throw error;
    }

    await medicine.destroy();

    // 清除该药材的缓存
    await knowledgeDbService.clearMedicineCache(medicineId);

    logger.info('Medicine deleted', { medicineId });
  }
}

module.exports = new MedicineService();

