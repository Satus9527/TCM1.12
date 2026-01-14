'use strict';

module.exports = (sequelize, DataTypes) => {
  const FourPropertiesRelationship = sequelize.define('FourPropertiesRelationship', {
    relationship_id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false
    },
    type: {
      type: DataTypes.STRING(20),
      allowNull: false,
      comment: '关系类型: 相须、相使、相畏、相杀'
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
      comment: '关系描述'
    },
    effect: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: '效果描述'
    },
    example_prescription: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: '例方名称'
    },
    mechanism: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: '作用机制'
    },
    usage: {
      type: DataTypes.STRING(200),
      allowNull: true,
      comment: '用法说明'
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
    tableName: 'four_properties_relationships',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  FourPropertiesRelationship.associate = (models) => {
    // 可以添加关联关系
  };

  return FourPropertiesRelationship;
};
