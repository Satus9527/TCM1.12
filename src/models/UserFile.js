'use strict';

module.exports = (sequelize, DataTypes) => {
  const UserFile = sequelize.define('UserFile', {
    file_id: {
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
    file_name: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: '原始文件名'
    },
    file_path: {
      type: DataTypes.STRING(500),
      allowNull: false,
      comment: '文件存储路径'
    },
    file_size: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: '文件大小（字节）'
    },
    file_type: {
      type: DataTypes.STRING(50),
      allowNull: false,
      comment: 'MIME类型'
    },
    upload_purpose: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: '上传用途: avatar, document等'
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'user_files',
    timestamps: false
  });

  UserFile.associate = (models) => {
    // UserFile belongs to User
    UserFile.belongsTo(models.User, {
      foreignKey: 'user_id',
      as: 'user',
      onDelete: 'CASCADE'
    });
  };

  return UserFile;
};

