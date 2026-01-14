'use strict';

module.exports = (sequelize, DataTypes) => {
  const MedicineCategory = sequelize.define('MedicineCategory', {
    category_id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false
    },
    name: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      comment: '分类名称'
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: '分类描述'
    },
    icon: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: '分类图标'
    },
    parent_id: {
      type: DataTypes.UUID,
      allowNull: true,
      comment: '父分类ID'
    },
    order: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
      comment: '显示顺序'
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
    tableName: 'medicine_categories',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  MedicineCategory.associate = (models) => {
    // 自关联，父分类
    MedicineCategory.belongsTo(models.MedicineCategory, {
      foreignKey: 'parent_id',
      as: 'parent',
      onDelete: 'SET NULL'
    });

    // 自关联，子分类
    MedicineCategory.hasMany(models.MedicineCategory, {
      foreignKey: 'parent_id',
      as: 'children',
      onDelete: 'SET NULL'
    });

    // 与药材的多对多关系
    MedicineCategory.belongsToMany(models.Medicine, {
      through: 'medicine_category_relationships',
      foreignKey: 'category_id',
      otherKey: 'medicine_id',
      as: 'medicines'
    });
  };

  return MedicineCategory;
};
