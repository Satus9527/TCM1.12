const { UserActivity } = require('../models');
const logger = require('../utils/logger');

/**
 * 用户活动服务类
 * 用于处理用户活动记录相关的业务逻辑
 */
class UserActivityService {
  /**
   * 获取用户的近期活动记录
   * @param {string} userId - 用户ID
   * @param {number} limit - 返回记录数量限制，默认10条
   * @returns {Promise<Array>} - 近期活动记录列表
   */
  async getUserRecentActivities(userId, limit = 10) {
    try {
      const activities = await UserActivity.findAll({
        where: { user_id: userId },
        order: [['created_at', 'DESC']],
        limit: limit
      });

      // 格式化活动数据
      return activities.map(activity => ({
        id: activity.activity_id,
        title: activity.title,
        time: this.formatActivityTime(activity.created_at),
        icon: this.getActivityIcon(activity.activity_type),
        route: this.getActivityRoute(activity.activity_type, activity.related_id)
      }));
    } catch (error) {
      logger.error('获取用户近期活动失败', { error: error.message, userId });
      throw error;
    }
  }

  /**
   * 格式化活动时间
   * @param {Date} date - 活动发生时间
   * @returns {string} - 格式化后的时间字符串
   */
  formatActivityTime(date) {
    const now = new Date();
    const diff = now - new Date(date);
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 60) {
      return `${minutes}分钟前`;
    } else if (hours < 24) {
      return `${hours}小时前`;
    } else {
      return `${days}天前`;
    }
  }

  /**
   * 根据活动类型获取对应图标
   * @param {string} activityType - 活动类型
   * @returns {string} - 图标类名
   */
  getActivityIcon(activityType) {
    const iconMap = {
      view_medicine: 'ri-search-line',
      create_prescription: 'ri-file-text-line',
      favorite_medicine: 'ri-star-line',
      view_prescription: 'ri-file-text-line',
      study: 'ri-book-open-line'
    };
    return iconMap[activityType] || 'ri-time-line';
  }

  /**
   * 根据活动类型获取跳转路由
   * @param {string} activityType - 活动类型
   * @param {string} relatedId - 相关资源ID
   * @returns {string} - 路由路径
   */
  getActivityRoute(activityType, relatedId) {
    switch (activityType) {
      case 'view_medicine':
      case 'favorite_medicine':
        return `/knowledge`;
      case 'create_prescription':
      case 'view_prescription':
        return `/simulation`;
      case 'study':
        return `/content`;
      default:
        return '';
    }
  }
}

module.exports = new UserActivityService();
