const logger = require('../utils/logger');
const prescriptionService = require('../services/prescriptionService');
const { UserSimulation } = require('../models');

class PrescriptionController {
  /**
   * 分析处方配伍
   * @param {Object} req - 请求对象
   * @param {Object} res - 响应对象
   * @param {Function} next - 中间件函数
   */
  async analyzePrescription(req, res, next) {
    try {
      const { medicines } = req.body;
      const analysisResult = await prescriptionService.analyzePrescription(medicines);

      res.json({
        code: 200,
        data: analysisResult,
        message: '处方分析成功'
      });

      logger.info('处方分析成功', { 
        medicineCount: medicines.length,
        correlationId: req.id
      });
    } catch (error) {
      logger.error('处方分析失败', {
        error: error.message,
        correlationId: req.id
      });
      
      // 返回格式化的错误响应
      res.json({
        code: error.statusCode || 500,
        message: error.message || '处方分析失败'
      });
    }
  }

  /**
   * 获取用户的处方列表
   * @param {Object} req - 请求对象
   * @param {Object} res - 响应对象
   * @param {Function} next - 中间件函数
   */
  async getUserPrescriptions(req, res, next) {
    try {
      const userId = req.user.id;
      const prescriptions = await UserSimulation.findAll({
        where: { user_id: userId },
        order: [['created_at', 'DESC']],
        limit: 10
      });

      const formattedPrescriptions = prescriptions.map(prescription => ({
        id: prescription.simulation_id,
        name: prescription.name,
        description: `${prescription.composition_data.length || 0}味中药配伍`,
        time: new Date(prescription.created_at).toLocaleDateString(),
        status: prescription.success ? 'success' : 'warning'
      }));

      res.json({
        code: 200,
        data: formattedPrescriptions
      });

      logger.info('获取用户处方列表成功', { 
        userId,
        prescriptionCount: prescriptions.length,
        correlationId: req.id
      });
    } catch (error) {
      logger.error('获取用户处方列表失败', {
        error: error.message,
        correlationId: req.id
      });
      next(error);
    }
  }
}

module.exports = new PrescriptionController();
