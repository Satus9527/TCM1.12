'use strict';

const { v4: uuidv4 } = require('uuid');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 首先查询方剂和药材的ID
    // 注意：在实际应用中，这里需要查询数据库获取ID
    // 为了简化，这里使用占位符，需要在实际环境中替换为真实ID
    
    // 这是一个示例，实际使用时需要先查询数据库获取对应的UUID
    // 建议在实际部署时手动填充或通过脚本生成
    
    console.log('Note: This seeder requires manual adjustment with actual UUIDs from medicines and formulas tables');
    console.log('Please run appropriate queries to get the IDs and update this seeder accordingly');
    
    // 示例结构（需要替换为实际的UUID）
    /*
    const compositions = [
      {
        composition_id: uuidv4(),
        formula_id: 'FORMULA_UUID_四君子汤',
        medicine_id: 'MEDICINE_UUID_人参',
        dosage: '9g',
        role: '君药',
        processing: null,
        notes: '大补元气，健脾养胃',
        created_at: new Date()
      },
      // ... 更多组成
    ];
    
    await queryInterface.bulkInsert('formula_composition', compositions);
    */
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('formula_composition', null, {});
  }
};

