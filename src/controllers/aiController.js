const logger = require('../utils/logger');
const axios = require('axios');
const config = require('../../config');

class AIController {
  /**
   * 接收用户提交的症状信息，返回方剂推荐及相关分析结果
   * POST /api/consult
   */
  async consult(req, res, next) {
    try {
      // 支持两种请求格式：前端直接发送question，或后端从symptoms构建
      let question;
      let symptoms, tongue, pulse;
      
      // 检查请求格式
      if (req.body.question) {
        // 前端直接发送了question
        question = req.body.question;
        logger.info('AI咨询请求（直接question格式）', {
          userId: req.user?.user_id || 'anonymous',
          question
        });
      } else {
        // 后端从symptoms构建question
        symptoms = req.body.symptoms || '';
        tongue = req.body.tongue || '';
        pulse = req.body.pulse || '';
        
        if (!symptoms) {
          return res.json({
            code: 400,
            message: '症状信息不能为空',
            data: null
          });
        }
        
        question = `我的症状是：${symptoms}${tongue ? `，舌象：${tongue}` : ''}${pulse ? `，脉象：${pulse}` : ''}。请辨证并推荐合适的方剂。`;
        
        logger.info('AI咨询请求（symptoms格式）', {
          userId: req.user?.user_id || 'anonymous',
          symptoms,
          tongue,
          pulse
        });
      }

      const requestBody = {
        question
      };

      // 调用AI服务
      const response = await axios.post(
        config.aiService.analyzeUrl,
        requestBody,
        {
          timeout: parseInt(config.aiService.timeout, 10) || 10000
        }
      );

      // 处理响应
      if (response.status === 200 && response.data && response.data.success) {
        let aiResponse = response.data;
        
        // 创建处理后的数据对象，直接使用AI服务返回的所有字段
        let processedData = {
          ai_enabled: aiResponse.ai_enabled || true,
          answer: aiResponse.answer,
          // 直接传递AI服务返回的辨证结果和方剂信息
          syndrome: aiResponse.syndrome,
          prescription: aiResponse.prescription
        };
        
        // 检查answer中是否包含JSON_START标记（用于配伍分析结果）
        const jsonStartIndex = aiResponse.answer.indexOf('<JSON_START>');
        if (jsonStartIndex !== -1) {
          try {
            // 提取JSON数据
            const jsonContent = aiResponse.answer.substring(jsonStartIndex + '<JSON_START>'.length);
            const jsonEndIndex = jsonContent.indexOf('<JSON_END>');
            const cleanJsonContent = jsonEndIndex !== -1 ? jsonContent.substring(0, jsonEndIndex) : jsonContent;
            const jsonData = JSON.parse(cleanJsonContent);
            
            // 合并JSON数据到processedData
            Object.assign(processedData, jsonData);
          } catch (jsonError) {
            logger.error('解析AI响应JSON失败', {
              userId: req.user?.user_id || 'anonymous',
              error: jsonError.message,
              answer: aiResponse.answer
            });
          }
        }
        
        // 检查是否包含辨证结果和方剂推荐
        if (processedData.syndrome) {
          // 这是症状咨询结果
          logger.info('AI症状咨询成功', {
            userId: req.user?.user_id || 'anonymous',
            syndrome: processedData.syndrome
          });
        } else if (processedData.overall_properties) {
          // 这是配伍分析结果
          logger.info('AI配伍分析成功', {
            userId: req.user?.user_id || 'anonymous',
            nature: processedData.overall_properties.nature
          });
        }
        
        // 返回给前端
        res.json({
          code: 200,
          message: 'AI咨询成功',
          data: processedData
        });
      } else {
        throw new Error('AI服务返回异常');
      }
    } catch (error) {
      logger.error('AI咨询失败', {
        userId: req.user?.user_id || 'anonymous',
        error: error.message
      });
      // 详细的错误信息
      let errorMessage = 'AI咨询失败';
      if (error.code === 'ECONNREFUSED') {
        errorMessage = 'AI服务未启动或连接失败，请检查AI服务状态';
      } else if (error.timeout) {
        errorMessage = 'AI服务响应超时';
      } else if (error.response) {
        errorMessage = `AI服务返回错误: ${error.response.status} - ${error.response.data?.message || '未知错误'}`;
      }
      res.json({
        code: 500,
        message: errorMessage,
        data: null
      });
    }
  }
}

module.exports = new AIController();
