'use strict';

// 导入所需模块
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// 导入数据库模型
const db = require('./src/models');

// 数据文件路径
const dataFiles = {
  herbEfficacies: path.join(__dirname, '中药的功效和性味.json'),
  formulas: path.join(__dirname, '药方数据集.json'),
  herbInteractions: path.join(__dirname, '18反19畏.json'),
  fourProperties: path.join(__dirname, '四相.json')
};

// 导入中药数据到medicines表
async function importMedicines() {
  console.log('开始导入中药数据...');
  
  try {
    // 读取数据文件
    const data = fs.readFileSync(dataFiles.herbEfficacies, 'utf8');
    const medicinesData = JSON.parse(data);
    
    // 遍历并导入每个中药
    for (const item of medicinesData) {
      // 解析输出内容
      const output = item.output;
      const lines = output.split('\n').filter(line => line.trim() !== '');
      
      // 提取基本信息
      let name = null;
      let natureFlavor = null;
      let meridian = null;
      let efficacy = null;
      
      // 确保有足够的行数
      if (lines.length >= 3) {
        // 提取药材名
        const nameMatch = lines[0].match(/^(.+)：/);
        name = nameMatch ? nameMatch[1].trim() : null;
        
        // 提取性味
        const natureFlavorMatch = lines[0].match(/：(.+)。$/);
        natureFlavor = natureFlavorMatch ? natureFlavorMatch[1].trim() : null;
        
        // 提取归经
        const meridianMatch = lines[1].match(/归(.+)经。$/);
        meridian = meridianMatch ? meridianMatch[1].trim() : null;
        
        // 提取功效
        const efficacyMatch = lines[2].match(/功效：(.+)。$/);
        efficacy = efficacyMatch ? efficacyMatch[1].trim() : null;
      }
      
      // 解析性味
      let nature = null;
      let flavor = null;
      if (natureFlavor) {
        const natureMatch = natureFlavor.match(/性([\u4e00-\u9fa5]+)，味([\u4e00-\u9fa5、]+)/);
        nature = natureMatch ? natureMatch[1] : null;
        flavor = natureMatch ? natureMatch[2] : null;
      }
      
      // 提取用法用量和禁忌
      let usageDosage = null;
      let contraindications = null;
      let indications = null;
      
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (line.startsWith('用法用量：')) {
          const match = line.match(/用法用量：(.+)。$/);
          usageDosage = match ? match[1].trim() : null;
        } else if (line.startsWith('禁忌：')) {
          const match = line.match(/禁忌：(.+)。$/);
          contraindications = match ? match[1].trim() : null;
        } else if (line.startsWith('主治：')) {
          const match = line.match(/主治：(.+)。$/);
          indications = match ? match[1].trim() : null;
        }
      }
      
      // 检查名称是否有效
      if (!name) {
        console.log('跳过无效中药条目');
        continue;
      }
      
      // 检查是否已存在
      const existing = await db.Medicine.findOne({
        where: { name }
      });
      
      if (!existing) {
        // 创建新药材
        await db.Medicine.create({
          medicine_id: uuidv4(),
          name,
          nature,
          flavor,
          meridian,
          efficacy,
          indications,
          usage_dosage: usageDosage,
          contraindications
        });
        console.log(`导入中药: ${name}`);
      } else {
        console.log(`中药已存在: ${name}`);
      }
    }
    
    console.log('中药数据导入完成！');
  } catch (error) {
    console.error('导入中药数据失败:', error);
    throw error;
  }
}

// 导入方剂数据到formulas表和formula_compositions表
async function importFormulas() {
  console.log('开始导入方剂数据...');
  
  try {
    // 读取数据文件
    const data = fs.readFileSync(dataFiles.formulas, 'utf8');
    const formulasData = JSON.parse(data);
    
    // 遍历并导入每个方剂
    for (const item of formulasData) {
      // 检查是否已存在
      const existing = await db.Formula.findOne({
        where: { name: item.方名 }
      });
      
      let formula;
      if (!existing) {
        // 创建新方剂
        formula = await db.Formula.create({
          formula_id: uuidv4(),
          name: item.方名,
          source: item.出处,
          efficacy: item.功效,
          indications: item.主治,
          usage_dosage: item.用法用量 || '',
          contraindications: item.禁忌 || '',
          clinical_applications: item.现代应用 || '',
          modifications: item.配伍特点 || ''
        });
        console.log(`导入方剂: ${item.方名}`);
      } else {
        formula = existing;
        console.log(`方剂已存在: ${item.方名}`);
      }
      
      // 导入方剂组成
      if (item.组成 && Array.isArray(item.组成)) {
        for (const comp of item.组成) {
          // 查找对应的药材
          const medicine = await db.Medicine.findOne({
            where: { name: comp.药材 }
          });
          
          if (medicine) {
            // 检查是否已存在
            const existingComp = await db.FormulaComposition.findOne({
              where: {
                formula_id: formula.formula_id,
                medicine_id: medicine.medicine_id
              }
            });
            
            if (!existingComp) {
              await db.FormulaComposition.create({
                composition_id: uuidv4(),
                formula_id: formula.formula_id,
                medicine_id: medicine.medicine_id,
                dosage: comp.剂量,
                role: comp.角色
              });
              console.log(`  - 导入组成: ${comp.药材} ${comp.剂量}`);
            }
          } else {
            console.log(`  - 警告: 未找到药材 ${comp.药材}`);
          }
        }
      }
    }
    
    console.log('方剂数据导入完成！');
  } catch (error) {
    console.error('导入方剂数据失败:', error);
    throw error;
  }
}

// 导入配伍禁忌数据到herb_interactions表
async function importHerbInteractions() {
  console.log('开始导入配伍禁忌数据...');
  
  try {
    // 读取数据文件
    const data = fs.readFileSync(dataFiles.herbInteractions, 'utf8');
    const interactionsData = JSON.parse(data);
    
    // 遍历并导入每个配伍禁忌
    for (const item of interactionsData.data) {
      // 检查是否已存在
      const existing = await db.HerbInteraction.findOne({
        where: {
          type: item.type,
          herb_a: item.herb_a,
          herb_b: item.herb_b
        }
      });
      
      if (!existing) {
        // 创建新的配伍禁忌
        await db.HerbInteraction.create({
          interaction_id: uuidv4(),
          type: item.type,
          group: item.group || null,
          herb_a: item.herb_a,
          herb_b: item.herb_b,
          description: item.description,
          severity: item.type === '十八反' ? 'high' : 'medium'
        });
        console.log(`导入配伍禁忌: ${item.type} - ${item.herb_a} 与 ${item.herb_b}`);
      } else {
        console.log(`配伍禁忌已存在: ${item.type} - ${item.herb_a} 与 ${item.herb_b}`);
      }
    }
    
    console.log('配伍禁忌数据导入完成！');
  } catch (error) {
    console.error('导入配伍禁忌数据失败:', error);
    throw error;
  }
}

// 导入四相关系数据到four_properties_relationships表
async function importFourProperties() {
  console.log('开始导入四相关系数据...');
  
  try {
    // 读取数据文件
    const data = fs.readFileSync(dataFiles.fourProperties, 'utf8');
    const fourPropsData = JSON.parse(data);
    
    // 遍历并导入每个四相关系
    for (const item of fourPropsData.relationships) {
      // 检查是否已存在
      const existing = await db.FourPropertiesRelationship.findOne({
        where: {
          type: item.type,
          herb_a: item.herb_a,
          herb_b: item.herb_b
        }
      });
      
      if (!existing) {
        // 创建新的四相关系
        await db.FourPropertiesRelationship.create({
          relationship_id: uuidv4(),
          type: item.type,
          herb_a: item.herb_a,
          herb_b: item.herb_b,
          description: item.description,
          effect: item.effect,
          example_prescription: item.example_prescription,
          mechanism: item.mechanism,
          usage: item.usage || null
        });
        console.log(`导入四相关系: ${item.type} - ${item.herb_a} 与 ${item.herb_b}`);
      } else {
        console.log(`四相关系已存在: ${item.type} - ${item.herb_a} 与 ${item.herb_b}`);
      }
    }
    
    console.log('四相关系数据导入完成！');
  } catch (error) {
    console.error('导入四相关系数据失败:', error);
    throw error;
  }
}

// 导入药材分类数据
async function importMedicineCategories() {
  console.log('开始导入药材分类数据...');
  
  try {
    // 定义基本药材分类
    const categories = [
      { name: '解表药', description: '发散表邪，解除表证', icon: 'el-icon-sunrise' },
      { name: '清热药', description: '清除热邪，治疗热证', icon: 'el-icon-fire' },
      { name: '泻下药', description: '通利大便，排除积滞', icon: 'el-icon-snowflake' },
      { name: '祛风湿药', description: '祛风除湿，治疗痹证', icon: 'el-icon-wind' },
      { name: '化湿药', description: '化湿醒脾，治疗湿阻中焦', icon: 'el-icon-water' },
      { name: '利水渗湿药', description: '通利水道，渗泄水湿', icon: 'el-icon-taxi' },
      { name: '温里药', description: '温散里寒，治疗里寒证', icon: 'el-icon-heatmap' },
      { name: '理气药', description: '调理气机，治疗气滞证', icon: 'el-icon-refresh' },
      { name: '消食药', description: '消化食积，治疗食积证', icon: 'el-icon-food' },
      { name: '驱虫药', description: '驱虫消积，治疗虫积证', icon: 'el-icon-s-bbs' },
      { name: '止血药', description: '制止出血，治疗出血证', icon: 'el-icon-microphone' },
      { name: '活血化瘀药', description: '活血化瘀，治疗瘀血证', icon: 'el-icon-money' },
      { name: '化痰止咳平喘药', description: '化痰止咳，平喘', icon: 'el-icon-headset' },
      { name: '安神药', description: '安定神志，治疗神志不安', icon: 'el-icon-star-on' },
      { name: '平肝息风药', description: '平肝潜阳，息风止痉', icon: 'el-icon-aim' },
      { name: '开窍药', description: '开窍醒神，治疗窍闭神昏', icon: 'el-icon-key' },
      { name: '补益药', description: '补益正气，治疗虚证', icon: 'el-icon-medal' },
      { name: '收涩药', description: '收敛固涩，治疗滑脱证', icon: 'el-icon-lock' },
      { name: '涌吐药', description: '涌吐毒物，治疗毒物停聚', icon: 'el-icon-back' },
      { name: '解毒杀虫燥湿止痒药', description: '解毒杀虫，燥湿止痒', icon: 'el-icon-close' },
      { name: '拔毒化腐生肌药', description: '拔毒化腐，生肌敛疮', icon: 'el-icon-s-tools' }
    ];
    
    // 导入每个分类
    for (const category of categories) {
      // 检查是否已存在
      const existing = await db.MedicineCategory.findOne({
        where: { name: category.name }
      });
      
      if (!existing) {
        await db.MedicineCategory.create({
          category_id: uuidv4(),
          name: category.name,
          description: category.description,
          icon: category.icon,
          order: categories.indexOf(category)
        });
        console.log(`导入药材分类: ${category.name}`);
      } else {
        console.log(`药材分类已存在: ${category.name}`);
      }
    }
    
    console.log('药材分类数据导入完成！');
  } catch (error) {
    console.error('导入药材分类数据失败:', error);
    throw error;
  }
}

// 主函数
async function main() {
  console.log('开始导入所有数据...');
  
  try {
    // 连接数据库
    await db.sequelize.authenticate();
    console.log('数据库连接成功！');
    
    // 导入数据
    await importMedicines();
    await importFormulas();
    await importHerbInteractions();
    await importFourProperties();
    await importMedicineCategories();
    
    console.log('所有数据导入完成！');
    process.exit(0);
  } catch (error) {
    console.error('数据导入失败:', error);
    process.exit(1);
  } finally {
    // 关闭数据库连接
    await db.sequelize.close();
  }
}

// 运行主函数
main();
