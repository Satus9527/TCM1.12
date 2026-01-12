'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('user_collections', {
      collection_id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
        comment: '收藏记录ID'
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        comment: '用户ID',
        references: {
          model: 'users',
          key: 'user_id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      content_type: {
        type: Sequelize.ENUM('medicine', 'formula'),
        allowNull: false,
        comment: '内容类型：medicine-药材, formula-方剂'
      },
      content_id: {
        type: Sequelize.UUID,
        allowNull: false,
        comment: '内容ID（药材ID或方剂ID）'
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        comment: '收藏时间'
      }
    }, {
      // 在 createTable 选项中直接定义索引
      indexes: [
        {
          unique: true,
          fields: ['user_id', 'content_type', 'content_id'],
          name: 'unique_user_collection'
        }
        // 注意：不需要单独的 user_id 索引，因为外键会自动创建
      ]
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('user_collections');
  }
};

