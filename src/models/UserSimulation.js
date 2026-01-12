/**
 * 用户模拟方案模型
 * 用于存储用户保存的配方模拟方案
 */

'use strict';

module.exports = (sequelize, DataTypes) => {
  const UserSimulation = sequelize.define('UserSimulation', {
  simulation_id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    comment: '模拟方案ID'
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
  name: {
    type: DataTypes.STRING(200),
    allowNull: false,
    comment: '方案名称'
  },
  composition_data: {
    type: DataTypes.JSON,
    allowNull: false,
    comment: '配方组成数据（JSON格式）'
  },
  ai_analysis_data: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'AI分析结果数据（JSON格式）'
  },
  user_notes: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: '用户备注'
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
  tableName: 'user_simulations',
  timestamps: false,
  indexes: [
    {
      fields: ['user_id', 'created_at'],
      name: 'idx_user_simulations_user_time'
    }
  ]
  });

  return UserSimulation;
};
