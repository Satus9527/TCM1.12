'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('medicine_categories', {
      category_id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false
      },
      name: {
        type: Sequelize.STRING(50),
        allowNull: false,
        unique: true,
        comment: '分类名称'
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: '分类描述'
      },
      icon: {
        type: Sequelize.STRING(100),
        allowNull: true,
        comment: '分类图标'
      },
      parent_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'medicine_categories',
          key: 'category_id'
        },
        onDelete: 'SET NULL',
        comment: '父分类ID'
      },
      order: {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: 0,
        comment: '显示顺序'
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')
      }
    });

    // 添加索引
    await queryInterface.addIndex('medicine_categories', ['name']);
    await queryInterface.addIndex('medicine_categories', ['parent_id']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('medicine_categories');
  }
};