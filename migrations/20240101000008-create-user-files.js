'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('user_files', {
      file_id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'user_id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      file_name: {
        type: Sequelize.STRING(255),
        allowNull: false,
        comment: '原始文件名'
      },
      file_path: {
        type: Sequelize.STRING(500),
        allowNull: false,
        comment: '文件存储路径'
      },
      file_size: {
        type: Sequelize.INTEGER,
        allowNull: false,
        comment: '文件大小（字节）'
      },
      file_type: {
        type: Sequelize.STRING(50),
        allowNull: false,
        comment: 'MIME类型'
      },
      upload_purpose: {
        type: Sequelize.STRING(100),
        allowNull: true,
        comment: '上传用途: avatar, document等'
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    // 添加索引
    await queryInterface.addIndex('user_files', ['user_id']);
    await queryInterface.addIndex('user_files', ['upload_purpose']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('user_files');
  }
};

