'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('four_properties_relationships', {
      relationship_id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false
      },
      type: {
        type: Sequelize.STRING(20),
        allowNull: false,
        comment: '关系类型: 相须、相使、相畏、相杀'
      },
      herb_a: {
        type: Sequelize.STRING(100),
        allowNull: false,
        comment: '药材A名称'
      },
      herb_b: {
        type: Sequelize.STRING(100),
        allowNull: false,
        comment: '药材B名称'
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: '关系描述'
      },
      effect: {
        type: Sequelize.STRING(100),
        allowNull: true,
        comment: '效果描述'
      },
      example_prescription: {
        type: Sequelize.STRING(100),
        allowNull: true,
        comment: '例方名称'
      },
      mechanism: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: '作用机制'
      },
      usage: {
        type: Sequelize.STRING(200),
        allowNull: true,
        comment: '用法说明'
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
    await queryInterface.addIndex('four_properties_relationships', ['herb_a']);
    await queryInterface.addIndex('four_properties_relationships', ['herb_b']);
    await queryInterface.addIndex('four_properties_relationships', ['type']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('four_properties_relationships');
  }
};