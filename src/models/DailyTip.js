/**
 * 今日提示模型
 * 用于存储系统生成的今日提示，如宜/忌事项、注意事项、推荐学习内容等
 */

'use strict';

module.exports = (sequelize, DataTypes) => {
  const DailyTip = sequelize.define('DailyTip', {
  tip_id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    comment: '提示ID'
  },
  type: {
    type: DataTypes.ENUM('success', 'warning', 'info'),
    allowNull: false,
    comment: '提示类型'
  },
  icon: {
    type: DataTypes.STRING(50),
    allowNull: false,
    comment: '提示图标'
  },
  text: {
    type: DataTypes.STRING(500),
    allowNull: false,
    comment: '提示内容'
  },
  effective_date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    comment: '生效日期'
  },
  created_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    comment: '创建时间'
  },
  updated_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    comment: '更新时间'
  }
}, {
  tableName: 'daily_tips',
  timestamps: false,
  indexes: [
    {
      fields: ['effective_date'],
      name: 'idx_daily_tips_date'
    }
  ]
  });

  return DailyTip;
};
