const { UserCollection, Formula, FormulaComposition, Medicine } = require('../models');
const logger = require('../utils/logger');

class CollectionService {
  /**
   * 添加收藏
   * @param {string} userId - 用户ID
   * @param {string} formulaId - 方剂ID
   * @param {string} notes - 收藏备注
   * @returns {Promise<Object>} 收藏记录
   */
  async addCollection(userId, formulaId, notes = null) {
    // 检查方剂是否存在
    const formula = await Formula.findByPk(formulaId);
    if (!formula) {
      const error = new Error('方剂不存在');
      error.statusCode = 404;
      error.code = 'FORMULA_NOT_FOUND';
      throw error;
    }

    // 检查是否已收藏
    const existing = await UserCollection.findOne({
      where: { user_id: userId, formula_id: formulaId }
    });

    if (existing) {
      const error = new Error('已收藏该方剂');
      error.statusCode = 409;
      error.code = 'ALREADY_COLLECTED';
      throw error;
    }

    // 创建收藏
    const collection = await UserCollection.create({
      user_id: userId,
      formula_id: formulaId,
      notes
    });

    logger.info('Collection added', { userId, formulaId });

    // 返回完整信息
    return await this.getCollectionById(collection.collection_id);
  }

  /**
   * 取消收藏
   * @param {string} userId - 用户ID
   * @param {string} formulaId - 方剂ID
   * @returns {Promise<void>}
   */
  async removeCollection(userId, formulaId) {
    const collection = await UserCollection.findOne({
      where: { user_id: userId, formula_id: formulaId }
    });

    if (!collection) {
      const error = new Error('收藏记录不存在');
      error.statusCode = 404;
      error.code = 'COLLECTION_NOT_FOUND';
      throw error;
    }

    await collection.destroy();

    logger.info('Collection removed', { userId, formulaId });
  }

  /**
   * 更新收藏备注
   * @param {string} userId - 用户ID
   * @param {string} formulaId - 方剂ID
   * @param {string} notes - 新的备注
   * @returns {Promise<Object>} 更新后的收藏记录
   */
  async updateCollectionNotes(userId, formulaId, notes) {
    const collection = await UserCollection.findOne({
      where: { user_id: userId, formula_id: formulaId }
    });

    if (!collection) {
      const error = new Error('收藏记录不存在');
      error.statusCode = 404;
      error.code = 'COLLECTION_NOT_FOUND';
      throw error;
    }

    await collection.update({ notes });

    logger.info('Collection notes updated', { userId, formulaId });

    // 返回完整信息
    return await this.getCollectionById(collection.collection_id);
  }

  /**
   * 获取用户的收藏列表
   * @param {string} userId - 用户ID
   * @param {Object} options - 查询选项
   * @returns {Promise<Object>} 收藏列表和分页信息
   */
  async getUserCollections(userId, options = {}) {
    const {
      page = 1,
      limit = 20,
      sortBy = 'created_at',
      sortOrder = 'DESC'
    } = options;

    const offset = (page - 1) * limit;

    const { rows: collections, count: total } = await UserCollection.findAndCountAll({
      where: { user_id: userId },
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [[sortBy, sortOrder]],
      include: [{
        model: Formula,
        as: 'formula',
        attributes: ['formula_id', 'name', 'pinyin', 'category', 'source', 'efficacy', 'composition_summary']
      }]
    });

    return {
      collections,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * 根据ID获取收藏详情
   * @param {string} collectionId - 收藏ID
   * @returns {Promise<Object>} 收藏详情
   */
  async getCollectionById(collectionId) {
    const collection = await UserCollection.findByPk(collectionId, {
      include: [{
        model: Formula,
        as: 'formula',
        attributes: ['formula_id', 'name', 'pinyin', 'category', 'source', 'efficacy', 'composition_summary']
      }]
    });

    if (!collection) {
      const error = new Error('收藏记录不存在');
      error.statusCode = 404;
      error.code = 'COLLECTION_NOT_FOUND';
      throw error;
    }

    return collection;
  }

  /**
   * 检查是否已收藏
   * @param {string} userId - 用户ID
   * @param {string} formulaId - 方剂ID
   * @returns {Promise<boolean>} 是否已收藏
   */
  async isCollected(userId, formulaId) {
    const collection = await UserCollection.findOne({
      where: { user_id: userId, formula_id: formulaId }
    });

    return !!collection;
  }

  /**
   * 获取用户收藏统计
   * @param {string} userId - 用户ID
   * @returns {Promise<Object>} 统计信息
   */
  async getCollectionStats(userId) {
    const total = await UserCollection.count({
      where: { user_id: userId }
    });

    return {
      total_collections: total
    };
  }
}

module.exports = new CollectionService();

