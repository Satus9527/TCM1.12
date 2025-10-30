const { Medicine, Formula, FormulaComposition } = require('../models');
const { Op } = require('sequelize');
const redisClient = require('../utils/redisClient');
const logger = require('../utils/logger');
const config = require('../../config');

// 缓存 TTL 配置（秒）
const CACHE_TTL = parseInt(process.env.KNOWLEDGE_CACHE_TTL, 10) || 3600; // 默认 1 小时

/**
 * 知识库数据库服务
 * 实现带 Redis 缓存的中医药知识库查询
 * 使用 Cache-Aside Pattern
 */
class KnowledgeDbService {
  /**
   * 生成缓存键
   * @param {string} prefix - 前缀
   * @param {string} key - 键值
   * @returns {string} Redis 缓存键
   */
  _generateCacheKey(prefix, key) {
    return `knowledge:${prefix}:${key}`;
  }

  /**
   * 从缓存获取数据
   * @param {string} cacheKey - 缓存键
   * @returns {Promise<any|null>} 缓存的数据或 null
   */
  async _getFromCache(cacheKey) {
    try {
      const cachedData = await redisClient.get(cacheKey);
      if (cachedData) {
        logger.debug('缓存命中', { cacheKey });
        // 处理空值标记
        if (cachedData === 'null') {
          return null;
        }
        return JSON.parse(cachedData);
      }
      logger.debug('缓存未命中', { cacheKey });
      return null;
    } catch (error) {
      logger.warn('缓存读取失败', { cacheKey, error: error.message });
      return null; // 缓存失败不影响主流程
    }
  }

  /**
   * 写入缓存
   * @param {string} cacheKey - 缓存键
   * @param {any} data - 要缓存的数据
   * @param {number} ttl - 过期时间（秒）
   */
  async _setCache(cacheKey, data, ttl = CACHE_TTL) {
    try {
      const jsonData = data === null ? 'null' : JSON.stringify(data);
      await redisClient.set(cacheKey, jsonData, ttl);
      logger.debug('数据已缓存', { cacheKey, ttl });
    } catch (error) {
      logger.warn('缓存写入失败', { cacheKey, error: error.message });
      // 缓存失败不影响主流程
    }
  }

  /**
   * 根据 ID 获取药材详情（带缓存）
   * @param {string} medicineId - 药材 ID
   * @returns {Promise<Object|null>} 药材对象或 null
   */
  async getMedicineById(medicineId) {
    const cacheKey = this._generateCacheKey('med', medicineId);

    // 1. 尝试从缓存获取
    const cached = await this._getFromCache(cacheKey);
    if (cached !== null) {
      return cached;
    }

    // 2. 缓存未命中，查询数据库
    try {
      const medicine = await Medicine.findByPk(medicineId);

      // 3. 写入缓存（包括空结果，防止缓存穿透）
      if (medicine) {
        await this._setCache(cacheKey, medicine.toJSON(), CACHE_TTL);
        logger.info('查询药材成功', { medicineId });
      } else {
        // 缓存空值，使用较短的 TTL
        await this._setCache(cacheKey, null, 300); // 5 分钟
        logger.info('药材不存在', { medicineId });
      }

      return medicine;
    } catch (error) {
      logger.error('查询药材失败', { medicineId, error: error.message });
      throw error;
    }
  }

  /**
   * 按名称或拼音搜索药材（带缓存）
   * @param {string} query - 搜索关键词
   * @param {Object} options - 查询选项
   * @returns {Promise<Array>} 药材列表
   */
  async searchMedicinesByName(query, options = {}) {
    const { limit = 20, offset = 0 } = options;
    const cacheKey = this._generateCacheKey('med:search', `${query}:${limit}:${offset}`);

    // 1. 尝试从缓存获取
    const cached = await this._getFromCache(cacheKey);
    if (cached !== null) {
      return cached;
    }

    // 2. 缓存未命中，查询数据库
    try {
      const medicines = await Medicine.findAll({
        where: {
          [Op.or]: [
            { name: { [Op.like]: `%${query}%` } },
            { pinyin: { [Op.like]: `%${query}%` } }
          ]
        },
        limit,
        offset,
        order: [['name', 'ASC']]
      });

      // 3. 写入缓存
      const result = medicines.map(m => m.toJSON());
      await this._setCache(cacheKey, result, CACHE_TTL);

      logger.info('搜索药材成功', { query, count: result.length });
      return result;
    } catch (error) {
      logger.error('搜索药材失败', { query, error: error.message });
      throw error;
    }
  }

  /**
   * 按功效搜索药材
   * @param {string} efficacy - 功效关键词
   * @param {Object} options - 查询选项
   * @returns {Promise<Array>} 药材列表
   */
  async searchMedicinesByEfficacy(efficacy, options = {}) {
    const { limit = 20, offset = 0 } = options;
    const cacheKey = this._generateCacheKey('med:efficacy', `${efficacy}:${limit}:${offset}`);

    // 1. 尝试从缓存获取
    const cached = await this._getFromCache(cacheKey);
    if (cached !== null) {
      return cached;
    }

    // 2. 缓存未命中，查询数据库
    try {
      const medicines = await Medicine.findAll({
        where: {
          efficacy: { [Op.like]: `%${efficacy}%` }
        },
        limit,
        offset,
        order: [['name', 'ASC']]
      });

      // 3. 写入缓存
      const result = medicines.map(m => m.toJSON());
      await this._setCache(cacheKey, result, CACHE_TTL);

      logger.info('按功效搜索药材成功', { efficacy, count: result.length });
      return result;
    } catch (error) {
      logger.error('按功效搜索药材失败', { efficacy, error: error.message });
      throw error;
    }
  }

  /**
   * 根据 ID 获取方剂详情（含组成药材）（带缓存）
   * @param {string} formulaId - 方剂 ID
   * @returns {Promise<Object|null>} 方剂对象或 null
   */
  async getFormulaById(formulaId) {
    const cacheKey = this._generateCacheKey('formula', formulaId);

    // 1. 尝试从缓存获取
    const cached = await this._getFromCache(cacheKey);
    if (cached !== null) {
      return cached;
    }

    // 2. 缓存未命中，查询数据库
    try {
      const formula = await Formula.findByPk(formulaId, {
        include: [
          {
            model: Medicine,
            as: 'medicines',
            through: {
              model: FormulaComposition,
              attributes: ['dosage', 'role', 'notes']
            }
          }
        ]
      });

      // 3. 写入缓存
      if (formula) {
        await this._setCache(cacheKey, formula.toJSON(), CACHE_TTL);
        logger.info('查询方剂成功', { formulaId });
      } else {
        // 缓存空值
        await this._setCache(cacheKey, null, 300); // 5 分钟
        logger.info('方剂不存在', { formulaId });
      }

      return formula;
    } catch (error) {
      logger.error('查询方剂失败', { formulaId, error: error.message });
      throw error;
    }
  }

  /**
   * 按名称搜索方剂（带缓存）
   * @param {string} query - 搜索关键词
   * @param {Object} options - 查询选项
   * @returns {Promise<Array>} 方剂列表
   */
  async searchFormulasByName(query, options = {}) {
    const { limit = 20, offset = 0 } = options;
    const cacheKey = this._generateCacheKey('formula:search', `${query}:${limit}:${offset}`);

    // 1. 尝试从缓存获取
    const cached = await this._getFromCache(cacheKey);
    if (cached !== null) {
      return cached;
    }

    // 2. 缓存未命中，查询数据库
    try {
      const formulas = await Formula.findAll({
        where: {
          [Op.or]: [
            { name: { [Op.like]: `%${query}%` } },
            { pinyin: { [Op.like]: `%${query}%` } }
          ]
        },
        limit,
        offset,
        order: [['name', 'ASC']]
      });

      // 3. 写入缓存
      const result = formulas.map(f => f.toJSON());
      await this._setCache(cacheKey, result, CACHE_TTL);

      logger.info('搜索方剂成功', { query, count: result.length });
      return result;
    } catch (error) {
      logger.error('搜索方剂失败', { query, error: error.message });
      throw error;
    }
  }

  /**
   * 按功效搜索方剂
   * @param {string} efficacy - 功效关键词
   * @param {Object} options - 查询选项
   * @returns {Promise<Array>} 方剂列表
   */
  async searchFormulasByEfficacy(efficacy, options = {}) {
    const { limit = 20, offset = 0 } = options;
    const cacheKey = this._generateCacheKey('formula:efficacy', `${efficacy}:${limit}:${offset}`);

    // 1. 尝试从缓存获取
    const cached = await this._getFromCache(cacheKey);
    if (cached !== null) {
      return cached;
    }

    // 2. 缓存未命中，查询数据库
    try {
      const formulas = await Formula.findAll({
        where: {
          efficacy: { [Op.like]: `%${efficacy}%` }
        },
        limit,
        offset,
        order: [['name', 'ASC']]
      });

      // 3. 写入缓存
      const result = formulas.map(f => f.toJSON());
      await this._setCache(cacheKey, result, CACHE_TTL);

      logger.info('按功效搜索方剂成功', { efficacy, count: result.length });
      return result;
    } catch (error) {
      logger.error('按功效搜索方剂失败', { efficacy, error: error.message });
      throw error;
    }
  }

  /**
   * 批量获取方剂详情（供 P4 内部调用）
   * @param {Array<string>} formulaIds - 方剂 ID 数组
   * @returns {Promise<Object>} 以 formula_id 为键的方剂对象映射
   */
  async getFormulasInBatch(formulaIds) {
    if (!Array.isArray(formulaIds) || formulaIds.length === 0) {
      return {};
    }

    // 限制批量查询数量，防止性能问题
    const MAX_BATCH_SIZE = 100;
    if (formulaIds.length > MAX_BATCH_SIZE) {
      const error = new Error(`批量查询 ID 数量不能超过 ${MAX_BATCH_SIZE}，当前: ${formulaIds.length}`);
      logger.warn('批量查询数量超限', { 
        requestCount: formulaIds.length, 
        maxAllowed: MAX_BATCH_SIZE 
      });
      throw error;
    }

    try {
      const formulas = await Formula.findAll({
        where: {
          formula_id: { [Op.in]: formulaIds }
        },
        include: [
          {
            model: Medicine,
            as: 'medicines',
            through: {
              model: FormulaComposition,
              attributes: ['dosage', 'role', 'notes']
            }
          }
        ]
      });

      // 转换为 ID 映射对象
      const result = {};
      formulas.forEach(formula => {
        result[formula.formula_id] = formula.toJSON();
      });

      logger.info('批量查询方剂成功', { 
        requestCount: formulaIds.length, 
        foundCount: formulas.length 
      });

      return result;
    } catch (error) {
      logger.error('批量查询方剂失败', { 
        formulaIds: formulaIds.slice(0, 5), // 只记录前5个ID
        error: error.message 
      });
      throw error;
    }
  }

  /**
   * 清除特定药材的缓存
   * @param {string} medicineId - 药材 ID
   */
  async clearMedicineCache(medicineId) {
    try {
      const cacheKey = this._generateCacheKey('med', medicineId);
      await redisClient.del(cacheKey);
      logger.info('已清除药材缓存', { medicineId });
    } catch (error) {
      logger.warn('清除药材缓存失败', { medicineId, error: error.message });
    }
  }

  /**
   * 清除特定方剂的缓存
   * @param {string} formulaId - 方剂 ID
   */
  async clearFormulaCache(formulaId) {
    try {
      const cacheKey = this._generateCacheKey('formula', formulaId);
      await redisClient.del(cacheKey);
      logger.info('已清除方剂缓存', { formulaId });
    } catch (error) {
      logger.warn('清除方剂缓存失败', { formulaId, error: error.message });
    }
  }

  /**
   * 清除所有知识库缓存
   * 注意：此方法会清除所有药材和方剂的缓存
   * 建议在批量更新或数据迁移时使用
   */
  async clearAllCache() {
    try {
      // 获取 Redis 客户端
      const client = await redisClient.getClient();
      
      // 使用 KEYS 命令查找所有知识库缓存键
      // 注意：KEYS 命令在生产环境中可能影响性能
      // 如果数据量大，建议使用 SCAN 命令
      const keys = await client.keys('knowledge:*');
      
      if (keys && keys.length > 0) {
        await client.del(keys);
        logger.info('已清除所有知识库缓存', { count: keys.length });
      } else {
        logger.info('无缓存需要清除');
      }
    } catch (error) {
      logger.error('清除所有缓存失败', { error: error.message });
      throw error;
    }
  }
}

module.exports = new KnowledgeDbService();

