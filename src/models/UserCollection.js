/**
 * 用户收藏模型
 * 用于存储用户收藏的药材和方剂
 */

'use strict';

module.exports = (sequelize, DataTypes) => {
  const UserCollection = sequelize.define('UserCollection', {
  collection_id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    comment: '收藏记录ID'
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
  content_type: {
    type: DataTypes.ENUM('medicine', 'formula'),
    allowNull: false,
    comment: '内容类型：medicine-药材, formula-方剂'
  },
  content_id: {
    type: DataTypes.UUID,
    allowNull: false,
    comment: '内容ID（药材ID或方剂ID）'
  },
  created_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    comment: '收藏时间'
  }
}, {
  tableName: 'user_collections',
  timestamps: false,
  indexes: [
    {
      unique: true,
      fields: ['user_id', 'content_type', 'content_id'],
      name: 'unique_user_collection'
    },
    {
      fields: ['user_id'],
      name: 'idx_user_collections_user_id'
    }
  ]
  });

  return UserCollection;
};
