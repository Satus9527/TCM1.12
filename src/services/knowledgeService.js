const fs = require('fs').promises;
const path = require('path');
const logger = require('../utils/logger');

class KnowledgeService {
  constructor() {
    this.data = {
      sixiang: null,           // 四相数据
      contraindications: null, // 十八反十九畏
      herbsInfo: null,         // 药材功效和性味
      formulas: null,          // 方剂数据集
      herbs: null              // 药材基础信息
    };
    this.loaded = false;
  }

  /**
   * 加载所有知识库数据
   */
  async loadAll() {
    try {
      const dataDir = path.join(__dirname, '../../');

      // 并行加载所有JSON文件
      const [sixiang, contraindications, herbsInfo, formulas, herbs] = await Promise.all([
        this.loadJSON(path.join(dataDir, '四相.json')),
        this.loadJSON(path.join(dataDir, '18反19畏.json')),
        this.loadJSON(path.join(dataDir, '中药的功效和性味.json')),
        this.loadJSON(path.join(dataDir, '药方数据集.json')),
        this.loadJSON(path.join(dataDir, 'herbs.json')).catch(() => []) // herbs.json可能不存在
      ]);

      this.data.sixiang = sixiang;
      this.data.contraindications = contraindications;
      this.data.herbsInfo = herbsInfo;
      this.data.formulas = formulas;
      this.data.herbs = herbs;

      this.loaded = true;

      logger.info('Knowledge base loaded successfully', {
        sixiang: sixiang?.relationships?.length || 0,
        contraindications: contraindications?.data?.length || 0,
        herbsInfo: Array.isArray(herbsInfo) ? herbsInfo.length : 0,
        formulas: Array.isArray(formulas) ? formulas.length : 0
      });

      return true;
    } catch (error) {
      logger.error('Failed to load knowledge base', { error: error.message });
      throw error;
    }
  }

  /**
   * 加载JSON文件
   */
  async loadJSON(filePath) {
    const content = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(content);
  }

  /**
   * 确保数据已加载
   */
  async ensureLoaded() {
    if (!this.loaded) {
      await this.loadAll();
    }
  }

  /**
   * 查询药材的配伍关系
   * @param {string} herbA - 药材A名称
   * @param {string} herbB - 药材B名称
   * @returns {Object} 配伍关系信息
   */
  async getCompatibility(herbA, herbB) {
    await this.ensureLoaded();

    const relationships = [];

    // 查询四相关系（相须、相使、相畏、相杀）
    if (this.data.sixiang?.relationships) {
      const matches = this.data.sixiang.relationships.filter(rel => 
        (rel.herb_a === herbA && rel.herb_b === herbB) ||
        (rel.herb_a === herbB && rel.herb_b === herbA)
      );
      relationships.push(...matches);
    }

    return {
      herbs: [herbA, herbB],
      hasRelationship: relationships.length > 0,
      relationships: relationships,
      summary: this.summarizeRelationship(relationships)
    };
  }

  /**
   * 检查配伍禁忌
   * @param {Array<string>} herbs - 药材名称列表
   * @returns {Object} 禁忌检查结果
   */
  async checkContraindications(herbs) {
    await this.ensureLoaded();

    const warnings = [];
    const contraindications = this.data.contraindications?.data || [];

    // 检查每对药材的组合
    for (let i = 0; i < herbs.length; i++) {
      for (let j = i + 1; j < herbs.length; j++) {
        const herbA = herbs[i];
        const herbB = herbs[j];

        const matches = contraindications.filter(item =>
          (item.herb_a === herbA && item.herb_b === herbB) ||
          (item.herb_a === herbB && item.herb_b === herbA)
        );

        if (matches.length > 0) {
          warnings.push({
            herbs: [herbA, herbB],
            contraindications: matches,
            severity: 'high'
          });
        }
      }
    }

    return {
      safe: warnings.length === 0,
      warnings: warnings,
      checkedCount: herbs.length,
      message: warnings.length === 0 
        ? '配伍安全，未发现禁忌' 
        : `发现 ${warnings.length} 个配伍禁忌，请谨慎使用`
    };
  }

  /**
   * 获取药材详细信息
   * @param {string} herbName - 药材名称
   * @returns {Object} 药材信息
   */
  async getHerbInfo(herbName) {
    await this.ensureLoaded();

    if (!Array.isArray(this.data.herbsInfo)) {
      return null;
    }

    const herbInfo = this.data.herbsInfo.find(item => 
      item.input && item.input.includes(herbName)
    );

    if (!herbInfo) {
      return null;
    }

    // 解析output字段
    const info = this.parseHerbOutput(herbInfo.output);

    return {
      name: herbName,
      ...info,
      raw: herbInfo.output
    };
  }

  /**
   * 搜索相似方剂
   * @param {Object} criteria - 搜索条件
   * @returns {Array} 方剂列表
   */
  async searchFormulas(criteria = {}) {
    await this.ensureLoaded();

    if (!Array.isArray(this.data.formulas)) {
      return [];
    }

    let results = [...this.data.formulas];

    // 按功效筛选
    if (criteria.efficacy) {
      results = results.filter(f => 
        f.功效 && f.功效.includes(criteria.efficacy)
      );
    }

    // 按主治筛选
    if (criteria.indication) {
      results = results.filter(f => 
        f.主治 && f.主治.includes(criteria.indication)
      );
    }

    // 按药材筛选
    if (criteria.herb) {
      results = results.filter(f => 
        f.组成 && f.组成.some(item => item.药材 === criteria.herb)
      );
    }

    // 限制返回数量
    if (criteria.limit) {
      results = results.slice(0, criteria.limit);
    }

    return results;
  }

  /**
   * 根据症状推荐方剂
   * @param {string} symptoms - 症状描述
   * @param {number} limit - 返回数量限制
   * @returns {Array} 推荐的方剂列表
   */
  async recommendFormulas(symptoms, limit = 5) {
    await this.ensureLoaded();

    if (!Array.isArray(this.data.formulas)) {
      return [];
    }

    // 简单的关键词匹配（后续可以接入AI模型）
    const results = this.data.formulas.filter(formula => {
      const searchText = `${formula.主治} ${formula.功效}`.toLowerCase();
      return symptoms.toLowerCase().split(' ').some(keyword => 
        searchText.includes(keyword)
      );
    });

    return results.slice(0, limit);
  }

  /**
   * 分析方剂组成
   * @param {Array} composition - 方剂组成 [{name, dosage}]
   * @returns {Object} 分析结果
   */
  async analyzeComposition(composition) {
    await this.ensureLoaded();

    const herbs = composition.map(item => item.name || item.药材);
    
    // 检查配伍禁忌
    const contraindications = await this.checkContraindications(herbs);
    
    // 检查配伍关系
    const relationships = [];
    for (let i = 0; i < herbs.length; i++) {
      for (let j = i + 1; j < herbs.length; j++) {
        const rel = await this.getCompatibility(herbs[i], herbs[j]);
        if (rel.hasRelationship) {
          relationships.push(rel);
        }
      }
    }

    return {
      herbs: herbs,
      totalCount: herbs.length,
      safety: contraindications,
      relationships: relationships,
      analysis: {
        hasBeneficialRelations: relationships.some(r => 
          r.relationships.some(rel => rel.type === '相须' || rel.type === '相使')
        ),
        hasContraindications: !contraindications.safe
      }
    };
  }

  /**
   * 总结配伍关系
   */
  summarizeRelationship(relationships) {
    if (relationships.length === 0) {
      return '无特殊配伍关系记录';
    }

    const types = relationships.map(r => r.type).join('、');
    const effects = relationships.map(r => r.effect || r.description).join('；');

    return `${types}关系：${effects}`;
  }

  /**
   * 解析药材信息输出
   */
  parseHerbOutput(output) {
    const lines = output.split('\n');
    const info = {};

    lines.forEach(line => {
      if (line.includes('性') && line.includes('味')) {
        const match = line.match(/性(.+?)，味(.+?)。/);
        if (match) {
          info.nature = match[1].trim();
          info.flavor = match[2].trim();
        }
      } else if (line.includes('归') && line.includes('经')) {
        const match = line.match(/归(.+?)经/);
        if (match) {
          info.meridian = match[1].trim();
        }
      } else if (line.includes('功效：')) {
        info.efficacy = line.split('功效：')[1]?.trim();
      } else if (line.includes('用法用量：')) {
        info.usage = line.split('用法用量：')[1]?.trim();
      } else if (line.includes('禁忌：')) {
        info.contraindication = line.split('禁忌：')[1]?.trim();
      }
    });

    return info;
  }

  /**
   * 获取统计信息
   */
  async getStats() {
    await this.ensureLoaded();

    return {
      sixiang: this.data.sixiang?.relationships?.length || 0,
      contraindications: this.data.contraindications?.data?.length || 0,
      herbsInfo: Array.isArray(this.data.herbsInfo) ? this.data.herbsInfo.length : 0,
      formulas: Array.isArray(this.data.formulas) ? this.data.formulas.length : 0,
      loaded: this.loaded
    };
  }
}

module.exports = new KnowledgeService();

