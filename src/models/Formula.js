'use strict';

module.exports = (sequelize, DataTypes) => {
  const Formula = sequelize.define('Formula', {
    formula_id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true
    },
    pinyin: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    category: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: '方剂分类'
    },
    source: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: '出处'
    },
    composition_summary: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: '组成概述'
    },
    efficacy: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: '功效'
    },
    indications: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: '主治'
    },
    usage_dosage: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: '用法用量'
    },
    contraindications: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: '禁忌'
    },
    clinical_applications: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: '临床应用'
    },
    modifications: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: '加减变化'
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: '方剂描述'
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
    tableName: 'formulas',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  Formula.associate = (models) => {
    // Formula belongs to many Medicines through FormulaComposition
    Formula.belongsToMany(models.Medicine, {
      through: models.FormulaComposition,
      foreignKey: 'formula_id',
      otherKey: 'medicine_id',
      as: 'medicines'
    });

    // Formula has many FormulaCompositions
    Formula.hasMany(models.FormulaComposition, {
      foreignKey: 'formula_id',
      as: 'compositions',
      onDelete: 'CASCADE'
    });

    // Formula has many UserCollections
    Formula.hasMany(models.UserCollection, {
      foreignKey: 'formula_id',
      as: 'collections',
      onDelete: 'CASCADE'
    });

    // Formula has many UserSimulations
    Formula.hasMany(models.UserSimulation, {
      foreignKey: 'formula_id',
      as: 'simulations',
      onDelete: 'CASCADE'
    });
  };

  return Formula;
};

