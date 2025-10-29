'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('medicines', {
      medicine_id: {
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
        allowNull: true
      },
      nature: {
        type: Sequelize.STRING(50),
        allowNull: true,
        comment: '性味: 寒、热、温、凉、平'
      },
      flavor: {
        type: Sequelize.STRING(50),
        allowNull: true,
        comment: '味: 辛、甘、酸、苦、咸'
      },
      meridian: {
        type: Sequelize.STRING(100),
        allowNull: true,
        comment: '归经'
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
        type: Sequelize.STRING(100),
        allowNull: true,
        comment: '用法用量'
      },
      contraindications: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: '禁忌'
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: '药材描述'
      },
      image_url: {
        type: Sequelize.STRING(255),
        allowNull: true
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
    await queryInterface.addIndex('medicines', ['name']);
    await queryInterface.addIndex('medicines', ['pinyin']);
    await queryInterface.addIndex('medicines', ['category']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('medicines');
  }
};

