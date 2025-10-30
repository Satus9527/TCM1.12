const collectionService = require('../services/collectionService');
const { validationResult } = require('express-validator');

class CollectionController {
  /**
   * 添加收藏
   * POST /api/collections
   */
  async addCollection(req, res, next) {
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

      const userId = req.user.user_id;
      const { formula_id, notes } = req.body;

      const collection = await collectionService.addCollection(userId, formula_id, notes);

      res.status(201).json({
        success: true,
        data: collection,
        message: '收藏成功'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 取消收藏
   * DELETE /api/collections/:formulaId
   */
  async removeCollection(req, res, next) {
    try {
      const userId = req.user.user_id;
      const { formulaId } = req.params;

      await collectionService.removeCollection(userId, formulaId);

      res.json({
        success: true,
        message: '取消收藏成功'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 更新收藏备注
   * PUT /api/collections/:formulaId
   */
  async updateCollectionNotes(req, res, next) {
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

      const userId = req.user.user_id;
      const { formulaId } = req.params;
      const { notes } = req.body;

      const collection = await collectionService.updateCollectionNotes(userId, formulaId, notes);

      res.json({
        success: true,
        data: collection,
        message: '备注更新成功'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 获取用户的收藏列表
   * GET /api/collections
   */
  async getUserCollections(req, res, next) {
    try {
      const userId = req.user.user_id;
      const options = {
        page: req.query.page,
        limit: req.query.limit,
        sortBy: req.query.sortBy,
        sortOrder: req.query.sortOrder
      };

      const result = await collectionService.getUserCollections(userId, options);

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 检查是否已收藏
   * GET /api/collections/check/:formulaId
   */
  async checkCollection(req, res, next) {
    try {
      const userId = req.user.user_id;
      const { formulaId } = req.params;

      const isCollected = await collectionService.isCollected(userId, formulaId);

      res.json({
        success: true,
        data: {
          is_collected: isCollected
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 获取收藏统计
   * GET /api/collections/stats
   */
  async getCollectionStats(req, res, next) {
    try {
      const userId = req.user.user_id;

      const stats = await collectionService.getCollectionStats(userId);

      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new CollectionController();

