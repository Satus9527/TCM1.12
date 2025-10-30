/**
 * 中药配伍安全检查服务
 * 
 * 功能：
 * - 检查十八反（配伍禁忌）
 * - 检查十九畏
 * - 基于权威典籍的配伍安全规则
 * 
 * 数据来源：
 * - 《神农本草经》
 * - 《珍珠囊补遗药性赋》
 */

const path = require('path');
const fs = require('fs');
const logger = require('../utils/logger');

class SafetyCheckService {
  constructor() {
    this.incompatibilityData = null;
    this.relationshipData = null;
    this.incompatibilityMap = new Map();
    this.loadData();
  }

  /**
   * 加载配伍禁忌数据
   */
  loadData() {
    try {
      // 加载十八反和十九畏数据
      const incompatibilityPath = path.join(__dirname, '../../18反19畏.json');
      const incompatibilityContent = fs.readFileSync(incompatibilityPath, 'utf8');
      this.incompatibilityData = JSON.parse(incompatibilityContent);

      // 构建快速查找映射
      this.buildIncompatibilityMap();

      logger.info('配伍禁忌数据加载成功', { 
        dataCount: this.incompatibilityData.data.length 
      });

      // 加载四相数据（相须相使相畏相杀）
      const relationshipPath = path.join(__dirname, '../../四相.json');
      const relationshipContent = fs.readFileSync(relationshipPath, 'utf8');
      this.relationshipData = JSON.parse(relationshipContent);

      logger.info('四相关系数据加载成功', { 
        dataCount: this.relationshipData.relationships.length 
      });
    } catch (error) {
      logger.error('加载配伍数据失败', { error: error.message });
      // 即使加载失败，也不应该阻止服务启动，使用空数据
      this.incompatibilityData = { data: [] };
      this.relationshipData = { relationships: [] };
    }
  }

  /**
   * 构建配伍禁忌快速查找映射
   * 结构：Map<药材A, Set<禁忌药材B>>
   */
  buildIncompatibilityMap() {
    this.incompatibilityMap.clear();

    for (const item of this.incompatibilityData.data) {
      const { herb_a, herb_b, type, description } = item;

      // 添加 A -> B 的映射
      if (!this.incompatibilityMap.has(herb_a)) {
        this.incompatibilityMap.set(herb_a, []);
      }
      this.incompatibilityMap.get(herb_a).push({
        herb: herb_b,
        type,
        description
      });

      // 添加 B -> A 的映射（双向）
      if (!this.incompatibilityMap.has(herb_b)) {
        this.incompatibilityMap.set(herb_b, []);
      }
      this.incompatibilityMap.get(herb_b).push({
        herb: herb_a,
        type,
        description
      });
    }
  }

  /**
   * 检查药材名称是否匹配（支持别名和简称）
   * @param {string} name1 - 药材名称1
   * @param {string} name2 - 药材名称2
   * @returns {boolean}
   */
  isMedicineMatch(name1, name2) {
    // 精确匹配
    if (name1 === name2) {
      return true;
    }

    // 处理常见别名和包含关系
    const aliases = {
      '乌头': ['川乌', '附子', '草乌', '制川乌', '制附子'],
      '贝母': ['川贝', '浙贝', '川贝母', '浙贝母'],
      '瓜蒌': ['全瓜蒌', '瓜蒌皮', '瓜蒌仁', '天花粉'],
      '沙参': ['南沙参', '北沙参'],
      '芍药': ['赤芍', '白芍'],
      '朴硝': ['芒硝', '玄明粉'],
      '牵牛': ['牵牛子', '黑丑', '白丑'],
      '丁香': ['公丁香', '母丁香'],
      '犀角': ['广角', '水牛角'],
      '官桂': ['肉桂', '桂皮'],
      '石脂': ['赤石脂', '白石脂']
    };

    // 检查是否属于同一别名组
    for (const [base, aliasList] of Object.entries(aliases)) {
      if ((name1 === base && aliasList.includes(name2)) ||
          (name2 === base && aliasList.includes(name1)) ||
          (aliasList.includes(name1) && aliasList.includes(name2))) {
        return true;
      }
    }

    // 检查包含关系（例如："制附子" 包含 "附子"）
    if (name1.includes(name2) || name2.includes(name1)) {
      return true;
    }

    return false;
  }

  /**
   * 检查方剂组成的配伍安全性
   * @param {Array<Object>} composition - 方剂组成数组
   *   例如：[{ medicine_id: 'uuid', name: '甘草', dosage: '10g' }, ...]
   * @returns {Object} 安全检查结果
   *   { isSafe: boolean, warnings: Array<string>, details: Array<Object> }
   */
  checkFormulaSafety(composition) {
    if (!composition || !Array.isArray(composition) || composition.length === 0) {
      return {
        isSafe: true,
        warnings: [],
        details: []
      };
    }

    const warnings = [];
    const details = [];
    const medicineNames = composition.map(item => item.name);

    logger.debug('开始安全检查', { 
      medicineCount: medicineNames.length,
      medicines: medicineNames 
    });

    // 检查每对药材的配伍禁忌
    for (let i = 0; i < medicineNames.length; i++) {
      const med1 = medicineNames[i];
      const incompatibilities = this.incompatibilityMap.get(med1);

      if (!incompatibilities || incompatibilities.length === 0) {
        continue;
      }

      for (let j = i + 1; j < medicineNames.length; j++) {
        const med2 = medicineNames[j];

        // 检查是否存在禁忌
        for (const incomp of incompatibilities) {
          if (this.isMedicineMatch(incomp.herb, med2)) {
            const warningMsg = `⚠️ ${incomp.type}: ${med1} 与 ${med2} 配伍禁忌！`;
            warnings.push(warningMsg);
            
            details.push({
              level: 'critical',
              type: incomp.type,
              medicine_a: med1,
              medicine_b: med2,
              description: incomp.description,
              recommendation: '建议重新审查方剂配伍，或在中医师指导下使用'
            });

            logger.warn('检测到配伍禁忌', {
              type: incomp.type,
              medicine_a: med1,
              medicine_b: med2
            });
          }
        }
      }
    }

    return {
      isSafe: warnings.length === 0,
      warnings,
      details,
      checked_at: new Date().toISOString()
    };
  }

  /**
   * 获取药材的有益配伍关系（相须、相使）
   * @param {string} medicineName - 药材名称
   * @returns {Array<Object>} 有益配伍关系列表
   */
  getBeneficialRelationships(medicineName) {
    if (!this.relationshipData || !this.relationshipData.relationships) {
      return [];
    }

    const beneficial = this.relationshipData.relationships.filter(rel => {
      return (rel.type === '相须' || rel.type === '相使') &&
             (this.isMedicineMatch(rel.herb_a, medicineName) ||
              this.isMedicineMatch(rel.herb_b, medicineName));
    });

    return beneficial.map(rel => ({
      type: rel.type,
      partner: rel.herb_a === medicineName ? rel.herb_b : rel.herb_a,
      effect: rel.effect,
      description: rel.description
    }));
  }

  /**
   * 获取配伍禁忌统计信息
   * @returns {Object}
   */
  getStatistics() {
    const stats = {
      total_incompatibilities: this.incompatibilityData.data.length,
      eighteen_antagonisms: this.incompatibilityData.data.filter(d => d.type === '十八反').length,
      nineteen_fears: this.incompatibilityData.data.filter(d => d.type === '十九畏').length,
      total_relationships: this.relationshipData.relationships.length,
      relationship_types: {
        '相须': this.relationshipData.relationships.filter(r => r.type === '相须').length,
        '相使': this.relationshipData.relationships.filter(r => r.type === '相使').length,
        '相畏': this.relationshipData.relationships.filter(r => r.type === '相畏').length,
        '相杀': this.relationshipData.relationships.filter(r => r.type === '相杀').length
      }
    };

    return stats;
  }
}

// 导出单例
module.exports = new SafetyCheckService();

