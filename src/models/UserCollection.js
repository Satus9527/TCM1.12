'use strict';

module.exports = (sequelize, DataTypes) => {
  const UserCollection = sequelize.define('UserCollection', {
    collection_id: {
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
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: '用户收藏备注'
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'user_collections',
    timestamps: false,
    indexes: [
      {
        unique: true,
        fields: ['user_id', 'formula_id']
      }
    ]
  });

  UserCollection.associate = (models) => {
    // UserCollection belongs to User
    UserCollection.belongsTo(models.User, {
      foreignKey: 'user_id',
      as: 'user',
      onDelete: 'CASCADE'
    });

    // UserCollection belongs to Formula
    UserCollection.belongsTo(models.Formula, {
      foreignKey: 'formula_id',
      as: 'formula',
      onDelete: 'CASCADE'
    });
  };

  return UserCollection;
};

