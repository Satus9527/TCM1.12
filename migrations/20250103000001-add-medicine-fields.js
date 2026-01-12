'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 添加英文名字段
    await queryInterface.addColumn('medicines', 'english_name', {
      type: Sequelize.STRING(200),
      allowNull: true,
      comment: '英文名（拉丁学名）'
    });

    // 添加毒性字段
    await queryInterface.addColumn('medicines', 'toxicity', {
      type: Sequelize.STRING(50),
      allowNull: true,
      defaultValue: '无毒',
      comment: '毒性：无毒、小毒、有毒、大毒'
    });

    // 添加现代研究字段
    await queryInterface.addColumn('medicines', 'modern_research', {
      type: Sequelize.TEXT,
      allowNull: true,
      comment: '现代研究'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('medicines', 'english_name');
    await queryInterface.removeColumn('medicines', 'toxicity');
    await queryInterface.removeColumn('medicines', 'modern_research');
  }
};
