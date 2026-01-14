const logger = require('../utils/logger');
const db = require('../models');

class LearningController {
  /**
   * 创建学习记录
   * POST /api/learning/records
   */
  async createLearningRecord(req, res, next) {
    try {
      const { topic, duration, progress, completed } = req.body;
      const userId = req.user.user_id;

      const learningRecord = await db.UserLearningRecord.create({
        user_id: userId,
        topic,
        duration,
        progress,
        completed
      });

      res.json({
        success: true,
        data: learningRecord,
        message: '学习记录创建成功'
      });

      logger.info('Learning record created successfully', { userId, recordId: learningRecord.record_id });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 获取用户的学习记录列表
   * GET /api/learning/records
   */
  async getLearningRecords(req, res, next) {
    try {
      const userId = req.user.user_id;

      const learningRecords = await db.UserLearningRecord.findAll({
        where: { user_id: userId },
        order: [['created_at', 'DESC']]
      });

      res.json({
        success: true,
        data: learningRecords,
        message: '获取学习记录成功'
      });

      logger.info('Learning records retrieved successfully', { userId });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 获取单个学习记录
   * GET /api/learning/records/:id
   */
  async getLearningRecordById(req, res, next) {
    try {
      const { id } = req.params;
      const userId = req.user.user_id;

      const learningRecord = await db.UserLearningRecord.findOne({
        where: {
          record_id: id,
          user_id: userId
        }
      });

      if (!learningRecord) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'RECORD_NOT_FOUND',
            message: '学习记录不存在'
          }
        });
      }

      res.json({
        success: true,
        data: learningRecord,
        message: '获取学习记录成功'
      });

      logger.info('Learning record retrieved successfully', { userId, recordId: id });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 更新学习记录
   * PUT /api/learning/records/:id
   */
  async updateLearningRecord(req, res, next) {
    try {
      const { id } = req.params;
      const { topic, duration, progress, completed } = req.body;
      const userId = req.user.user_id;

      const learningRecord = await db.UserLearningRecord.findOne({
        where: {
          record_id: id,
          user_id: userId
        }
      });

      if (!learningRecord) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'RECORD_NOT_FOUND',
            message: '学习记录不存在'
          }
        });
      }

      await learningRecord.update({
        topic,
        duration,
        progress,
        completed,
        updated_at: new Date()
      });

      res.json({
        success: true,
        data: learningRecord,
        message: '学习记录更新成功'
      });

      logger.info('Learning record updated successfully', { userId, recordId: id });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 删除学习记录
   * DELETE /api/learning/records/:id
   */
  async deleteLearningRecord(req, res, next) {
    try {
      const { id } = req.params;
      const userId = req.user.user_id;

      const deleted = await db.UserLearningRecord.destroy({
        where: {
          record_id: id,
          user_id: userId
        }
      });

      if (deleted === 0) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'RECORD_NOT_FOUND',
            message: '学习记录不存在'
          }
        });
      }

      res.json({
        success: true,
        message: '学习记录删除成功'
      });

      logger.info('Learning record deleted successfully', { userId, recordId: id });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new LearningController();
