/**
 * 用户文件元数据模型
 * 用于存储教师上传的文件元数据
 */

'use strict';

module.exports = (sequelize, DataTypes) => {
  const UserFile = sequelize.define('UserFile', {
  file_id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    comment: '文件ID'
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: false,
    comment: '用户ID（教师ID）',
    references: {
      model: 'users',
      key: 'user_id'
    }
  },
  file_name: {
    type: DataTypes.STRING(255),
    allowNull: false,
    comment: '文件名'
  },
  storage_url: {
    type: DataTypes.STRING(500),
    allowNull: false,
    comment: '存储URL（D8对象存储地址）'
  },
  file_type: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: '文件类型（MIME type）'
  },
  file_size: {
    type: DataTypes.BIGINT,
    allowNull: true,
    comment: '文件大小（字节）'
  },
  uploaded_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    comment: '上传时间'
  }
}, {
  tableName: 'user_files',
  timestamps: false,
  indexes: [
    {
      fields: ['user_id', 'uploaded_at'],
      name: 'idx_user_files_user_time'
    }
  ]
  });

  return UserFile;
};
