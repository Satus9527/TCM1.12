'use strict';

module.exports = (sequelize, DataTypes) => {
  const Medicine = sequelize.define('Medicine', {
    medicine_id: {
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
      allowNull: true
    },
    nature: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: '性味: 寒、热、温、凉、平'
    },
    flavor: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: '味: 辛、甘、酸、苦、咸'
    },
    meridian: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: '归经'
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
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: '用法用量'
    },
    contraindications: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: '禁忌'
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: '药材描述'
    },
    image_url: {
      type: DataTypes.STRING(255),
      allowNull: true
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
    tableName: 'medicines',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  Medicine.associate = (models) => {
    // Medicine belongs to many Formulas through FormulaComposition
    Medicine.belongsToMany(models.Formula, {
      through: models.FormulaComposition,
      foreignKey: 'medicine_id',
      otherKey: 'formula_id',
      as: 'formulas'
    });
  };

  return Medicine;
};

