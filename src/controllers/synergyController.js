const synergyService = require('../services/synergyService');

class SynergyController {
  /**
   * 计算药物功效协同度
   * POST /api/synergy/calculate
   */
  async calculateSynergy(req, res, next) {
    try {
      const { medicineIds } = req.body;
      
      if (!medicineIds || !Array.isArray(medicineIds) || medicineIds.length === 0) {
        return res.status(400).json({
          success: false,
          message: '请提供有效的药物ID列表'
        });
      }
      
      const result = await synergyService.calculateSynergy(medicineIds);
      
      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  }
  
  /**
   * 获取功效协同雷达图数据
   * POST /api/synergy/radar
   */
  async getSynergyRadar(req, res, next) {
    try {
      const { medicineIds } = req.body;
      
      if (!medicineIds || !Array.isArray(medicineIds) || medicineIds.length === 0) {
        return res.status(400).json({
          success: false,
          message: '请提供有效的药物ID列表'
        });
      }
      
      const radarData = await synergyService.getSynergyRadarData(medicineIds);
      
      res.json({
        success: true,
        data: radarData
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new SynergyController();
