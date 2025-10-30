const { Formula, Medicine, FormulaComposition, User } = require('../models');
const { Op } = require('sequelize');
const logger = require('../utils/logger');
const knowledgeDbService = require('./knowledgeDbService');

class FormulaService {
  /**
   * 获取方剂列表（支持分页、搜索、筛选）
   * @param {Object} options - 查询选项
   * @returns {Promise<Object>} 方剂列表和分页信息
   */
  async getFormulas(options = {}) {
    const {
      page = 1,
      limit = 20,
      search = '',
      category = '',
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

    // 查询
    const { rows: formulas, count: total } = await Formula.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [[sortBy, sortOrder]],
      attributes: [
        'formula_id',
        'name',
        'pinyin',
        'category',
        'source',
        'efficacy',
        'indications',
        'composition_summary'
      ]
    });

    return {
      formulas,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * 根据ID获取方剂详情（包含组成药材）
   * @param {string} formulaId - 方剂ID
   * @returns {Promise<Object>} 方剂详情
   */
  async getFormulaById(formulaId) {
    const formula = await Formula.findByPk(formulaId, {
      include: [{
        model: FormulaComposition,
        as: 'compositions',
        include: [{
          model: Medicine,
          as: 'medicine',
          attributes: ['medicine_id', 'name', 'pinyin', 'category', 'nature', 'flavor']
        }]
      }]
    });

    if (!formula) {
      const error = new Error('方剂不存在');
      error.statusCode = 404;
      error.code = 'FORMULA_NOT_FOUND';
      throw error;
    }

    return formula;
  }

  /**
   * 创建方剂（仅教师权限）
   * @param {Object} formulaData - 方剂数据（包含组成信息）
   * @returns {Promise<Object>} 创建的方剂
   */
  async createFormula(formulaData) {
    const { compositions, ...baseData } = formulaData;

    // 检查方剂名称是否已存在
    const existing = await Formula.findOne({
      where: { name: baseData.name }
    });

    if (existing) {
      const error = new Error('该方剂名称已存在');
      error.statusCode = 409;
      error.code = 'FORMULA_NAME_EXISTS';
      throw error;
    }

    // 创建方剂
    const formula = await Formula.create(baseData);

    // 如果有组成信息，创建关联
    if (compositions && compositions.length > 0) {
      const compositionRecords = compositions.map(comp => ({
        formula_id: formula.formula_id,
        medicine_id: comp.medicine_id,
        dosage: comp.dosage,
        role: comp.role,
        processing: comp.processing,
        notes: comp.notes
      }));

      await FormulaComposition.bulkCreate(compositionRecords);
    }

    logger.info('Formula created', { formulaId: formula.formula_id, name: formula.name });

    // 返回完整的方剂信息（包含组成）
    return await this.getFormulaById(formula.formula_id);
  }

  /**
   * 更新方剂（仅教师权限）
   * @param {string} formulaId - 方剂ID
   * @param {Object} updateData - 更新数据
   * @returns {Promise<Object>} 更新后的方剂
   */
  async updateFormula(formulaId, updateData) {
    const { compositions, ...baseData } = updateData;

    const formula = await Formula.findByPk(formulaId);

    if (!formula) {
      const error = new Error('方剂不存在');
      error.statusCode = 404;
      error.code = 'FORMULA_NOT_FOUND';
      throw error;
    }

    // 如果更新名称，检查是否重复
    if (baseData.name && baseData.name !== formula.name) {
      const existing = await Formula.findOne({
        where: { name: baseData.name }
      });

      if (existing) {
        const error = new Error('该方剂名称已存在');
        error.statusCode = 409;
        error.code = 'FORMULA_NAME_EXISTS';
        throw error;
      }
    }

    // 更新基础信息
    await formula.update(baseData);

    // 如果有组成信息更新，先删除旧的，再创建新的
    if (compositions && compositions.length > 0) {
      await FormulaComposition.destroy({
        where: { formula_id: formulaId }
      });

      const compositionRecords = compositions.map(comp => ({
        formula_id: formulaId,
        medicine_id: comp.medicine_id,
        dosage: comp.dosage,
        role: comp.role,
        processing: comp.processing,
        notes: comp.notes
      }));

      await FormulaComposition.bulkCreate(compositionRecords);
    }

    // 清除该方剂的缓存，确保下次查询获取最新数据
    await knowledgeDbService.clearFormulaCache(formulaId);

    logger.info('Formula updated', { formulaId: formula.formula_id });

    // 返回完整的方剂信息
    return await this.getFormulaById(formulaId);
  }

  /**
   * 删除方剂（仅教师权限）
   * @param {string} formulaId - 方剂ID
   * @returns {Promise<void>}
   */
  async deleteFormula(formulaId) {
    const formula = await Formula.findByPk(formulaId);

    if (!formula) {
      const error = new Error('方剂不存在');
      error.statusCode = 404;
      error.code = 'FORMULA_NOT_FOUND';
      throw error;
    }

    await formula.destroy();

    // 清除该方剂的缓存
    await knowledgeDbService.clearFormulaCache(formulaId);

    logger.info('Formula deleted', { formulaId });
  }
}

module.exports = new FormulaService();

