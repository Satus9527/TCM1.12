// 从JSON数据集导入数据到数据库
const { Medicine, Formula, FormulaComposition, sequelize } = require('./src/models');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// 拼音映射表（简化版，只包含主要药材）
const pinyinMap = {
  '人参': 'renshen', '黄芪': 'huangqi', '白术': 'baizhu', '甘草': 'gancao',
  '山药': 'shanyao', '大枣': 'dazao', '炙甘草': 'zhigancao', '当归': 'danggui',
  '熟地黄': 'shudihuang', '白芍': 'baishao', '阿胶': 'ejiao', '麦冬': 'maidong',
  '黄连': 'huanglian', '黄芩': 'huangqin', '金银花': 'jinyinhua', '连翘': 'lianqiao',
  '生地黄': 'shengdihuang', '赤芍': 'chishao', '牡丹皮': 'mudanpi', '柴胡': 'chaihu',
  '薄荷': 'bohe', '牛蒡子': 'niubangzi', '蝉蜕': 'chantui', '桑叶': 'sangye',
  '菊花': 'juhua', '蔓荆子': 'manjingzi', '升麻': 'shengma', '葛根': 'gegen',
  '桂枝': 'guizhi', '麻黄': 'mahuang', '防风': 'fangfeng', '荆芥': 'jingjie',
  '淡豆豉': 'dandouchi', '大黄': 'dahuang', '芒硝': 'mangxiao', '厚朴': 'houpu',
  '枳壳': 'zhike', '枳实': 'zhishi', '陈皮': 'chenpi', '木香': 'muxiang',
  '茯苓': 'fuling', '泽泻': 'zexie', '车前子': 'cheqianzi', '猪苓': 'zhuling',
  '附子': 'fuzi', '干姜': 'ganjiang', '肉桂': 'rougui', '吴茱萸': 'wuzhuyu',
  '半夏': 'banxia', '天南星': 'tiannanxing', '白附子': 'baifuzi', '白芥子': 'baijiezi',
  '桔梗': 'jiegeng', '前胡': 'qianhu', '川贝母': 'chuanbeimu', '浙贝母': 'zhebeimu',
  '杏仁': 'xingren', '苏子': 'suzi', '百部': 'baibu', '紫菀': 'ziwan',
  '五味子': 'wuweizi', '乌梅': 'wumei', '诃子': 'hezi', '山茱萸': 'shanzhuyu',
  '莪术': 'ezhu', '三棱': 'sanleng', '桃仁': 'taoren', '红花': 'honghua',
  '川芎': 'chuanxiong', '延胡索': 'yanhusuo', '丹参': 'danshen', '益母草': 'yimucao'
};

function toPinyin(name) {
  if (!name) return '';
  return pinyinMap[name] || '';
}

async function main() {
  try {
    console.log('正在连接数据库...');
    await sequelize.authenticate();
    console.log('✅ 数据库连接成功\n');

    // 读取JSON文件
    console.log('正在读取数据文件...');
    const herbs = JSON.parse(fs.readFileSync(path.join(__dirname, 'herbs.json'), 'utf8'));
    console.log(`✅ 读取药材数据: ${herbs.length} 条`);
    
    const formulas = JSON.parse(fs.readFileSync(path.join(__dirname, '药方数据集.json'), 'utf8'));
    console.log(`✅ 读取方剂数据: ${formulas.length} 条\n`);

    // 开始事务
    const transaction = await sequelize.transaction();

    try {
      // 1. 导入药材
      console.log('开始导入药材数据...');
      let medicineMap = {}; // 用于药材名称到ID的映射
      
      for (const herb of herbs) {
        const pinyin = toPinyin(herb.name);
        const flavorStr = Array.isArray(herb.flavor) ? herb.flavor.join('、') : herb.flavor || '';
        const meridianStr = Array.isArray(herb.meridian) ? herb.meridian.join('、') : herb.meridian || '';
        const contraindicationsStr = Array.isArray(herb.contraindications) 
          ? herb.contraindications.join('；') 
          : herb.contraindications || '';
        
        const [medicine, created] = await Medicine.findOrCreate({
          where: { name: herb.name },
          defaults: {
            name: herb.name,
            pinyin: pinyin,
            category: herb.category || '',
            nature: herb.property || '',
            flavor: flavorStr,
            meridian: meridianStr,
            efficacy: herb.efficacy || '',
            indications: '',
            usage_dosage: herb.usage_notes || `${herb.dosage?.[0] || ''}-${herb.dosage?.[1] || ''}g`,
            contraindications: contraindicationsStr,
            description: ''
          },
          transaction
        });
        
        medicineMap[herb.name] = medicine.medicine_id;
        
        if (created) {
          console.log(`  创建药材: ${herb.name}`);
        } else {
          console.log(`  药材已存在: ${herb.name}`);
        }
      }
      console.log(`✅ 药材导入完成，共${Object.keys(medicineMap).length}条\n`);

      // 2. 导入方剂
      console.log('开始导入方剂数据...');
      let formulaCompositions = [];
      
      for (const formula of formulas) {
        const pinyin = toPinyin(formula.方名);
        const compositionNames = formula.组成.map(item => item.药材).join('、');
        
        const [dbFormula, created] = await Formula.findOrCreate({
          where: { name: formula.方名 },
          defaults: {
            name: formula.方名,
            pinyin: pinyin,
            category: '',
            source: formula.出处 || '',
            composition_summary: compositionNames,
            efficacy: formula.功效 || '',
            indications: formula.主治 || '',
            usage_dosage: '水煎服',
            contraindications: '',
            clinical_applications: formula.现代应用 || '',
            modifications: '',
            description: formula.配伍特点 || ''
          },
          transaction
        });

        if (created) {
          console.log(`  创建方剂: ${formula.方名}`);
        } else {
          console.log(`  方剂已存在: ${formula.方名}`);
        }

        // 3. 导入方剂组成
        if (formula.组成 && Array.isArray(formula.组成)) {
          for (const component of formula.组成) {
            const medicineId = medicineMap[component.药材];
            if (medicineId) {
              formulaCompositions.push({
                formula_id: dbFormula.formula_id,
                medicine_id: medicineId,
                dosage: component.剂量 || '',
                role: component.角色 || '',
                notes: component.功效 || '',
                created_at: new Date(),
                updated_at: new Date()
              });
            } else {
              console.log(`  ⚠️ 方剂${formula.方名}包含未知药材: ${component.药材}`);
            }
          }
        }
      }
      console.log(`✅ 方剂导入完成，共${formulas.length}条`);

      // 批量插入方剂组成
      if (formulaCompositions.length > 0) {
        console.log(`\n正在导入方剂组成数据... (${formulaCompositions.length}条)`);
        // 分批插入以避免数据过多
        const batchSize = 100;
        for (let i = 0; i < formulaCompositions.length; i += batchSize) {
          const batch = formulaCompositions.slice(i, i + batchSize);
          await FormulaComposition.bulkCreate(batch, {
            transaction,
            ignoreDuplicates: true
          });
          console.log(`  已插入 ${Math.min(i + batchSize, formulaCompositions.length)} / ${formulaCompositions.length}`);
        }
        console.log(`✅ 方剂组成导入完成\n`);
      }

      // 提交事务
      await transaction.commit();
      console.log('✅ 所有数据导入成功！');

      // 统计信息
      const totalMedicines = await Medicine.count();
      const totalFormulas = await Formula.count();
      const totalCompositions = await FormulaComposition.count();
      
      console.log('\n数据库统计:');
      console.log(`  药材: ${totalMedicines} 条`);
      console.log(`  方剂: ${totalFormulas} 条`);
      console.log(`  方剂组成: ${totalCompositions} 条\n`);

    } catch (error) {
      await transaction.rollback();
      console.error('❌ 导入失败，已回滚:', error.message);
      throw error;
    }

  } catch (error) {
    console.error('❌ 错误:', error);
  } finally {
    await sequelize.close();
    process.exit(0);
  }
}

main();

