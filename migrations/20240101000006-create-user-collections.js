'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('user_collections', {
      collection_id: {
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
      formula_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'formulas',
          key: 'formula_id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      notes: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: '用户收藏备注'
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    // 添加唯一约束和索引
    await queryInterface.addIndex('user_collections', ['user_id', 'formula_id'], {
      unique: true,
      name: 'unique_user_formula_collection'
    });
    await queryInterface.addIndex('user_collections', ['user_id']);
    await queryInterface.addIndex('user_collections', ['formula_id']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('user_collections');
  }
};

