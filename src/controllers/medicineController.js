const medicineService = require('../services/medicineService');
const { validationResult } = require('express-validator');

class MedicineController {
  /**
   * 获取药材列表
   * GET /api/medicines
   */
  async getMedicines(req, res, next) {
    try {
      const options = {
        page: req.query.page,
        limit: req.query.limit,
        search: req.query.search,
        category: req.query.category,
        nature: req.query.nature,
        flavor: req.query.flavor,
        sortBy: req.query.sortBy,
        sortOrder: req.query.sortOrder
      };

      const result = await medicineService.getMedicines(options);

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 获取药材详情
   * GET /api/medicines/:id
   */
  async getMedicineById(req, res, next) {
    try {
      const medicine = await medicineService.getMedicineById(req.params.id);

      res.json({
        success: true,
        data: medicine
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 获取药材分类列表
   * GET /api/medicine-categories
   */
  async getCategories(req, res, next) {
    try {
      const categories = await medicineService.getCategories();

      res.json({
        success: true,
        data: categories
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 创建药材
   * POST /api/medicines
   */
  async createMedicine(req, res, next) {
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

      const medicine = await medicineService.createMedicine(req.body);

      res.status(201).json({
        success: true,
        data: medicine,
        message: '药材创建成功'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 更新药材
   * PUT /api/medicines/:id
   */
  async updateMedicine(req, res, next) {
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

      const medicine = await medicineService.updateMedicine(req.params.id, req.body);

      res.json({
        success: true,
        data: medicine,
        message: '药材更新成功'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 删除药材
   * DELETE /api/medicines/:id
   */
  async deleteMedicine(req, res, next) {
    try {
      await medicineService.deleteMedicine(req.params.id);

      res.json({
        success: true,
        message: '药材删除成功'
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new MedicineController();

