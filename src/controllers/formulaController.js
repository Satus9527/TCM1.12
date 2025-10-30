const formulaService = require('../services/formulaService');
const { validationResult } = require('express-validator');

class FormulaController {
  /**
   * 获取方剂列表
   * GET /api/formulas
   */
  async getFormulas(req, res, next) {
    try {
      const options = {
        page: req.query.page,
        limit: req.query.limit,
        search: req.query.search,
        category: req.query.category,
        sortBy: req.query.sortBy,
        sortOrder: req.query.sortOrder
      };

      const result = await formulaService.getFormulas(options);

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 获取方剂详情（包含组成药材）
   * GET /api/formulas/:id
   */
  async getFormulaById(req, res, next) {
    try {
      const formula = await formulaService.getFormulaById(req.params.id);

      res.json({
        success: true,
        data: formula
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 创建方剂
   * POST /api/formulas
   */
  async createFormula(req, res, next) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: '输入验证失败',
            details: errors.array()
          }
        });
      }

      const formula = await formulaService.createFormula(req.body);

      res.status(201).json({
        success: true,
        data: formula,
        message: '方剂创建成功'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 更新方剂
   * PUT /api/formulas/:id
   */
  async updateFormula(req, res, next) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: '输入验证失败',
            details: errors.array()
          }
        });
      }

      const formula = await formulaService.updateFormula(req.params.id, req.body);

      res.json({
        success: true,
        data: formula,
        message: '方剂更新成功'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 删除方剂
   * DELETE /api/formulas/:id
   */
  async deleteFormula(req, res, next) {
    try {
      await formulaService.deleteFormula(req.params.id);

      res.json({
        success: true,
        message: '方剂删除成功'
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new FormulaController();

