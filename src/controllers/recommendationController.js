/**
 * AI推荐控制器
 * 
 * 功能：
 * - 调用外部 AI 服务 (E1) 获取方剂推荐
 * - 实现服务降级机制（HP 7）
 * - 调用知识库服务获取方剂详情
 * - 执行配伍安全检查
 * - 组合并返回最终推荐结果
 */

const axios = require('axios');
const config = require('../../config');
const knowledgeDbService = require('../services/knowledgeDbService'); // 使用数据库版本
const safetyCheckService = require('../services/safetyCheckService');
const logger = require('../utils/logger');

class RecommendationController {
  /**
   * 处理方剂推荐请求
   * POST /api/recommend/formula
   */
  async getRecommendation(req, res, next) {
    const symptomsData = req.body; // 已通过验证器校验
    const requestId = req.id; // correlation ID
    const userId = req.user?.id || 'anonymous';

    logger.info('收到AI推荐请求', {
      correlationId: requestId,
      userId,
      symptomsCount: symptomsData.symptoms.length
    });

    try {
      // 1. 调用外部 AI 服务 E1
      const e1Result = await this.callAIService(symptomsData, requestId);

      // 2. 处理 E1 调用失败的情况（服务降级）
      if (!e1Result.success) {
        logger.warn('E1服务调用失败，返回降级响应', {
          correlationId: requestId,
          error: e1Result.error
        });
        return res.status(503).json({
          timestamp: new Date().toISOString(),
          status: 503,
          error: 'Service Unavailable',
          message: e1Result.message || 'AI推荐服务暂时不可用，请稍后重试',
          error_code: 'AI_SERVICE_UNAVAILABLE',
          path: req.originalUrl
        });
      }

      // 3. E1 调用成功，处理推荐结果
      const recommendations = e1Result.data;

      if (!recommendations || recommendations.length === 0) {
        // E1 未推荐任何方剂
        logger.info('E1未返回推荐方剂', { correlationId: requestId });
        return res.status(200).json({
          success: true,
          data: {
            recommendations: [],
            message: '根据当前症状未找到合适的推荐方剂，建议咨询专业中医师'
          }
        });
      }

      // 4. 提取方剂 ID 列表
      const formulaIds = recommendations.map(rec => rec.formula_id).filter(id => id);

      if (formulaIds.length === 0) {
        logger.warn('E1推荐结果中无有效方剂ID', { correlationId: requestId });
        return res.status(200).json({
          success: true,
          data: {
            recommendations: [],
            message: '推荐结果格式异常，请稍后重试'
          }
        });
      }

      logger.debug('准备查询方剂详情', {
        correlationId: requestId,
        formulaIds
      });

      // 5. 批量获取方剂详情（调用 P2 知识库服务）
      const formulasMap = await knowledgeDbService.getFormulasInBatch(formulaIds);

      if (!formulasMap || Object.keys(formulasMap).length === 0) {
        logger.warn('知识库未返回方剂详情', {
          correlationId: requestId,
          formulaIds
        });
        return res.status(200).json({
          success: true,
          data: {
            recommendations: [],
            message: 'AI分析完成，但无法获取方剂详情，请稍后重试'
          }
        });
      }

      // 6. 对每个推荐结果执行安全检查并组合最终响应
      const finalResults = [];

      for (const rec of recommendations) {
        const formulaDetail = formulasMap[rec.formula_id];

        if (!formulaDetail) {
          logger.warn('方剂详情缺失', {
            correlationId: requestId,
            formula_id: rec.formula_id
          });
          continue;
        }

        // 执行安全检查
        let safetyCheck = { isSafe: true, warnings: [], details: [] };

        if (formulaDetail.medicines && formulaDetail.medicines.length > 0) {
          safetyCheck = safetyCheckService.checkFormulaSafety(formulaDetail.medicines);

          if (!safetyCheck.isSafe) {
            logger.warn('检测到配伍安全警告', {
              correlationId: requestId,
              formula_id: rec.formula_id,
              formula_name: formulaDetail.name,
              warningsCount: safetyCheck.warnings.length
            });
          }
        } else {
          logger.warn('方剂组成信息缺失，无法进行安全检查', {
            correlationId: requestId,
            formula_id: rec.formula_id
          });
          safetyCheck = {
            isSafe: null,
            warnings: ['缺少组成信息，无法进行安全检查'],
            details: [{
              level: 'warning',
              type: 'incomplete_data',
              description: '该方剂缺少详细组成信息，建议咨询中医师后使用'
            }]
          };
        }

        // 组合最终结果
        const result = {
          formula: {
            id: formulaDetail.formula_id,
            name: formulaDetail.name,
            pinyin: formulaDetail.pinyin,
            source: formulaDetail.source,
            category: formulaDetail.category,
            efficacy: formulaDetail.efficacy,
            indications: formulaDetail.indications,
            composition: formulaDetail.medicines ? formulaDetail.medicines.map(med => ({
              medicine_id: med.medicine_id,
              name: med.name,
              pinyin: med.pinyin,
              dosage: med.FormulaComposition?.dosage || med.dosage,
              role: med.FormulaComposition?.role || '未注明',
              processing: med.FormulaComposition?.processing
            })) : []
          },
          ai_analysis: {
            reasoning: rec.reasoning || '基于症状匹配分析',
            confidence: rec.confidence || 0.7,
            match_symptoms: rec.matched_symptoms || []
          },
          safety_check: {
            is_safe: safetyCheck.isSafe,
            warnings: safetyCheck.warnings,
            details: safetyCheck.details,
            checked_at: safetyCheck.checked_at
          }
        };

        finalResults.push(result);
      }

      // 7. 返回最终组合结果
      logger.info('AI推荐完成', {
        correlationId: requestId,
        userId,
        recommendationsCount: finalResults.length,
        safeIssuesCount: finalResults.filter(r => !r.safety_check.is_safe).length
      });

      res.status(200).json({
        success: true,
        data: {
          recommendations: finalResults,
          total: finalResults.length,
          has_safety_warnings: finalResults.some(r => !r.safety_check.is_safe)
        }
      });
    } catch (error) {
      // 捕获处理过程中的未预期错误
      logger.error('处理AI推荐请求时发生错误', {
        correlationId: requestId,
        userId,
        error: error.message,
        stack: error.stack
      });
      next(error); // 交给全局错误处理器
    }
  }

  /**
   * 调用外部 AI 服务 E1
   * @param {Object} symptomsData - 症状数据
   * @param {string} requestId - 请求 ID
   * @returns {Promise<Object>} { success: boolean, data?: any, error?: string, message?: string }
   */
  async callAIService(symptomsData, requestId) {
    const e1RequestBody = {
      symptoms: symptomsData.symptoms,
      tongue_desc: symptomsData.tongue_desc || null,
      user_profile: symptomsData.user_profile || null
    };

    logger.debug('调用E1服务', {
      correlationId: requestId,
      url: config.aiService.recommendUrl,
      timeout: config.aiService.timeout
    });

    try {
      const response = await axios.post(
        config.aiService.recommendUrl,
        e1RequestBody,
        {
          timeout: config.aiService.timeout, // 5000ms
          headers: {
            'Content-Type': 'application/json',
            'X-Request-ID': requestId
          }
        }
      );

      // 检查响应状态
      if (response.status !== 200) {
        logger.error('E1返回非200状态码', {
          correlationId: requestId,
          statusCode: response.status,
          statusText: response.statusText
        });
        return {
          success: false,
          error: 'non_200_status',
          message: 'AI服务返回异常状态'
        };
      }

      // 验证响应数据格式
      const responseData = response.data;
      if (!responseData) {
        logger.error('E1响应数据为空', { correlationId: requestId });
        return {
          success: false,
          error: 'empty_response',
          message: 'AI服务返回数据为空'
        };
      }

      // 检查是否包含推荐结果
      // 支持两种格式：{ recommendations: [...] } 或直接数组 [...]
      let recommendations = [];
      if (Array.isArray(responseData)) {
        recommendations = responseData;
      } else if (Array.isArray(responseData.recommendations)) {
        recommendations = responseData.recommendations;
      } else if (Array.isArray(responseData.data)) {
        recommendations = responseData.data;
      } else {
        logger.error('E1响应格式无效（缺少recommendations数组）', {
          correlationId: requestId,
          responseKeys: Object.keys(responseData)
        });
        return {
          success: false,
          error: 'invalid_format',
          message: 'AI服务返回格式异常'
        };
      }

      logger.info('E1服务调用成功', {
        correlationId: requestId,
        recommendationsCount: recommendations.length
      });

      return {
        success: true,
        data: recommendations
      };
    } catch (error) {
      // 处理各种错误情况
      if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
        // 超时错误
        logger.error('E1服务调用超时', {
          correlationId: requestId,
          timeout: config.aiService.timeout,
          error: error.message
        });
        return {
          success: false,
          error: 'timeout',
          message: 'AI推荐服务响应超时，请稍后重试'
        };
      } else if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
        // 连接错误
        logger.error('E1服务连接失败', {
          correlationId: requestId,
          url: config.aiService.recommendUrl,
          error: error.message
        });
        return {
          success: false,
          error: 'connection_failed',
          message: 'AI推荐服务暂时不可用'
        };
      } else if (error.response) {
        // E1 返回了错误响应
        logger.error('E1服务返回错误响应', {
          correlationId: requestId,
          statusCode: error.response.status,
          data: error.response.data
        });
        return {
          success: false,
          error: 'api_error',
          message: 'AI推荐服务处理失败'
        };
      } else {
        // 其他未知错误
        logger.error('E1服务调用发生未知错误', {
          correlationId: requestId,
          error: error.message
        });
        return {
          success: false,
          error: 'unknown_error',
          message: 'AI推荐服务暂时不可用'
        };
      }
    }
  }
}

module.exports = new RecommendationController();

