'use strict';

module.exports = (sequelize, DataTypes) => {
  const HerbInteraction = sequelize.define('HerbInteraction', {
    interaction_id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false
    },
    type: {
      type: DataTypes.STRING(20),
      allowNull: false,
      comment: '类型: 十八反、十九畏'
    },
    group: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: '分组，如：甘草反'
    },
    herb_a: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: '药材A名称'
    },
    herb_b: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: '药材B名称'
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: '禁忌描述'
    },
    severity: {
      type: DataTypes.STRING(20),
      allowNull: true,
      comment: '严重程度: high、medium、low'
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      onUpdate: DataTypes.NOW
    }
  }, {
    tableName: 'herb_interactions',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  HerbInteraction.associate = (models) => {
    // 可以添加关联关系
  };

  return HerbInteraction;
};
