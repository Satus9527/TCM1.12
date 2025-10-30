// 知识库服务测试脚本
const knowledgeService = require('./src/services/knowledgeService');

async function runTests() {
  console.log('\n========================================');
  console.log('知识库服务测试');
  console.log('========================================\n');

  try {
    // 测试 1: 加载知识库
    console.log('[测试 1] 加载知识库数据...');
    await knowledgeService.loadAll();
    const stats = await knowledgeService.getStats();
    console.log('✅ 知识库加载成功');
    console.log(`   四相数据: ${stats.sixiang} 条`);
    console.log(`   配伍禁忌: ${stats.contraindications} 条`);
    console.log(`   药材信息: ${stats.herbsInfo} 条`);
    console.log(`   方剂数据: ${stats.formulas} 个`);

    // 测试 2: 查询配伍关系
    console.log('\n[测试 2] 查询配伍关系（麻黄-桂枝）...');
    const compatibility = await knowledgeService.getCompatibility('麻黄', '桂枝');
    if (compatibility.hasRelationship) {
      console.log('✅ 找到配伍关系');
      console.log(`   关系类型: ${compatibility.relationships[0].type}`);
      console.log(`   配伍效果: ${compatibility.relationships[0].effect}`);
      console.log(`   经典方剂: ${compatibility.relationships[0].example_prescription}`);
    } else {
      console.log('⚠️  未找到配伍关系记录');
    }

    // 测试 3: 检查配伍禁忌
    console.log('\n[测试 3] 检查配伍禁忌（甘草-甘遂）...');
    const safetyCheck = await knowledgeService.checkContraindications(['甘草', '甘遂', '人参']);
    console.log(safetyCheck.safe ? '✅ 配伍安全' : '⚠️  发现配伍禁忌');
    console.log(`   检查结果: ${safetyCheck.message}`);
    if (safetyCheck.warnings.length > 0) {
      safetyCheck.warnings.forEach(warning => {
        console.log(`   - ${warning.herbs.join(' + ')}: ${warning.contraindications[0].description}`);
      });
    }

    // 测试 4: 获取药材信息
    console.log('\n[测试 4] 获取药材信息（人参）...');
    const herbInfo = await knowledgeService.getHerbInfo('人参');
    if (herbInfo) {
      console.log('✅ 获取药材信息成功');
      console.log(`   性味: ${herbInfo.nature || '未知'} / ${herbInfo.flavor || '未知'}`);
      console.log(`   归经: ${herbInfo.meridian || '未知'}`);
      console.log(`   功效: ${herbInfo.efficacy ? herbInfo.efficacy.substring(0, 30) + '...' : '未知'}`);
    } else {
      console.log('❌ 未找到药材信息');
    }

    // 测试 5: 搜索方剂
    console.log('\n[测试 5] 搜索方剂（功效：益气健脾）...');
    const formulas = await knowledgeService.searchFormulas({ 
      efficacy: '益气健脾', 
      limit: 3 
    });
    console.log(`✅ 找到 ${formulas.length} 个相关方剂`);
    formulas.forEach((formula, index) => {
      console.log(`   ${index + 1}. ${formula.方名} - ${formula.出处}`);
    });

    // 测试 6: 根据症状推荐方剂
    console.log('\n[测试 6] 根据症状推荐方剂（症状：脾胃虚弱）...');
    const recommendations = await knowledgeService.recommendFormulas('脾胃虚弱', 3);
    console.log(`✅ 推荐 ${recommendations.length} 个方剂`);
    recommendations.forEach((formula, index) => {
      console.log(`   ${index + 1}. ${formula.方名} - ${formula.功效}`);
    });

    // 测试 7: 分析方剂组成
    console.log('\n[测试 7] 分析方剂组成（四君子汤）...');
    const composition = [
      { name: '人参' },
      { name: '白术' },
      { name: '茯苓' },
      { name: '甘草' }
    ];
    const analysis = await knowledgeService.analyzeComposition(composition);
    console.log('✅ 方剂组成分析完成');
    console.log(`   药材数量: ${analysis.totalCount}`);
    console.log(`   配伍安全: ${analysis.safety.safe ? '是' : '否'}`);
    console.log(`   有益配伍: ${analysis.analysis.hasBeneficialRelations ? '是' : '否'}`);
    if (analysis.relationships.length > 0) {
      console.log(`   配伍关系数: ${analysis.relationships.length}`);
    }

  } catch (error) {
    console.log('❌ 测试过程中发生错误:', error.message);
    console.error(error);
  }

  console.log('\n========================================');
  console.log('测试完成！');
  console.log('========================================\n');
}

// 运行测试
runTests();

