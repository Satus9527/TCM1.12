/**
 * 用户学习记录模型
 * 用于存储用户的学习记录，包括学习时长、进度等
 */

'use strict';

module.exports = (sequelize, DataTypes) => {
  const UserLearningRecord = sequelize.define('UserLearningRecord', {
  record_id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    comment: '学习记录ID'
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
  topic: {
    type: DataTypes.STRING(200),
    allowNull: false,
    comment: '学习主题'
  },
  duration: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    comment: '学习时长（分钟）'
  },
  progress: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    comment: '学习进度（百分比）'
  },
  completed: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    comment: '是否完成'
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
  tableName: 'user_learning_records',
  timestamps: false,
  indexes: [
    {
      fields: ['user_id', 'created_at'],
      name: 'idx_learning_records_user_time'
    }
  ]
  });

  return UserLearningRecord;
};
