const { Medicine } = require('../models');
const { Op } = require('sequelize');
const logger = require('../utils/logger');
const knowledgeDbService = require('./knowledgeDbService');

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
    const medicine = await Medicine.findByPk(medicineId);

    if (!medicine) {
      const error = new Error('药材不存在');
      error.statusCode = 404;
      error.code = 'MEDICINE_NOT_FOUND';
      throw error;
    }

    return medicine;
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

