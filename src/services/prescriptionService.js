const { Formula, Medicine, FormulaComposition, User } = require('../models');
const { Op } = require('sequelize');
const logger = require('../utils/logger');
const safetyCheckService = require('./safetyCheckService');
const medicineService = require('./medicineService');

class PrescriptionService {
  /**
   * 分析处方配伍
   * @param {Array} medicines - 处方中的药材列表
   * @returns {Promise<Object>} 分析结果
   */
  async analyzePrescription(medicines) {
    if (!medicines || medicines.length === 0) {
      const error = new Error('处方中必须包含药材');
      error.statusCode = 400;
      error.code = 'PRESCRIPTION_EMPTY';
      throw error;
    }

    try {
      // 1. 检查药材是否存在
      const medicineIds = medicines.map(med => med.medicine_id || med.id);
      const existingMedicines = await Medicine.findAll({
        where: {
          medicine_id: {
            [Op.in]: medicineIds
          }
        },
        attributes: ['medicine_id', 'name', 'nature', 'flavor', 'meridian']
      });

      if (existingMedicines.length === 0) {
        // 如果没有找到药材，可能是前端传递的id格式问题，继续分析
        logger.warn('未找到对应药材，使用前端传递的药材信息进行分析');
      }

      // 2. 执行安全性检查
      const safetyCheck = safetyCheckService.checkFormulaSafety(medicines);

      // 3. 计算性味归经分布
      const tasteAnalysis = this.calculateTasteAnalysis(existingMedicines, medicines);
      const meridianAnalysis = this.calculateMeridianAnalysis(existingMedicines, medicines);

      // 4. 生成分析结果
      const analysisResult = {
        tasteAnalysis,
        meridianAnalysis,
        synergyEffects: [], // 相须相使效果
        tabooList: safetyCheck.details || [], // 配伍禁忌列表
        safetySuggestions: safetyCheck.warnings || [], // 安全建议
        compatibilityScore: safetyCheck.isSafe ? 85 : 50 // 根据安全性给出基础分数
      };

      return analysisResult;
    } catch (error) {
      logger.error('处方分析失败:', error);
      throw error;
    }
  }

  /**
   * 计算性味分析
   * @param {Array} medicines - 数据库中的药材列表
   * @param {Array} prescriptionMedicines - 处方中的药材（包含剂量）
   * @returns {Array} 性味分析结果
   */
  calculateTasteAnalysis(medicines, prescriptionMedicines) {
    // 合并药材信息和剂量信息
    const fullMedicines = prescriptionMedicines.map(prescriptionMed => {
      // 查找数据库中的药材信息
      const dbMed = medicines.find(med => med.medicine_id === (prescriptionMed.medicine_id || prescriptionMed.id));
      
      // 使用数据库信息或前端传递的信息
      const medInfo = dbMed ? dbMed.toJSON() : prescriptionMed;
      
      return {
        ...medInfo,
        dosage: parseFloat(prescriptionMed.dosage || 0),
        nature: medInfo.nature || prescriptionMed.nature || '',
        flavor: medInfo.flavor || prescriptionMed.flavor || '',
        meridian: medInfo.meridian || prescriptionMed.meridian || ''
      };
    });

    // 统计性味分布
    const tasteStats = {};
    let totalDosage = fullMedicines.reduce((sum, med) => sum + med.dosage, 0);

    fullMedicines.forEach(med => {
      if (!med.flavor || !med.dosage) return;

      // 处理不同的分隔符
      const flavors = med.flavor.split(/[,，]/);
      flavors.forEach(flavor => {
        flavor = flavor.trim();
        if (!flavor) return;

        if (!tasteStats[flavor]) {
          tasteStats[flavor] = 0;
        }
        tasteStats[flavor] += med.dosage;
      });
    });

    // 转换为百分比
    const tasteAnalysis = Object.entries(tasteStats).map(([taste, dosage]) => ({
      name: taste,
      percentage: totalDosage > 0 ? parseFloat(((dosage / totalDosage) * 100).toFixed(2)) : 0,
      color: this.getTasteColor(taste)
    }));

    return tasteAnalysis.sort((a, b) => b.percentage - a.percentage);
  }

  /**
   * 计算归经分析
   * @param {Array} medicines - 数据库中的药材列表
   * @param {Array} prescriptionMedicines - 处方中的药材（包含剂量）
   * @returns {Array} 归经分析结果
   */
  calculateMeridianAnalysis(medicines, prescriptionMedicines) {
    // 合并药材信息和剂量信息
    const fullMedicines = prescriptionMedicines.map(prescriptionMed => {
      // 查找数据库中的药材信息
      const dbMed = medicines.find(med => med.medicine_id === (prescriptionMed.medicine_id || prescriptionMed.id));
      
      // 使用数据库信息或前端传递的信息
      const medInfo = dbMed ? dbMed.toJSON() : prescriptionMed;
      
      return {
        ...medInfo,
        dosage: parseFloat(prescriptionMed.dosage || 0),
        nature: medInfo.nature || prescriptionMed.nature || '',
        flavor: medInfo.flavor || prescriptionMed.flavor || '',
        meridian: medInfo.meridian || prescriptionMed.meridian || ''
      };
    });

    // 统计归经分布
    const meridianStats = {};
    let totalDosage = fullMedicines.reduce((sum, med) => sum + med.dosage, 0);

    fullMedicines.forEach(med => {
      if (!med.meridian || !med.dosage) return;

      // 处理不同的分隔符
      const meridians = med.meridian.split(/[,，、]/);
      meridians.forEach(meridian => {
        meridian = meridian.trim();
        if (!meridian) return;

        if (!meridianStats[meridian]) {
          meridianStats[meridian] = 0;
        }
        meridianStats[meridian] += med.dosage;
      });
    });

    // 转换为百分比
    const meridianAnalysis = Object.entries(meridianStats).map(([meridian, dosage]) => ({
      name: meridian,
      intensity: totalDosage > 0 ? parseFloat(((dosage / totalDosage) * 100).toFixed(2)) : 0
    }));

    return meridianAnalysis.sort((a, b) => b.intensity - a.intensity);
  }

  /**
   * 获取性味对应的颜色
   * @param {string} taste - 性味名称
   * @returns {string} 颜色值
   */
  getTasteColor(taste) {
    const colorMap = {
      '酸': '#F56C6C',
      '苦': '#909399',
      '甘': '#E6A23C',
      '辛': '#67C23A',
      '咸': '#409EFF',
      '淡': '#C0C4CC',
      '涩': '#722ED1'
    };
    return colorMap[taste] || '#909399';
  }
}

module.exports = new PrescriptionService();
