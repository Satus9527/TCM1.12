'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('user_files', {
      file_id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
        comment: '文件ID'
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        comment: '用户ID（教师ID）',
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
        comment: '文件名'
      },
      storage_url: {
        type: Sequelize.STRING(500),
        allowNull: false,
        comment: '存储URL（D8对象存储地址）'
      },
      file_type: {
        type: Sequelize.STRING(100),
        allowNull: true,
        comment: '文件类型（MIME type）'
      },
      file_size: {
        type: Sequelize.BIGINT,
        allowNull: true,
        comment: '文件大小（字节）'
      },
      uploaded_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        comment: '上传时间'
      }
    }, {
      // 在 createTable 选项中直接定义索引
      indexes: [
        {
          fields: ['user_id', 'uploaded_at'],
          name: 'idx_files_user_upload'  // 改名避免冲突
        }
      ]
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('user_files');
  }
};

