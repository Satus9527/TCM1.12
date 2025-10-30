const knowledgeDbService = require('../services/knowledgeDbService');
const logger = require('../utils/logger');

/**
 * 知识库 API 控制器
 * 处理知识库查询的 HTTP 请求
 */
class KnowledgeController {
  /**
   * 搜索药材
   * GET /api/knowledge/medicines/search?q=关键词&limit=20&offset=0
   */
  async searchMedicines(req, res, next) {
    try {
      const { q: query, limit, offset } = req.query;

      // 基础验证
      if (!query || query.trim() === '') {
        return res.status(400).json({
          timestamp: new Date().toISOString(),
          status: 400,
          error: 'Bad Request',
          message: '搜索关键词不能为空',
          path: req.originalUrl
        });
      }

      const options = {
        limit: parseInt(limit, 10) || 20,
        offset: parseInt(offset, 10) || 0
      };

      const medicines = await knowledgeDbService.searchMedicinesByName(
        query.trim(),
        options
      );

      res.status(200).json({
        success: true,
        data: {
          medicines,
          query: query.trim(),
          total: medicines.length,
          limit: options.limit,
          offset: options.offset
        }
      });
    } catch (error) {
      logger.error('搜索药材失败', {
        correlationId: req.id,
        error: error.message,
        stack: error.stack
      });
      next(error);
    }
  }

  /**
   * 根据 ID 获取药材详情
   * GET /api/knowledge/medicines/:id
   */
  async getMedicineById(req, res, next) {
    try {
      const { id } = req.params;

      // 验证 ID 格式（UUID）
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(id)) {
        return res.status(400).json({
          timestamp: new Date().toISOString(),
          status: 400,
          error: 'Bad Request',
          message: '无效的药材 ID 格式',
          path: req.originalUrl
        });
      }

      const medicine = await knowledgeDbService.getMedicineById(id);

      if (!medicine) {
        return res.status(404).json({
          timestamp: new Date().toISOString(),
          status: 404,
          error: 'Not Found',
          message: '未找到指定的药材',
          path: req.originalUrl
        });
      }

      res.status(200).json({
        success: true,
        data: medicine
      });
    } catch (error) {
      logger.error('获取药材详情失败', {
        correlationId: req.id,
        medicineId: req.params.id,
        error: error.message,
        stack: error.stack
      });
      next(error);
    }
  }

  /**
   * 按功效搜索药材
   * GET /api/knowledge/medicines/efficacy?q=补气&limit=20&offset=0
   */
  async searchMedicinesByEfficacy(req, res, next) {
    try {
      const { q: efficacy, limit, offset } = req.query;

      if (!efficacy || efficacy.trim() === '') {
        return res.status(400).json({
          timestamp: new Date().toISOString(),
          status: 400,
          error: 'Bad Request',
          message: '功效关键词不能为空',
          path: req.originalUrl
        });
      }

      const options = {
        limit: parseInt(limit, 10) || 20,
        offset: parseInt(offset, 10) || 0
      };

      const medicines = await knowledgeDbService.searchMedicinesByEfficacy(
        efficacy.trim(),
        options
      );

      res.status(200).json({
        success: true,
        data: {
          medicines,
          efficacy: efficacy.trim(),
          total: medicines.length,
          limit: options.limit,
          offset: options.offset
        }
      });
    } catch (error) {
      logger.error('按功效搜索药材失败', {
        correlationId: req.id,
        error: error.message,
        stack: error.stack
      });
      next(error);
    }
  }

  /**
   * 搜索方剂
   * GET /api/knowledge/formulas/search?q=关键词&limit=20&offset=0
   */
  async searchFormulas(req, res, next) {
    try {
      const { q: query, limit, offset } = req.query;

      if (!query || query.trim() === '') {
        return res.status(400).json({
          timestamp: new Date().toISOString(),
          status: 400,
          error: 'Bad Request',
          message: '搜索关键词不能为空',
          path: req.originalUrl
        });
      }

      const options = {
        limit: parseInt(limit, 10) || 20,
        offset: parseInt(offset, 10) || 0
      };

      const formulas = await knowledgeDbService.searchFormulasByName(
        query.trim(),
        options
      );

      res.status(200).json({
        success: true,
        data: {
          formulas,
          query: query.trim(),
          total: formulas.length,
          limit: options.limit,
          offset: options.offset
        }
      });
    } catch (error) {
      logger.error('搜索方剂失败', {
        correlationId: req.id,
        error: error.message,
        stack: error.stack
      });
      next(error);
    }
  }

  /**
   * 根据 ID 获取方剂详情（含组成药材）
   * GET /api/knowledge/formulas/:id
   */
  async getFormulaById(req, res, next) {
    try {
      const { id } = req.params;

      // 验证 ID 格式
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(id)) {
        return res.status(400).json({
          timestamp: new Date().toISOString(),
          status: 400,
          error: 'Bad Request',
          message: '无效的方剂 ID 格式',
          path: req.originalUrl
        });
      }

      const formula = await knowledgeDbService.getFormulaById(id);

      if (!formula) {
        return res.status(404).json({
          timestamp: new Date().toISOString(),
          status: 404,
          error: 'Not Found',
          message: '未找到指定的方剂',
          path: req.originalUrl
        });
      }

      res.status(200).json({
        success: true,
        data: formula
      });
    } catch (error) {
      logger.error('获取方剂详情失败', {
        correlationId: req.id,
        formulaId: req.params.id,
        error: error.message,
        stack: error.stack
      });
      next(error);
    }
  }

  /**
   * 按功效搜索方剂
   * GET /api/knowledge/formulas/efficacy?q=补气&limit=20&offset=0
   */
  async searchFormulasByEfficacy(req, res, next) {
    try {
      const { q: efficacy, limit, offset } = req.query;

      if (!efficacy || efficacy.trim() === '') {
        return res.status(400).json({
          timestamp: new Date().toISOString(),
          status: 400,
          error: 'Bad Request',
          message: '功效关键词不能为空',
          path: req.originalUrl
        });
      }

      const options = {
        limit: parseInt(limit, 10) || 20,
        offset: parseInt(offset, 10) || 0
      };

      const formulas = await knowledgeDbService.searchFormulasByEfficacy(
        efficacy.trim(),
        options
      );

      res.status(200).json({
        success: true,
        data: {
          formulas,
          efficacy: efficacy.trim(),
          total: formulas.length,
          limit: options.limit,
          offset: options.offset
        }
      });
    } catch (error) {
      logger.error('按功效搜索方剂失败', {
        correlationId: req.id,
        error: error.message,
        stack: error.stack
      });
      next(error);
    }
  }
}

module.exports = new KnowledgeController();

