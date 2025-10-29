'use strict';

module.exports = (sequelize, DataTypes) => {
  const UserSimulation = sequelize.define('UserSimulation', {
    simulation_id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'user_id'
      }
    },
    formula_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'formulas',
        key: 'formula_id'
      }
    },
    modified_composition: {
      type: DataTypes.JSON,
      allowNull: false,
      comment: '修改后的组成，JSON格式，包含medicine_id, dosage等'
    },
    user_notes: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: '用户笔记'
    },
    ai_analysis: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'AI分析结果，JSON格式'
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'user_simulations',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  UserSimulation.associate = (models) => {
    // UserSimulation belongs to User
    UserSimulation.belongsTo(models.User, {
      foreignKey: 'user_id',
      as: 'user',
      onDelete: 'CASCADE'
    });

    // UserSimulation belongs to Formula
    UserSimulation.belongsTo(models.Formula, {
      foreignKey: 'formula_id',
      as: 'formula',
      onDelete: 'CASCADE'
    });
  };

  return UserSimulation;
};

