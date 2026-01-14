const { sequelize, Medicine } = require('./src/models');
const fs = require('fs');
const path = require('path');

// 读取中药数据集
const medicineDataPath = path.join(__dirname, '中药的功效和性味.json');
const medicineData = JSON.parse(fs.readFileSync(medicineDataPath, 'utf8'));

// 解析药材信息的函数
const parseMedicineInfo = (input, output) => {
  // 提取药材名称
  const nameMatch = input.match(/药材：(.+)/);
  if (!nameMatch) return null;
  const name = nameMatch[1].trim();
  
  // 提取性味
  const natureFlavorMatch = output.match(/(.+)：(.+)/);
  if (!natureFlavorMatch) return null;
  
  const natureFlavor = natureFlavorMatch[2].trim();
  
  // 提取归经
  const meridianMatch = output.match(/归(.+?)经/);
  const meridian = meridianMatch ? meridianMatch[1].trim() + '经' : '';
  
  // 提取功效
  const efficacyMatch = output.match(/功效：(.+?)\n/);
  const efficacy = efficacyMatch ? efficacyMatch[1].trim() : '';
  
  // 提取用法用量
  const usageMatch = output.match(/用法用量：(.+?)\n/);
  const usageDosage = usageMatch ? usageMatch[1].trim() : '';
  
  // 提取禁忌
  const tabooMatch = output.match(/禁忌：(.+)/);
  const taboo = tabooMatch ? tabooMatch[1].trim() : '';
  
  // 解析性味
  let nature = '';
  let flavor = '';
  
  if (natureFlavor.includes('性')) {
    const naturePart = natureFlavor.split('性')[1].split('，')[0].trim();
    nature = naturePart;
  }
  
  if (natureFlavor.includes('味')) {
    const flavorPart = natureFlavor.split('味')[1].split('。')[0].trim();
    flavor = flavorPart;
  }
  
  return {
    name,
    nature,
    flavor,
    meridian,
    efficacy,
    usage_dosage: usageDosage,
    taboo,
    category: '常用中药', // 默认分类
    pinyin: name, // 简单处理，实际应该使用拼音转换库
    image_url: '', // 暂时为空
    created_at: new Date(),
    updated_at: new Date()
  };
};

// 导入数据到数据库
const importMedicines = async () => {
  try {
    console.log('正在连接数据库...');
    await sequelize.authenticate();
    console.log('数据库连接成功！');
    
    console.log('开始导入药材数据...');
    
    const successCount = 0;
    const failCount = 0;
    
    for (const item of medicineData) {
      const medicineInfo = parseMedicineInfo(item.input, item.output);
      
      if (medicineInfo) {
        try {
          await Medicine.create(medicineInfo);
          console.log(`成功导入：${medicineInfo.name}`);
        } catch (error) {
          console.error(`导入失败：${medicineInfo.name} - ${error.message}`);
        }
      } else {
        console.error(`解析失败：${item.input}`);
      }
    }
    
    console.log('\n药材数据导入完成！');
    
  } catch (error) {
    console.error('导入过程中发生错误：', error);
  } finally {
    await sequelize.close();
  }
};

// 执行导入
importMedicines();