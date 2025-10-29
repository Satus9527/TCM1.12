'use strict';

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    user_id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false
    },
    username: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true
    },
    password_hash: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    role: {
      type: DataTypes.ENUM('health_follower', 'student', 'teacher'),
      allowNull: false
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: true,
      unique: true,
      validate: {
        isEmail: true
      }
    },
    phone: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    avatar_url: {
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
    tableName: 'users',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  User.associate = (models) => {
    // User has many RefreshTokens
    User.hasMany(models.RefreshToken, {
      foreignKey: 'user_id',
      as: 'refreshTokens',
      onDelete: 'CASCADE'
    });

    // User has many UserCollections
    User.hasMany(models.UserCollection, {
      foreignKey: 'user_id',
      as: 'collections',
      onDelete: 'CASCADE'
    });

    // User has many UserSimulations
    User.hasMany(models.UserSimulation, {
      foreignKey: 'user_id',
      as: 'simulations',
      onDelete: 'CASCADE'
    });

    // User has many UserFiles
    User.hasMany(models.UserFile, {
      foreignKey: 'user_id',
      as: 'files',
      onDelete: 'CASCADE'
    });
  };

  return User;
};

