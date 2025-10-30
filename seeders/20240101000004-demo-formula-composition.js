'use strict';

const { v4: uuidv4 } = require('uuid');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 查询方剂ID
    const formulas = await queryInterface.sequelize.query(
      `SELECT formula_id, name FROM formulas;`,
      { type: Sequelize.QueryTypes.SELECT }
    );

    // 查询药材ID
    const medicines = await queryInterface.sequelize.query(
      `SELECT medicine_id, name FROM medicines;`,
      { type: Sequelize.QueryTypes.SELECT }
    );

    // 创建ID映射
    const formulaMap = {};
    formulas.forEach(f => {
      formulaMap[f.name] = f.formula_id;
    });

    const medicineMap = {};
    medicines.forEach(m => {
      medicineMap[m.name] = m.medicine_id;
    });

    const compositions = [];

    // 四君子汤组成
    if (formulaMap['四君子汤']) {
      if (medicineMap['人参']) {
        compositions.push({
          composition_id: uuidv4(),
          formula_id: formulaMap['四君子汤'],
          medicine_id: medicineMap['人参'],
          dosage: '9g',
          role: '君药',
          processing: null,
          notes: '大补元气，健脾养胃',
          created_at: new Date()
        });
      }
      if (medicineMap['白术']) {
        compositions.push({
          composition_id: uuidv4(),
          formula_id: formulaMap['四君子汤'],
          medicine_id: medicineMap['白术'],
          dosage: '9g',
          role: '臣药',
          processing: null,
          notes: '健脾燥湿，加强益气助运之力',
          created_at: new Date()
        });
      }
      if (medicineMap['茯苓']) {
        compositions.push({
          composition_id: uuidv4(),
          formula_id: formulaMap['四君子汤'],
          medicine_id: medicineMap['茯苓'],
          dosage: '9g',
          role: '佐药',
          processing: null,
          notes: '健脾渗湿',
          created_at: new Date()
        });
      }
      if (medicineMap['甘草']) {
        compositions.push({
          composition_id: uuidv4(),
          formula_id: formulaMap['四君子汤'],
          medicine_id: medicineMap['甘草'],
          dosage: '6g',
          role: '使药',
          processing: '炙',
          notes: '益气和中，调和诸药',
          created_at: new Date()
        });
      }
    }

    // 四物汤组成
    if (formulaMap['四物汤']) {
      if (medicineMap['当归']) {
        compositions.push({
          composition_id: uuidv4(),
          formula_id: formulaMap['四物汤'],
          medicine_id: medicineMap['当归'],
          dosage: '12g',
          role: '君药',
          processing: null,
          notes: '补血活血',
          created_at: new Date()
        });
      }
      if (medicineMap['熟地黄']) {
        compositions.push({
          composition_id: uuidv4(),
          formula_id: formulaMap['四物汤'],
          medicine_id: medicineMap['熟地黄'],
          dosage: '12g',
          role: '君药',
          processing: null,
          notes: '滋阴补血',
          created_at: new Date()
        });
      }
      // 注：川芎和芍药可能不在基础药材列表中，如果有的话可以添加
    }

    // 六味地黄丸组成
    if (formulaMap['六味地黄丸']) {
      if (medicineMap['熟地黄']) {
        compositions.push({
          composition_id: uuidv4(),
          formula_id: formulaMap['六味地黄丸'],
          medicine_id: medicineMap['熟地黄'],
          dosage: '24g',
          role: '君药',
          processing: null,
          notes: '滋阴补肾，填精益髓',
          created_at: new Date()
        });
      }
      if (medicineMap['山药']) {
        compositions.push({
          composition_id: uuidv4(),
          formula_id: formulaMap['六味地黄丸'],
          medicine_id: medicineMap['山药'],
          dosage: '12g',
          role: '臣药',
          processing: null,
          notes: '补脾益肾',
          created_at: new Date()
        });
      }
      // 注：山茱萸、茯苓、泽泻、丹皮可以继续添加
      if (medicineMap['茯苓']) {
        compositions.push({
          composition_id: uuidv4(),
          formula_id: formulaMap['六味地黄丸'],
          medicine_id: medicineMap['茯苓'],
          dosage: '9g',
          role: '佐药',
          processing: null,
          notes: '健脾渗湿',
          created_at: new Date()
        });
      }
    }

    // 插入组成数据
    if (compositions.length > 0) {
      await queryInterface.bulkInsert('formula_composition', compositions);
      console.log(`Successfully inserted ${compositions.length} formula composition records`);
    } else {
      console.log('No compositions to insert - please check if formulas and medicines exist in database');
    }
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('formula_composition', null, {});
  }
};
