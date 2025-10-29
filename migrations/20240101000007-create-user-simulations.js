'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('user_simulations', {
      simulation_id: {
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
      modified_composition: {
        type: Sequelize.JSON,
        allowNull: false,
        comment: '修改后的组成，JSON格式，包含medicine_id, dosage等'
      },
      user_notes: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: '用户笔记'
      },
      ai_analysis: {
        type: Sequelize.JSON,
        allowNull: true,
        comment: 'AI分析结果，JSON格式'
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
    await queryInterface.addIndex('user_simulations', ['user_id']);
    await queryInterface.addIndex('user_simulations', ['formula_id']);
    await queryInterface.addIndex('user_simulations', ['created_at']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('user_simulations');
  }
};

