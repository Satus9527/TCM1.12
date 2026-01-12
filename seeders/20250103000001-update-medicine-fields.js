'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 药材新字段数据映射（根据药材名称）
    const medicineFieldUpdates = {
      '人参': {
        english_name: 'Panax ginseng C. A. Mey.',
        toxicity: '无毒',
        modern_research: '增强免疫功能，抗疲劳，改善心脑血管功能，促进造血，抗氧化，抗肿瘤，降血糖，改善记忆和学习能力'
      },
      '白术': {
        english_name: 'Atractylodes macrocephala Koidz.',
        toxicity: '无毒',
        modern_research: '增强免疫功能，调节胃肠运动，抗溃疡，降血糖，利尿，抗炎，抗氧化'
      },
      '茯苓': {
        english_name: 'Poria cocos (Schw.) Wolf',
        toxicity: '无毒',
        modern_research: '利尿，增强免疫功能，抗肿瘤，镇静催眠，抗炎，抗氧化，保肝'
      },
      '甘草': {
        english_name: 'Glycyrrhiza uralensis Fisch.',
        toxicity: '无毒',
        modern_research: '抗炎，抗溃疡，镇咳祛痰，抗病毒，增强免疫功能，抗过敏，保肝，抗肿瘤'
      },
      '黄芪': {
        english_name: 'Astragalus membranaceus (Fisch.) Bge.',
        toxicity: '无毒',
        modern_research: '增强免疫力，保护心脑血管，抗衰老，抗肿瘤，降血糖，降血压，抗病毒，抗炎'
      },
      '当归': {
        english_name: 'Angelica sinensis (Oliv.) Diels',
        toxicity: '无毒',
        modern_research: '促进造血，调节子宫功能，抗炎镇痛，抗血小板聚集，降血脂，抗氧化，抗肿瘤'
      },
      '川芎': {
        english_name: 'Ligusticum chuanxiong Hort.',
        toxicity: '无毒',
        modern_research: '抗血小板聚集，扩张血管，改善微循环，抗炎镇痛，抗氧化，抗肿瘤，保护心脑血管'
      },
      '白芍': {
        english_name: 'Paeonia lactiflora Pall.',
        toxicity: '无毒',
        modern_research: '解痉，镇痛，抗炎，抗血小板聚集，保肝，抗氧化，抗肿瘤，调节免疫'
      },
      '熟地黄': {
        english_name: 'Rehmannia glutinosa Libosch. (prepared)',
        toxicity: '无毒',
        modern_research: '促进造血，增强免疫功能，降血糖，抗衰老，抗氧化，抗炎，保护肾脏'
      },
      '桂枝': {
        english_name: 'Cinnamomum cassia Presl',
        toxicity: '无毒',
        modern_research: '扩张血管，促进血液循环，抗炎，抗菌，抗病毒，抗血小板聚集，降血糖，抗氧化'
      },
      '麻黄': {
        english_name: 'Ephedra sinica Stapf',
        toxicity: '有毒',
        modern_research: '扩张支气管，抗炎，抗过敏，兴奋中枢神经，升高血压，发汗，利尿'
      },
      '杏仁': {
        english_name: 'Prunus armeniaca L.',
        toxicity: '小毒',
        modern_research: '镇咳平喘，润肠通便，抗炎，抗氧化，抗肿瘤，降血糖，降血脂'
      },
      '麦冬': {
        english_name: 'Ophiopogon japonicus (L.f) Ker-Gawl.',
        toxicity: '无毒',
        modern_research: '降血糖，抗心肌缺血，增强免疫功能，抗炎，抗氧化，抗肿瘤，改善心功能'
      },
      '五味子': {
        english_name: 'Schisandra chinensis (Turcz.) Baill.',
        toxicity: '无毒',
        modern_research: '保护肝脏，抗氧化，抗疲劳，增强免疫功能，抗炎，抗肿瘤，改善学习记忆'
      },
      '山药': {
        english_name: 'Dioscorea opposita Thunb.',
        toxicity: '无毒',
        modern_research: '降血糖，增强免疫功能，抗氧化，抗肿瘤，保护胃黏膜，调节肠道菌群'
      },
      '大枣': {
        english_name: 'Ziziphus jujuba Mill.',
        toxicity: '无毒',
        modern_research: '增强免疫力，保护肝脏，抗氧化，抗肿瘤，降血压，改善睡眠，补血'
      },
      '炙甘草': {
        english_name: 'Glycyrrhiza uralensis Fisch. (prepared)',
        toxicity: '无毒',
        modern_research: '增强免疫功能，抗心律失常，抗炎，抗溃疡，镇咳祛痰，调和药性'
      },
      '生地黄': {
        english_name: 'Rehmannia glutinosa Libosch.',
        toxicity: '无毒',
        modern_research: '降血糖，抗炎，抗氧化，保肝，保护心脑血管，抗肿瘤，增强免疫功能'
      },
      '黄连': {
        english_name: 'Coptis chinensis Franch.',
        toxicity: '无毒',
        modern_research: '抗菌消炎，降血糖，抗心律失常，抗炎，抗氧化，抗肿瘤，保护胃肠道'
      },
      '黄芩': {
        english_name: 'Scutellaria baicalensis Georgi',
        toxicity: '无毒',
        modern_research: '抗菌，抗炎，降血压，抗病毒，抗氧化，抗肿瘤，保护肝脏，抗过敏'
      },
      '金银花': {
        english_name: 'Lonicera japonica Thunb.',
        toxicity: '无毒',
        modern_research: '抗菌，抗病毒，抗炎，抗氧化，降血脂，保肝，增强免疫功能'
      },
      '连翘': {
        english_name: 'Forsythia suspensa (Thunb.) Vahl',
        toxicity: '无毒',
        modern_research: '抗菌，抗病毒，抗炎，抗氧化，保肝，降血压，增强免疫功能'
      },
      '桔梗': {
        english_name: 'Platycodon grandiflorus (Jacq.) A. DC.',
        toxicity: '无毒',
        modern_research: '祛痰，镇咳，抗炎，抗氧化，降血糖，抗肿瘤，增强免疫功能'
      },
      '薄荷': {
        english_name: 'Mentha haplocalyx Briq.',
        toxicity: '无毒',
        modern_research: '抗菌，抗病毒，抗炎，镇痛，促进消化，止痒，局部麻醉'
      },
      '柴胡': {
        english_name: 'Bupleurum chinense DC.',
        toxicity: '无毒',
        modern_research: '抗炎，保肝，抗病毒，抗肿瘤，调节免疫，抗抑郁，改善胃肠道功能'
      },
      '生姜': {
        english_name: 'Zingiber officinale Roscoe',
        toxicity: '无毒',
        modern_research: '促进消化，抗炎，抗菌，抗病毒，抗氧化，止呕，温中散寒'
      },
      '牡丹皮': {
        english_name: 'Paeonia suffruticosa Andr.',
        toxicity: '无毒',
        modern_research: '抗炎，抗菌，抗血小板聚集，降血压，抗肿瘤，抗氧化，保护心脑血管'
      },
      '泽泻': {
        english_name: 'Alisma orientale (Sam.) Juzep.',
        toxicity: '无毒',
        modern_research: '利尿，降血脂，降血糖，抗炎，抗氧化，保肝，抗肿瘤'
      },
      '山茱萸': {
        english_name: 'Cornus officinalis Sieb. et Zucc.',
        toxicity: '无毒',
        modern_research: '降血糖，抗炎，抗氧化，抗肿瘤，保护心脑血管，增强免疫功能，保肝'
      },
      '荆芥穗': {
        english_name: 'Schizonepeta tenuifolia Briq.',
        toxicity: '无毒',
        modern_research: '抗菌，抗病毒，抗炎，解热，镇痛，抗过敏，止血'
      },
      '淡豆豉': {
        english_name: 'Glycine max (L.) Merr. (fermented)',
        toxicity: '无毒',
        modern_research: '调节肠道菌群，降血脂，抗氧化，抗炎，改善消化功能'
      },
      '牛蒡子': {
        english_name: 'Arctium lappa L.',
        toxicity: '无毒',
        modern_research: '抗菌，抗病毒，抗炎，降血糖，降血脂，抗氧化，抗肿瘤'
      },
      '竹叶': {
        english_name: 'Phyllostachys nigra (Lodd.) Munro var. henonis (Bean) Stapf ex Rendle',
        toxicity: '无毒',
        modern_research: '清热，利尿，抗氧化，抗炎，抗菌，降血糖'
      },
      '枳壳': {
        english_name: 'Citrus aurantium L.',
        toxicity: '无毒',
        modern_research: '调节胃肠运动，利胆，抗炎，抗氧化，降血压，抗血小板聚集'
      }
    };

    // 批量更新药材字段
    for (const [name, fields] of Object.entries(medicineFieldUpdates)) {
      await queryInterface.sequelize.query(
        `UPDATE medicines 
         SET english_name = :english_name, 
             toxicity = :toxicity, 
             modern_research = :modern_research,
             updated_at = NOW()
         WHERE name = :name`,
        {
          replacements: { name, ...fields },
          type: Sequelize.QueryTypes.UPDATE
        }
      );
    }

    console.log(`✅ 已更新 ${Object.keys(medicineFieldUpdates).length} 种药材的新字段数据`);
  },

  down: async (queryInterface, Sequelize) => {
    // 回滚：清空新字段数据
    await queryInterface.sequelize.query(
      `UPDATE medicines 
       SET english_name = NULL, 
           toxicity = NULL, 
           modern_research = NULL,
           updated_at = NOW()`
    );

    console.log('✅ 已清空药材新字段数据');
  }
};
