'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('medicine_category_relationships', {
      relationship_id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false
      },
      category_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'medicine_categories',
          key: 'category_id'
        },
        onDelete: 'CASCADE',
        comment: '分类ID'
      },
      medicine_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'medicines',
          key: 'medicine_id'
        },
        onDelete: 'CASCADE',
        comment: '药材ID'
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
    await queryInterface.addIndex('medicine_category_relationships', ['category_id']);
    await queryInterface.addIndex('medicine_category_relationships', ['medicine_id']);
    await queryInterface.addIndex('medicine_category_relationships', ['category_id', 'medicine_id'], { unique: true });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('medicine_category_relationships');
  }
};