const { DailyTip } = require('../models');
const logger = require('../utils/logger');

/**
 * 今日提示服务类
 * 用于处理每日提示相关的业务逻辑
 */
class DailyTipService {
  /**
   * 获取今日的提示列表
   * @returns {Promise<Array>} - 今日提示列表
   */
  async getTodayTips() {
    try {
      // 获取今天的日期（YYYY-MM-DD格式）
      const today = new Date().toISOString().split('T')[0];
      
      const tips = await DailyTip.findAll({
        where: { effective_date: today },
        order: [['created_at', 'ASC']]
      });

      // 如果今天没有提示，返回默认提示
      if (tips.length === 0) {
        return this.getDefaultTips();
      }

      // 格式化提示数据
      return tips.map(tip => ({
        id: tip.tip_id,
        type: tip.type,
        icon: tip.icon,
        text: tip.text
      }));
    } catch (error) {
      logger.error('获取今日提示失败', { error: error.message });
      // 发生错误时返回默认提示
      return this.getDefaultTips();
    }
  }

  /**
   * 获取默认提示列表
   * @returns {Array} - 默认提示列表
   */
  getDefaultTips() {
    return [
      { type: 'success', icon: 'ri-sun-line', text: '今日宜研究补气类药材配伍' },
      { type: 'warning', icon: 'ri-moon-line', text: '注意：孕妇慎用活血化瘀药材' },
      { type: 'info', icon: 'ri-star-line', text: '推荐学习：四君子汤的现代应用' }
    ];
  }

  /**
   * 获取随机提示（用于测试或补充）
   * @returns {Object} - 随机提示对象
   */
  getRandomTip() {
    const tips = this.getDefaultTips();
    const randomIndex = Math.floor(Math.random() * tips.length);
    return tips[randomIndex];
  }
}

module.exports = new DailyTipService();
