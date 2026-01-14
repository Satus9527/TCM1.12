const { Medicine } = require('../models');
const logger = require('../utils/logger');

class SynergyService {
  // 药物属性量化配置
  static QUANTIFICATION_CONFIG = {
    // 性味量化映射
    nature: {
      '寒': -2,
      '凉': -1,
      '平': 0,
      '温': 1,
      '热': 2
    },
    
    // 味道量化映射（每个味道对应不同的功效方向）
    flavor: {
      '辛': { value: 1, category: '发散' },
      '甘': { value: 1, category: '补益' },
      '酸': { value: 1, category: '收敛' },
      '苦': { value: 1, category: '清热' },
      '咸': { value: 1, category: '软坚' }
    },
    
    // 归经量化映射
    meridian: {
      '心': 1,
      '肝': 1,
      '脾': 1,
      '肺': 1,
      '肾': 1,
      '胃': 1,
      '大肠': 1,
      '小肠': 1,
      '胆': 1,
      '膀胱': 1,
      '三焦': 1,
      '心包': 1
    },
    
    // 功效分类及权重
    efficacyCategories: {
      '解表': 1.0,
      '清热': 1.0,
      '泻下': 1.0,
      '祛风湿': 1.0,
      '化湿': 1.0,
      '利水渗湿': 1.0,
      '温里': 1.0,
      '理气': 1.0,
      '消食': 1.0,
      '驱虫': 1.0,
      '止血': 1.0,
      '活血化瘀': 1.0,
      '化痰止咳平喘': 1.0,
      '安神': 1.0,
      '平肝息风': 1.0,
      '开窍': 1.0,
      '补益': 1.0,
      '收涩': 1.0,
      '涌吐': 1.0,
      '解毒杀虫燥湿止痒': 1.0,
      '拔毒化腐生肌': 1.0
    }
  };

  /**
   * 获取药物详细信息
   * @param {Array} medicineIds - 药物ID列表
   * @returns {Promise<Array>} 药物列表
   */
  async getMedicinesByIds(medicineIds) {
    try {
      return await Medicine.findAll({
        where: {
          medicine_id: medicineIds
        },
        attributes: [
          'medicine_id', 'name', 'nature', 'flavor', 
          'meridian', 'efficacy', 'category'
        ]
      });
    } catch (error) {
      logger.error('获取药物信息失败:', error);
      throw error;
    }
  }

  /**
   * 量化单个药物的属性
   * @param {Object} medicine - 药物对象
   * @returns {Object} 量化后的药物属性
   */
  quantifyMedicineProperties(medicine) {
    const { nature, flavor, meridian, efficacy, category } = medicine;
    
    // 1. 性味量化
    const natureValue = SynergyService.QUANTIFICATION_CONFIG.nature[nature] || 0;
    
    // 2. 味道量化（多味道处理）
    const flavorValues = {};
    if (flavor) {
      const flavors = flavor.split('、');
      flavors.forEach(f => {
        if (SynergyService.QUANTIFICATION_CONFIG.flavor[f]) {
          const { category: flavorCat } = SynergyService.QUANTIFICATION_CONFIG.flavor[f];
          flavorValues[flavorCat] = (flavorValues[flavorCat] || 0) + 1;
        }
      });
    }
    
    // 3. 归经量化（多归经处理）
    const meridianValues = {};
    if (meridian) {
      const meridians = meridian.split('、');
      meridians.forEach(m => {
        meridianValues[m] = 1;
      });
    }
    
    // 4. 功效量化
    const efficacyValues = {};
    if (efficacy) {
      // 将功效字符串按顿号和逗号分割
      const efficacyList = efficacy.split(/[、，]/);
      
      // 遍历所有功效，匹配功效分类
      Object.keys(SynergyService.QUANTIFICATION_CONFIG.efficacyCategories).forEach(category => {
        const matchingEfficacies = efficacyList.filter(e => e.includes(category));
        if (matchingEfficacies.length > 0) {
          efficacyValues[category] = SynergyService.QUANTIFICATION_CONFIG.efficacyCategories[category] * matchingEfficacies.length;
        } else {
          efficacyValues[category] = 0;
        }
      });
    }
    
    return {
      medicine_id: medicine.medicine_id,
      name: medicine.name,
      category,
      nature: natureValue,
      flavor: flavorValues,
      meridian: meridianValues,
      efficacy: efficacyValues
    };
  }

  /**
   * 计算药物之间的功效协同度
   * @param {Array} medicineIds - 药物ID列表
   * @returns {Object} 功效协同计算结果
   */
  async calculateSynergy(medicineIds) {
    try {
      // 获取药物信息
      const medicines = await this.getMedicinesByIds(medicineIds);
      
      if (medicines.length === 0) {
        return {
          synergy_score: 0,
          medicine_count: 0,
          synergy_level: '无协同',
          analysis: '未找到有效的药物信息'
        };
      }
      
      // 量化所有药物的属性
      const quantifiedMedicines = medicines.map(med => this.quantifyMedicineProperties(med));
      
      // 计算功效协同度
      const synergyResult = this.calculateSynergyScore(quantifiedMedicines);
      
      return {
        synergy_score: synergyResult.score,
        medicine_count: medicines.length,
        synergy_level: synergyResult.level,
        analysis: synergyResult.analysis,
        medicine_details: quantifiedMedicines
      };
    } catch (error) {
      logger.error('计算功效协同度失败:', error);
      throw error;
    }
  }

  /**
   * 计算功效协同度分数
   * @param {Array} quantifiedMedicines - 量化后的药物列表
   * @returns {Object} 协同度计算结果
   */
  calculateSynergyScore(quantifiedMedicines) {
    const totalMedicines = quantifiedMedicines.length;
    
    // 1. 计算功效相似度
    const efficacySimilarity = this.calculateEfficacySimilarity(quantifiedMedicines);
    
    // 2. 计算性味协同性
    const natureSynergy = this.calculateNatureSynergy(quantifiedMedicines);
    
    // 3. 计算归经协同性
    const meridianSynergy = this.calculateMeridianSynergy(quantifiedMedicines);
    
    // 4. 加权计算总分（功效相似度权重最高）
    const totalScore = (efficacySimilarity * 0.6) + (natureSynergy * 0.2) + (meridianSynergy * 0.2);
    
    // 5. 确定协同等级
    let level = '无协同';
    let analysis = '';
    
    if (totalScore >= 0.8) {
      level = '高度协同';
      analysis = '药物之间功效高度协同，性味和归经匹配良好，可增强疗效';
    } else if (totalScore >= 0.5) {
      level = '中度协同';
      analysis = '药物之间功效协同较好，性味和归经有一定匹配度';
    } else if (totalScore >= 0.3) {
      level = '低度协同';
      analysis = '药物之间功效协同一般，需要注意性味和归经的搭配';
    } else {
      level = '无协同';
      analysis = '药物之间功效协同性较差，建议调整配伍';
    }
    
    return {
      score: totalScore.toFixed(2),
      level,
      analysis,
      details: {
        efficacy_similarity: efficacySimilarity.toFixed(2),
        nature_synergy: natureSynergy.toFixed(2),
        meridian_synergy: meridianSynergy.toFixed(2)
      }
    };
  }

  /**
   * 计算功效相似度
   * @param {Array} quantifiedMedicines - 量化后的药物列表
   * @returns {number} 功效相似度分数（0-1）
   */
  calculateEfficacySimilarity(quantifiedMedicines) {
    if (quantifiedMedicines.length < 2) return 1.0;
    
    const totalMedicines = quantifiedMedicines.length;
    let totalSimilarity = 0;
    
    // 计算每对药物之间的功效相似度
    for (let i = 0; i < totalMedicines; i++) {
      for (let j = i + 1; j < totalMedicines; j++) {
        const med1 = quantifiedMedicines[i];
        const med2 = quantifiedMedicines[j];
        
        // 计算功效向量相似度（余弦相似度）
        const similarity = this.calculateVectorSimilarity(med1.efficacy, med2.efficacy);
        totalSimilarity += similarity;
      }
    }
    
    // 计算平均相似度
    const pairCount = totalMedicines * (totalMedicines - 1) / 2;
    return totalSimilarity / pairCount;
  }

  /**
   * 计算性味协同性
   * @param {Array} quantifiedMedicines - 量化后的药物列表
   * @returns {number} 性味协同性分数（0-1）
   */
  calculateNatureSynergy(quantifiedMedicines) {
    if (quantifiedMedicines.length < 2) return 1.0;
    
    // 计算性味平均值
    const natureSum = quantifiedMedicines.reduce((sum, med) => sum + med.nature, 0);
    const natureAvg = natureSum / quantifiedMedicines.length;
    
    // 计算性味方差（方差越小，协同性越好）
    const natureVariance = quantifiedMedicines.reduce((sum, med) => {
      return sum + Math.pow(med.nature - natureAvg, 2);
    }, 0) / quantifiedMedicines.length;
    
    // 将方差转换为协同性分数（0-1）
    // 假设最大方差为 4（寒热两极），方差越小分数越高
    const normalizedVariance = Math.min(natureVariance / 4, 1);
    return 1 - normalizedVariance;
  }

  /**
   * 计算归经协同性
   * @param {Array} quantifiedMedicines - 量化后的药物列表
   * @returns {number} 归经协同性分数（0-1）
   */
  calculateMeridianSynergy(quantifiedMedicines) {
    if (quantifiedMedicines.length < 2) return 1.0;
    
    // 统计所有药物的归经交集
    let commonMeridians = new Set();
    
    // 初始化第一个药物的归经为交集
    if (quantifiedMedicines.length > 0) {
      commonMeridians = new Set(Object.keys(quantifiedMedicines[0].meridian));
    }
    
    // 计算归经交集
    for (let i = 1; i < quantifiedMedicines.length; i++) {
      const currentMeridians = new Set(Object.keys(quantifiedMedicines[i].meridian));
      commonMeridians = new Set(
        [...commonMeridians].filter(m => currentMeridians.has(m))
      );
    }
    
    // 计算归经并集
    const allMeridians = new Set();
    quantifiedMedicines.forEach(med => {
      Object.keys(med.meridian).forEach(m => allMeridians.add(m));
    });
    
    // 计算归经协同性分数（交集大小 / 并集大小）
    if (allMeridians.size === 0) return 1.0;
    return commonMeridians.size / allMeridians.size;
  }

  /**
   * 计算向量相似度（余弦相似度）
   * @param {Object} vec1 - 向量1
   * @param {Object} vec2 - 向量2
   * @returns {number} 相似度分数（0-1）
   */
  calculateVectorSimilarity(vec1, vec2) {
    // 获取所有唯一的键
    const allKeys = new Set([...Object.keys(vec1), ...Object.keys(vec2)]);
    
    let dotProduct = 0;
    let magnitude1 = 0;
    let magnitude2 = 0;
    
    // 计算点积和向量长度
    allKeys.forEach(key => {
      const val1 = vec1[key] || 0;
      const val2 = vec2[key] || 0;
      
      dotProduct += val1 * val2;
      magnitude1 += Math.pow(val1, 2);
      magnitude2 += Math.pow(val2, 2);
    });
    
    // 计算余弦相似度
    if (magnitude1 === 0 || magnitude2 === 0) return 0;
    return dotProduct / (Math.sqrt(magnitude1) * Math.sqrt(magnitude2));
  }

  /**
   * 获取功效协同雷达图数据
   * @param {Array} medicineIds - 药物ID列表
   * @returns {Object} 雷达图数据
   */
  async getSynergyRadarData(medicineIds) {
    try {
      // 获取药物信息
      const medicines = await this.getMedicinesByIds(medicineIds);
      
      if (medicines.length === 0) {
        return {
          radar_data: [],
          categories: [],
          synergy_score: 0
        };
      }
      
      // 量化所有药物的属性
      const quantifiedMedicines = medicines.map(med => this.quantifyMedicineProperties(med));
      
      // 计算功效协同度
      const synergyResult = this.calculateSynergyScore(quantifiedMedicines);
      
      // 生成雷达图数据
      const radarData = this.generateRadarChartData(quantifiedMedicines);
      
      return {
        radar_data: radarData.values,
        categories: radarData.categories,
        synergy_score: synergyResult.score,
        synergy_level: synergyResult.level,
        medicine_names: medicines.map(m => m.name)
      };
    } catch (error) {
      logger.error('生成雷达图数据失败:', error);
      throw error;
    }
  }

  /**
   * 生成雷达图数据
   * @param {Array} quantifiedMedicines - 量化后的药物列表
   * @returns {Object} 雷达图数据，包含categories和values
   */
  generateRadarChartData(quantifiedMedicines) {
    // 使用功效分类作为雷达图的维度
    const categories = Object.keys(SynergyService.QUANTIFICATION_CONFIG.efficacyCategories);
    
    // 计算每个功效类别的平均得分
    const efficacyScores = {};
    
    // 初始化得分
    categories.forEach(category => {
      efficacyScores[category] = 0;
    });
    
    // 累加每个药物的功效得分
    quantifiedMedicines.forEach(med => {
      categories.forEach(category => {
        efficacyScores[category] += (med.efficacy[category] || 0);
      });
    });
    
    // 计算平均值
    const totalMedicines = quantifiedMedicines.length;
    categories.forEach(category => {
      efficacyScores[category] = (efficacyScores[category] / totalMedicines).toFixed(2);
    });
    
    // 转换为雷达图所需的数据格式
    const values = categories.map(category => parseFloat(efficacyScores[category]));
    
    return {
      categories,
      values
    };
  }
}

module.exports = new SynergyService();
