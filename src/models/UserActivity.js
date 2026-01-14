/**
 * 用户活动记录模型
 * 用于存储用户的各种活动记录，如查看药材详情、创建处方等
 */

'use strict';

module.exports = (sequelize, DataTypes) => {
  const UserActivity = sequelize.define('UserActivity', {
  activity_id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    comment: '活动记录ID'
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: false,
    comment: '用户ID',
    references: {
      model: 'users',
      key: 'user_id'
    }
  },
  activity_type: {
    type: DataTypes.ENUM('view_medicine', 'create_prescription', 'favorite_medicine', 'view_prescription', 'study'),
    allowNull: false,
    comment: '活动类型'
  },
  title: {
    type: DataTypes.STRING(200),
    allowNull: false,
    comment: '活动标题'
  },
  description: {
    type: DataTypes.STRING(500),
    allowNull: true,
    comment: '活动描述'
  },
  related_id: {
    type: DataTypes.UUID,
    allowNull: true,
    comment: '相关资源ID（如药材ID、处方ID等）'
  },
  created_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    comment: '活动发生时间'
  }
}, {
  tableName: 'user_activities',
  timestamps: false,
  indexes: [
    {
      fields: ['user_id', 'created_at'],
      name: 'idx_user_activities_user_time'
    }
  ]
  });

  return UserActivity;
};
