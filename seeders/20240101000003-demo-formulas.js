'use strict';

const { v4: uuidv4 } = require('uuid');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const formulas = [
      {
        formula_id: uuidv4(),
        name: '四君子汤',
        pinyin: 'sijunzitang',
        category: '补益剂',
        source: '《太平惠民和剂局方》',
        composition_summary: '人参、白术、茯苓、甘草',
        efficacy: '益气健脾',
        indications: '脾胃气虚证。面色萎白，语声低微，气短乏力，食少便溏，舌淡苔白，脉虚弱',
        usage_dosage: '水煎服',
        contraindications: '阴虚火旺或实热证者不宜使用',
        clinical_applications: '慢性胃炎、胃及十二指肠溃疡等属脾胃气虚者',
        modifications: '若呕吐，加半夏以降逆止呕，名六君子汤；若痰多，加陈皮、半夏以理气化痰，名异功散',
        description: '四君子汤是补气的基础方，功能益气健脾，主治脾胃气虚证',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        formula_id: uuidv4(),
        name: '四物汤',
        pinyin: 'siwutang',
        category: '补益剂',
        source: '《太平惠民和剂局方》',
        composition_summary: '熟地黄、当归、白芍、川芎',
        efficacy: '补血调血',
        indications: '营血虚滞证。心悸失眠，头晕目眩，面色无华，妇人月经不调，量少或经闭，脐腹作痛，舌淡，脉细弦或细涩',
        usage_dosage: '水煎服',
        contraindications: '阴虚发热，血崩气脱者不宜使用',
        clinical_applications: '月经不调、习惯性流产、功能性子宫出血等属营血虚滞者',
        modifications: '若血虚有寒，加肉桂、炮姜；血虚有热，加黄芩、丹皮',
        description: '四物汤是补血的基础方，功能补血调血，主治营血虚滞证',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        formula_id: uuidv4(),
        name: '八珍汤',
        pinyin: 'bazhentang',
        category: '补益剂',
        source: '《太平惠民和剂局方》',
        composition_summary: '人参、白术、茯苓、甘草、熟地黄、当归、白芍、川芎',
        efficacy: '益气补血',
        indications: '气血两虚证。面色苍白或萎黄，头晕目眩，四肢倦怠，气短懒言，心悸怔忡，饮食减少，舌淡苔白，脉细弱或虚大无力',
        usage_dosage: '水煎服',
        contraindications: '外感发热或阴虚火旺者不宜使用',
        clinical_applications: '病后虚弱、各种慢性病、妇女月经不调等属气血两虚者',
        modifications: '若气虚甚，加黄芪；血虚甚，加阿胶',
        description: '八珍汤由四君子汤和四物汤组成，功能益气补血，主治气血两虚证',
        created_at: new Date(),
        updated_at: new Date()
      }
    ];

    // 使用 ignoreDuplicates 选项避免重复插入错误
    await queryInterface.bulkInsert('formulas', formulas, {
      ignoreDuplicates: true
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('formulas', null, {});
  }
};

