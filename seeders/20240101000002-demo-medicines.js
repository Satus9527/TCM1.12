'use strict';

const { v4: uuidv4 } = require('uuid');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const medicines = [
      {
        medicine_id: uuidv4(),
        name: '人参',
        pinyin: 'renshen',
        category: '补虚药',
        nature: '温',
        flavor: '甘、微苦',
        meridian: '脾、肺、心',
        efficacy: '大补元气，复脉固脱，补脾益肺，生津养血，安神益智',
        indications: '体虚欲脱，肢冷脉微，脾虚食少，肺虚喘咳，津伤口渴，内热消渴，气血亏虚，久病虚羸，惊悸失眠，阳痿宫冷',
        usage_dosage: '3-9g',
        contraindications: '实证、热证忌服',
        description: '五加科植物人参的干燥根及根茎',
        image_url: null,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        medicine_id: uuidv4(),
        name: '白术',
        pinyin: 'baizhu',
        category: '补虚药',
        nature: '温',
        flavor: '苦、甘',
        meridian: '脾、胃',
        efficacy: '补气健脾，燥湿利水，止汗，安胎',
        indications: '脾虚食少，腹胀泄泻，痰饮眩悸，水肿，自汗，胎动不安',
        usage_dosage: '6-12g',
        contraindications: '阴虚燥渴，气滞胀闷者忌服',
        description: '菊科植物白术的干燥根茎',
        image_url: null,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        medicine_id: uuidv4(),
        name: '茯苓',
        pinyin: 'fuling',
        category: '利水渗湿药',
        nature: '平',
        flavor: '甘、淡',
        meridian: '心、脾、肾',
        efficacy: '利水渗湿，健脾，宁心',
        indications: '水肿尿少，痰饮眩悸，脾虚食少，便溏泄泻，心神不安，惊悸失眠',
        usage_dosage: '10-15g',
        contraindications: '虚寒精滑或气虚下陷者慎服',
        description: '多孔菌科真菌茯苓的干燥菌核',
        image_url: null,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        medicine_id: uuidv4(),
        name: '甘草',
        pinyin: 'gancao',
        category: '补虚药',
        nature: '平',
        flavor: '甘',
        meridian: '心、肺、脾、胃',
        efficacy: '补脾益气，清热解毒，祛痰止咳，缓急止痛，调和诸药',
        indications: '脾胃虚弱，倦怠乏力，心悸气短，咳嗽痰多，脘腹、四肢挛急疼痛，痈肿疮毒，缓解药物毒性、烈性',
        usage_dosage: '3-9g',
        contraindications: '不宜与京大戟、芫花、甘遂同用',
        description: '豆科植物甘草的干燥根及根茎',
        image_url: null,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        medicine_id: uuidv4(),
        name: '黄芪',
        pinyin: 'huangqi',
        category: '补虚药',
        nature: '微温',
        flavor: '甘',
        meridian: '肺、脾',
        efficacy: '补气升阳，固表止汗，利水消肿，生津养血，行滞通痹，托毒排脓，敛疮生肌',
        indications: '气虚乏力，食少便溏，中气下陷，久泻脱肛，便血崩漏，表虚自汗，气虚水肿，内热消渴，血虚萎黄，半身不遂，痹痛麻木，痈疽难溃，久溃不敛',
        usage_dosage: '9-30g',
        contraindications: '表实邪盛，气滞湿阻，食积停滞，痈疽初起或溃后热毒尚盛等实证，以及阴虚阳亢者，均须禁服',
        description: '豆科植物蒙古黄芪或膜荚黄芪的干燥根',
        image_url: null,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        medicine_id: uuidv4(),
        name: '当归',
        pinyin: 'danggui',
        category: '补虚药',
        nature: '温',
        flavor: '甘、辛',
        meridian: '肝、心、脾',
        efficacy: '补血活血，调经止痛，润肠通便',
        indications: '血虚萎黄，眩晕心悸，月经不调，经闭痛经，虚寒腹痛，风湿痹痛，跌打损伤，痈疽疮疡，肠燥便秘',
        usage_dosage: '6-12g',
        contraindications: '湿阻中满及大便溏泄者慎服',
        description: '伞形科植物当归的干燥根',
        image_url: null,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        medicine_id: uuidv4(),
        name: '川芎',
        pinyin: 'chuanxiong',
        category: '活血化瘀药',
        nature: '温',
        flavor: '辛',
        meridian: '肝、胆、心包',
        efficacy: '活血行气，祛风止痛',
        indications: '月经不调，经闭痛经，产后瘀滞腹痛，胸胁刺痛，跌打肿痛，头痛，风湿痹痛',
        usage_dosage: '3-10g',
        contraindications: '阴虚火旺，上盛下虚及气弱者慎服',
        description: '伞形科植物川芎的干燥根茎',
        image_url: null,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        medicine_id: uuidv4(),
        name: '白芍',
        pinyin: 'baishao',
        category: '补虚药',
        nature: '微寒',
        flavor: '苦、酸',
        meridian: '肝、脾',
        efficacy: '养血调经，敛阴止汗，柔肝止痛，平抑肝阳',
        indications: '血虚萎黄，月经不调，自汗，盗汗，胁痛，腹痛，四肢挛痛，头痛眩晕',
        usage_dosage: '6-15g',
        contraindications: '虚寒腹痛泄泻者慎服',
        description: '毛茛科植物芍药的干燥根',
        image_url: null,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        medicine_id: uuidv4(),
        name: '熟地黄',
        pinyin: 'shudihuang',
        category: '补虚药',
        nature: '微温',
        flavor: '甘',
        meridian: '肝、肾',
        efficacy: '补血滋阴，益精填髓',
        indications: '血虚萎黄，眩晕心悸，月经不调，崩漏，肝肾阴虚，潮热盗汗，遗精，消渴，腰膝酸软，耳鸣耳聋，头目昏花，须发早白',
        usage_dosage: '9-15g',
        contraindications: '脾胃虚弱，气滞痰多，腹满便溏者忌服',
        description: '玄参科植物地黄的根茎经加工炮制而成',
        image_url: null,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        medicine_id: uuidv4(),
        name: '桂枝',
        pinyin: 'guizhi',
        category: '解表药',
        nature: '温',
        flavor: '辛、甘',
        meridian: '心、肺、膀胱',
        efficacy: '发汗解肌，温通经脉，助阳化气',
        indications: '风寒感冒，脘腹冷痛，血寒经闭，关节痹痛，痰饮，水肿，心悸，奔豚',
        usage_dosage: '3-10g',
        contraindications: '温热病及阴虚阳盛者忌服',
        description: '樟科植物肉桂的干燥嫩枝',
        image_url: null,
        created_at: new Date(),
        updated_at: new Date()
      }
    ];

    await queryInterface.bulkInsert('medicines', medicines);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('medicines', null, {});
  }
};

