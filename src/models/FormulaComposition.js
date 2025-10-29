'use strict';

module.exports = (sequelize, DataTypes) => {
  const FormulaComposition = sequelize.define('FormulaComposition', {
    composition_id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false
    },
    formula_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'formulas',
        key: 'formula_id'
      }
    },
    medicine_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'medicines',
        key: 'medicine_id'
      }
    },
    dosage: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: '用量，如 "9g", "3-9g"'
    },
    role: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: '药物角色: 君、臣、佐、使'
    },
    processing: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: '炮制方法'
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: '备注'
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'formula_composition',
    timestamps: false,
    indexes: [
      {
        unique: true,
        fields: ['formula_id', 'medicine_id']
      }
    ]
  });

  FormulaComposition.associate = (models) => {
    // FormulaComposition belongs to Formula
    FormulaComposition.belongsTo(models.Formula, {
      foreignKey: 'formula_id',
      as: 'formula',
      onDelete: 'CASCADE'
    });

    // FormulaComposition belongs to Medicine
    FormulaComposition.belongsTo(models.Medicine, {
      foreignKey: 'medicine_id',
      as: 'medicine',
      onDelete: 'RESTRICT'
    });
  };

  return FormulaComposition;
};

