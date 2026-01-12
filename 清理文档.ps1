# 文档清理脚本
# 将重复和临时文档移动到归档目录

# 设置变量
$archiveDir = "docs_archive"
$rootDir = "."

# 创建归档目录
if (-not (Test-Path $archiveDir)) {
    New-Item -ItemType Directory -Path $archiveDir
    Write-Host "✅ 创建归档目录: $archiveDir"
}

# 定义要归档的文件列表
$filesToArchive = @(
    # 重复的完成总结
    "✅_最终完成总结.md",
    "✅_最终完整报告.md",
    "🎊_最终完成总结_v2.md",
    "🎊_最终完整总结.md",
    "🎊_最终完成报告.md",
    "🎉_最终完成总结.md",
    "🎉_最终完成报告_前端对接.md",
    "🎊_项目完成最终总结.md",
    "✅_所有任务完成.md",
    "🎊_所有任务完成报告.md",
    "✅_本次任务完成总结.md",
    "✨_项目已完全就绪.md",
    
    # 重复的项目补全报告
    "✅_项目自检完成.md",
    "🎉_项目补全最终报告.md",
    "项目补全工作总结.md",
    "补全报告_缺失文件已修复.md",
    "补全完成总结.md",
    "项目自检总结.md",
    "项目自检报告_完整性检查.md",
    
    # 重复的测试文档
    "✨_测试完成总结.md",
    "🎯_完整自测报告.md",
    "实际测试验证报告.md",
    "全局测试自检报告.md",
    "🎯_自测指南总览.md",
    "如何实现100%测试通过率.md",
    "为什么不需要所有测试通过.md",
    "未通过功能影响分析.md",
    
    # 重复的修复文档
    "✅_修复完成总结.md",
    "修复总结和建议.md",
    "🎉_修复成功报告.md",
    "🎊_最终修复报告.md",
    "🎯_完整修复总结报告.md",
    "🎯_完整修复执行总结.md",
    "🎉_完美修复完成.md",
    "✅_所有修复和配置完成.md",
    "🎊_所有修复已完成.md",
    "📖_修复完成总索引.md",
    
    # 重复的部署文档
    "✅_部署指南交付完成.md",
    "✅_部署指南增强完成.md",
    "🎉_部署文档完成总结.md",
    "📦_Docker使用情况报告.md",
    "Docker使用情况简要总结.md",
    "🚀_快速启动和测试指南.md",
    "🚀_快速启动AI测试.md",
    
    # 临时调试文档
    "⚠️_立即重启后端.md",
    "⚠️_重要_必须重启前端.md",
    "🔍_浏览器调试步骤.md",
    "✅_登录问题修复总结.md",
    "✅_登录问题已修复.md",
    "🎉_所有问题修复完成.md",
    
    # 重复的Colab AI文档
    "✅_Colab_AI集成完成总结.md",
    "🎉_Colab_AI完整集成总结.md",
    "🎯_Colab_AI对接总览.md",
    "🚀_快速对接指南.md",
    "✅_AI服务对接准备完成.md",
    "✅_AI团队服务已就绪_对接状态.md",
    "🧪_Colab_AI测试指南.md",
    "📚_Colab_AI文档索引.md",
    
    # 重复的VMware文档
    "✅_VMware兼容性问题已解决.md",
    "✅_VMware详细指南完成.md",
    "🎊_VMware完整指南交付完成.md",
    
    # 重复的UUID文档
    "🎉_UUID接口就绪总结.md",
    "✅_UUID接口交付总结.md",
    
    # 重复的前端文档
    "🔧_前端修复指南.md",
    "🔧_前端对接问题清单.md",
    "✅_前端修复完成报告.md",
    "🎉_环境变量配置完成.md",
    "✅_前端验收文档完成总结.md",
    "🎯_前端对接总结.md",
    "🎊_前端对接完成总结.md",
    
    # 重复的配置文档
    "🎉_配置更新完成.md",
    "✅_所有修复和配置完成.md",
    
    # 其他重复文档
    "功能完整性检查报告.md",
    "需求文档功能对比分析.md",
    "最终工作摘要.md",
    "立即重启服务.md",
    "清理并重新迁移.md",
    "迁移文件修复报告.md",
    "迁移错误修复指南.md",
    "阶段二完成总结.md",
    "开发工作日志_个性化内容API.md",
    "步骤10-文件上传API完成.md",
    "步骤10-文件上传API测试通过.md",
    "工作日志报告.md",
    "遗留问题清单.md",
    "README_测试修复完成.md",
    "README_自测和补全完成.md",
    "README_项目补全完成.md",
    "📚_部署文档索引.md",
    "📖_部署快速参考.md",
    "🎯_部署帮助总结.md",
    "📋_剩余问题分步修复指南.md",
    "🎯_实现100%通过的完整指南.md",
    "🎯_最终功能检查结论.md",
    "🤖_自动部署说明.md",
    "🎊_AI团队交付完成报告.md"
)

Write-Host "======================================"
Write-Host "开始归档文档..."
Write-Host "======================================"
Write-Host ""

$archivedCount = 0
$skippedCount = 0

foreach ($file in $filesToArchive) {
    $sourcePath = Join-Path $rootDir $file
    
    if (Test-Path $sourcePath) {
        try {
            Move-Item -Path $sourcePath -Destination $archiveDir -Force
            Write-Host "✅ 已归档: $file"
            $archivedCount++
        } catch {
            Write-Host "❌ 归档失败: $file - $($_.Exception.Message)"
        }
    } else {
        Write-Host "⚠️ 文件不存在: $file"
        $skippedCount++
    }
}

Write-Host ""
Write-Host "======================================"
Write-Host "归档完成！"
Write-Host "======================================"
Write-Host "已归档: $archivedCount 个文件"
Write-Host "跳过: $skippedCount 个文件"
Write-Host "归档目录: $archiveDir"
Write-Host ""

