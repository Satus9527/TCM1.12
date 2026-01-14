'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('herb_interactions', {
      interaction_id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false
      },
      type: {
        type: Sequelize.STRING(20),
        allowNull: false,
        comment: '类型: 十八反、十九畏'
      },
      group: {
        type: Sequelize.STRING(50),
        allowNull: true,
        comment: '分组，如：甘草反'
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
        comment: '禁忌描述'
      },
      severity: {
        type: Sequelize.STRING(20),
        allowNull: true,
        comment: '严重程度: high、medium、low'
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
    await queryInterface.addIndex('herb_interactions', ['herb_a']);
    await queryInterface.addIndex('herb_interactions', ['herb_b']);
    await queryInterface.addIndex('herb_interactions', ['type']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('herb_interactions');
  }
};