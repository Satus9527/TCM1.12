'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('formulas', {
      formula_id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false
      },
      name: {
        type: Sequelize.STRING(100),
        allowNull: false,
        unique: true
      },
      pinyin: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      category: {
        type: Sequelize.STRING(50),
        allowNull: true,
        comment: '方剂分类'
      },
      source: {
        type: Sequelize.STRING(100),
        allowNull: true,
        comment: '出处'
      },
      composition_summary: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: '组成概述'
      },
      efficacy: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: '功效'
      },
      indications: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: '主治'
      },
      usage_dosage: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: '用法用量'
      },
      contraindications: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: '禁忌'
      },
      clinical_applications: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: '临床应用'
      },
      modifications: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: '加减变化'
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: '方剂描述'
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
    await queryInterface.addIndex('formulas', ['name']);
    await queryInterface.addIndex('formulas', ['pinyin']);
    await queryInterface.addIndex('formulas', ['category']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('formulas');
  }
};

